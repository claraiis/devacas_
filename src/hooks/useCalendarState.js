import { useCallback, useMemo, useState } from 'react';

const useCalendarState = ({
  config,
  setConfig,
  calendarRef,
  nationalHolidays,
  regionalHolidays,
  getDateStr,
  setShowLimitBanner,
  setLastAction
}) => {
  const [optimizedDays, setOptimizedDays] = useState([]);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const vacationDaysNumber = useMemo(
    () => (config.vacationDays === '' ? 0 : config.vacationDays),
    [config.vacationDays]
  );

  const holidayDates = useMemo(() => ([
    ...nationalHolidays.map((h) => h.date),
    ...regionalHolidays.map((h) => h.date),
    ...config.customHolidays.map((h) => h.date)
  ]), [nationalHolidays, regionalHolidays, config.customHolidays]);

  const isWeekend = useCallback((date) => {
    const day = date.getDay();
    if (config.workDays === 'L-V') return day === 0 || day === 6;
    if (config.workDays === 'L-S') return day === 0;
    return false;
  }, [config.workDays]);

  const isHoliday = useCallback((date) => {
    const dateStr = getDateStr(date);
    return holidayDates.includes(dateStr);
  }, [getDateStr, holidayDates]);

  const confirmedDays = useMemo(
    () => Object.values(config.manualOverrides).filter((value) => value === 'confirmed').length,
    [config.manualOverrides]
  );

  const proposedDays = useMemo(
    () => optimizedDays.filter((day) => !config.manualOverrides[day]).length,
    [optimizedDays, config.manualOverrides]
  );

  const daysAssigned = useMemo(
    () => proposedDays + confirmedDays,
    [proposedDays, confirmedDays]
  );

  const daysAvailable = useMemo(
    () => Math.max(0, vacationDaysNumber - daysAssigned),
    [vacationDaysNumber, daysAssigned]
  );

  const handleDayClick = useCallback((dateStr, hasHoliday, event) => {
    if (hasHoliday && activeTooltip !== dateStr && window.innerWidth < 768) {
      event.stopPropagation();
      setActiveTooltip(dateStr);
      setTimeout(() => setActiveTooltip(null), 3000);
      return;
    }

    if (activeTooltip === dateStr) {
      setActiveTooltip(null);
    }

    const current = config.manualOverrides[dateStr];
    const isProposed = optimizedDays.includes(dateStr);
    const newOverrides = { ...config.manualOverrides };

    const totalUsed = confirmedDays + proposedDays;

    if (isProposed && !current) {
      newOverrides[dateStr] = 'confirmed';
      setLastAction({ date: dateStr, status: 'confirmado' });
    } else if (current === 'confirmed') {
      newOverrides[dateStr] = 'blocked';
      setLastAction({ date: dateStr, status: 'bloqueado' });
      // Si se bloqueó un día que era propuesto, invalidar optimizedDays
      if (isProposed) {
        setOptimizedDays((prev) => prev.filter((day) => day !== dateStr));
      }
    } else if (current === 'blocked') {
      delete newOverrides[dateStr];
      setOptimizedDays((prev) => prev.filter((day) => day !== dateStr));
      setLastAction({ date: dateStr, status: 'desbloqueado' });
    } else if (!isProposed) {
      if (totalUsed < vacationDaysNumber) {
        newOverrides[dateStr] = 'confirmed';
        setLastAction({ date: dateStr, status: 'confirmado' });
      } else {
        // Si no hay días disponibles, permitir bloquear directamente
        newOverrides[dateStr] = 'blocked';
        setLastAction({ date: dateStr, status: 'bloqueado' });
      }
    }

    setConfig((prev) => ({ ...prev, manualOverrides: newOverrides }));
  }, [
    activeTooltip,
    config.manualOverrides,
    confirmedDays,
    optimizedDays,
    proposedDays,
    setConfig,
    setShowLimitBanner,
    setLastAction,
    vacationDaysNumber
  ]);

  const downloadCalendar = useCallback(async () => {
    const vacationDays = optimizedDays.filter((dateStr) => {
      const override = config.manualOverrides[dateStr];
      return !override || override === 'confirmed';
    });

    if (vacationDays.length === 0) {
      alert('No hay días de vacaciones para descargar');
      return;
    }

    try {
      const calendarElement = calendarRef.current;
      if (!calendarElement) {
        alert('No se pudo capturar el calendario');
        return;
      }

      // Lazy load de jsPDF y html2canvas
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);

      const isMobile = window.innerWidth < 768;
      const originalWidth = calendarElement.style.width;

      if (isMobile) {
        calendarElement.style.width = '1200px';
      }

      const canvas = await html2canvas(calendarElement, {
        scale: isMobile ? 1.5 : 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: isMobile ? 1200 : calendarElement.scrollWidth,
        windowWidth: isMobile ? 1200 : window.innerWidth
      });

      if (isMobile) {
        calendarElement.style.width = originalWidth;
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`vacaciones_${config.year}.pdf`);
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alert('Hubo un error al generar el PDF');
    }
  }, [calendarRef, config.manualOverrides, config.year, optimizedDays]);

  return {
    optimizedDays,
    setOptimizedDays,
    activeTooltip,
    setActiveTooltip,
    handleDayClick,
    downloadCalendar,
    isWeekend,
    isHoliday,
    confirmedDays,
    proposedDays,
    vacationDaysNumber,
    daysGenerated: vacationDaysNumber,
    daysAssigned,
    daysAvailable
  };
};

export default useCalendarState;
