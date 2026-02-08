import React from 'react';
import { Info } from 'lucide-react';

const AppHeader = ({
  headerRef,
  showCalendar,
  showForm,
  onPrimaryAction,
  onShowHelpModal,
  onLogoClick,
  calendarStats
}) => {
  const daysUnassigned = Math.max(0, calendarStats?.daysAvailable ?? 0);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 h-20 md:h-24 bg-transparent"
    >
      <div className="relative w-full h-full mx-auto px-6 md:px-16 flex items-center">
        <button
          type="button"
          onClick={onLogoClick}
          className={`absolute left-6 md:left-16 top-1/2 -translate-y-1/2 text-xl md:text-2xl font-bold uppercase transition-opacity hover:opacity-70 ${showCalendar ? 'text-black' : 'text-white'}`}
          aria-label="Ir al inicio"
        >
          devacas_
        </button>
        {!showCalendar ? (
          <div className="ml-auto flex items-center gap-6">
            <button
              onClick={onShowHelpModal}
              className="text-white uppercase text-sm font-medium hover:opacity-70 transition-opacity tracking-wide"
            >
              <span className="hidden md:inline">¿Cómo funciona?</span>
              <Info className="md:hidden" size={18} aria-hidden="true" />
            </button>
            <button
              onClick={onPrimaryAction}
              className={`px-6 py-2.5 bg-black text-white uppercase text-sm font-medium tracking-wide rounded-[4px] items-center gap-2 hover:bg-gray-900 transition-colors ${showForm ? 'hidden' : 'flex'}`}
            >
              {showForm ? 'Optimizar mis vacaciones' : 'Empezar'}
            </button>
          </div>
        ) : (
          <>
            <div className="flex md:hidden items-center text-black absolute right-6 top-1/2 -translate-y-1/2">
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-wide">
                <div className="text-end">
                  <div className="font-semibold">{calendarStats.daysAssigned} días</div>
                  <div className="text-[9px]">Asignados</div>
                </div>
                <div className="text-end">
                  <div className="font-semibold">{calendarStats.daysAvailable} días</div>
                  <div className="text-[9px]">Pendientes</div>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center text-black absolute right-6 md:right-16">
              <div className="relative">
                <div className="flex items-center gap-6">
                  <div className="text-end">
                    <div className="text-xl md:text-2xl font-bold">
                      {calendarStats.daysAssigned}{' '}
                      <span className="uppercase tracking-wide font-semibold text-[10px]">días</span>
                    </div>
                    <div className="uppercase tracking-wide text-[10px] -mt-2">Asignados</div>
                  </div>
                  <div className="text-end">
                    <div className="text-xl md:text-2xl font-bold">
                      {calendarStats.daysAvailable}{' '}
                      <span className="uppercase tracking-wide font-semibold text-[10px]">días</span>
                    </div>
                    <div className="uppercase tracking-wide text-[10px] -mt-2">Pendientes</div>
                  </div>
                </div>
              </div>
            </div>
            {daysUnassigned > 0 && (
              <div className="absolute left-1/2 top-full mt-2 w-max -translate-x-1/2 text-center text-[11px] text-black/60 md:top-1/2 md:mt-0 md:-translate-y-1/2 md:text-sm">
                Tienes {daysUnassigned} día{daysUnassigned === 1 ? '' : 's'} de vacaciones sin asignar
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
