import React from 'react';
import { CheckCircle } from 'lucide-react';

const HeroSection = ({
  heroOpacity,
  heroTitleRef,
  heroTyped,
  onPrimaryAction,
  showForm
}) => {
  return (
    <section
      className="relative z-10 w-full min-h-screen bg-white px-6 pt-32 pb-[calc(env(safe-area-inset-bottom)+120px)] transition-opacity duration-700 ease-in-out flex flex-col"
      style={{ opacity: heroOpacity }}
    >
      <div className="max-w-3xl mx-auto w-full  flex flex-1 flex-col text-center">
        <div className="space-y-4">
          <div className="text-base text-emerald-900/70">No desperdicies tus días libres</div>
          <h1
            ref={heroTitleRef}
            className="text-3xl font-semibold uppercase text-emerald-950 tracking-tight leading-[1.1]"
          >
            Tu próxima escapada empieza aquí
          </h1>
        </div>

        <div className="flex flex-1 items-center">
          <div className="w-full space-y-6 text-emerald-950">
            <div className="flex items-start gap-4">
              <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-700" aria-hidden="true" />
              <p className="text-sm font-medium">Mazimiza tus días de vacaciones</p>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-700" aria-hidden="true" />
              <p className="text-sm font-medium">Adapta el calendario a tus necesidades</p>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-700" aria-hidden="true" />
              <p className="text-sm font-medium">Descarga y comparte tu planificación</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 w-full max-w-3xl mx-auto">
        <form className="bg-white border border-emerald-100 rounded-xl p-6 shadow-sm flex flex-wrap gap-4 items-end justify-between">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-emerald-800">Código postal</label>
            <input
              type="text"
              placeholder="Ej. 28001"
              className="border border-emerald-200 rounded-md px-3 py-2 w-28 text-sm"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-emerald-800">Días de vacaciones</label>
            <input
              type="number"
              placeholder="Ej. 23"
              className="border border-emerald-200 rounded-md px-3 py-2 w-24 text-sm"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-emerald-800 mb-1">Tipo</label>
            <div className="flex gap-2">
              <label className="flex items-center gap-1 text-xs text-emerald-900">
                <input
                  type="radio"
                  name="tipo"
                  value="laborables"
                  className="accent-emerald-700"
                  defaultChecked
                />
                Laborables
              </label>
              <label className="flex items-center gap-1 text-xs text-emerald-900">
                <input
                  type="radio"
                  name="tipo"
                  value="naturales"
                  className="accent-emerald-700"
                />
                Naturales
              </label>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-emerald-800">Días ya gastados</label>
            <input
              type="number"
              placeholder="Opcional"
              className="border border-emerald-200 rounded-md px-3 py-2 w-24 text-sm"
            />
          </div>

          <button
            type="submit"
            className="bg-emerald-800 text-white font-semibold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider hover:bg-emerald-900 transition"
          >
            Calcular
          </button>
        </form>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 px-6 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-4 bg-white">
        <button
          type="button"
          onClick={onPrimaryAction}
          className="w-full rounded-xl bg-emerald-800 px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.35em] text-white transition-colors hover:bg-emerald-900"
        >
          {showForm ? 'Optimizar mis vacaciones' : 'Empezar a planificar'}
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
