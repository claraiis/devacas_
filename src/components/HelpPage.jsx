import React from 'react';
import { ArrowLeft } from 'lucide-react';

const HelpPage = ({ onClose }) => {
  return (
    <section className="relative z-10 w-full min-h-screen bg-white px-6 pt-32 pb-[calc(env(safe-area-inset-bottom)+24px)]">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold uppercase text-emerald-950 tracking-tight leading-[1.1]">
            Cómo funciona
          </h1>
          <p className="text-sm text-emerald-900/70">
            <strong>devacas_</strong> revisa todo el año y encuentra los mejores huecos para estirar tus vacaciones.
            Prioriza los periodos de descanso más largos según su eficiencia.
          </p>
          <div className="rounded-xl border border-emerald-900/10 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900">
            <span className="font-semibold">Eficiencia</span> = Días libres totales / Días de vacaciones gastados
          </div>
          <p className="text-xs text-emerald-900/60">
            El algoritmo considera periodos devacas_ los de 3 o más días, buscando siempre el mejor ratio posible.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-900/70">
            Calendario a tu medida
          </h2>
          <p className="text-sm text-emerald-900/70">
            Eliges si tus vacaciones son naturales o laborables, defines tus días de trabajo y añades festivos por
            convenio. Con esa base, la herramienta te propone el calendario más rentable para ti.
          </p>
          <p className="text-sm text-emerald-900/70">
            Puedes aceptar, rechazar o bloquear propuestas para ajustar el resultado a tu realidad.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-900/70">
            Fuentes de datos
          </h2>
          <p className="text-sm text-emerald-900/70">
            Los festivos se incluyen directamente en la aplicación. Puedes añadir festivos adicionales si tu empresa
            o localidad tiene días especiales.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-900/10 bg-white px-4 py-3 text-xs text-emerald-900/70">
          Esta es una herramienta de planificación. Los días propuestos son sugerencias que puedes modificar o eliminar
          según tus necesidades. Verifica siempre las políticas de vacaciones de tu empresa.
        </div>
      </div>
    </section>
  );
};

export default HelpPage;
