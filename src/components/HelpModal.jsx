import React from 'react';
import { ChevronDown, X } from 'lucide-react';

const HelpModal = ({
  modalRef,
  modalScrollRef,
  onClose,
  onBackdropClick
}) => {
  const handleScrollToBottom = () => {
    if (!modalScrollRef?.current) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(min-width: 768px)').matches) {
      modalScrollRef.current.scrollTo({ top: modalScrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl mx-auto backdrop-blur-md bg-white/70 rounded-[4px] shadow-2xl px-12 md:px-16 py-12 md:py-16 max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-[4px] p-2 text-black/70 hover:text-black"
          aria-label="Cerrar modal"
        >
          <X size={24} />
        </button>
        <div
          ref={modalScrollRef}
          className="modal-scroll max-h-[calc(85vh-6rem)] md:max-h-[calc(85vh-8rem)] overflow-y-auto pr-2"
        >
          <div className="pb-6 bg-transparent flex justify-between items-center">
            <h2 id="modal-title" className="text-xl md:text-2xl font-regular text-black uppercase">
              <span className="md:hidden">¿Cómo funciona?</span>
              <span className="hidden md:inline">¿Cómo funciona DEVACAS_?</span>
            </h2>
          </div>

          <div className="space-y-8 text-black/80">
            <section>
              <p className="mb-3">
                DEVACAS_ analiza todo el calendario del año para encontrar las mejores oportunidades de maximizar tus días libres,
                priorizando periodos extendidos de vacaciones* según su ratio de eficiencia:
              </p>
              <div className="bg-black/10 p-4 mb-3 border-l-4 border-black">
                <p className="text-sm text-black">
                  <strong>Eficiencia</strong> = Días libres totales / Días de vacaciones gastados
                </p>
              </div>
              <p className="mb-3 text-sm">
                * El algoritmo entiende por periodos extendidos de vacaciones aquellos de 3 o más días, buscando siempre el mejor ratio posible.
              </p>
            </section>

            <section>
              <h3 className="text-lg md:text-xl font-regular mb-3 text-black uppercase">Calendario de vacaciones a tu medida</h3>
              <p className="mb-3">
                Mientras otras herramientas se limitan a decirte cuándo caen los puentes, DEVACAS_ se adapta a tu realidad.
              </p>
              <p className="mb-3">
                Te permite escoger entre vacaciones en días naturales o laborables, definir tus días de trabajo, añadir festivos por convenio e indicar posibles condicionantes a la hora de cogerte vacaciones.
              </p>
              <p className="mb-3">
                A partir de ahí, el algoritmo busca los huecos más rentables y te propone un calendario optimizado para ti, no para "la media".
              </p>
              <p className="mb-3">
                ¿Uno de los días sugeridos no te convence? Lo rechazas.
              </p>
              <p className="mb-3">
                ¿Prefieres este otro? Lo reservas.
              </p>
              <p className="mb-3">
                ¿Tu compañero ya se ha cogido vacaciones esa semana y no podéis coincidir? La bloqueas.
              </p>
            </section>

            <section>
              <h3 className="text-lg md:text-xl font-regular mb-3 text-black uppercase">Fuentes de datos</h3>
              <p className="mb-3">
                Los festivos están incluidos directamente en el código de la aplicación.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Festivos nacionales:</strong> <a href="https://date.nager.at/" className="text-black hover:underline">Nager.Date API</a></li>
                <li><strong>Festivos autonómicos:</strong> <a href="https://www.rtve.es/noticias/20251006/calendario-laboral-2026-festivos-puentes-nacionales-autonomicos/16744047.shtml" className="text-black hover:underline">Este artículo recopilatorio de RTVE</a></li>
              </ul>
              <p className="text-sm mt-3">
                *Los datos se basan en el calendario oficial español. Puedes añadir festivos adicionales
                en la sección "Festivos de convenio / locales" si tu empresa o localidad tiene días especiales.
              </p>
            </section>

            <div className="bg-black/10 rounded p-4 text-sm text-black/80">
              <p>
                💡 <strong>Recuerda:</strong> Esta es una herramienta de planificación.
                Los días propuestos son sugerencias que puedes modificar o eliminar según tus necesidades.
                Verifica siempre las políticas de vacaciones de tu empresa.
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleScrollToBottom}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-black/60 hover:text-black transition-colors"
          aria-label="Desplazar al final"
        >
          <ChevronDown size={22} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default HelpModal;
