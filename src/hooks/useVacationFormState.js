import { useCallback, useState } from 'react';
import { POSTAL_TO_REGION } from '../constants/holidays';

const useVacationFormState = ({ config, setConfig, holidayDateInputRef }) => {
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });
  const [holidayError, setHolidayError] = useState('');
  const [postalCodeError, setPostalCodeError] = useState('');

  const handlePostalCodeChange = useCallback((value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 5);
    setConfig(prev => {
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
  }, [setConfig]);

  const addCustomHoliday = useCallback(() => {
    if (!newHoliday.name.trim()) {
      setHolidayError('Debes indicar el nombre del festivo.');
      return;
    }
    if (!newHoliday.date) {
      setHolidayError('Debes indicar la fecha del festivo.');
      return;
    }
    const datePattern = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])$/;
    if (!datePattern.test(newHoliday.date)) {
      setHolidayError('Formato de fecha inválido. Usa DD/MM (Ej: 25/12).');
      return;
    }
    if (newHoliday.date && newHoliday.name) {
      const [day, month] = newHoliday.date.split('/');
      const fullDate = `${config.year}-${month}-${day}`;
      setConfig(prev => ({
        ...prev,
        customHolidays: [...prev.customHolidays, { date: fullDate, name: newHoliday.name }]
      }));
      setNewHoliday({ date: '', name: '' });
      setHolidayError('');

      setTimeout(() => {
        holidayDateInputRef.current?.focus();
      }, 0);
    }
  }, [config.year, holidayDateInputRef, newHoliday.date, newHoliday.name, setConfig]);

  const removeCustomHoliday = useCallback((holidayToRemove) => {
    setConfig(prev => ({
      ...prev,
      customHolidays: prev.customHolidays.filter((holiday) => (
        holiday.date !== holidayToRemove.date || holiday.name !== holidayToRemove.name
      ))
    }));
  }, [setConfig]);

  return {
    newHoliday,
    setNewHoliday,
    holidayError,
    setHolidayError,
    postalCodeError,
    handlePostalCodeChange,
    addCustomHoliday,
    removeCustomHoliday
  };
};

export default useVacationFormState;
