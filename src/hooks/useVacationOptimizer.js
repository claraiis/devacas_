import { useCallback, useMemo } from 'react';

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
  optimizedDays,
  setOptimizedDays,
  setConfig,
  setShowCalendar,
  outputRef
}) => {
  // Memoizar el cálculo de días optimizados - solo recalcula cuando cambian las dependencias críticas
  const memoizedOptimizedDays = useMemo(() => {
    const vacationDays = config.vacationDays === '' ? 0 : config.vacationDays;
    const startDate = new Date(config.year, 0, 1);
    const endDate = new Date(config.year, 11, 31);
    const today = normalizeDate(new Date());
    const minDate = config.year <= today.getFullYear() ? today : startDate;

    const offDays = new Set();
    const isWeekendForScoring = config.vacationType === 'naturales'
      ? (date) => {
          const day = date.getDay();
          return day === 0 || day === 6;
        }
      : isWeekend;
    const confirmedSet = new Set();
    const rejectedSet = new Set();
    const suggestedSet = new Set(optimizedDays);
    Object.entries(config.manualOverrides).forEach(([dateStr, status]) => {
      if (status === 'confirmed') confirmedSet.add(dateStr);
      if (status === 'rejected') rejectedSet.add(dateStr);
    });
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const normalized = normalizeDate(date);
      const dateStr = getDateStr(normalized);
      if (isWeekendForScoring(normalized) || isHoliday(normalized)) {
        offDays.add(dateStr);
      }
    }

    if (config.vacationType === 'naturales') {
      let remainingDays = vacationDays - confirmedSet.size - suggestedSet.size;
      if (remainingDays <= 0) return [];

      const allDates = [];
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const normalized = normalizeDate(date);
        if (normalized < minDate) continue;
        allDates.push(normalized);
      }

      const lengths = [];
      if (config.weeklyBlocks) {
        lengths.push(7);
      } else {
        const maxLength = Math.min(10, remainingDays);
        for (let length = remainingDays === 1 ? 1 : 2; length <= maxLength; length += 1) {
          lengths.push(length);
        }
        if (remainingDays > 10) {
          lengths.push(Math.min(14, remainingDays));
        }
      }

      const candidates = [];
      for (let i = 0; i < allDates.length; i += 1) {
        for (const length of lengths) {
          const endIndex = i + length - 1;
          if (endIndex >= allDates.length) continue;

          const start = allDates[i];
          const startDay = start.getDay();
          if (config.weeklyBlocks && startDay !== 1) continue;

          let invalid = false;
          const range = [];
          for (let j = i; j <= endIndex; j += 1) {
            const dateStr = getDateStr(allDates[j]);
            if (rejectedSet.has(dateStr) || confirmedSet.has(dateStr) || suggestedSet.has(dateStr)) {
              invalid = true;
              break;
            }
            range.push(allDates[j]);
          }
          if (invalid) continue;

          let daysBefore = 0;
          let iterator = normalizeDate(start);
          iterator.setDate(iterator.getDate() - 1);
          while (daysBefore < 30) {
            const normalized = normalizeDate(iterator);
            const dateStr = getDateStr(normalized);
            if (!offDays.has(dateStr)) break;
            daysBefore += 1;
            iterator.setDate(iterator.getDate() - 1);
          }

          let daysAfter = 0;
          iterator = normalizeDate(allDates[endIndex]);
          iterator.setDate(iterator.getDate() + 1);
          while (daysAfter < 30) {
            const normalized = normalizeDate(iterator);
            const dateStr = getDateStr(normalized);
            if (!offDays.has(dateStr)) break;
            daysAfter += 1;
            iterator.setDate(iterator.getDate() + 1);
          }

          const totalFreeDays = daysBefore + range.length + daysAfter;
          const efficiency = totalFreeDays / range.length;
          const isPuente = range.length <= 4 && efficiency >= 2;
          let priority = isPuente ? efficiency * 10 : efficiency;

          if (config.prioritizeSummerWinter) {
            const month = start.getMonth();
            const isPopularMonth = [
              POPULAR_VACATION_MONTHS.JULY,
              POPULAR_VACATION_MONTHS.AUGUST,
              POPULAR_VACATION_MONTHS.DECEMBER
            ].includes(month);

            if (isPopularMonth) {
              priority *= 1.5;
            }
          }

          candidates.push({ range, start, startDay, efficiency, daysBefore, daysAfter, totalFreeDays, isPuente, priority });
        }
      }

      candidates.sort((a, b) => b.priority - a.priority);

      const selected = [];
      const selectedSet = new Set();
      const usedMonths = new Map();

      for (const candidate of candidates) {
        if (remainingDays <= 0) break;
        if (candidate.range.length > remainingDays) continue;

        const month = candidate.start.getMonth();
        const monthUsage = usedMonths.get(month) || 0;
        const maxDaysPerMonth = config.weeklyBlocks ? 10 : 7;
        if (!candidate.isPuente && monthUsage >= maxDaysPerMonth) {
          continue;
        }

        const overlap = candidate.range.some((day) => selectedSet.has(getDateStr(day)));
        if (overlap) continue;

        candidate.range.forEach((day) => {
          const dateStr = getDateStr(day);
          selected.push(dateStr);
          selectedSet.add(dateStr);
        });
        remainingDays -= candidate.range.length;
        usedMonths.set(month, monthUsage + candidate.range.length);
      }

      return selected;
    }

    const gaps = [];
    let currentGap = null;

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const normalized = normalizeDate(date);
      const dateStr = getDateStr(normalized);
      const isRejected = config.manualOverrides[dateStr] === 'rejected';
      const isConfirmed = confirmedSet.has(dateStr);
      const isSuggested = suggestedSet.has(dateStr);
      const isOff = offDays.has(dateStr);

      if (normalized < minDate) {
        if (currentGap) {
          gaps.push(currentGap);
          currentGap = null;
        }
        continue;
      }

      if (!isOff && !isRejected && !isConfirmed && !isSuggested) {
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

    const confirmedCount = confirmedSet.size + suggestedSet.size;
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
        const blockSize = config.workDays === 'L-V' ? 5 : 6;

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

    return selected.map((day) => getDateStr(day));
  }, [
    config.vacationDays,
    config.year,
    config.manualOverrides,
    config.prioritizeSummerWinter,
    config.weeklyBlocks,
    config.vacationType,
    config.workDays,
    getDateStr,
    isHoliday,
    isWeekend,
    normalizeDate,
    optimizedDays
  ]);

  // Función optimizeVacations calcula días sugeridos
  const optimizeVacations = useCallback(() => {
    setOptimizedDays((prev) => Array.from(new Set([...prev, ...memoizedOptimizedDays])));

    setShowCalendar(true);

    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [
    memoizedOptimizedDays,
    outputRef,
    setOptimizedDays,
    setShowCalendar
  ]);

  return { optimizeVacations };
};

export default useVacationOptimizer;
