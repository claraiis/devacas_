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
      className={`fixed top-0 left-0 right-0 z-50 h-auto border-b border-emerald-900/10 transition-all duration-200 ${
        isBlurred ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-white'
      }`}
    >
      <div className="relative w-full h-full mx-auto px-6 md:px-16 py-4 flex items-center">
        {!showCalendar ? (
          <div className="grid w-full grid-cols-2 items-center gap-4 md:grid-cols-3">
            <div className="flex min-h-11 items-center md:min-h-0">
              <button
                type="button"
                onClick={onLogoClick}
                className="justify-self-start text-xl md:text-2xl font-semibold uppercase tracking-[0.2em] text-emerald-900 transition-opacity hover:opacity-70"
                aria-label="Ir al inicio"
              >
                devacas_
              </button>
            </div>
            <div className="hidden justify-self-center md:block" aria-hidden="true">
              <div className="text-[11px] uppercase tracking-[0.4em] text-emerald-900/50">
                Optimiza tus vacaciones en 2026
              </div>
            </div>
            <div className="justify-self-end">
              <div className="flex items-center gap-4 md:gap-6">
                <button
                  onClick={onShowHelpModal}
                  className="text-emerald-900 uppercase text-[11px] font-semibold hover:opacity-70 transition-opacity tracking-[0.25em]"
                >
                  <span className="hidden md:inline">¿Cómo funciona?</span>
                  <Info className="md:hidden" size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid w-full grid-cols-1 items-center gap-3 md:grid-cols-3 md:gap-0">
            <div className="order-1 flex min-h-11 items-center justify-between gap-3 md:order-none md:min-h-0">
              <button
                type="button"
                onClick={onLogoClick}
                className="w-full text-left text-xl font-semibold uppercase tracking-[0.2em] text-emerald-900 transition-opacity hover:opacity-70 md:justify-self-start md:text-2xl"
                aria-label="Ir al inicio"
              >
                devacas_
              </button>
              <button
                type="button"
                onClick={onShare}
                className="md:hidden p-2 text-emerald-900 hover:opacity-70 transition-opacity"
                aria-label="Compartir calendario"
              >
                <Share size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="order-2 w-full text-emerald-900 md:order-3 md:justify-self-end">
              <div className="flex w-full items-center justify-center gap-6 text-[10px] uppercase tracking-[0.25em] md:w-auto md:justify-end md:gap-6 md:text-[11px]">
                <div className="text-center md:text-end">
                  <div className="text-xl font-semibold tracking-tight">
                    {calendarStats.daysAssigned}{' '}
                    <span className="uppercase tracking-[0.2em] font-semibold text-[12px]">días</span>
                  </div>
                  <div className="text-[11px] text-emerald-900/70">Asignados</div>
                </div>
                <div className="text-center md:text-end">
                  <div className="text-xl font-semibold tracking-tight">
                    {calendarStats.daysAvailable}{' '}
                    <span className="uppercase tracking-[0.2em] font-semibold text-[12px]">días</span>
                  </div>
                  <div className="text-[11px] text-emerald-900/70">Pendientes</div>
                </div>
              </div>
            </div>
            <div className="order-3 hidden w-full text-center text-[12px] text-emerald-900/60 md:order-2 md:block md:justify-self-center md:text-sm">
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
