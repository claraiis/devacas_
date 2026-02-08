import React, { useState, useEffect, useRef, useCallback } from 'react';
import AppHeader from './components/AppHeader';
import HelpModal from './components/HelpModal';
import HeroSection from './components/HeroSection';
import VacationForm from './components/VacationForm';
import CalendarLayout from './components/CalendarLayout';
import AppFooter from './components/AppFooter';
import CalendarActionBar from './components/CalendarActionBar';
import useDateFormatter from './hooks/useDateFormatter';
import useHolidays from './hooks/useHolidays';
import useCalendarState from './hooks/useCalendarState';
import useVacationOptimizer from './hooks/useVacationOptimizer';
import useDebounceLocalStorage from './hooks/useDebounceLocalStorage';
import useVacationConfig from './hooks/useVacationConfig';
import useVacationFormState from './hooks/useVacationFormState';
import useHeroTyping from './hooks/useHeroTyping';

const HERO_SUFFIXES = [
  'fiestas en el pueblo_',
  'rutas por la montaña_',
  'viajes en familia_',
  'paseos por la playa_',
  'escapadas a la ciudad_',
  'días devacas_',
];
const COUNTRY_OPTIONS = [{ value: 'ES', label: 'España' }];
const YEAR_OPTIONS = [{ value: 2026, label: '2026' }];
const VACATION_TYPE_OPTIONS = [
  { value: 'laborables', label: 'laborables' },
  { value: 'naturales', label: 'naturales' }
];

const VacationOptimizer = () => {
  const [showForm, setShowForm] = useState(false);
  const [shouldScrollToForm, setShouldScrollToForm] = useState(false);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [openSelect, setOpenSelect] = useState(null);
  const [openSelectPlacement, setOpenSelectPlacement] = useState('down');
  const { config, setConfig } = useVacationConfig();
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [showLimitBanner, setShowLimitBanner] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPostalCodeTooltip, setShowPostalCodeTooltip] = useState(false);
  const [isTransitioningToCalendar, setIsTransitioningToCalendar] = useState(false);
  const [showFormOverlay, setShowFormOverlay] = useState(false);
  const [lastAction, setLastAction] = useState({ date: '', status: '' });
  const [animateSuggestedDays, setAnimateSuggestedDays] = useState([]);
  const calendarRef = useRef(null);
  const prevSuggestedRef = useRef([]);
  const outputRef = useRef(null);
  const formRef = useRef(null);
  const heroTitleRef = useRef(null);
  const headerRef = useRef(null);
  const isMobileRef = useRef({ matches: false });
  const countrySelectRef = useRef(null);
  const yearSelectRef = useRef(null);
  const vacationTypeSelectRef = useRef(null);
  const section3Ref = useRef(null);
  const holidayDateInputRef = useRef(null);
  const modalRef = useRef(null);
  const modalScrollRef = useRef(null);
  const prevWorkDaysRef = useRef(config.workDays);
  const heroSuffixes = HERO_SUFFIXES;
  const countryOptions = COUNTRY_OPTIONS;
  const yearOptions = YEAR_OPTIONS;
  const vacationTypeOptions = VACATION_TYPE_OPTIONS;
  const getSelectPlacement = (optionsCount, rect) => {
    const itemHeight = 40;
    const menuHeight = optionsCount * itemHeight + 8;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    return spaceBelow < menuHeight && spaceAbove > spaceBelow ? 'up' : 'down';
  };

  const { normalizeDate, getDateStr } = useDateFormatter();
  const { nationalHolidays, regionalHolidays, getHolidayInfo } = useHolidays(config);
  const {
    optimizedDays,
    setOptimizedDays,
    activeTooltip,
    handleDayClick,
    downloadCalendar,
    shareCalendar,
    isWeekend,
    isHoliday,
    vacationDaysNumber,
    daysAssigned,
    daysAvailable
  } = useCalendarState({
    config,
    setConfig,
    calendarRef,
    nationalHolidays,
    regionalHolidays,
    getDateStr,
    setLastAction,
    setShowLimitBanner
  });

  const getInvalidOverrides = (manualOverrides) => {
    return Object.keys(manualOverrides).filter((dateStr) => {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return isWeekend(date) || isHoliday(date);
    });
  };

  // Eliminar overrides en fines de semana o festivos según los días laborables actuales
  useEffect(() => {
    const invalidOverrides = getInvalidOverrides(config.manualOverrides);
    if (invalidOverrides.length > 0) {
      setConfig((prev) => {
        const newOverrides = { ...prev.manualOverrides };
        invalidOverrides.forEach((dateStr) => {
          delete newOverrides[dateStr];
        });
        return { ...prev, manualOverrides: newOverrides };
      });
      setOptimizedDays((prevOptimized) =>
        prevOptimized.filter((day) => !invalidOverrides.includes(day))
      );
    }

    prevWorkDaysRef.current = config.workDays;
  }, [config.workDays, config.manualOverrides, isHoliday, isWeekend, setOptimizedDays]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(max-width: 767px)');
    isMobileRef.current = mql;
    const handleChange = (event) => {
      isMobileRef.current = event.currentTarget;
    };

    if (mql.addEventListener) {
      mql.addEventListener('change', handleChange);
    } else {
      mql.addListener(handleChange);
    }

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handleChange);
      } else {
        mql.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    if (!showForm || !formRef.current || !shouldScrollToForm) return;

    if (isMobileRef.current.matches) {
      const headerHeight = headerRef.current?.offsetHeight ?? 0;
      const targetTop = formRef.current.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    } else {
      requestAnimationFrame(() => {
        const rect = formRef.current.getBoundingClientRect();
        const targetTop = rect.top + window.pageYOffset - (window.innerHeight - rect.height) / 2;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      });
    }
    setShouldScrollToForm(false);
  }, [showForm, shouldScrollToForm]);

  useEffect(() => {
    const handleScroll = () => {
      if (isTransitioningToCalendar || showCalendar || showFormOverlay) return;
      const triggerPoint = window.innerHeight * 0.5;
      const shouldShow = window.scrollY >= triggerPoint;
      const fadeProgress = Math.min(1, window.scrollY / triggerPoint);

      setShowForm((prev) => {
        if (!isMobileRef.current.matches && !prev && shouldShow) {
          setShouldScrollToForm(true);
        }
        return prev === shouldShow ? prev : shouldShow;
      });
      setHeroOpacity(1 - fadeProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isTransitioningToCalendar, showCalendar, showFormOverlay]);

  useEffect(() => {
    if (!openSelect) return;

    const refs = {
      country: countrySelectRef,
      year: yearSelectRef,
      vacationType: vacationTypeSelectRef
    };
    const activeRef = refs[openSelect];

    const handleClickOutside = (event) => {
      if (activeRef?.current && !activeRef.current.contains(event.target)) {
        setOpenSelect(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenSelect(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openSelect]);

  const heroTyped = useHeroTyping(heroSuffixes);

  const handlePrimaryAction = () => {
    if (!showForm) {
      setShowForm(true);
      setShouldScrollToForm(true);
      return;
    }
    handleOptimizeVacations();
  };
  const handleLogoClick = useCallback(() => {
    setShowCalendar(false);
    setShowForm(false);
    setHeroOpacity(1);
    setShouldScrollToForm(false);
    setShowFormOverlay(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const handleEditPreferences = useCallback(() => {
    setShowCalendar(true);
    setShowForm(true);
    setShouldScrollToForm(true);
    setShowFormOverlay(true);
  }, []);
  const handleCloseFormOverlay = useCallback(() => {
    setShowFormOverlay(false);
    setShowForm(false);
    setShouldScrollToForm(false);
  }, []);
  const handleHelpModalBackdropClick = useCallback((event) => {
    if (event.target === event.currentTarget) {
      setShowHelpModal(false);
    }
  }, []);
  const { optimizeVacations } = useVacationOptimizer({
    config,
    normalizeDate,
    getDateStr,
    isHoliday,
    isWeekend,
    optimizedDays,
    setOptimizedDays,
    setConfig,
    setShowCalendar,
    outputRef
  });

  const handleOptimizeVacations = useCallback(() => {
    if (isTransitioningToCalendar) return;
    setIsTransitioningToCalendar(true);
    setShowForm(false);
    setShowFormOverlay(false);
    window.setTimeout(() => {
      optimizeVacations();
      setIsTransitioningToCalendar(false);
    }, 700);
  }, [isTransitioningToCalendar, optimizeVacations]);

  const handleResetCalendar = useCallback(() => {
    setOptimizedDays([]);
    setAnimateSuggestedDays([]);
    prevSuggestedRef.current = [];
    setShowLimitBanner(false);
    setLastAction({ date: '', status: '' });
    setConfig((prev) => ({ ...prev, manualOverrides: {} }));
  }, [setConfig, setOptimizedDays]);

  useEffect(() => {
    if (!showCalendar) return;
    const prevSuggested = new Set(prevSuggestedRef.current);
    let newlySuggested = optimizedDays.filter((day) => !prevSuggested.has(day));
    if (lastAction.status === 'sugerido' && lastAction.date) {
      newlySuggested = newlySuggested.filter((day) => day !== lastAction.date);
    }

    if (newlySuggested.length > 0) {
      setAnimateSuggestedDays(newlySuggested);
      if (isMobileRef.current?.matches) {
        const container = calendarRef.current;
        if (container) {
          const target = container.querySelector(`[data-date="${newlySuggested[0]}"]`);
          if (target) {
            const containerRect = container.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const targetTop =
              targetRect.top -
              containerRect.top +
              container.scrollTop -
              container.clientHeight / 2 +
              targetRect.height / 2;
            container.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
          }
        }
      }
      const timeoutId = window.setTimeout(() => {
        setAnimateSuggestedDays([]);
      }, 3000);
      prevSuggestedRef.current = optimizedDays;
      return () => window.clearTimeout(timeoutId);
    }

    prevSuggestedRef.current = optimizedDays;
  }, [optimizedDays, showCalendar, lastAction]);

  // Prevenir scroll horizontal
  useEffect(() => {
    document.body.style.overflowX = 'hidden';
    return () => {
      document.body.style.overflowX = '';
    };
  }, []);

  // Cerrar modal con tecla ESC y focus trap
  useEffect(() => {
    if (!showHelpModal) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowHelpModal(false);
      }
    };

    const handleTab = (e) => {
      if (e.key !== 'Tab' || !modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Enfocar el primer elemento focusable cuando se abre el modal
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements && focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    window.addEventListener('keydown', handleEscape);
    window.addEventListener('keydown', handleTab);

    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('keydown', handleTab);
    };
  }, [showHelpModal]);

  useEffect(() => {
    if (!showFormOverlay) return;
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleCloseFormOverlay();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showFormOverlay, handleCloseFormOverlay]);

  useEffect(() => {
    if (!showHelpModal) return;
    const scrollEl = modalScrollRef.current;
    if (!scrollEl) return;

    let timeoutId;
    const handleScroll = () => {
      scrollEl.classList.add('is-scrolling');
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        scrollEl.classList.remove('is-scrolling');
      }, 600);
    };

    scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      scrollEl.removeEventListener('scroll', handleScroll);
      window.clearTimeout(timeoutId);
    };
  }, [showHelpModal]);

  // Controlar overflow del body al abrir modal
  useEffect(() => {
    if (showHelpModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [showHelpModal]);

  // Cargar configuración desde localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vacationConfig');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setConfig(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading config from localStorage:', error);
      // Continuar con la configuración por defecto
    }
  }, []);

  // Guardar configuración en localStorage con debounce
  // Reduce escrituras de ~50/segundo a 1 cada 500ms
  useDebounceLocalStorage('vacationConfig', config, 500);

  const {
    newHoliday,
    setNewHoliday,
    holidayError,
    setHolidayError,
    postalCodeError,
    handlePostalCodeChange,
    addCustomHoliday,
    removeCustomHoliday
  } = useVacationFormState({ config, setConfig, holidayDateInputRef });


  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Hero Section con video de fondo */}
      <div className="fixed inset-0 z-0">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="https://irzives3xaevat4z.public.blob.vercel-storage.com/video-mar.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className={`absolute inset-0 ${showCalendar ? 'backdrop-blur-md bg-white/20' : 'bg-black/20'}`}></div>
      </div>

      {/* Header fijo */}
      <AppHeader
        headerRef={headerRef}
        showCalendar={showCalendar}
        showForm={showForm}
        onPrimaryAction={handlePrimaryAction}
        onShowHelpModal={() => setShowHelpModal(true)}
        onLogoClick={handleLogoClick}
        calendarStats={{
          daysAssigned,
          daysAvailable
        }}
      />

      {/* Help Modal */}
      {showHelpModal && (
        <HelpModal
          modalRef={modalRef}
          modalScrollRef={modalScrollRef}
          onBackdropClick={handleHelpModalBackdropClick}
          onClose={() => setShowHelpModal(false)}
        />
      )}

      {!showCalendar && (
        <>
          {/* Hero Section - H1 grande */}
          <HeroSection
            heroOpacity={heroOpacity}
            heroTitleRef={heroTitleRef}
            heroTyped={heroTyped}
          />
        </>
      )}

      {showFormOverlay ? (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={handleCloseFormOverlay}
        >
          <div className="w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <VacationForm
              isOverlay
              showForm={showForm}
              formRef={formRef}
              holidayDateInputRef={holidayDateInputRef}
              section3Ref={section3Ref}
              optimizeVacations={handleOptimizeVacations}
              configState={{ config, setConfig }}
              selectState={{
                openSelect,
                setOpenSelect,
                openSelectPlacement,
                setOpenSelectPlacement,
                getSelectPlacement,
                options: {
                  country: countryOptions,
                  year: yearOptions,
                  vacationType: vacationTypeOptions
                },
                refs: {
                  country: countrySelectRef,
                  year: yearSelectRef,
                  vacationType: vacationTypeSelectRef
                }
              }}
              formState={{
                postalCodeError,
                handlePostalCodeChange,
                newHoliday,
                setNewHoliday,
                holidayError,
                setHolidayError,
                addCustomHoliday,
                removeCustomHoliday
              }}
              tooltipState={{
                showPostalCodeTooltip,
                setShowPostalCodeTooltip
              }}
            />
          </div>
        </div>
      ) : (
        !showCalendar && (
          <VacationForm
            showForm={showForm}
            formRef={formRef}
            holidayDateInputRef={holidayDateInputRef}
            section3Ref={section3Ref}
            optimizeVacations={handleOptimizeVacations}
            configState={{ config, setConfig }}
            selectState={{
              openSelect,
              setOpenSelect,
              openSelectPlacement,
              setOpenSelectPlacement,
              getSelectPlacement,
              options: {
                country: countryOptions,
                year: yearOptions,
                vacationType: vacationTypeOptions
              },
              refs: {
                country: countrySelectRef,
                year: yearSelectRef,
                vacationType: vacationTypeSelectRef
              }
            }}
            formState={{
              postalCodeError,
              handlePostalCodeChange,
              newHoliday,
              setNewHoliday,
              holidayError,
              setHolidayError,
              addCustomHoliday,
              removeCustomHoliday
            }}
            tooltipState={{
              showPostalCodeTooltip,
              setShowPostalCodeTooltip
            }}
          />
        )
      )}

      {/* Calendar Section */}
      {showCalendar && (
        <>
          {showLimitBanner && (
            <div className="fixed top-20 md:top-24 left-0 right-0 z-40 px-6 md:px-16">
              <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded-[4px]">
                <p className="font-regular text-sm">Ya has utilizado todos tus días de vacaciones disponibles ({vacationDaysNumber} días). Elimina días confirmados para añadir más.</p>
              </div>
            </div>
          )}
          <CalendarActionBar
            onSuggest={handleOptimizeVacations}
            onEditPreferences={handleEditPreferences}
            onReset={handleResetCalendar}
            onShare={shareCalendar}
          />
          <div className="animate-fade-in">
            <CalendarLayout
              calendarData={{
                config,
                calendarRef,
                lastAction,
                daysAssigned,
                daysAvailable,
                showLimitBanner,
                vacationDaysNumber
              }}
              calendarLogic={{
                normalizeDate,
                getDateStr,
                isWeekend,
                isHoliday,
                getHolidayInfo,
                optimizedDays,
                animateSuggestedDays,
                activeTooltip,
                handleDayClick
              }}
            />
          </div>
        </>
      )}

      {/* Footer */}
      <AppFooter showCalendar={showCalendar} showForm={showForm} showFormOverlay={showFormOverlay} />
    </div>
  );
};

export default VacationOptimizer;
