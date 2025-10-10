import { useEffect, useRef } from 'react';

/**
 * Hook para guardar datos en localStorage con debounce
 * Reduce escrituras a localStorage de ~50/segundo a 1 cada 500ms
 *
 * @param {string} key - Clave de localStorage
 * @param {any} value - Valor a guardar
 * @param {number} delay - Delay en milisegundos (default: 500)
 */
export const useDebounceLocalStorage = (key, value, delay = 500) => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Establecer nuevo timeout
    timeoutRef.current = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(value));
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, value, delay]);
};

export default useDebounceLocalStorage;
