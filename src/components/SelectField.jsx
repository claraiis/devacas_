import React from 'react';
import { ChevronDown } from 'lucide-react';

const SelectField = ({
  label,
  options,
  value,
  onChange,
  selectKey,
  selectRef,
  openSelect,
  setOpenSelect,
  openSelectPlacement,
  setOpenSelectPlacement,
  getSelectPlacement,
  wrapperClassName = 'relative',
  buttonClassName = 'w-full py-2 px-4 bg-black/30 text-white rounded-[4px] flex items-center justify-between font-light',
  menuClassName = 'w-full bg-white text-black rounded-[4px] shadow-lg z-20 p-1',
  optionClassName = 'w-full text-left px-4 py-2 rounded-xl hover:bg-black/5 font-light'
}) => {
  const isOpen = openSelect === selectKey;

  return (
    <div className={wrapperClassName}>
      {label && <h3 className="block mb-2 font-normal text-black">{label}</h3>}
      <div ref={selectRef} className="relative">
        <button
          type="button"
          onClick={() => {
            if (isOpen) {
              setOpenSelect(null);
              return;
            }
            const rect = selectRef.current?.getBoundingClientRect();
            if (rect) {
              setOpenSelectPlacement(getSelectPlacement(options.length, rect));
            }
            setOpenSelect(selectKey);
          }}
          className={buttonClassName}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
        <span>{options.find((opt) => opt.value === value)?.label}</span>
        <ChevronDown className="text-current" size={18} />
        </button>
        {isOpen && (
          <div className={`absolute ${openSelectPlacement === 'up' ? 'bottom-0' : 'top-0'} ${menuClassName}`}>
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpenSelect(null);
                }}
                className={optionClassName}
                role="option"
                aria-selected={value === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectField;
