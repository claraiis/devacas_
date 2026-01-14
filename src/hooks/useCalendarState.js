import { useCallback, useMemo, useState } from 'react';

const useCalendarState = ({
  config,
  setConfig,
  calendarRef,
  nationalHolidays,
  regionalHolidays,
  getDateStr,
  setLastAction,
  setShowLimitBanner
}) => {
  const [optimizedDays, setOptimizedDays] = useState([]);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const vacationDaysNumber = useMemo(
    () => (config.vacationDays === '' ? 0 : config.vacationDays),
    [config.vacationDays]
  );

  // Convertir optimizedDays a Set para búsquedas O(1) en lugar de O(n)
  const optimizedDaysSet = useMemo(
    () => new Set(optimizedDays),
    [optimizedDays]
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

  // Los días propuestos ahora están directamente confirmados, así que proposedDays siempre será 0
  const proposedDays = useMemo(
    () => 0,
    []
  );

  const daysAssigned = useMemo(
    () => proposedDays + confirmedDays,
    [proposedDays, confirmedDays]
  );

  const daysAvailable = useMemo(
    () => Math.max(0, vacationDaysNumber - daysAssigned),
    [vacationDaysNumber, daysAssigned]
  );

  const daysGenerated = useMemo(
    () => optimizedDays.length,
    [optimizedDays]
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
    const isProposed = optimizedDaysSet.has(dateStr);
    const newOverrides = { ...config.manualOverrides };

    const totalUsed = confirmedDays + proposedDays;

    // Si es un día sugerido (está en optimizedDays), solo puede tener dos estados: confirmed o blocked
    if (isProposed) {
      if (current === 'confirmed') {
        // Cambiar de confirmed a blocked
        newOverrides[dateStr] = 'blocked';
        setLastAction({ date: dateStr, status: 'bloqueado' });
        setOptimizedDays((prev) => prev.filter((day) => day !== dateStr));
        // Ocultar banner cuando se bloquea un día confirmado (ahora hay días disponibles)
        if (setShowLimitBanner && totalUsed >= vacationDaysNumber) {
          setShowLimitBanner(false);
        }
      } else {
        // Si está blocked o no tiene estado, cambiar a confirmed
        newOverrides[dateStr] = 'confirmed';
        setLastAction({ date: dateStr, status: 'confirmado' });
        // Ocultar banner si estaba visible
        if (setShowLimitBanner) {
          setShowLimitBanner(false);
        }
      }
    } else {
      // Días que no están en optimizedDays (días manuales)
      // Pueden alternar entre: neutro -> confirmed -> blocked -> neutro
      if (current === 'confirmed') {
        // Cambiar de confirmed a blocked
        newOverrides[dateStr] = 'blocked';
        setLastAction({ date: dateStr, status: 'bloqueado' });
        // Ocultar banner cuando se bloquea un día confirmado (ahora hay días disponibles)
        if (setShowLimitBanner && totalUsed >= vacationDaysNumber) {
          setShowLimitBanner(false);
        }
      } else if (current === 'blocked') {
        // Cambiar de blocked a neutro (eliminar estado)
        delete newOverrides[dateStr];
        setLastAction({ date: dateStr, status: 'desbloqueado' });
        // Ocultar banner cuando se desbloquea un día (ahora hay días disponibles)
        if (setShowLimitBanner) {
          setShowLimitBanner(false);
        }
      } else {
        // Día sin estado (neutro): intentar confirmar
        if (totalUsed < vacationDaysNumber) {
          newOverrides[dateStr] = 'confirmed';
          setLastAction({ date: dateStr, status: 'confirmado' });
          // Ocultar banner si estaba visible
          if (setShowLimitBanner) {
            setShowLimitBanner(false);
          }
        } else {
          // Ya tiene todos los días asignados e intenta confirmar otro
          // Mostrar banner y bloquear el día para evitar confirmación accidental
          if (setShowLimitBanner) {
            setShowLimitBanner(true);
          }
          newOverrides[dateStr] = 'blocked';
          setLastAction({ date: dateStr, status: 'bloqueado' });
        }
      }
    }

    setConfig((prev) => ({ ...prev, manualOverrides: newOverrides }));
  }, [
    activeTooltip,
    config.manualOverrides,
    confirmedDays,
    optimizedDaysSet,
    proposedDays,
    setConfig,
    setLastAction,
    setShowLimitBanner,
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
    daysGenerated,
    daysAssigned,
    daysAvailable
  };
};

export default useCalendarState;
