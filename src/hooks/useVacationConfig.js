import { useCallback, useReducer } from 'react';

/**
 * @typedef {Object} VacationConfig
 * @property {'ES'} country
 * @property {string} postalCode
 * @property {number} year
 * @property {number | ''} vacationDays
 * @property {'laborables' | 'naturales'} vacationType
 * @property {'L-V' | 'L-S'} workDays
 * @property {boolean} weeklyBlocks
 * @property {boolean} prioritizeSummerWinter
 * @property {Array<{date: string, name: string}>} customHolidays
 * @property {Record<string, string>} manualOverrides
 */

/**
 * @typedef {Object} SetConfigAction
 * @property {'SET_CONFIG'} type
 * @property {VacationConfig} payload
 */

/**
 * @typedef {Object} ApplyUpdaterAction
 * @property {'APPLY_UPDATER'} type
 * @property {(prev: VacationConfig) => VacationConfig} updater
 */

/** @typedef {SetConfigAction | ApplyUpdaterAction} VacationConfigAction */

const ACTIONS = {
  setConfig: 'SET_CONFIG',
  applyUpdater: 'APPLY_UPDATER'
};

/** @type {VacationConfig} */
const initialConfig = {
  country: 'ES',
  postalCode: '',
  year: 2026,
  vacationDays: 22,
  vacationType: 'laborables',
  workDays: 'L-V',
  weeklyBlocks: false,
  prioritizeSummerWinter: false,
  customHolidays: [],
  manualOverrides: {}
};

/** @param {VacationConfig} state @param {VacationConfigAction} action */
const configReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.setConfig:
      return action.payload ?? state;
    case ACTIONS.applyUpdater: {
      const nextState = action.updater(state);
      return nextState ?? state;
    }
    default:
      return state;
  }
};

const useVacationConfig = () => {
  const [config, dispatch] = useReducer(configReducer, initialConfig);

  const setConfig = useCallback((updater) => {
    if (typeof updater === 'function') {
      dispatch({ type: ACTIONS.applyUpdater, updater });
      return;
    }
    dispatch({ type: ACTIONS.setConfig, payload: updater });
  }, []);

  return { config, setConfig };
};

export default useVacationConfig;
