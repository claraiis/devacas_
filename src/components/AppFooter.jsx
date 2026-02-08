import React from 'react';

const AppFooter = ({ showCalendar, showForm, showFormOverlay }) => {
  if (!showForm && !showFormOverlay && !showCalendar) {
    return null;
  }
  return (
    <footer className={`relative z-30 lg:fixed lg:bottom-0 lg:left-0 lg:right-0 lg:z-40 py-6 bg-transparent ${showFormOverlay ? 'hidden lg:block' : ''} ${showCalendar ? 'hidden lg:block' : ''}`}>
      <div className="w-full mx-auto px-6 md:px-16 flex flex-col md:flex-row justify-between items-center gap-2">
        <p className="text-white text-sm font-normal">
          Con <span className="text-transparent" style={{ WebkitTextStroke: '#ffffff 1px' }}>♥</span> por <a href="https://www.linkedin.com/in/claraiglesiasmarketing/" className="hover:underline">Clara Iglesias</a>
        </p>
        <p className="text-white text-sm font-normal">
          <a href="https://github.com/claraiis/devacas_" className="hover:underline">Ver repositorio en Github</a>
        </p>
      </div>
    </footer>
  );
};

export default AppFooter;
