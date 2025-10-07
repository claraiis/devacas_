import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Plus, X, Calendar } from 'lucide-react';

// Datos estáticos de festivos autonómicos españoles
const REGIONAL_HOLIDAYS = {
  '2025': {
    'AN': [{ date: '2025-02-28', name: 'Día de Andalucía' }],
    'AR': [{ date: '2025-04-23', name: 'Día de Aragón' }],
    'AS': [{ date: '2025-09-08', name: 'Día de Asturias' }],
    'IB': [{ date: '2025-03-01', name: 'Día de las Islas Baleares' }],
    'CN': [{ date: '2025-05-30', name: 'Día de Canarias' }],
    'CB': [{ date: '2025-07-28', name: 'Día de Cantabria' }],
    'CL': [{ date: '2025-04-23', name: 'Día de Castilla y León' }],
    'CM': [{ date: '2025-05-31', name: 'Día de Castilla-La Mancha' }],
    'CT': [{ date: '2025-09-11', name: 'Diada de Catalunya' }, { date: '2025-06-24', name: 'Sant Joan' }],
    'EX': [{ date: '2025-09-08', name: 'Día de Extremadura' }],
    'GA': [{ date: '2025-07-25', name: 'Día de Galicia' }],
    'MD': [{ date: '2025-05-02', name: 'Día de la Comunidad de Madrid' }],
    'MU': [{ date: '2025-06-09', name: 'Día de la Región de Murcia' }],
    'NC': [{ date: '2025-09-27', name: 'Día de Navarra' }],
    'PV': [{ date: '2025-10-25', name: 'Día del País Vasco' }],
    'RI': [{ date: '2025-06-09', name: 'Día de La Rioja' }],
    'VC': [{ date: '2025-10-09', name: 'Día de la Comunidad Valenciana' }]
  },
  '2026': {
    'AN': [{ date: '2026-02-28', name: 'Día de Andalucía' }],
    'AR': [{ date: '2026-04-23', name: 'Día de Aragón' }],
    'AS': [{ date: '2026-09-08', name: 'Día de Asturias' }],
    'IB': [{ date: '2026-03-01', name: 'Día de las Islas Baleares' }],
    'CN': [{ date: '2026-05-30', name: 'Día de Canarias' }],
    'CB': [{ date: '2026-07-28', name: 'Día de Cantabria' }],
    'CL': [{ date: '2026-04-23', name: 'Día de Castilla y León' }],
    'CM': [{ date: '2026-05-31', name: 'Día de Castilla-La Mancha' }],
    'CT': [{ date: '2026-09-11', name: 'Diada de Catalunya' }, { date: '2026-06-24', name: 'Sant Joan' }],
    'EX': [{ date: '2026-09-08', name: 'Día de Extremadura' }],
    'GA': [{ date: '2026-07-25', name: 'Día de Galicia' }],
    'MD': [{ date: '2026-05-02', name: 'Día de la Comunidad de Madrid' }],
    'MU': [{ date: '2026-06-09', name: 'Día de la Región de Murcia' }],
    'NC': [{ date: '2026-09-27', name: 'Día de Navarra' }],
    'PV': [{ date: '2026-10-25', name: 'Día del País Vasco' }],
    'RI': [{ date: '2026-06-09', name: 'Día de La Rioja' }],
    'VC': [{ date: '2026-10-09', name: 'Día de la Comunidad Valenciana' }]
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
  '51': 'MD', '52': 'MD'
};

const VacationOptimizer = () => {
  const [expanded, setExpanded] = useState({ section1: true, section2: false, section3: false });
  const [config, setConfig] = useState({
    country: 'ES',
    postalCode: '',
    year: new Date().getFullYear(),
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
  const calendarRef = useRef(null);

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

  // Fetch festivos nacionales
  useEffect(() => {
    if (config.country && config.year) {
      fetch(`https://date.nager.at/api/v3/PublicHolidays/${config.year}/${config.country}`)
        .then(res => res.json())
        .then(data => setNationalHolidays(data || []))
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
    }
  }, [config.postalCode, config.year]);

  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const addCustomHoliday = () => {
    if (newHoliday.date && newHoliday.name) {
      setConfig(prev => ({
        ...prev,
        customHolidays: [...prev.customHolidays, newHoliday]
      }));
      setNewHoliday({ date: '', name: '' });
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
    const dateStr = date.toISOString().split('T')[0];
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
    
    // Identificar todos los días libres (festivos + fines de semana + confirmados)
    const offDays = new Set();
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (isWeekend(d) || isHoliday(d) || config.manualOverrides[dateStr] === 'confirmed') {
        offDays.add(dateStr);
      }
    }
    
    // Encontrar gaps (tramos de días laborables entre días libres)
    const gaps = [];
    let currentGap = null;
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
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
    
    // Calcular eficiencia: días libres totales conseguidos / días de vacaciones usados
    const scoredGaps = gaps.map(gap => {
      const firstDate = gap.days[0];
      const lastDate = gap.days[gap.days.length - 1];
      
      // Contar días libres antes del gap
      let daysBefore = 0;
      for (let d = new Date(firstDate); daysBefore < 7; d.setDate(d.getDate() - 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (!offDays.has(dateStr)) break;
        daysBefore++;
      }
      
      // Contar días libres después del gap
      let daysAfter = 0;
      for (let d = new Date(lastDate); daysAfter < 7; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (!offDays.has(dateStr)) break;
        daysAfter++;
      }
      
      const totalFreeDays = daysBefore + gap.days.length + daysAfter;
      const efficiency = totalFreeDays / gap.days.length;
      
      return { ...gap, efficiency, daysBefore, daysAfter, totalFreeDays };
    });
    
    // Ordenar por eficiencia (priorizar puentes)
    scoredGaps.sort((a, b) => b.efficiency - a.efficiency);
    
    // Calcular días disponibles (descontando confirmados)
    const confirmedCount = Object.values(config.manualOverrides).filter(v => v === 'confirmed').length;
    let remainingDays = config.vacationDays - confirmedCount;
    const selected = [];
    
    for (const gap of scoredGaps) {
      if (remainingDays <= 0) break;
      
      if (config.weeklyBlocks) {
        // Calcular tamaño de bloque según configuración
        let blockSize;
        if (config.vacationType === 'naturales') {
          blockSize = 7; // Lunes a domingo
        } else {
          blockSize = config.workDays === 'L-V' ? 5 : 6;
        }
        
        // Para bloques semanales, el gap debe empezar en lunes
        const startsOnMonday = gap.startDay === 1;
        if (!startsOnMonday && config.vacationType === 'naturales') continue;
        
        const blocks = Math.floor(gap.days.length / blockSize);
        
        if (blocks > 0 && remainingDays >= blockSize) {
          const blocksToUse = Math.min(blocks, Math.floor(remainingDays / blockSize));
          const daysToUse = blocksToUse * blockSize;
          selected.push(...gap.days.slice(0, daysToUse));
          remainingDays -= daysToUse;
        }
      } else {
        // Sin bloques obligatorios: optimizar libremente
        const daysToUse = Math.min(gap.days.length, remainingDays);
        selected.push(...gap.days.slice(0, daysToUse));
        remainingDays -= daysToUse;
      }
    }
    
    setOptimizedDays(selected.map(d => d.toISOString().split('T')[0]));
    setShowCalendar(true);
    
    // Scroll al calendario
    setTimeout(() => {
      calendarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDayClick = (dateStr) => {
    const current = config.manualOverrides[dateStr];
    const newOverrides = { ...config.manualOverrides };
    
    if (optimizedDays.includes(dateStr) && !current) {
      newOverrides[dateStr] = 'confirmed';
    } else if (current === 'confirmed') {
      newOverrides[dateStr] = 'blocked';
    } else {
      delete newOverrides[dateStr];
    }
    
    setConfig(prev => ({ ...prev, manualOverrides: newOverrides }));
  };

  const renderCalendar = () => {
    const months = [];
    for (let m = 0; m < 12; m++) {
      months.push(renderMonth(m));
    }
    
    return (
      <div className="grid grid-cols-3 gap-6 mt-8">
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
      const dateStr = date.toISOString().split('T')[0];
      const override = config.manualOverrides[dateStr];
      
      let borderColor = 'border-gray-200';
      let bgColor = 'bg-white';
      
      if (isWeekend(date) || isHoliday(date)) {
        bgColor = 'bg-gray-100';
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
          className={`h-8 flex items-center justify-center text-sm cursor-pointer border-2 ${borderColor} ${bgColor} hover:opacity-70 transition-opacity`}
        >
          {d}
        </div>
      );
    }
    
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    return (
      <div key={month} className="border border-gray-200 p-4">
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
  const availableDays = config.vacationDays - confirmedDays;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="py-6 px-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl">
            <span className="text-black">de</span>
            <span className="text-[#F26D1B]">vacas_</span>
          </h1>
        </div>
      </header>

      {/* Hero */}
      <div className="py-16 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">Sácale el máximo partido a tus vacaciones</h1>
        <p className="text-xl text-gray-500">Convierte días sueltos en descansos significativos</p>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
      
      {/* Sección 1: Configuración básica */}
      <div className="mb-8">
        <button
          onClick={() => toggleSection('section1')}
          className="w-full p-6 flex justify-between items-center hover:bg-gray-50"
        >
          <span className="font-bold text-xl text-[#F26D1B]">1. Configuración básica</span>
          {expanded.section1 ? <ChevronUp /> : <ChevronDown />}
        </button>
        
        {expanded.section1 && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-medium">País</label>
                <select
                  value={config.country}
                  onChange={(e) => setConfig(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full p-2 border border-gray-300"
                >
                  <option value="ES">España</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Código postal</label>
                <input
                  type="text"
                  value={config.postalCode}
                  onChange={(e) => setConfig(prev => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="Ej: 28001"
                  className="w-full p-2 border border-gray-300"
                  maxLength="5"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Año</label>
                <input
                  type="number"
                  value={config.year}
                  onChange={(e) => setConfig(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  className="w-full p-2 border border-gray-300"
                  min="2024"
                  max="2030"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Días de vacaciones</label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    value={config.vacationDays}
                    onChange={(e) => setConfig(prev => ({ ...prev, vacationDays: parseInt(e.target.value) || 0 }))}
                    className="flex-1 p-2 border border-gray-300"
                    min="0"
                  />
                  <select
                    value={config.vacationType}
                    onChange={(e) => setConfig(prev => ({ ...prev, vacationType: e.target.value }))}
                    className="p-2 border border-gray-300"
                  >
                    <option value="laborables">Laborables</option>
                    <option value="naturales">Naturales</option>
                  </select>
                </div>
                {config.country === 'ES' && config.vacationDays < 22 && (
                  <p className="text-sm text-orange-600 mt-1">
                    ⚠️ En España el mínimo legal son 22 días laborables
                  </p>
                )}
              </div>
            </div>
            
            {nationalHolidays.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50">
                <h3 className="font-semibold mb-2">Festivos detectados:</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Nacionales:</strong> {nationalHolidays.length} festivos</p>
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
      <div className="mb-8">
        <button
          onClick={() => toggleSection('section2')}
          className="w-full p-6 flex justify-between items-center hover:bg-gray-50"
        >
          <span className="font-bold text-xl text-[#F26D1B]">2. Festivos de convenio / locales</span>
          {expanded.section2 ? <ChevronUp /> : <ChevronDown />}
        </button>
        
        {expanded.section2 && (
          <div className="px-6 pb-6">
            <div className="flex gap-4 mb-4">
              <input
                type="date"
                value={newHoliday.date}
                onChange={(e) => setNewHoliday(prev => ({ ...prev, date: e.target.value }))}
                className="flex-1 p-2 border border-gray-300"
              />
              <input
                type="text"
                value={newHoliday.name}
                onChange={(e) => setNewHoliday(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del festivo"
                className="flex-1 p-2 border border-gray-300"
              />
              <button
                onClick={addCustomHoliday}
                className="px-6 py-2 bg-black text-white hover:bg-gray-800 flex items-center gap-2 rounded"
              >
                <Plus size={20} /> Añadir
              </button>
            </div>
            
            {config.customHolidays.length > 0 && (
              <div className="space-y-2">
                {config.customHolidays.map((holiday, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50">
                    <span>
                      <strong>{new Date(holiday.date + 'T00:00:00').toLocaleDateString('es-ES')}</strong> - {holiday.name}
                    </span>
                    <button
                      onClick={() => removeCustomHoliday(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Sección 3: Preferencias laborales */}
      <div className="mb-8">
        <button
          onClick={() => toggleSection('section3')}
          className="w-full p-6 flex justify-between items-center hover:bg-gray-50"
        >
          <span className="font-bold text-xl text-[#F26D1B]">3. Preferencias laborales</span>
          {expanded.section3 ? <ChevronUp /> : <ChevronDown />}
        </button>
        
        {expanded.section3 && (
          <div className="px-6 pb-6 space-y-6">
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
                    className="w-5 h-5 accent-[#F26D1B] cursor-pointer"
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
                    className="w-5 h-5 accent-[#F26D1B] cursor-pointer"
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
                    className="w-5 h-5 accent-[#F26D1B] cursor-pointer"
                  />
                  No tengo días fijos (seleccionar en calendario)
                </label>
              </div>
            </div>
            
            <div>
              <label className="block mb-3 font-medium">¿Obligatorio coger vacaciones en bloques semanales?</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="weeklyBlocks"
                    checked={config.weeklyBlocks === true}
                    onChange={() => setConfig(prev => ({ ...prev, weeklyBlocks: true }))}
                    className="w-5 h-5 accent-[#F26D1B] cursor-pointer"
                  />
                  Sí
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="weeklyBlocks"
                    checked={config.weeklyBlocks === false}
                    onChange={() => setConfig(prev => ({ ...prev, weeklyBlocks: false }))}
                    className="w-5 h-5 accent-[#F26D1B] cursor-pointer"
                  />
                  No
                </label>
              </div>
            </div>
            
            <button
              onClick={optimizeVacations}
              className="w-full py-3 bg-[#F26D1B] text-white font-semibold hover:bg-[#d95f17] flex items-center justify-center gap-2 rounded transition-colors"
            >
              <Calendar size={20} />
              Calcular vacaciones optimizadas
            </button>
          </div>
        )}
      </div>
      
      {/* Sección 4: Calendario */}
      {showCalendar && (
        <div className="mt-12" ref={calendarRef}>
          <div className="flex justify-between items-center mb-6 p-6 bg-gray-50">
            <div className="text-lg font-semibold">
              {config.vacationDays} días de vacaciones | {availableDays} días disponibles | {confirmedDays} días confirmados
            </div>
            <button
              onClick={optimizeVacations}
              className="px-6 py-2 bg-[#F26D1B] text-white hover:bg-[#d95f17] rounded transition-colors"
            >
              Recalcular
            </button>
          </div>
          
          <div className="flex gap-6 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-purple-500"></div>
              <span>Festivo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-500"></div>
              <span>Propuesta</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-green-500"></div>
              <span>Confirmado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-red-500"></div>
              <span>Bloqueado</span>
            </div>
          </div>
          
          {renderCalendar()}
        </div>
      )}
      
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600">
            Feito con <span className="text-red-500">♥</span> por Clara
          </p>
        </div>
      </footer>
    </div>
  );
};

export default VacationOptimizer;