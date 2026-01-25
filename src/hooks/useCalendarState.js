import { createElement, useCallback, useMemo, useState } from 'react';

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

  const daysAssigned = useMemo(
    () => confirmedDays,
    [confirmedDays]
  );

  const daysAvailable = useMemo(
    () => Math.max(0, vacationDaysNumber - confirmedDays),
    [vacationDaysNumber, confirmedDays]
  );

  const daysSuggested = useMemo(
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

    const [year, month, day] = dateStr.split('-').map(Number);
    const clickedDate = new Date(year, month - 1, day);
    if (hasHoliday || isWeekend(clickedDate)) {
      return;
    }

    const current = config.manualOverrides[dateStr];
    const isSuggested = optimizedDaysSet.has(dateStr);
    const newOverrides = { ...config.manualOverrides };

    if (current === 'confirmed') {
      delete newOverrides[dateStr];
      setLastAction({ date: dateStr, status: 'sin estado' });
      setConfig((prev) => ({ ...prev, manualOverrides: newOverrides }));
      return;
    }

    if (isSuggested) {
      newOverrides[dateStr] = 'rejected';
      setOptimizedDays((prev) => prev.filter((day) => day !== dateStr));
      setLastAction({ date: dateStr, status: 'rechazado' });
      setShowLimitBanner(false);
    } else if (current === 'rejected') {
      delete newOverrides[dateStr];
      setLastAction({ date: dateStr, status: 'sin estado' });
      setShowLimitBanner(false);
    } else {
      const noSlots = daysAvailable - optimizedDays.length <= 0;
      if (noSlots) {
        newOverrides[dateStr] = 'rejected';
        setLastAction({ date: dateStr, status: 'rechazado' });
        setShowLimitBanner(true);
      } else {
        setOptimizedDays((prev) => [...prev, dateStr]);
        setLastAction({ date: dateStr, status: 'sugerido' });
        setShowLimitBanner(false);
      }
    }

    setConfig((prev) => ({ ...prev, manualOverrides: newOverrides }));
  }, [
    activeTooltip,
    config.manualOverrides,
    confirmedDays,
    daysAvailable,
    optimizedDaysSet,
    setConfig,
    setLastAction,
    setShowLimitBanner,
    isWeekend
  ]);

  const createCalendarPdf = useCallback(async () => {
    const vacationDays = Object.entries(config.manualOverrides)
      .filter(([, status]) => status === 'confirmed')
      .map(([dateStr]) => dateStr);

    if (vacationDays.length === 0) {
      alert('No hay días de vacaciones confirmados para compartir');
      return null;
    }

    const { pdf } = await import('@react-pdf/renderer');
    const { default: CalendarPdfDocument } = await import('../components/CalendarPdf.jsx');
    const daysUnassigned = Math.max(0, daysAvailable - daysSuggested);
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const optimizedDaysSet = new Set(optimizedDays);

    const isMarkedDay = (date, dateStr) => {
      const override = config.manualOverrides[dateStr];
      if (override === 'confirmed') {
        return true;
      }
      return isWeekend(date) || isHoliday(date);
    };

    const documentElement = createElement(CalendarPdfDocument, {
      year: config.year,
      daysUnassigned,
      siteUrl,
      getDateStr,
      isMarkedDay
    });

    const blob = await pdf(documentElement).toBlob();
    return {
      blob,
      filename: `vacaciones_${config.year}.pdf`
    };
  }, [
    config.manualOverrides,
    config.year,
    daysAvailable,
    daysSuggested,
    getDateStr,
    isHoliday,
    isWeekend,
    optimizedDays
  ]);

  const downloadCalendar = useCallback(async () => {
    try {
      const result = await createCalendarPdf();
      if (!result) return;
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alert('Hubo un error al generar el PDF');
    }
  }, [createCalendarPdf]);

  const shareCalendar = useCallback(async () => {
    try {
      const result = await createCalendarPdf();
      if (!result) return;

      const file = new File([result.blob], result.filename, { type: 'application/pdf' });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Vacaciones ${config.year}`
        });
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: `Vacaciones ${config.year}`,
          url: window.location.href
        });
        return;
      }

      const url = URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al compartir el PDF:', error);
      alert('Hubo un error al compartir el calendario');
    }
  }, [config.year, createCalendarPdf]);

  const confirmSuggestedDays = useCallback(() => {
    if (optimizedDays.length === 0) return;
    setConfig((prev) => {
      const newOverrides = { ...prev.manualOverrides };
      optimizedDays.forEach((dateStr) => {
        newOverrides[dateStr] = 'confirmed';
      });
      return { ...prev, manualOverrides: newOverrides };
    });
    setOptimizedDays([]);
    setLastAction({ date: 'varios', status: 'confirmados' });
  }, [optimizedDays, setConfig, setLastAction]);

  return {
    optimizedDays,
    setOptimizedDays,
    activeTooltip,
    setActiveTooltip,
    handleDayClick,
    downloadCalendar,
    shareCalendar,
    confirmSuggestedDays,
    isWeekend,
    isHoliday,
    confirmedDays,
    vacationDaysNumber,
    daysSuggested,
    daysAssigned,
    daysAvailable
  };
};

export default useCalendarState;
