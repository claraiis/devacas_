import React from 'react';
import { Info, Share } from 'lucide-react';

const AppHeader = ({
  headerRef,
  showCalendar,
  showForm,
  isBlurred,
  onPrimaryAction,
  onShowHelpModal,
  onLogoClick,
  calendarStats,
  onShare
}) => {
  const daysUnassigned = Math.max(0, calendarStats?.daysAvailable ?? 0);

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 h-auto md:h-24 transition-colors duration-200 ${
        isBlurred ? 'backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="relative w-full h-full mx-auto px-6 md:px-16 py-4 flex items-center">
        {!showCalendar ? (
          <div className="grid w-full grid-cols-3 items-center self-start md:self-center">
            <div className="flex min-h-11 items-center md:min-h-0">
              <button
                type="button"
                onClick={onLogoClick}
                className="justify-self-start text-xl md:text-2xl font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-70"
                aria-label="Ir al inicio"
              >
                devacas_
              </button>
            </div>
            <div className="justify-self-center" aria-hidden="true" />
            <div className="justify-self-end">
              <div className="flex items-center gap-6">
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
            </div>
          </div>
        ) : (
          <div className="grid w-full grid-cols-1 items-center gap-3 self-start md:grid-cols-3 md:gap-0 md:self-center">
            <div className="order-1 flex min-h-11 items-center justify-between gap-3 md:order-none md:min-h-0">
              <button
                type="button"
                onClick={onLogoClick}
                className="w-full text-left text-xl font-bold uppercase tracking-wide text-black transition-opacity hover:opacity-70 md:justify-self-start md:text-2xl"
                aria-label="Ir al inicio"
              >
                devacas_
              </button>
              <button
                type="button"
                onClick={onShare}
                className="md:hidden p-2 text-black hover:opacity-70 transition-opacity"
                aria-label="Compartir calendario"
              >
                <Share size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="order-2 w-full text-black md:order-3 md:justify-self-end">
              <div className="flex w-full items-center justify-center gap-6 text-[10px] uppercase tracking-wide md:w-auto md:justify-end md:gap-6 md:text-[11px]">
                <div className="text-center md:text-end">
                  <div className="text-xl font-semibold">
                    {calendarStats.daysAssigned}{' '}
                    <span className="uppercase tracking-wide font-semibold text-[12px]">días</span>
                  </div>
                  <div className="text-[12px]">Asignados</div>
                </div>
                <div className="text-center md:text-end">
                  <div className="text-xl font-semibold">
                    {calendarStats.daysAvailable}{' '}
                    <span className="uppercase tracking-wide font-semibold text-[12px]">días</span>
                  </div>
                  <div className="text-[12px]">Pendientes</div>
                </div>
              </div>
            </div>
            <div className="order-3 hidden w-full text-center text-[12px] text-black/60 md:order-2 md:block md:justify-self-center md:text-sm">
              {daysUnassigned > 0
                ? (
                  <>Tienes {daysUnassigned} día{daysUnassigned === 1 ? '' : 's'} de vacaciones sin asignar</>
                )
                : (
                  <span className="sr-only">Sin días pendientes</span>
                )}
            </div>
          </div>
        )}
        {!showCalendar ? null : null}
      </div>
    </header>
  );
};

export default AppHeader;
