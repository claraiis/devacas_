import React from 'react';
import { Plus, X, Info } from 'lucide-react';
import SelectField from './SelectField';
import { THEME_COLORS } from '../constants/colors';

const VacationForm = ({
  showForm,
  formRef,
  section3Ref,
  holidayDateInputRef,
  optimizeVacations,
  configState,
  selectState,
  formState,
  tooltipState,
  isOverlay = false
}) => {
  const baseInputClassName = 'w-full py-2 px-4 bg-black/30 text-white rounded-[4px] font-normal text-sm';
  const placeholderInputClassName = `${baseInputClassName} placeholder:text-white/50 placeholder:font-normal`;
  const { config, setConfig } = configState;
  const {
    openSelect,
    setOpenSelect,
    openSelectPlacement,
    setOpenSelectPlacement,
    getSelectPlacement,
    options,
    refs
  } = selectState;
  const {
    postalCodeError,
    handlePostalCodeChange,
    newHoliday,
    setNewHoliday,
    holidayError,
    setHolidayError,
    addCustomHoliday,
    removeCustomHoliday
  } = formState;
  const { showPostalCodeTooltip, setShowPostalCodeTooltip } = tooltipState;

  return (
    <div
      ref={formRef}
      className={`relative transition-opacity duration-700 ease-in-out ${showForm ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${isOverlay ? '' : 'z-20 md:min-h-screen md:flex md:items-center md:justify-center'}`}
    >
      <div className="backdrop-blur-md bg-white/50 rounded-[4px] shadow-2xl w-full max-w-4xl mx-auto px-8 md:px-12 py-8 md:py-12">
        <div className="space-y-8 text-sm">
          <div className="mb-8">
            <h2 className="text-md md:text-xl font-medium md:font-normal mb-6 text-black tracking-tight uppercase">Empecemos por lo básico</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <SelectField
                  label="País"
                  options={options.country}
                  value={config.country}
                  onChange={(value) => setConfig((prev) => ({ ...prev, country: value }))}
                  selectKey="country"
                  selectRef={refs.country}
                  openSelect={openSelect}
                  setOpenSelect={setOpenSelect}
                  openSelectPlacement={openSelectPlacement}
                  setOpenSelectPlacement={setOpenSelectPlacement}
                  getSelectPlacement={getSelectPlacement}
                />
              </div>

              <div>
                <h3 className="block mb-2 font-normal flex items-center gap-2 text-black">
                  Código postal
                  <div className="relative group">
                    <Info
                      size={16}
                      className="text-black cursor-help"
                      onClick={() => {
                        setShowPostalCodeTooltip(true);
                        setTimeout(() => setShowPostalCodeTooltip(false), 3000);
                      }}
                    />
                    <div className={`absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900  text-white text-sm rounded-[4px] shadow-lg transition-all duration-200 z-20 ${
                      showPostalCodeTooltip ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'
                    }`}>
                      Los días festivos se calculan en base a este código postal.
                    </div>
                  </div>
                </h3>
                <input
                  type="text"
                  value={config.postalCode}
                  onChange={(e) => handlePostalCodeChange(e.target.value)}
                  placeholder="Ej: 15009"
                  className={placeholderInputClassName}
                  maxLength="5"
                  aria-labelledby="postal-code-heading"
                />
                {postalCodeError && (
                  <p className="text-sm text-orange-600 mt-1">⚠️ {postalCodeError}</p>
                )}
              </div>

              <div>
                <SelectField
                  label="Año"
                  options={options.year}
                  value={config.year}
                  onChange={(value) => setConfig((prev) => ({ ...prev, year: value }))}
                  selectKey="year"
                  selectRef={refs.year}
                  openSelect={openSelect}
                  setOpenSelect={setOpenSelect}
                  openSelectPlacement={openSelectPlacement}
                  setOpenSelectPlacement={setOpenSelectPlacement}
                  getSelectPlacement={getSelectPlacement}
                />
              </div>

              <div>
                <h3 className="block mb-2 font-normal text-black">Días de vacaciones</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={config.vacationDays}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value === '' ? '' : parseInt(value, 10);
                        setConfig(prev => ({ ...prev, vacationDays: isNaN(numValue) ? '' : numValue }));
                      }}
                      className={`${baseInputClassName} appearance-none font-light`}
                      min="0"
                    />
                  </div>
                  <SelectField
                    options={options.vacationType}
                    value={config.vacationType}
                    onChange={(value) => setConfig((prev) => ({ ...prev, vacationType: value }))}
                    selectKey="vacationType"
                    selectRef={refs.vacationType}
                    openSelect={openSelect}
                    setOpenSelect={setOpenSelect}
                    openSelectPlacement={openSelectPlacement}
                    setOpenSelectPlacement={setOpenSelectPlacement}
                    getSelectPlacement={getSelectPlacement}
                    wrapperClassName="relative flex-1"
                    buttonClassName="w-full py-2 px-4 bg-black/30 text-white rounded-[4px] flex items-center justify-between whitespace-nowrap font-light"
                  />
                </div>
                {config.country === 'ES' && (config.vacationDays === '' || config.vacationDays < 22) && (
                  <p className="text-sm text-red-700 mt-2">
                    ⚠️ En España el mínimo legal son 22 días laborables.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-md md:text-xl font-medium md:font-normal mb-6 text-black tracking-tight uppercase">Añade tus festivos locales / por convenio</h2>
            <div>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                  ref={holidayDateInputRef}
                  type="text"
                  value={newHoliday.date}
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^\d]/g, '');

                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }

                    setNewHoliday(prev => ({ ...prev, date: value }));
                    if (holidayError) setHolidayError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addCustomHoliday();
                    }
                  }}
                  placeholder="DD/MM (Ej: 25/12)"
                  className={`${placeholderInputClassName} flex-1`}
                  maxLength="5"
                />
                <input
                  type="text"
                  value={newHoliday.name}
                  onChange={(e) => {
                    setNewHoliday(prev => ({ ...prev, name: e.target.value }));
                    if (holidayError) setHolidayError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addCustomHoliday();
                    }
                  }}
                  placeholder="Nombre del festivo"
                  className={`${placeholderInputClassName} flex-1`}
                />
                <button
                  onClick={addCustomHoliday}
                  className="w-full md:w-auto px-4 py-2 bg-white text-black flex items-center justify-center gap-2 rounded-[4px] transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>

              {holidayError && (
                <p className="text-sm text-red-600 mb-4">{holidayError}</p>
              )}

              {config.customHolidays.length > 0 && (
                <div className="space-y-2">
                  {[...config.customHolidays]
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((holiday) => {
                      const [year, month, day] = holiday.date.split('-');
                      const monthNames = [
                        'enero',
                        'febrero',
                        'marzo',
                        'abril',
                        'mayo',
                        'junio',
                        'julio',
                        'agosto',
                        'septiembre',
                        'octubre',
                        'noviembre',
                        'diciembre'
                      ];
                      const formattedDate = `${day} ${monthNames[Number(month) - 1]}`;
                      return (
                        <div key={`${holiday.date}-${holiday.name}`} className="flex items-center gap-3 bg-transparent">
                          <span className="text-black font-normal">
                            {formattedDate} - {holiday.name}
                          </span>
                          <button
                            onClick={() => removeCustomHoliday(holiday)}
                            className="text-red-700 hover:text-red-600 text-sm font-normal"
                          >
                            (Eliminar)
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          <div ref={section3Ref}>
            <h2 className="text-md md:text-xl font-medium md:font-normal mb-6 text-black tracking-tight uppercase">Escoge tus preferencias</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-2">
                  <div>
                    <label htmlFor="weekly-blocks" className="flex items-center gap-3 cursor-pointer font-normal">
                      <input
                        id="weekly-blocks"
                        type="checkbox"
                        checked={config.weeklyBlocks}
                        onChange={(e) => setConfig(prev => ({ ...prev, weeklyBlocks: e.target.checked }))}
                        className="w-4 h-4 cursor-pointer"
                        style={{ accentColor: THEME_COLORS.primary }}
                      />
                      <span className="font-normal text-sm text-black">Vacaciones en bloques semanales</span>
                    </label>
                  </div>

                  <div>
                    <label htmlFor="prioritize-summer-winter" className="flex items-center gap-3 cursor-pointer font-normal">
                      <input
                        id="prioritize-summer-winter"
                        type="checkbox"
                        checked={config.prioritizeSummerWinter}
                        onChange={(e) => setConfig(prev => ({ ...prev, prioritizeSummerWinter: e.target.checked }))}
                        className="w-4 h-4 cursor-pointer"
                        style={{ accentColor: THEME_COLORS.primary }}
                      />
                      <span className="font-normal text-sm text-black">Priorizar verano y Navidad</span>
                    </label>
                  </div>
                </div>

                {config.vacationType !== 'naturales' && (
                  <div>
                    <label className="block mb-3 font-medium text-black">Jornada laboral de...</label>
                    <div className="grid grid-cols-2 gap-4">
                      <label htmlFor="workdays-lv" className="flex items-center gap-3 cursor-pointer text-black font-normal">
                        <input
                          id="workdays-lv"
                          type="radio"
                          name="workDays"
                          value="L-V"
                          checked={config.workDays === 'L-V'}
                          onChange={(e) => setConfig(prev => ({ ...prev, workDays: e.target.value }))}
                          className="w-4 h-4 cursor-pointer flex-shrink-0"
                          style={{ accentColor: THEME_COLORS.primary }}
                        />
                        Lunes a viernes
                      </label>
                      <label htmlFor="workdays-ls" className="flex items-center gap-3 cursor-pointer text-black font-normal">
                        <input
                          id="workdays-ls"
                          type="radio"
                          name="workDays"
                          value="L-S"
                          checked={config.workDays === 'L-S'}
                          onChange={(e) => setConfig(prev => ({ ...prev, workDays: e.target.value }))}
                          className="w-4 h-4 cursor-pointer flex-shrink-0"
                          style={{ accentColor: THEME_COLORS.primary }}
                        />
                        Lunes a sábado
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={optimizeVacations}
              className=" w-full px-8 py-4 bg-black text-white uppercase text-md font-medium tracking-wide rounded-[4px] hover:bg-gray-900 transition-colors"
            >
              Optimizar mis vacaciones
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacationForm;
