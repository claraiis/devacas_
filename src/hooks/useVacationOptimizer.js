import { useCallback } from 'react';

const POPULAR_VACATION_MONTHS = {
  JULY: 6,
  AUGUST: 7,
  DECEMBER: 11
};

const useVacationOptimizer = ({
  config,
  normalizeDate,
  getDateStr,
  isHoliday,
  isWeekend,
  setOptimizedDays,
  setShowCalendar,
  setExpanded,
  outputRef
}) => {
  const optimizeVacations = useCallback(() => {
    const vacationDays = config.vacationDays === '' ? 0 : config.vacationDays;
    const startDate = new Date(config.year, 0, 1);
    const endDate = new Date(config.year, 11, 31);

    const offDays = new Set();
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const normalized = normalizeDate(date);
      const dateStr = getDateStr(normalized);
      if (isWeekend(normalized) || isHoliday(normalized) || config.manualOverrides[dateStr] === 'confirmed') {
        offDays.add(dateStr);
      }
    }

    const gaps = [];
    let currentGap = null;

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const normalized = normalizeDate(date);
      const dateStr = getDateStr(normalized);
      const isBlocked = config.manualOverrides[dateStr] === 'blocked';
      const isOff = offDays.has(dateStr);

      if (!isOff && !isBlocked) {
        if (!currentGap) {
          currentGap = { start: normalizeDate(date), days: [], startDay: normalized.getDay() };
        }
        currentGap.days.push(normalizeDate(date));
      } else if (currentGap) {
        gaps.push(currentGap);
        currentGap = null;
      }
    }

    if (currentGap) {
      gaps.push(currentGap);
    }

    const scoredGaps = gaps.map((gap) => {
      const firstDate = gap.days[0];
      const lastDate = gap.days[gap.days.length - 1];

      let daysBefore = 0;
      let iterator = normalizeDate(firstDate);
      iterator.setDate(iterator.getDate() - 1);
      while (daysBefore < 30) {
        const normalized = normalizeDate(iterator);
        const dateStr = getDateStr(normalized);
        if (!offDays.has(dateStr)) break;
        daysBefore++;
        iterator.setDate(iterator.getDate() - 1);
      }

      let daysAfter = 0;
      iterator = normalizeDate(lastDate);
      iterator.setDate(iterator.getDate() + 1);
      while (daysAfter < 30) {
        const normalized = normalizeDate(iterator);
        const dateStr = getDateStr(normalized);
        if (!offDays.has(dateStr)) break;
        daysAfter++;
        iterator.setDate(iterator.getDate() + 1);
      }

      const totalFreeDays = daysBefore + gap.days.length + daysAfter;
      const efficiency = totalFreeDays / gap.days.length;
      const isPuente = gap.days.length <= 4 && efficiency >= 2;
      let priority = isPuente ? efficiency * 10 : efficiency;

      if (config.prioritizeSummerWinter) {
        const month = gap.start.getMonth();
        const isPopularMonth = [
          POPULAR_VACATION_MONTHS.JULY,
          POPULAR_VACATION_MONTHS.AUGUST,
          POPULAR_VACATION_MONTHS.DECEMBER
        ].includes(month);

        if (isPopularMonth) {
          priority *= 1.5;
        }
      }

      return { ...gap, efficiency, daysBefore, daysAfter, totalFreeDays, isPuente, priority };
    });

    scoredGaps.sort((a, b) => b.priority - a.priority);

    const confirmedCount = Object.values(config.manualOverrides).filter((value) => value === 'confirmed').length;
    let remainingDays = vacationDays - confirmedCount;
    const selected = [];
    const usedMonths = new Map();

    for (const gap of scoredGaps) {
      if (remainingDays <= 0) break;

      const month = gap.start.getMonth();
      const monthUsage = usedMonths.get(month) || 0;

      const maxDaysPerMonth = config.weeklyBlocks ? 10 : 7;
      if (!gap.isPuente && monthUsage >= maxDaysPerMonth) {
        continue;
      }

      if (config.weeklyBlocks) {
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
        let daysToUse;
        if (gap.isPuente) {
          daysToUse = Math.min(gap.days.length, remainingDays);
        } else {
          daysToUse = Math.min(gap.days.length, remainingDays, 5);
        }

        let daysToSelect;
        if (gap.daysBefore >= gap.daysAfter) {
          daysToSelect = gap.days.slice(0, daysToUse);
        } else {
          daysToSelect = gap.days.slice(-daysToUse);
        }

        selected.push(...daysToSelect);
        remainingDays -= daysToUse;
        usedMonths.set(month, monthUsage + daysToUse);
      }
    }

    setOptimizedDays(selected.map((day) => getDateStr(day)));
    setShowCalendar(true);
    setExpanded((prev) => ({ ...prev, section3: false }));

    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [
    config,
    getDateStr,
    isHoliday,
    isWeekend,
    normalizeDate,
    outputRef,
    setExpanded,
    setOptimizedDays,
    setShowCalendar
  ]);

  return { optimizeVacations };
};

export default useVacationOptimizer;
