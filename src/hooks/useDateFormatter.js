import { useCallback } from 'react';

const useDateFormatter = () => {
  const normalizeDate = useCallback((date) => (
    new Date(date.getFullYear(), date.getMonth(), date.getDate())
  ), []);

  const getDateStr = useCallback((date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  return { normalizeDate, getDateStr };
};

export default useDateFormatter;
