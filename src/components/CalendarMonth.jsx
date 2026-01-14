import { memo, useMemo } from 'react';
import { THEME_COLORS } from '../constants/colors';

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const CalendarMonth = memo(({
  month,
  year,
  manualOverrides,
  customHolidays,
  normalizeDate,
  getDateStr,
  isWeekend,
  isHoliday,
  getHolidayInfo,
  optimizedDays,
  activeTooltip,
  onDayClick
}) => {
  // Convertir optimizedDays a Set para búsquedas O(1) en lugar de O(n)
  const optimizedDaysSet = useMemo(() => new Set(optimizedDays), [optimizedDays]);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];

  for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
    days.push(<div key={`empty-${i}`} className="h-8"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const normalized = normalizeDate(date);
    const dateStr = getDateStr(normalized);
    const override = manualOverrides[dateStr];

    let borderColor = 'border-gray-200 dark:border-gray-700';
    let bgColor = 'bg-white dark:bg-gray-800';
    let holidayName = '';

    if (isWeekend(normalized) || isHoliday(normalized)) {
      bgColor = 'bg-gray-100 dark:bg-gray-700';
    }

    if (isHoliday(normalized)) {
      // Usar función optimizada O(1) en lugar de 3 búsquedas lineales O(n)
      const holidayInfo = getHolidayInfo(dateStr, customHolidays);
      holidayName = holidayInfo?.name || '';
    }

    if (override === 'confirmed') {
      bgColor = 'bg-green-100 dark:bg-green-900/50';
    } else if (override === 'blocked') {
      bgColor = 'bg-red-100 dark:bg-red-900/50';
    }
    // Ya no mostramos borde marrón porque los días optimizados se confirman automáticamente

    const isProposed = optimizedDaysSet.has(dateStr) && override !== 'confirmed' && override !== 'blocked';

    days.push(
      <div
        key={day}
        onClick={(event) => onDayClick(dateStr, Boolean(holidayName), event)}
        title={holidayName}
        className={`h-8 flex items-center justify-center text-sm cursor-pointer border-2 rounded ${borderColor} ${bgColor} hover:opacity-70 transition-opacity relative group text-black dark:text-white`}
        style={isProposed ? { borderColor: THEME_COLORS.primary } : undefined}
      >
        {day}
        {holidayName && (
          <div
            className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded transition-opacity pointer-events-none whitespace-nowrap z-10 ${
              activeTooltip === dateStr ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'
            }`}
          >
            {holidayName}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-center font-semibold mb-3 text-black dark:text-white">{MONTH_NAMES[month]}</h3>
      <div className="grid grid-cols-7 gap-1 text-xs text-center mb-2 text-gray-600 dark:text-gray-400">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Solo re-renderizar si cambian estas props específicas
  // Retorna true si las props son iguales (NO re-renderizar)
  // Retorna false si las props son diferentes (SÍ re-renderizar)
  
  // Comparación profunda de arrays para optimizedDays
  const optimizedDaysEqual = 
    prevProps.optimizedDays.length === nextProps.optimizedDays.length &&
    prevProps.optimizedDays.every((day, idx) => day === nextProps.optimizedDays[idx]);
  
  // Comparación profunda de arrays para customHolidays
  const customHolidaysEqual = 
    prevProps.customHolidays.length === nextProps.customHolidays.length &&
    prevProps.customHolidays.every((holiday, idx) => 
      holiday.date === nextProps.customHolidays[idx]?.date &&
      holiday.name === nextProps.customHolidays[idx]?.name
    );
  
  return (
    prevProps.month === nextProps.month &&
    prevProps.year === nextProps.year &&
    prevProps.manualOverrides === nextProps.manualOverrides &&
    optimizedDaysEqual &&
    prevProps.activeTooltip === nextProps.activeTooltip &&
    customHolidaysEqual &&
    prevProps.getHolidayInfo === nextProps.getHolidayInfo
  );
});

export default CalendarMonth;
