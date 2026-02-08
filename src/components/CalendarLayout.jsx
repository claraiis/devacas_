import React, { useEffect, useState } from 'react';
import Calendar from './Calendar';

const CalendarLayout = ({
  calendarData,
  calendarLogic
}) => {
  const {
    config,
    calendarRef,
    lastAction,
    daysAvailable,
    errorNational
  } = calendarData;
  const [showNationalError, setShowNationalError] = useState(Boolean(errorNational));
  const daysUnassigned = Math.max(0, daysAvailable ?? 0);
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const {
    normalizeDate,
    getDateStr,
    isWeekend,
    isHoliday,
    getHolidayInfo,
    optimizedDays,
    animateSuggestedDays,
    activeTooltip,
    handleDayClick
  } = calendarLogic;

  useEffect(() => {
    if (!errorNational) {
      setShowNationalError(false);
      return;
    }

    setShowNationalError(true);

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (!isMobile) return;

    const timeoutId = window.setTimeout(() => {
      setShowNationalError(false);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [errorNational]);

  return (
    <div className="relative bg-transparent h-screen">
      <div className="w-full h-screen pt-32 pb-24 px-6 md:px-16 backdrop-blur-md flex flex-col">
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {lastAction.date && `Día ${lastAction.date} ${lastAction.status}`}
        </div>
        {showNationalError && (
          <div className="-mx-6 mb-4 rounded-none border border-orange-200 bg-orange-50 px-4 py-3 text-[12px] text-orange-800 md:mx-0 md:rounded-[4px]">
            No se han podido cargar los festivos nacionales. Puedes seguir usando el calendario, pero algunos días pueden no estar marcados.
          </div>
        )}

        <div ref={calendarRef} className="calendar-scroll flex-1 overflow-y-auto overflow-x-hidden pr-2">
          <div className="calendar-export-only text-center text-black">
            <p className="text-sm uppercase tracking-[0.2em]">Vacaciones {config.year}</p>
          </div>
          {daysUnassigned > 0 && (
            <div className="calendar-export-only mt-2 text-center text-[12px] text-black/70">
              Recuerda que aún tienes {daysUnassigned} día{daysUnassigned === 1 ? '' : 's'} disponibles para gastar cuando más te apetezca
            </div>
          )}
          <div className="mx-auto w-full max-w-7xl lg:max-w-none">
            <Calendar
              year={config.year}
              manualOverrides={config.manualOverrides}
              customHolidays={config.customHolidays}
              normalizeDate={normalizeDate}
              getDateStr={getDateStr}
              isWeekend={isWeekend}
              isHoliday={isHoliday}
              getHolidayInfo={getHolidayInfo}
              optimizedDays={optimizedDays}
              animateSuggestedDays={animateSuggestedDays}
              activeTooltip={activeTooltip}
              onDayClick={handleDayClick}
            />
          </div>
          <div className="calendar-export-only mt-4 text-center text-[11px] text-black/60">
            Generado en <a href={siteUrl || '/'} className="underline">{siteUrl || 'devacas_'}</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarLayout;
