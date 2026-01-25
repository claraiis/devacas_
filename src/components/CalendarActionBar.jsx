import React from 'react';
import { Check, RotateCcw, Share2, SlidersHorizontal, Wand2 } from 'lucide-react';

const CalendarActionBar = ({
  onSuggest,
  onConfirm,
  onEditPreferences,
  onReset,
  onShare
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2">
      <div className="flex items-center gap-4 rounded-[4px] bg-white px-4 py-2 shadow-lg">
        <div className="relative group">
          <button
            onClick={onEditPreferences}
            className="p-2 text-black hover:opacity-70 transition-opacity"
            aria-label="Editar preferencias"
          >
            <SlidersHorizontal size={18} aria-hidden="true" />
          </button>
          <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-black px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
            Editar preferencias
          </span>
        </div>
        <div className="relative group">
          <button
            onClick={onReset}
            className="p-2 text-black hover:opacity-70 transition-opacity"
            aria-label="Resetear calendario"
          >
            <RotateCcw size={16} aria-hidden="true" />
          </button>
          <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-black px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
            Resetear calendario
          </span>
        </div>
        <div className="relative group">
          <button
            onClick={onSuggest}
            className="p-2 text-black hover:opacity-70 transition-opacity"
            aria-label="Sugerir nuevos días"
          >
            <Wand2 size={18} aria-hidden="true" />
          </button>
          <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-black px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
            Sugerir nuevos días
          </span>
        </div>
        <div className="relative group">
          <button
            onClick={onConfirm}
            className="p-2 text-black hover:opacity-70 transition-opacity"
            aria-label="Confirmar sugeridos"
          >
            <Check size={18} aria-hidden="true" />
          </button>
          <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-black px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
            Confirmar sugeridos
          </span>
        </div>
        <div className="relative group">
          <button
            onClick={onShare}
            className="p-2 text-black hover:opacity-70 transition-opacity"
            aria-label="Compartir calendario"
          >
            <Share2 size={16} aria-hidden="true" />
          </button>
          <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-black px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
            Compartir calendario
          </span>
        </div>
      </div>
    </div>
  );
};

export default CalendarActionBar;
