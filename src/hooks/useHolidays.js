import { useEffect, useState, useMemo, useCallback } from 'react';
import { REGIONAL_HOLIDAYS, POSTAL_TO_REGION } from '../constants/holidays';

const useHolidays = (config) => {
  const [nationalHolidays, setNationalHolidays] = useState([]);
  const [regionalHolidays, setRegionalHolidays] = useState([]);

  useEffect(() => {
    if (!config.country || !config.year) {
      setNationalHolidays([]);
      return;
    }

    fetch(`https://date.nager.at/api/v3/PublicHolidays/${config.year}/${config.country}`)
      .then((res) => res.json())
      .then((data) => {
        const nationalOnly = (data || []).filter((holiday) => holiday.global === true);
        setNationalHolidays(nationalOnly);
      })
      .catch(() => setNationalHolidays([]));
  }, [config.country, config.year]);

  useEffect(() => {
    if (!config.postalCode || !config.year) {
      setRegionalHolidays([]);
      return;
    }

    const province = config.postalCode.substring(0, 2);
    const region = POSTAL_TO_REGION[province];
    if (region && REGIONAL_HOLIDAYS[config.year]?.[region]) {
      setRegionalHolidays(REGIONAL_HOLIDAYS[config.year][region]);
    } else {
      setRegionalHolidays([]);
    }
  }, [config.postalCode, config.year]);

  // Pre-computar un Map de festivos para búsquedas O(1) en lugar de O(n)
  // Esto evita 1116 operaciones lineales (3 búsquedas × 372 días) en cada render
  const holidaysMap = useMemo(() => {
    const map = new Map();

    nationalHolidays.forEach(h => {
      map.set(h.date, { name: h.localName, type: 'national' });
    });

    regionalHolidays.forEach(h => {
      map.set(h.date, { name: h.name, type: 'regional' });
    });

    return map;
  }, [nationalHolidays, regionalHolidays]);

  // Función optimizada para obtener información de festivos con búsqueda O(1)
  const getHolidayInfo = useCallback((dateStr, customHolidays = []) => {
    // Buscar en el mapa pre-computado (O(1))
    const holiday = holidaysMap.get(dateStr);
    if (holiday) return holiday;

    // Buscar en festivos personalizados (suele ser un array pequeño)
    const custom = customHolidays.find(h => h.date === dateStr);
    if (custom) return { name: custom.name, type: 'custom' };

    return null;
  }, [holidaysMap]);

  return {
    nationalHolidays,
    regionalHolidays,
    holidaysMap,
    getHolidayInfo
  };
};

export default useHolidays;
