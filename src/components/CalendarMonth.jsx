import React from 'react';
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

const CalendarMonth = ({
  month,
  year,
  manualOverrides,
  customHolidays,
  normalizeDate,
  getDateStr,
  isWeekend,
  isHoliday,
  nationalHolidays,
  regionalHolidays,
  optimizedDays,
  activeTooltip,
  onDayClick
}) => {
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

    let borderColor = 'border-gray-200';
    let bgColor = 'bg-white';
    let holidayName = '';

    if (isWeekend(normalized) || isHoliday(normalized)) {
      bgColor = 'bg-gray-100';
    }

    if (isHoliday(normalized)) {
      const nationalHoliday = nationalHolidays.find(h => h.date === dateStr);
      const regionalHoliday = regionalHolidays.find(h => h.date === dateStr);
      const customHoliday = customHolidays.find(h => h.date === dateStr);

      holidayName = nationalHoliday?.localName || regionalHoliday?.name || customHoliday?.name || '';
    }

    if (override === 'confirmed') {
      bgColor = 'bg-green-100';
    } else if (override === 'blocked') {
      bgColor = 'bg-red-100';
    } else if (optimizedDays.includes(dateStr)) {
      borderColor = '';
    }

    const isProposed = optimizedDays.includes(dateStr);

    days.push(
      <div
        key={day}
        onClick={(event) => onDayClick(dateStr, Boolean(holidayName), event)}
        title={holidayName}
        className={`h-8 flex items-center justify-center text-sm cursor-pointer border-2 rounded ${borderColor} ${bgColor} hover:opacity-70 transition-opacity relative group`}
        style={isProposed ? { borderColor: THEME_COLORS.primary } : undefined}
      >
        {day}
        {holidayName && (
          <div
            className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded transition-opacity pointer-events-none whitespace-nowrap z-10 ${
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
      <h3 className="text-center font-semibold mb-3">{MONTH_NAMES[month]}</h3>
      <div className="grid grid-cols-7 gap-1 text-xs text-center mb-2">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
};

export default CalendarMonth;
