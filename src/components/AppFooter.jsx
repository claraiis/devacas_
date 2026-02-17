import React from 'react';

const AppFooter = ({ showCalendar, showFormOverlay }) => {
  if (showFormOverlay || showCalendar) {
    return null;
  }
  return (
    <footer className="relative z-30 py-6 bg-white border-t border-emerald-900/10">
      <div className="w-full mx-auto px-6 md:px-16 flex flex-col md:flex-row justify-between items-center gap-2">
        <p className="text-emerald-900 text-sm font-normal">
          Con <span className="text-emerald-900">♥</span> por <a href="https://www.linkedin.com/in/claraiglesiasmarketing/" className="hover:underline">Clara Iglesias</a>
        </p>
        <p className="text-emerald-900 text-sm font-normal">
          <a href="https://github.com/claraiis/devacas_" className="hover:underline">Ver repositorio en Github</a>
        </p>
      </div>
    </footer>
  );
};

export default AppFooter;
