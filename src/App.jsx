import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp, Plus, X, Calendar as CalendarIcon, Info, Moon, Sun, Trash2 } from 'lucide-react';
import Calendar from './components/Calendar';
import useDateFormatter from './hooks/useDateFormatter';
import useHolidays from './hooks/useHolidays';
import useCalendarState from './hooks/useCalendarState';
import useVacationOptimizer from './hooks/useVacationOptimizer';
import useDebounceLocalStorage from './hooks/useDebounceLocalStorage';
import { POSTAL_TO_REGION } from './constants/holidays';
import { THEME_COLORS } from './constants/colors';
import { useTheme } from './contexts/ThemeContext';

const VacationOptimizer = () => {
  const { isDark, toggleTheme } = useTheme();
  const [expanded, setExpanded] = useState({ section1: false, section2: false, section3: false });
  const [showForm, setShowForm] = useState(false);
  const [shouldScrollToForm, setShouldScrollToForm] = useState(false);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [heroPhraseIndex, setHeroPhraseIndex] = useState(0);
  const [heroTyped, setHeroTyped] = useState('');
  const [heroIsDeleting, setHeroIsDeleting] = useState(false);
  const [openSelect, setOpenSelect] = useState(null);
  const [openSelectPlacement, setOpenSelectPlacement] = useState('down');
  const [config, setConfig] = useState({
    country: 'ES',
    postalCode: '',
    year: 2026,
    vacationDays: 22,
    vacationType: 'laborables',
    workDays: 'L-V',
    weeklyBlocks: false,
    prioritizeSummerWinter: false,
    customHolidays: [],
    manualOverrides: {}
  });
  
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });
  const [showCalendar, setShowCalendar] = useState(false);
  const [showLimitBanner, setShowLimitBanner] = useState(false);
  const [holidayError, setHolidayError] = useState('');
  const [postalCodeError, setPostalCodeError] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPostalCodeTooltip, setShowPostalCodeTooltip] = useState(false);
  const [lastAction, setLastAction] = useState({ date: '', status: '' });
  const calendarRef = useRef(null);
  const outputRef = useRef(null);
  const formRef = useRef(null);
  const heroTitleRef = useRef(null);
  const headerRef = useRef(null);
  const countrySelectRef = useRef(null);
  const yearSelectRef = useRef(null);
  const vacationTypeSelectRef = useRef(null);
  const section3Ref = useRef(null);
  const holidayDateInputRef = useRef(null);
  const modalRef = useRef(null);
  const prevWorkDaysRef = useRef(config.workDays);
  const heroSuffixes = useMemo(
    () => [
      'descansos significativos_',
      'rutas por la montaña_',
      'viajes en familia_',
      'paseos por la playa_',
      'escapadas a la ciudad_',
      'fiestas en el pueblo_',
      'días devacas_',
    ],
    []
  );
  const countryOptions = useMemo(() => [{ value: 'ES', label: 'España' }], []);
  const yearOptions = useMemo(() => [{ value: 2026, label: '2026' }], []);
  const vacationTypeOptions = useMemo(
    () => [
      { value: 'laborables', label: 'laborables' },
      { value: 'naturales', label: 'naturales' }
    ],
    []
  );
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
    isWeekend,
    isHoliday,
    vacationDaysNumber,
    daysGenerated,
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

  // Eliminar sábados confirmados cuando se cambia de L-S a L-V
  useEffect(() => {
    const prevWorkDays = prevWorkDaysRef.current;
    const currentWorkDays = config.workDays;
    
    // Solo ejecutar si cambió de 'L-S' a 'L-V'
    if (prevWorkDays === 'L-S' && currentWorkDays === 'L-V') {
      // Usar función de actualización para acceder al estado actual
      setConfig((prev) => {
        // Buscar todos los sábados confirmados y eliminarlos
        const saturdaysToRemove = [];
        
        Object.keys(prev.manualOverrides).forEach((dateStr) => {
          if (prev.manualOverrides[dateStr] === 'confirmed') {
            // Parsear la fecha (formato YYYY-MM-DD)
            const [year, month, day] = dateStr.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            const dayOfWeek = date.getDay(); // 0 = domingo, 6 = sábado
            
            if (dayOfWeek === 6) { // Es sábado
              saturdaysToRemove.push(dateStr);
            }
          }
        });

        if (saturdaysToRemove.length > 0) {
          const newOverrides = { ...prev.manualOverrides };
          saturdaysToRemove.forEach((dateStr) => {
            delete newOverrides[dateStr];
          });
          
          // También eliminar de optimizedDays
          setOptimizedDays((prevOptimized) => 
            prevOptimized.filter((day) => !saturdaysToRemove.includes(day))
          );
          
          return { ...prev, manualOverrides: newOverrides };
        }
        
        return prev;
      });
    }
    
    // Actualizar el ref con el valor actual
    prevWorkDaysRef.current = currentWorkDays;
  }, [config.workDays, setOptimizedDays]);

  useEffect(() => {
    if (!showForm || !formRef.current) return;

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const shouldScroll = shouldScrollToForm || (!isMobile && heroOpacity < 1);
    if (!shouldScroll) return;

    const headerHeight = headerRef.current?.offsetHeight ?? 0;
    const targetTop = formRef.current.getBoundingClientRect().top + window.pageYOffset - headerHeight;
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
    setShouldScrollToForm(false);
  }, [showForm, shouldScrollToForm, heroOpacity]);

  useEffect(() => {
    const handleScroll = () => {
      const triggerPoint = window.innerHeight * 0.5;
      const shouldShow = window.scrollY >= triggerPoint;
      const fadeProgress = Math.min(1, window.scrollY / triggerPoint);

      setShowForm((prev) => (prev === shouldShow ? prev : shouldShow));
      setHeroOpacity(1 - fadeProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  useEffect(() => {
    const currentPhrase = heroSuffixes[heroPhraseIndex];
    let timeoutId;

    if (!heroIsDeleting) {
      if (heroTyped === currentPhrase) {
        timeoutId = window.setTimeout(() => setHeroIsDeleting(true), 1200);
      } else {
        timeoutId = window.setTimeout(
          () => setHeroTyped(currentPhrase.slice(0, heroTyped.length + 1)),
          80
        );
      }
    } else {
      if (heroTyped === '') {
        setHeroIsDeleting(false);
        setHeroPhraseIndex((prev) => (prev + 1) % heroSuffixes.length);
      } else {
        timeoutId = window.setTimeout(
          () => setHeroTyped(currentPhrase.slice(0, heroTyped.length - 1)),
          40
        );
      }
    }

    return () => window.clearTimeout(timeoutId);
  }, [heroTyped, heroIsDeleting, heroPhraseIndex, heroSuffixes]);

  const handlePrimaryAction = () => {
    if (!showForm) {
      setShowForm(true);
      setShouldScrollToForm(true);
      return;
    }
    optimizeVacations();
  };
  const { optimizeVacations } = useVacationOptimizer({
    config,
    normalizeDate,
    getDateStr,
    isHoliday,
    isWeekend,
    setOptimizedDays,
    setConfig,
    setShowCalendar,
    setExpanded,
    outputRef
  });

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

  const toggleSection = useCallback((section) => {
    setExpanded(prev => {
      const isCurrentlyExpanded = prev[section];

      // Si la sección ya está expandida, contraerla
      if (isCurrentlyExpanded) {
        return { ...prev, [section]: false };
      }

      // Si no, contraer todas y expandir solo la seleccionada
      const newState = {
        section1: false,
        section2: false,
        section3: false,
        [section]: true
      };

      // Si expandimos la sección 3, hacer scroll después de que se expanda
      if (section === 'section3') {
        setTimeout(() => {
          if (section3Ref.current) {
            const rect = section3Ref.current.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const targetPosition = scrollTop + rect.bottom - window.innerHeight + 40;

            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      }

      return newState;
    });
  }, []);

  const handlePostalCodeChange = useCallback((value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 5);
    setConfig(prev => {
      // Mostrar warning si el código no mapea a ninguna región (solo para España)
      if (prev.country === 'ES') {
        const province = cleaned.substring(0, 2);
        if (cleaned.length === 5 && !POSTAL_TO_REGION[province]) {
          setPostalCodeError('Código postal no reconocido');
        } else {
          setPostalCodeError('');
        }
      } else {
        setPostalCodeError('');
      }
      
      return { ...prev, postalCode: cleaned };
    });
  }, []);

  const addCustomHoliday = useCallback(() => {
    if (!newHoliday.name.trim()) {
      setHolidayError('Debes indicar el nombre del festivo.');
      return;
    }
    if (!newHoliday.date) {
      setHolidayError('Debes indicar la fecha del festivo.');
      return;
    }
    // Validar formato DD/MM
    const datePattern = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/;
    if (!datePattern.test(newHoliday.date)) {
      setHolidayError('Formato de fecha inválido. Usa DD/MM (Ej: 25/12).');
      return;
    }
    if (newHoliday.date && newHoliday.name) {
      // Convertir DD/MM a formato YYYY-MM-DD
      const [day, month] = newHoliday.date.split('/');
      const fullDate = `${config.year}-${month}-${day}`;
      setConfig(prev => ({
        ...prev,
        customHolidays: [...prev.customHolidays, { date: fullDate, name: newHoliday.name }]
      }));
      setNewHoliday({ date: '', name: '' });
      setHolidayError('');

      // Hacer focus en el campo de fecha para añadir otro festivo
      setTimeout(() => {
        holidayDateInputRef.current?.focus();
      }, 0);
    }
  }, [config.year, newHoliday.date, newHoliday.name]);

  const removeCustomHoliday = useCallback((index) => {
    setConfig(prev => ({
      ...prev,
      customHolidays: prev.customHolidays.filter((_, i) => i !== index)
    }));
  }, []);


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
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Header fijo */}
      <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 py-6 md:py-8">
        <div className="w-full mx-auto px-6 md:px-16 pb-6 md:pb-16 flex justify-between items-center">
          {/* Logo */}
          <h1 className="text-2xl md:text-3xl font-medium text-white uppercase tracking-tight">devacas_</h1>
          
          {/* Botones derecha */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowHelpModal(true)}
              className="text-white uppercase text-sm font-medium tracking-wide hover:opacity-70 transition-opacity"
            >
              <span className="hidden md:inline">¿Cómo funciona?</span>
              <Info className="md:hidden" size={18} aria-hidden="true" />
            </button>
            <button
              onClick={handlePrimaryAction}
              className={`px-6 py-2.5 bg-black text-white uppercase text-sm font-medium tracking-wide rounded-full items-center gap-2 hover:bg-gray-900 transition-colors ${showForm ? 'hidden' : 'flex'}`}
            >
              {showForm ? 'Optimizar mis vacaciones' : 'Empezar'}
            </button>
          </div>
        </div>
      </header>

      {/* Help Modal */}
      {showHelpModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowHelpModal(false)}
        >
          <div
            ref={modalRef}
            className="bg-white rounded-[4px] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 id="modal-title" className="text-2xl font-semibold text-black">¿Cómo funciona devacas_?</h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className="rounded-full p-2 text-gray-500 hover:text-gray-700"
                aria-label="Cerrar modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 space-y-8">
              {/* Sección 1: Eficiencia */}
              <section>
                <p className="text-gray-700 mb-3">
                  <strong>devacas_</strong> analiza todo el calendario del año para encontrar las mejores oportunidades de maximizar tus días libres,
                  priorizando periodos extendidos de vacaciones* según su ratio de eficiencia:
                </p>
                <div className="bg-orange-50 p-4 mb-3" style={{ borderLeft: `4px solid ${THEME_COLORS.primary}` }}>
                  <p className="font-mono text-sm text-gray-800">
                    <strong>Eficiencia</strong> = Días libres totales / Días de vacaciones gastados
                  </p>
                </div>
                <p className="text-gray-700 mb-3 text-sm">
                  *El algoritmo entiende por periodos extendidos de vacaciones aquellos de 3 o más días, buscando siempre el mejor ratio posible.
                </p>
              </section>

              {/* Sección 2: Funcionamiento */}
              <section>
                <h3 className="text-xl font-semibold mb-3 text-black">Máximo descanso personalizado</h3>
                  <p className="text-gray-700 mb-3">
                  Mientras otras herramientas se limitan a decirte cuándo caen los puentes, <strong>devacas_</strong> se adapta a tu realidad.
                </p>
                <p className="text-gray-700 mb-3">
                  Elige entre vacaciones en días naturales o laborables, define tus días de trabajo, añade festivos por convenio e indica si tienes alguna limitación a la hora de cogerte vacaciones.
                </p>
                <p className="text-gray-700 mb-2">
                  A partir de ahí, el algoritmo busca los huecos más rentables y te propone un calendario optimizado para ti, no para "la media".
                </p>
                <p className="text-gray-700 mb-2">
                  ¿Que un día no te convence? Lo quitas.
                </p>
                <p className="text-gray-700 mb-2">
                  ¿Que prefieres este otro? Lo reservas.
                </p>
                <p className="text-gray-700 mb-2">
                  ¿Que este fin de semana se casa tu prima y tienes que estar aquí? Lo bloqueas.
                </p>
              </section>

              {/* Sección 3: Fuentes */}
              <section>
                <h3 className="text-xl font-semibold mb-3 text-black">Fuentes de datos</h3>
                <p className="text-gray-700 mb-2">
                  Los festivos están incluidos directamente en el código de la aplicación.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>Festivos nacionales:</strong> <a href="https://date.nager.at/" className="text-blue-600 hover:underline">Nager.Date API</a></li>
                  <li><strong>Festivos autonómicos:</strong> <a href="https://www.rtve.es/noticias/20251006/calendario-laboral-2026-festivos-puentes-nacionales-autonomicos/16744047.shtml" className="text-blue-600 hover:underline">Este artículo recopilatorio de RTVE</a></li>
                </ul>
                <p className="text-gray-700 text-sm mt-3">
                  *Los datos se basan en el calendario oficial español. Puedes añadir festivos adicionales
                  en la sección "Festivos de convenio / locales" si tu empresa o localidad tiene días especiales.
                </p>
              </section>

              {/* Nota final */}
              <div className="bg-gray-50 rounded p-4 text-sm text-gray-600">
                <p>
                  💡 <strong>Recuerda:</strong> Esta es una herramienta de planificación.
                  Los días propuestos son sugerencias que puedes confirmar, modificar o eliminar según tus necesidades.
                  Verifica siempre las políticas de vacaciones de tu empresa.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - H1 grande */}
      <div className="h-screen" aria-hidden="true" />
      <div
        className="fixed inset-0 z-10 flex items-end transition-opacity duration-700 ease-in-out pointer-events-none"
        style={{ opacity: heroOpacity }}
      >
        <div className="w-full mx-auto px-6 md:px-16 pb-6 md:pb-16">
          <h1
            ref={heroTitleRef}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white uppercase tracking-tight leading-tight w-full min-h-[6.4em] md:min-h-[2em]"
          >
            <span className="block">Convierte días sueltos en</span>
            <span className="block min-h-[2.4em] md:min-h-[1em]">{heroTyped || '\u00A0'}</span>
          </h1>
        </div>
      </div>

      {/* Formulario con blur overlay - oculto al inicio */}
      <div
        ref={formRef}
        className={`relative z-20 mt-12 md:mt-16 transition-opacity duration-700 ease-in-out ${showForm ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="backdrop-blur-md bg-white/20 rounded-3xl shadow-2xl w-full max-w-4xl mx-auto px-12 md:px-16 py-12 md:py-16">
          <div className="space-y-12">

            {/* Sección 1: Configuración básica */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-medium mb-6 text-black tracking-tight">Empecemos por lo básico</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="block mb-2 font-medium text-black">País</h3>
                <div ref={countrySelectRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (openSelect === 'country') {
                        setOpenSelect(null);
                        return;
                      }
                      const rect = countrySelectRef.current?.getBoundingClientRect();
                      if (rect) {
                        setOpenSelectPlacement(getSelectPlacement(countryOptions.length, rect));
                      }
                      setOpenSelect('country');
                    }}
                    className="w-full py-2 px-4 bg-black/30 text-white rounded-full flex items-center justify-between"
                    aria-haspopup="listbox"
                    aria-expanded={openSelect === 'country'}
                  >
                    <span>{countryOptions.find((opt) => opt.value === config.country)?.label}</span>
                    <ChevronDown className="text-white" size={18} />
                  </button>
                  {openSelect === 'country' && (
                    <div className={`absolute ${openSelectPlacement === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'} w-full bg-black/80 text-white rounded-2xl shadow-lg z-20 p-1`}>
                      {countryOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setConfig((prev) => ({ ...prev, country: opt.value }));
                            setOpenSelect(null);
                          }}
                          className="w-full text-left px-4 py-2 rounded-xl hover:bg-white/10"
                          role="option"
                          aria-selected={config.country === opt.value}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="block mb-2 font-medium flex items-center gap-2 text-black">
                  Código postal
                  <div className="relative group">
                    <Info
                      size={18}
                      className="text-black cursor-help"
                      onClick={() => {
                        setShowPostalCodeTooltip(true);
                        setTimeout(() => setShowPostalCodeTooltip(false), 3000);
                      }}
                    />
                    <div className={`absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900  text-white text-sm rounded-[4px] shadow-lg transition-all duration-200 z-20 ${
                      showPostalCodeTooltip ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'
                    }`}>
                      Los días festivos se calculan en base a este código postal.
                    </div>
                  </div>
                </h3>
                <input
                  type="text"
                  value={config.postalCode}
                  onChange={(e) => handlePostalCodeChange(e.target.value)}
                  placeholder="Ej: 15009"
                  className="w-full py-2 px-4 bg-black/30 text-white placeholder:text-white/50 rounded-full"
                  maxLength="5"
                  aria-labelledby="postal-code-heading"
                />
                {postalCodeError && (
                  <p className="text-sm text-orange-600 mt-1">⚠️ {postalCodeError}</p>
                )}
              </div>

              <div>
                <h3 className="block mb-2 font-medium text-black">Año</h3>
                <div ref={yearSelectRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (openSelect === 'year') {
                        setOpenSelect(null);
                        return;
                      }
                      const rect = yearSelectRef.current?.getBoundingClientRect();
                      if (rect) {
                        setOpenSelectPlacement(getSelectPlacement(yearOptions.length, rect));
                      }
                      setOpenSelect('year');
                    }}
                    className="w-full py-2 px-4 bg-black/30 text-white rounded-full flex items-center justify-between"
                    aria-haspopup="listbox"
                    aria-expanded={openSelect === 'year'}
                  >
                    <span>{yearOptions.find((opt) => opt.value === config.year)?.label}</span>
                    <ChevronDown className="text-white" size={18} />
                  </button>
                  {openSelect === 'year' && (
                    <div className={`absolute ${openSelectPlacement === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'} w-full bg-black/80 text-white rounded-2xl shadow-lg z-20 p-1`}>
                      {yearOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setConfig((prev) => ({ ...prev, year: opt.value }));
                            setOpenSelect(null);
                          }}
                          className="w-full text-left px-4 py-2 rounded-xl hover:bg-white/10"
                          role="option"
                          aria-selected={config.year === opt.value}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="block mb-2 font-medium text-black">Días de vacaciones</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                    type="number"
                    value={config.vacationDays}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = value === '' ? '' : parseInt(value, 10);
                      setConfig(prev => ({ ...prev, vacationDays: isNaN(numValue) ? '' : numValue }));
                    }}
                    className="w-full py-2 px-4 bg-black/30 text-white rounded-full appearance-none"
                    min="0"
                    />
                  </div>
                  <div ref={vacationTypeSelectRef} className="relative flex-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (openSelect === 'vacationType') {
                          setOpenSelect(null);
                          return;
                        }
                        const rect = vacationTypeSelectRef.current?.getBoundingClientRect();
                        if (rect) {
                          setOpenSelectPlacement(getSelectPlacement(vacationTypeOptions.length, rect));
                        }
                        setOpenSelect('vacationType');
                      }}
                      className="w-full py-2 px-4 bg-black/30 text-white rounded-full flex items-center justify-between whitespace-nowrap"
                      aria-haspopup="listbox"
                      aria-expanded={openSelect === 'vacationType'}
                    >
                      <span>{vacationTypeOptions.find((opt) => opt.value === config.vacationType)?.label}</span>
                      <ChevronDown className="text-white" size={18} />
                    </button>
                    {openSelect === 'vacationType' && (
                      <div className={`absolute ${openSelectPlacement === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'} w-full bg-black/80 text-white rounded-2xl shadow-lg z-20 p-1`}>
                        {vacationTypeOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setConfig((prev) => ({ ...prev, vacationType: opt.value }));
                              setOpenSelect(null);
                            }}
                            className="w-full text-left px-4 py-2 rounded-xl hover:bg-white/10"
                            role="option"
                            aria-selected={config.vacationType === opt.value}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {config.country === 'ES' && (config.vacationDays === '' || config.vacationDays < 22) && (
                  <p className="text-sm text-red-700 mt-2">
                    ⚠️ En España el mínimo legal son 22 días laborables.
                  </p>
                )}
              </div>
            </div>

            </div>
            
            {/* Sección 2: Festivos de convenio */}
            <div>
              <h2 className="text-2xl md:text-3xl font-medium mb-6 text-black tracking-tight">Añade tus festivos locales / por convenio</h2>
              <div>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
              <input
                ref={holidayDateInputRef}
                type="text"
                value={newHoliday.date}
                onChange={(e) => {
                  let value = e.target.value.replace(/[^\d]/g, ''); // Solo números

                  // Formatear automáticamente con /
                  if (value.length >= 2) {
                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                  }

                  setNewHoliday(prev => ({ ...prev, date: value }));
                  if (holidayError) setHolidayError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addCustomHoliday();
                  }
                }}
                placeholder="DD/MM (Ej: 25/12)"
                className="flex-1 py-2 px-4 bg-black/30 text-white placeholder:text-white/50 rounded-full"
                maxLength="5"
              />
              <input
                type="text"
                value={newHoliday.name}
                onChange={(e) => {
                  setNewHoliday(prev => ({ ...prev, name: e.target.value }));
                  if (holidayError) setHolidayError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addCustomHoliday();
                  }
                }}
                placeholder="Nombre del festivo"
                className="flex-1 py-2 px-4 bg-black/30 text-white placeholder:text-white/50 rounded-full"
              />
              <button
                onClick={addCustomHoliday}
                className="w-full md:w-auto px-6 py-2 bg-white text-black flex items-center justify-center gap-2 rounded-full transition-colors"
              >
                <Plus size={20} /> Añadir
              </button>
            </div>

            {holidayError && (
              <p className="text-sm text-red-600 mb-4">{holidayError}</p>
            )}

            {config.customHolidays.length > 0 && (
              <div className="space-y-0">
                {config.customHolidays.map((holiday, idx) => {
                  const [year, month, day] = holiday.date.split('-');
                  const formattedDate = `${day}/${month}/${year}`;
                  return (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-transparent">
                      <span className="text-white">
                        <strong>{formattedDate}</strong> - {holiday.name}
                      </span>
                      <button
                        onClick={() => removeCustomHoliday(idx)}
                        className="flex items-center text-red-500 hover:text-red-600"
                      >
                        <X size={22} strokeWidth={2.5} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
              </div>
            </div>
            
            {/* Sección 3: Personalización */}
            <div ref={section3Ref}>
              <h2 className="text-2xl md:text-3xl font-medium mb-6 text-black tracking-tight">Escoge tus preferencias</h2>
              <div className="space-y-6">
                {/* Contenedor de preguntas - Grid de 2 columnas en desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Columna izquierda - Checkboxes */}
              <div className="space-y-3">
                <div>
                  <label htmlFor="weekly-blocks" className="flex items-center gap-3 cursor-pointer">
                    <input
                      id="weekly-blocks"
                      type="checkbox"
                      checked={config.weeklyBlocks}
                      onChange={(e) => setConfig(prev => ({ ...prev, weeklyBlocks: e.target.checked }))}
                      className="w-5 h-5 cursor-pointer"
                      style={{ accentColor: THEME_COLORS.primary }}
                    />
                    <span className="font-medium text-black">Vacaciones en bloques semanales</span>
                  </label>
                </div>

                <div>
                  <label htmlFor="prioritize-summer-winter" className="flex items-center gap-3 cursor-pointer">
                    <input
                      id="prioritize-summer-winter"
                      type="checkbox"
                      checked={config.prioritizeSummerWinter}
                      onChange={(e) => setConfig(prev => ({ ...prev, prioritizeSummerWinter: e.target.checked }))}
                      className="w-5 h-5 cursor-pointer"
                      style={{ accentColor: THEME_COLORS.primary }}
                    />
                    <span className="font-medium text-black">Priorizar verano y Navidad</span>
                  </label>
                </div>
              </div>

              {/* Columna derecha - Horario laboral */}
              <div>
                <label className="block mb-3 font-medium text-black">¿Qué días trabajas?</label>
                <div className="grid grid-cols-2 gap-4">
                  <label htmlFor="workdays-lv" className="flex items-center gap-3 cursor-pointer text-black">
                    <input
                      id="workdays-lv"
                      type="radio"
                      name="workDays"
                      value="L-V"
                      checked={config.workDays === 'L-V'}
                      onChange={(e) => setConfig(prev => ({ ...prev, workDays: e.target.value }))}
                      className="w-5 h-5 cursor-pointer flex-shrink-0"
                      style={{ accentColor: THEME_COLORS.primary }}
                    />
                    Lunes a viernes
                  </label>
                  <label htmlFor="workdays-ls" className="flex items-center gap-3 cursor-pointer text-black">
                    <input
                      id="workdays-ls"
                      type="radio"
                      name="workDays"
                      value="L-S"
                      checked={config.workDays === 'L-S'}
                      onChange={(e) => setConfig(prev => ({ ...prev, workDays: e.target.value }))}
                      className="w-5 h-5 cursor-pointer flex-shrink-0"
                      style={{ accentColor: THEME_COLORS.primary }}
                    />
                    Lunes a sábado
                  </label>
                </div>
              </div>
            </div>

              </div>
            </div>

            {/* Botón Optimizar */}
            <div className="flex justify-center">
              <button
                onClick={optimizeVacations}
                className="px-8 py-4 bg-black text-white uppercase text-sm font-medium tracking-wide rounded-full flex items-center gap-3 hover:bg-gray-900 transition-colors"
              >
                <CalendarIcon size={20} />
                Optimizar mis vacaciones
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Section - aparece después del formulario */}
      {showCalendar && (
        <div className="relative z-30 mt-12 bg-white">
          {/* Output Section - Resume */}
          <div ref={outputRef} className="sticky top-0 z-10 backdrop-blur bg-black">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
              <div className="grid grid-cols-3 gap-4 md:gap-8">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl text-white font-bold mb-2">{vacationDaysNumber}</div>
                  <div className="text-sm text-white font-light">Generados</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl text-white font-bold mb-2">{daysAssigned}</div>
                  <div className="text-sm text-white font-light">Asignados</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl text-white font-bold mb-2">{daysAvailable}</div>
                  <div className="text-sm text-white font-light">Disponibles</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6" ref={calendarRef}>
              {/* Leyenda */}
              <div className="w-full mt-6 mb-4 bg-gray-50 py-6 rounded-[4px] flex flex-col items-center text-left md:text-center px-4">
                <div className="space-y-3 text-sm w-full text-black">
                  <p>
                    Los días generados por el algoritmo se confirman automáticamente. Haz clic en ellos para rechazarlos si no te convienen.
                  </p>
                  <p>
                    También puedes hacer clic en cualquier otra fecha del calendario para confirmarla o bloquearla según necesites.
                  </p>
                </div>
              </div>
              <div className="w-full flex justify-center mb-6">
                <div className="flex flex-wrap justify-center gap-6 text-sm text-black">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 border border-gray-200 rounded"></div>
                    <span>Confirmado</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-red-100 border border-gray-200 rounded"></div>
                    <span>Bloqueado</span>
                  </div>
                </div>
              </div>

              {/* Banner de límite alcanzado */}
              {showLimitBanner && (
                <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-6">
                  <p className="font-medium">Ya has utilizado todos tus días de vacaciones disponibles ({vacationDaysNumber} días). Elimina días confirmados para añadir más.</p>
                </div>
              )}

              {/* Región aria-live para anunciar cambios a lectores de pantalla */}
              <div aria-live="polite" aria-atomic="true" className="sr-only">
                {lastAction.date && `Día ${lastAction.date} ${lastAction.status}`}
              </div>

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
                activeTooltip={activeTooltip}
                onDayClick={handleDayClick}
              />
            </div>

            {/* Botones de acción */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                {/* Botón Recalcular - secundario */}
                <button
                  onClick={optimizeVacations}
                className="px-6 py-3 bg-white rounded-full transition-colors whitespace-nowrap"
                  style={{ color: THEME_COLORS.primary, borderWidth: '2px', borderStyle: 'solid', borderColor: THEME_COLORS.primary }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = THEME_COLORS.primaryLight}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  Recalcular
                </button>

                {/* Botón Descargar - principal */}
                <button
                  onClick={downloadCalendar}
                className="px-6 py-3 text-white rounded-full transition-colors whitespace-nowrap"
                  style={{ backgroundColor: THEME_COLORS.primary }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = THEME_COLORS.primaryHover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = THEME_COLORS.primary}
                >
                  Descargar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`relative z-30 mt-20 py-8 bg-transparent ${showCalendar ? "mt-20" : ""}`}>
        <div className="w-full mx-auto px-6 md:px-16 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-white text-sm">
            Hecho con <span className="text-transparent" style={{ WebkitTextStroke: '1px #ffffff' }}>♥</span> por <a href="https://www.linkedin.com/in/claraiglesiasmarketing/" className="hover:underline">Clara Iglesias</a>
          </p>
          <p className="text-white text-sm">
            <a href="https://github.com/claraiis/devacas_" className="hover:underline">Ver repositorio en Github</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default VacationOptimizer;
