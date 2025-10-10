import { useEffect, useState } from 'react';
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

  return { nationalHolidays, regionalHolidays };
};

export default useHolidays;
