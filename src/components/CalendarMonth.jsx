import { memo, useMemo } from 'react';

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
  animateSuggestedDays = [],
  activeTooltip,
  onDayClick
}) => {
  // Convertir optimizedDays a Set para búsquedas O(1) en lugar de O(n)
  const optimizedDaysSet = useMemo(() => new Set(optimizedDays), [optimizedDays]);
  const animateSuggestedMap = useMemo(
    () => new Map(animateSuggestedDays.map((dateStr, index) => [dateStr, index])),
    [animateSuggestedDays]
  );

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];

  const dayStates = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const date = new Date(year, month, day);
    const normalized = normalizeDate(date);
    const dateStr = getDateStr(normalized);
    const override = manualOverrides[dateStr];

    let bgColor = 'bg-transparent';
    let textColor = 'text-black';
    let holidayName = '';
    let isDisabled = false;

    if (isWeekend(normalized) || isHoliday(normalized)) {
      bgColor = 'bg-gray-200/50';
      textColor = 'text-gray-700';
    }

    if (isHoliday(normalized)) {
      const holidayInfo = getHolidayInfo(dateStr, customHolidays);
      holidayName = holidayInfo?.name || '';
    }

    if (override === 'confirmed') {
      bgColor = 'bg-gray-200';
      textColor = 'text-gray-700';
    } else if (override === 'rejected') {
      bgColor = 'bg-transparent';
      textColor = 'text-gray-700';
      isDisabled = true;
    } else if (optimizedDaysSet.has(dateStr)) {
      bgColor = 'bg-green-200';
      textColor = 'text-black';
    }
    return {
      day,
      dateStr,
      bgColor,
      textColor,
      holidayName,
      isMarked: bgColor !== 'bg-transparent',
      isDisabled,
      isSuggested: optimizedDaysSet.has(dateStr)
    };
  });

  for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
    days.push(<div key={`empty-${i}`} className="h-8 w-full"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const state = dayStates[day - 1];
    const { dateStr, bgColor, textColor, holidayName, isMarked, isDisabled } = state;
    const prevState = dayStates[day - 2];
    const nextState = dayStates[day];
    const hasLeftSame =
      prevState &&
      prevState.isMarked;
    const hasRightSame =
      nextState &&
      nextState.isMarked;
    const hasUpSame = false;
    const hasDownSame = false;
    const roundedClass = isMarked
      ? [
          !hasLeftSame && !hasUpSame ? 'rounded-tl-[4px]' : '',
          !hasRightSame && !hasUpSame ? 'rounded-tr-[4px]' : '',
          !hasLeftSame && !hasDownSame ? 'rounded-bl-[4px]' : '',
          !hasRightSame && !hasDownSame ? 'rounded-br-[4px]' : ''
        ]
          .filter(Boolean)
          .join(' ') || 'rounded-none'
      : 'rounded-none';

    const animateIndex = animateSuggestedMap.get(dateStr);
    const shouldAnimate = animateIndex !== undefined;

    days.push(
      <div
        key={day}
        onClick={(event) => onDayClick(dateStr, Boolean(holidayName), event)}
        title={holidayName}
        data-date={dateStr}
        className={`h-8 w-full flex items-center justify-center ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-70'} ${roundedClass} ${bgColor} ${textColor} transition-opacity relative group ${shouldAnimate ? 'suggested-pop' : ''}`}
        style={shouldAnimate ? { animationDelay: `${animateIndex * 40}ms` } : undefined}
      >
        <span className="calendar-day-number text-[13px] leading-[1]">{day}</span>
        {shouldAnimate && (
          <span className="absolute -top-1 left-0 z-10 rounded-[4px] bg-black/80 px-0.5 text-[8px] font-regular text-white shadow">
            N
          </span>
        )}
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
    <div className="w-full min-w-0">
      <h3 className="text-left mb-3 text-black font-medium uppercase tracking-tight">{MONTH_NAMES[month]}</h3>
      <div className="grid grid-cols-7 gap-0 text-xs text-center mb-2 text-black">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-x-0 gap-y-[1px]">
        {days}
      </div>
    </div>
  );
});

export default CalendarMonth;
