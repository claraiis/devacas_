import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Plus, X, Calendar, Download, HelpCircle, Info } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Datos estáticos de festivos autonómicos españoles
const REGIONAL_HOLIDAYS = {
  '2026': {
    'AN': [{ date: '2026-02-28', name: 'Día de Andalucía' }, { date: '2026-04-02', name: 'Jueves Santo' }, { date: '2026-11-02', name: 'Fiesta de Todos los Santos' }, { date: '2026-12-07', name: 'Día de la Constitución' }],
    'AR': [{ date: '2026-04-23', name: 'Día de Aragón' }, { date: '2026-04-02', name: 'Jueves Santo' }, { date: '2026-11-02', name: 'Fiesta de Todos los Santos' }, { date: '2026-12-07', name: 'Día de la Constitución' }],
    'AS': [{ date: '2026-09-08', name: 'Día de Asturias' }, { date: '2026-04-02', name: 'Jueves Santo' }, { date: '2026-11-02', name: 'Fiesta de Todos los Santos' }, { date: '2026-12-07', name: 'Día de la Constitución' }],
    'IB': [{ date: '2026-03-02', name: 'Día de las Islas Baleares' }, { date: '2026-04-02', name: 'Jueves Santo' }, { date: '2026-04-06', name: 'Lunes de Pascua' }, { date: '2026-12-26', name: 'Sant Esteve' }],
    'CE': [{ date: '2026-09-02', name: 'Día de Ceuta' }, { date: '2026-04-02', name: 'Jueves Santo' },{ date: '2026-08-05', name: 'Nuestra Señora de África' },{ date: '2026-05-27', name: 'Fiesta del Sacrificio - Aid al-Adha' }],
    'CN': [{ date: '2026-05-30', name: 'Día de Canarias' }, { date: '2026-04-02', name: 'Jueves Santo' }, { date: '2026-11-02', name: 'Fiesta de Todos los Santos' }],
    'CB': [{ date: '2026-07-28', name: 'Día de las Instituciones de Cantabria' }, { date: '2026-04-02', name: 'Jueves Santo' }, { date: '2026-09-15', name: 'La Bien Aparecida' }, { date: '2026-12-07', name: 'Día de la Constitución' }],
    'CL': [{ date: '2026-04-23', name: 'Día de Castilla y León' }, { date: '2026-04-02', name: 'Jueves Santo' }, { date: '2026-11-02', name: 'Fiesta de Todos los Santos' }, { date: '2026-12-07', name: 'Día de la Constitución' }],
    'CM': [{ date: '2026-06-04', name: 'Fiesta del Corpus Christi' }, { date: '2026-04-02', name: 'Jueves Santo' }, { date: '2026-04-06', name: 'Lunes de Pascua' }, { date: '2026-11-02', name: 'Día de Todos los Santos' }],
    'CT': [{ date: '2026-09-11', name: 'Diada de Catalunya' }, { date: '2026-06-24', name: 'Sant Joan' }, { date: '2026-04-06', name: 'Lunes de Pascua' }, { date: '2026-12-26', name: 'Sant Esteve' }],
    'EX': [{ date: '2026-09-08', name: 'Día de Extremadura' }, { date: '2026-04-02', name: 'Jueves Santo' }, { date: '2026-11-02', name: 'Fiesta de Todos los Santos' }, { date: '2026-12-07', name: 'Día de la Constitución' }],
    'GA': [{ date: '2026-07-25', name: 'Santiago Apóstol' }, { date: '2026-06-24', name: 'San Juan'}, { date: '2026-04-02', name: 'Jueves Santo' }, { date: '2026-03-19', name: 'San José' }],
    'MD': [{ date: '2026-05-02', name: 'Día de la Comunidad de Madrid' }, { date: '2026-04-02', name: 'Jueves Santo' }, { date: '2026-11-02', name: 'Fiesta de Todos los Santos' }, { date: '2026-12-07', name: 'Día de la Constitución' }],
    'ME': [{ date: '2026-09-17', name: 'Día de Melilla' },{ date: '2026-04-02', name: 'Jueves Santo' },{ date: '2026-03-20', name: 'Fiesta del Fin del Ayuno - Eid al-Fitr' }, { date: '2026-05-27', name: 'Fiesta del Sacrificio - Aid al-Adha' }, { date: '2026-12-07', name: 'Día de la Constitución' }],
    'MU': [{ date: '2026-06-09', name: 'Día de la Región de Murcia' }, { date: '2026-03-19', name: 'San José' }, { date: '2026-04-02', name: 'Jueves Santo' }, { date: '2026-12-07', name: 'Día de la Constitución' }],
    'NC': [{ date: '2026-12-03', name: 'San Francisco Javier' }, { date: '2026-03-19', name: 'San José' }, { date: '2026-04-02', name: 'Jueves Santo' }, { date: '2026-04-06', name: 'Lunes de Pascua' }, { date: '2026-11-02', name: 'Día de Todos los Santos' }],
    'PV': [{ date: '2026-03-19', name: 'San José' }, { date: '2026-04-02', name: 'Jueves Santo' }, { date: '2026-04-06', name: 'Lunes de Pascua' },{ date: '2026-07-25', name: 'Santiago Apóstol' }],
    'RI': [{ date: '2026-06-09', name: 'Día de La Rioja' }, { date: '2026-04-02', name: 'Jueves Santo' }, { date: '2026-04-06', name: 'Lunes de Pascua' }, { date: '2026-12-07', name: 'Día de la Constitución' }],
    'VC': [{ date: '2026-10-09', name: 'Día de la Comunitat Valençiana' }, { date: '2026-03-19', name: 'San José' }, { date: '2026-04-06', name: 'Lunes de Pascua' }, { date: '2026-06-24', name: 'Sant Joan' }]
  }
};

const POSTAL_TO_REGION = {
  '01': 'PV', '02': 'CM', '03': 'VC', '04': 'AN', '05': 'CL',
  '06': 'EX', '07': 'IB', '08': 'CT', '09': 'CL', '10': 'EX',
  '11': 'AN', '12': 'VC', '13': 'CM', '14': 'AN', '15': 'GA',
  '16': 'CM', '17': 'CT', '18': 'AN', '19': 'CM', '20': 'PV',
  '21': 'AN', '22': 'AR', '23': 'AN', '24': 'CL', '25': 'CT',
  '26': 'RI', '27': 'GA', '28': 'MD', '29': 'AN', '30': 'MU',
  '31': 'NC', '32': 'GA', '33': 'AS', '34': 'CL', '35': 'CN',
  '36': 'GA', '37': 'CL', '38': 'CN', '39': 'CB', '40': 'CL',
  '41': 'AN', '42': 'CL', '43': 'CT', '44': 'AR', '45': 'CM',
  '46': 'VC', '47': 'CL', '48': 'PV', '49': 'CL', '50': 'AR',
  '51': 'CE', '52': 'ME'
};

const VacationOptimizer = () => {
  const [expanded, setExpanded] = useState({ section1: false, section2: false, section3: false });
  const [config, setConfig] = useState({
    country: 'ES',
    postalCode: '',
    year: 2026,
    vacationDays: 22,
    vacationType: 'laborables',
    workDays: 'L-V',
    weeklyBlocks: false,
    customHolidays: [],
    manualOverrides: {}
  });
  
  const [nationalHolidays, setNationalHolidays] = useState([]);
  const [regionalHolidays, setRegionalHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });
  const [optimizedDays, setOptimizedDays] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showLimitBanner, setShowLimitBanner] = useState(false);
  const [holidayError, setHolidayError] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPostalCodeTooltip, setShowPostalCodeTooltip] = useState(false);
  const calendarRef = useRef(null);
  const outputRef = useRef(null);
  const section3Ref = useRef(null);

  // Cerrar modal con tecla ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showHelpModal) {
        setShowHelpModal(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showHelpModal]);

  // Cargar configuración desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vacationConfig');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, []);

  // Guardar configuración en localStorage
  useEffect(() => {
    localStorage.setItem('vacationConfig', JSON.stringify(config));
  }, [config]);

  // Fetch festivos nacionales (solo los globales)
  useEffect(() => {
    if (config.country && config.year) {
      fetch(`https://date.nager.at/api/v3/PublicHolidays/${config.year}/${config.country}`)
        .then(res => res.json())
        .then(data => {
          // Filtrar solo los festivos nacionales (global: true)
          const nationalOnly = (data || []).filter(holiday => holiday.global === true);
          setNationalHolidays(nationalOnly);
        })
        .catch(() => setNationalHolidays([]));
    }
  }, [config.country, config.year]);

  // Cargar festivos regionales
  useEffect(() => {
    if (config.postalCode && config.year) {
      const province = config.postalCode.substring(0, 2);
      const region = POSTAL_TO_REGION[province];
      if (region && REGIONAL_HOLIDAYS[config.year]?.[region]) {
        setRegionalHolidays(REGIONAL_HOLIDAYS[config.year][region]);
      } else {
        setRegionalHolidays([]);
      }
    } else {
      // Si no hay código postal, limpiar festivos regionales
      setRegionalHolidays([]);
    }
  }, [config.postalCode, config.year]);


  const toggleSection = (section) => {
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
  };

  const addCustomHoliday = () => {
    if (!newHoliday.name.trim()) {
      setHolidayError('Debes indicar el nombre del festivo.');
      return;
    }
    if (newHoliday.date && newHoliday.name) {
      setConfig(prev => ({
        ...prev,
        customHolidays: [...prev.customHolidays, newHoliday]
      }));
      setNewHoliday({ date: '', name: '' });
      setHolidayError('');
    }
  };

  const removeCustomHoliday = (index) => {
    setConfig(prev => ({
      ...prev,
      customHolidays: prev.customHolidays.filter((_, i) => i !== index)
    }));
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    if (config.workDays === 'L-V') return day === 0 || day === 6;
    if (config.workDays === 'L-S') return day === 0;
    return false;
  };

  const isHoliday = (date) => {
    // Usar fecha local en lugar de UTC para evitar desfases de zona horaria
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const allHolidays = [
      ...nationalHolidays.map(h => h.date),
      ...regionalHolidays.map(h => h.date),
      ...config.customHolidays.map(h => h.date)
    ];
    return allHolidays.includes(dateStr);
  };

  const optimizeVacations = () => {
    const startDate = new Date(config.year, 0, 1);
    const endDate = new Date(config.year, 11, 31);

    const getDateStr = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Identificar todos los días libres (festivos + fines de semana + confirmados)
    const offDays = new Set();
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = getDateStr(d);
      if (isWeekend(d) || isHoliday(d) || config.manualOverrides[dateStr] === 'confirmed') {
        offDays.add(dateStr);
      }
    }

    // Encontrar gaps (tramos de días laborables entre días libres)
    const gaps = [];
    let currentGap = null;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = getDateStr(d);
      const isBlocked = config.manualOverrides[dateStr] === 'blocked';
      const isOff = offDays.has(dateStr);

      if (!isOff && !isBlocked) {
        if (!currentGap) {
          currentGap = { start: new Date(d), days: [], startDay: d.getDay() };
        }
        currentGap.days.push(new Date(d));
      } else {
        if (currentGap) {
          gaps.push(currentGap);
          currentGap = null;
        }
      }
    }
    if (currentGap) gaps.push(currentGap);

    // Calcular eficiencia y prioridad de cada gap
    const scoredGaps = gaps.map(gap => {
      const firstDate = gap.days[0];
      const lastDate = gap.days[gap.days.length - 1];

      // Contar días libres antes del gap
      let daysBefore = 0;
      let d = new Date(firstDate);
      d.setDate(d.getDate() - 1);
      while (daysBefore < 30) {
        const dateStr = getDateStr(d);
        if (!offDays.has(dateStr)) break;
        daysBefore++;
        d.setDate(d.getDate() - 1);
      }

      // Contar días libres después del gap
      let daysAfter = 0;
      d = new Date(lastDate);
      d.setDate(d.getDate() + 1);
      while (daysAfter < 30) {
        const dateStr = getDateStr(d);
        if (!offDays.has(dateStr)) break;
        daysAfter++;
        d.setDate(d.getDate() + 1);
      }

      const totalFreeDays = daysBefore + gap.days.length + daysAfter;
      const efficiency = totalFreeDays / gap.days.length;

      // Priorizar puentes (gaps pequeños con alta eficiencia)
      const isPuente = gap.days.length <= 4 && efficiency >= 2;
      const priority = isPuente ? efficiency * 10 : efficiency;

      return { ...gap, efficiency, daysBefore, daysAfter, totalFreeDays, isPuente, priority };
    });

    // Ordenar por prioridad (puentes primero, luego eficiencia)
    scoredGaps.sort((a, b) => b.priority - a.priority);

    // Calcular días disponibles (descontando confirmados)
    const confirmedCount = Object.values(config.manualOverrides).filter(v => v === 'confirmed').length;
    let remainingDays = config.vacationDays - confirmedCount;
    const selected = [];
    const usedMonths = new Map(); // Para distribuir mejor por el año

    for (const gap of scoredGaps) {
      if (remainingDays <= 0) break;

      const month = gap.start.getMonth();
      const monthUsage = usedMonths.get(month) || 0;

      // Limitar días por mes para distribuir mejor (excepto puentes)
      const maxDaysPerMonth = config.weeklyBlocks ? 10 : 7;
      if (!gap.isPuente && monthUsage >= maxDaysPerMonth) {
        continue;
      }

      if (config.weeklyBlocks) {
        // Calcular tamaño de bloque según configuración
        let blockSize;
        if (config.vacationType === 'naturales') {
          blockSize = 7;
        } else {
          blockSize = config.workDays === 'L-V' ? 5 : 6;
        }

        const startsOnMonday = gap.startDay === 1;
        if (!startsOnMonday && config.vacationType === 'naturales') continue;

        const blocks = Math.floor(gap.days.length / blockSize);

        if (blocks > 0 && remainingDays >= blockSize) {
          const blocksToUse = Math.min(blocks, Math.floor(remainingDays / blockSize));
          const daysToUse = blocksToUse * blockSize;
          selected.push(...gap.days.slice(0, daysToUse));
          remainingDays -= daysToUse;
          usedMonths.set(month, monthUsage + daysToUse);
        }
      } else {
        // Priorizar puentes completos, luego limitar días
        let daysToUse;
        if (gap.isPuente) {
          daysToUse = Math.min(gap.days.length, remainingDays);
        } else {
          daysToUse = Math.min(gap.days.length, remainingDays, 5); // Máximo 5 días por gap no-puente
        }

        // Decidir si coger días del principio o del final del gap
        // Pegar los días al lado que tenga más días libres consecutivos
        let daysToSelect;
        if (gap.daysBefore >= gap.daysAfter) {
          // Más días libres antes → coger del principio del gap
          daysToSelect = gap.days.slice(0, daysToUse);
        } else {
          // Más días libres después → coger del final del gap
          daysToSelect = gap.days.slice(-daysToUse);
        }

        selected.push(...daysToSelect);
        remainingDays -= daysToUse;
        usedMonths.set(month, monthUsage + daysToUse);
      }
    }

    setOptimizedDays(selected.map(d => getDateStr(d)));
    setShowCalendar(true);

    // Contraer la sección 3 (Preferencias laborales)
    setExpanded(prev => ({ ...prev, section3: false }));

    // Scroll al Output Section
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDayClick = (dateStr) => {
    const current = config.manualOverrides[dateStr];
    const isProposed = optimizedDays.includes(dateStr);
    const newOverrides = { ...config.manualOverrides };

    // Calcular días actualmente usados
    const confirmedCount = Object.values(config.manualOverrides).filter(v => v === 'confirmed').length;
    const proposedCount = optimizedDays.filter(d => !config.manualOverrides[d]).length;
    const totalUsed = confirmedCount + proposedCount;

    // Ciclo circular: normal → propuesto → confirmado → bloqueado → normal
    if (isProposed && !current) {
      // Día propuesto sin override → confirmado (simplemente cambia de estado, no añade días)
      newOverrides[dateStr] = 'confirmed';
    } else if (current === 'confirmed') {
      // Confirmado → bloqueado
      newOverrides[dateStr] = 'blocked';
    } else if (current === 'blocked') {
      // Bloqueado → normal (eliminar override y de optimizedDays)
      delete newOverrides[dateStr];
      setOptimizedDays(prev => prev.filter(d => d !== dateStr));
    } else {
      // Normal → siguiente estado (aquí sí necesitamos validar disponibilidad)
      if (!isProposed) {
        if (totalUsed < config.vacationDays) {
          // Hay días disponibles → propuesta (azul)
          setOptimizedDays(prev => [...prev, dateStr]);
        } else {
          // No hay días disponibles → bloqueado (rojo)
          newOverrides[dateStr] = 'blocked';
          setShowLimitBanner(true);
          setTimeout(() => setShowLimitBanner(false), 5000);
        }
      }
    }

    setConfig(prev => ({ ...prev, manualOverrides: newOverrides }));
  };

  const renderCalendar = () => {
    const months = [];
    for (let m = 0; m < 12; m++) {
      months.push(renderMonth(m));
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {months}
      </div>
    );
  };

  const renderMonth = (month) => {
    const firstDay = new Date(config.year, month, 1);
    const lastDay = new Date(config.year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }
    
    // Días del mes
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(config.year, month, d);
      const year = date.getFullYear();
      const monthNum = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${monthNum}-${day}`;
      const override = config.manualOverrides[dateStr];

      let borderColor = 'border-gray-200';
      let bgColor = 'bg-white';
      let holidayName = '';

      if (isWeekend(date) || isHoliday(date)) {
        bgColor = 'bg-gray-100';
      }

      // Buscar nombre del festivo
      if (isHoliday(date)) {
        const nationalHoliday = nationalHolidays.find(h => h.date === dateStr);
        const regionalHoliday = regionalHolidays.find(h => h.date === dateStr);
        const customHoliday = config.customHolidays.find(h => h.date === dateStr);

        holidayName = nationalHoliday?.localName || regionalHoliday?.name || customHoliday?.name || '';
      }

      if (isHoliday(date)) {
        borderColor = 'border-purple-500';
      } else if (override === 'confirmed') {
        borderColor = 'border-green-500';
      } else if (override === 'blocked') {
        borderColor = 'border-red-500';
      } else if (optimizedDays.includes(dateStr)) {
        borderColor = 'border-blue-500';
      }

      days.push(
        <div
          key={d}
          onClick={() => handleDayClick(dateStr)}
          title={holidayName}
          className={`h-8 flex items-center justify-center text-sm cursor-pointer border-2 rounded ${borderColor} ${bgColor} hover:opacity-70 transition-opacity relative group`}
        >
          {d}
          {holidayName && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {holidayName}
            </div>
          )}
        </div>
      );
    }
    
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    return (
      <div key={month} className="p-4">
        <h3 className="text-center font-semibold mb-3">{monthNames[month]}</h3>
        <div className="grid grid-cols-7 gap-1 text-xs text-center mb-2">
          <div>L</div><div>M</div><div>X</div><div>J</div><div>V</div><div>S</div><div>D</div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  const confirmedDays = Object.values(config.manualOverrides).filter(v => v === 'confirmed').length;
  const proposedDays = optimizedDays.filter(d => !config.manualOverrides[d]).length;
  const availableDays = config.vacationDays - confirmedDays - proposedDays;

  const downloadCalendar = async () => {
    const vacationDays = optimizedDays.filter(dateStr => {
      const override = config.manualOverrides[dateStr];
      return !override || override === 'confirmed';
    });

    if (vacationDays.length === 0) {
      alert('No hay días de vacaciones para descargar');
      return;
    }

    try {
      // Capturar el elemento del calendario
      const calendarElement = calendarRef.current;
      if (!calendarElement) {
        alert('No se pudo capturar el calendario');
        return;
      }

      // Guardar el ancho original del viewport
      const isMobile = window.innerWidth < 768;
      const originalWidth = calendarElement.style.width;

      // Si es móvil, forzar ancho desktop temporalmente para la captura
      if (isMobile) {
        calendarElement.style.width = '1200px';
      }

      // Convertir el calendario a canvas con escala ajustada
      const canvas = await html2canvas(calendarElement, {
        scale: isMobile ? 1.5 : 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: isMobile ? 1200 : calendarElement.scrollWidth,
        windowWidth: isMobile ? 1200 : window.innerWidth
      });

      // Restaurar ancho original
      if (isMobile) {
        calendarElement.style.width = originalWidth;
      }

      // Crear PDF
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
  };

  return (
    <div className={`bg-white flex flex-col ${!showCalendar ? "min-h-screen" : ""}`}>
      {/* Header */}
      <header className="py-6 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl">
            <span className="text-[#792a26] font-semibold">de</span>
            <span className="text-black font-semibold">vacas_</span>
          </h1>
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-black hover:bg-[#FFF7ED] rounded-[4px] transition-colors"
          >
            <Info size={20} />
            <span className="hidden md:inline">Info</span>
          </button>
        </div>
      </header>

      {/* Help Modal */}
      {showHelpModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="bg-white rounded-[4px] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-semibold">¿Cómo funciona devacas_?</h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-gray-500 hover:text-gray-700"
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
                <div className="bg-orange-50 border-l-4 border-[#7c4c46] p-4 mb-3">
                  <p className="font-mono text-sm">
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
                  A partir de ahí, el algoritmo busca los huecos más rentables y te propone un calendario optimizado para ti, no para “la media”. ¿Que un día no te convence? Lo cambias.
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
                  <li><strong>Festivos nacionales:</strong> <a href="https://date.nager.at/">Nager.Date API</a></li>
                  <li><strong>Festivos autonómicos:</strong> <a href="https://www.rtve.es/noticias/20251006/calendario-laboral-2026-festivos-puentes-nacionales-autonomicos/16744047.shtml">Este artículo recopilatorio de RTVE</a></li>
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

      {/* Configuration Section - 100vh cuando no hay resultados */}
      <div className={!showCalendar ? "flex-1 flex flex-col" : ""}>
        {/* Hero */}
        <div className="py-8 md:py-16 px-4 md:px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Sácale el máximo partido a tus vacaciones</h1>
          <p className="text-lg md:text-xl text-gray-500">Convierte días sueltos en descansos significativos</p>
        </div>

        {/* Configuration Forms */}
        <div className={!showCalendar ? "flex-1" : ""}>
          <div className="max-w-7xl mx-auto px-0 md:px-6 py-6 md:space-y-3">

      {/* Sección 1: Configuración básica */}
      <div>
        <button
          onClick={() => toggleSection('section1')}
          className="w-full px-4 md:px-6 py-6 flex justify-between items-center hover:bg-gray-50 hover:rounded-[4px]"
        >
          <span className="font-semibold text-xl text-black">1. Empecemos por lo básico</span>
          {expanded.section1 ? <ChevronUp /> : <ChevronDown />}
        </button>
        
        {expanded.section1 && (
          <div className="px-4 md:px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-medium">País</label>
                <select
                  value={config.country}
                  onChange={(e) => setConfig(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full py-2 pl-2 pr-8 border border-gray-300 rounded"
                >
                  <option value="ES">España</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-2 font-medium flex items-center gap-2">
                  Código postal
                  <div className="relative group">
                    <Info
                      size={18}
                      className="text-gray-500 cursor-help"
                      onClick={() => {
                        setShowPostalCodeTooltip(true);
                        setTimeout(() => setShowPostalCodeTooltip(false), 3000);
                      }}
                    />
                    <div className={`absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-sm rounded shadow-lg transition-all duration-200 z-20 ${
                      showPostalCodeTooltip ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'
                    }`}>
                      Los días festivos se calculan teniendo en cuenta el código postal indicado
                    </div>
                  </div>
                </label>
                <input
                  type="text"
                  value={config.postalCode}
                  onChange={(e) => setConfig(prev => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="Ej: 15009"
                  className="w-full p-2 border border-gray-300 rounded"
                  maxLength="5"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Año</label>
                <select
                  value={config.year}
                  onChange={(e) => setConfig(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  className="w-full py-2 pl-2 pr-8 border border-gray-300 rounded"
                >
                  <option value="2026">2026</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Días de vacaciones</label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    value={config.vacationDays}
                    onChange={(e) => setConfig(prev => ({ ...prev, vacationDays: parseInt(e.target.value) || 0 }))}
                    className="flex-1 p-2 border border-gray-300 rounded"
                    min="0"
                  />
                  <select
                    value={config.vacationType}
                    onChange={(e) => setConfig(prev => ({ ...prev, vacationType: e.target.value }))}
                    className="py-2 pl-2 pr-8 border border-gray-300 rounded"
                  >
                    <option value="laborables">laborables</option>
                    <option value="naturales">naturales</option>
                  </select>
                </div>
                {config.country === 'ES' && config.vacationDays < 22 && (
                  <p className="text-sm text-orange-600 mt-1">
                    ⚠️ En España el mínimo legal son 22 días laborables.
                  </p>
                )}
              </div>
            </div>
            
            {(nationalHolidays.length > 0 || regionalHolidays.length > 0) && (
              <div className="mt-6 p-4 bg-gray-50">
                <h3 className="font-semibold mb-2">Festivos detectados:</h3>
                <div className="text-sm space-y-1">
                  {nationalHolidays.length > 0 && (
                    <p><strong>Nacionales:</strong> {nationalHolidays.length} festivos</p>
                  )}
                  {regionalHolidays.length > 0 && (
                    <p><strong>Autonómicos:</strong> {regionalHolidays.length} festivos</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Sección 2: Festivos de convenio */}
      <div>
        <button
          onClick={() => toggleSection('section2')}
          className="w-full px-4 md:px-6 py-6 flex justify-between items-center hover:bg-gray-50  hover:rounded-[4px]"
        >
          <span className="font-semibold text-xl text-black">2. Festivos de convenio / locales</span>
          {expanded.section2 ? <ChevronUp /> : <ChevronDown />}
        </button>
        
        {expanded.section2 && (
          <div className="px-4 md:px-6 py-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <input
                type="date"
                value={newHoliday.date}
                onChange={(e) => setNewHoliday(prev => ({ ...prev, date: e.target.value }))}
                className="flex-1 p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                value={newHoliday.name}
                onChange={(e) => {
                  setNewHoliday(prev => ({ ...prev, name: e.target.value }));
                  if (holidayError) setHolidayError('');
                }}
                placeholder="Nombre del festivo"
                className="flex-1 p-2 border border-gray-300 rounded"
              />
              <button
                onClick={addCustomHoliday}
                className="w-full md:w-auto px-6 py-2 bg-[#7c4c46] text-white hover:bg-[#653934] flex items-center justify-center gap-2 rounded"
              >
                <Plus size={20} /> Añadir
              </button>
            </div>

            {holidayError && (
              <p className="text-sm text-red-600 mb-4">{holidayError}</p>
            )}
            
            {config.customHolidays.length > 0 && (
              <div className="space-y-2">
                {config.customHolidays.map((holiday, idx) => {
                  const [year, month, day] = holiday.date.split('-');
                  const formattedDate = `${day}/${month}/${year}`;
                  return (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50">
                      <span>
                        <strong>{formattedDate}</strong> - {holiday.name}
                      </span>
                      <button
                        onClick={() => removeCustomHoliday(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Sección 3: Preferencias laborales */}
      <div ref={section3Ref}>
        <button
          onClick={() => toggleSection('section3')}
          className="w-full px-4 md:px-6 py-6 flex justify-between items-center hover:bg-gray-50 hover:rounded-[4px]"
        >
          <span className="font-semibold text-xl text-black">3. Preferencias laborales</span>
          {expanded.section3 ? <ChevronUp /> : <ChevronDown />}
        </button>
        
        {expanded.section3 && (
          <div className="space-y-6">
            {/* Contenedor de preguntas */}
            <div className="px-4 md:px-6 py-6 space-y-6">
              <div>
                <label className="block mb-3 font-medium">¿Qué días trabajas?</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="workDays"
                      value="L-V"
                      checked={config.workDays === 'L-V'}
                      onChange={(e) => setConfig(prev => ({ ...prev, workDays: e.target.value }))}
                      className="w-5 h-5 accent-[#7c4c46] cursor-pointer"
                    />
                    Lunes a viernes
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="workDays"
                      value="L-S"
                      checked={config.workDays === 'L-S'}
                      onChange={(e) => setConfig(prev => ({ ...prev, workDays: e.target.value }))}
                      className="w-5 h-5 accent-[#7c4c46] cursor-pointer"
                    />
                    Lunes a sábado
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="workDays"
                      value="custom"
                      checked={config.workDays === 'custom'}
                      onChange={(e) => setConfig(prev => ({ ...prev, workDays: e.target.value }))}
                      className="w-5 h-5 accent-[#7c4c46] cursor-pointer"
                    />
                    No tengo días fijos (seleccionar en calendario)
                  </label>
                </div>
              </div>

              <div>
                <label className="block mb-3 font-medium">¿Debes coger las vacaciones en bloques semanales?</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="weeklyBlocks"
                      checked={config.weeklyBlocks === true}
                      onChange={() => setConfig(prev => ({ ...prev, weeklyBlocks: true }))}
                      className="w-5 h-5 accent-[#7c4c46] cursor-pointer"
                    />
                    Sí
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="weeklyBlocks"
                      checked={config.weeklyBlocks === false}
                      onChange={() => setConfig(prev => ({ ...prev, weeklyBlocks: false }))}
                      className="w-5 h-5 accent-[#7c4c46] cursor-pointer"
                    />
                    No
                  </label>
                </div>
              </div>
            </div>

            {/* Botón separado */}
            <div className="mx-4 md:mx-6 flex justify-center">
              <button
                onClick={optimizeVacations}
                className="px-6 py-3 bg-[#7c4c46] text-white font-semibold hover:bg-[#653934] flex items-center justify-center gap-2 rounded transition-colors"
              >
                <Calendar size={20} />
                Optimizar mis vacaciones
              </button>
            </div>
          </div>
        )}
      </div>

          </div>
        </div>
      </div>

      {/* Output Section - Resume */}
      {showCalendar && (
        <div ref={outputRef} className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            <div className="grid grid-cols-3 gap-4 md:gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">{nationalHolidays.length + regionalHolidays.length + config.customHolidays.length}</div>
                <div className="text-sm text-gray-600">Festivos</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">{config.vacationDays}</div>
                <div className="text-sm text-gray-600">Disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">{availableDays}</div>
                <div className="text-sm text-gray-600">Sin asignar</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Section */}
      {showCalendar && (
        <div>
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 mt-6" ref={calendarRef}>
            {/* Leyenda centrada */}
            <div className="flex justify-center mt-20 md:mt-6 mb-6">
              {/* Leyenda de colores */}
              <div className="grid grid-cols-2 md:flex md:flex-wrap gap-4 md:gap-6 text-xs md:text-sm">
                {[
                  { color: 'purple', label: 'Festivo' },
                  { color: 'blue', label: 'Propuesto' },
                  { color: 'green', label: 'Reservado' },
                  { color: 'red', label: 'Bloqueado' }
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-3 text-sm">
                    <div className={`w-6 h-6 border-2 border-${color}-500 rounded`}></div>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

          {/* Banner de límite alcanzado */}
          {showLimitBanner && (
            <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-6">
              <p className="font-medium">Ya has utilizado todos tus días de vacaciones disponibles ({config.vacationDays} días). Elimina días reservados o propuestos para añadir más.</p>
            </div>
          )}

          {renderCalendar()}
          </div>

          {/* Botones de acción */}
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              {/* Botón Recalcular - secundario */}
              <button
                onClick={optimizeVacations}
                className="px-6 py-3 bg-white text-[#7c4c46] border-2 border-[#7c4c46] hover:bg-[#FFF7ED] rounded transition-colors whitespace-nowrap"
              >
                Recalcular
              </button>

              {/* Botón Descargar - principal */}
              <button
                onClick={downloadCalendar}
                className="px-6 py-3 bg-[#7c4c46] text-white hover:bg-[#653934] rounded transition-colors whitespace-nowrap"
              >
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`py-8 px-4 md:px-6 ${showCalendar ? "mt-20" : ""}`}>
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600 text-sm">
            Feito con <span className="text-[#7c4c46]">♥</span> por <a href="https://www.linkedin.com/in/claraiglesiasmarketing/">Clara Iglesias</a>
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Ver repositorio en <a href="https://github.com/claraiis/devacas_">Github</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default VacationOptimizer;