import React from 'react';

const AppFooter = ({ showCalendar, showForm, showFormOverlay }) => {
  if (!showForm && !showCalendar && !showFormOverlay) {
    return null;
  }
  return (
    <footer className={`lg:fixed lg:bottom-0 lg:left-0 lg:right-0 lg:z-40 py-6 bg-transparent ${showFormOverlay ? 'hidden lg:block' : ''}`}>
      <div className="w-full mx-auto px-6 md:px-16 flex flex-col md:flex-row justify-between items-center gap-2">
        <p className={`${showCalendar ? 'text-black' : 'text-white'} text-sm font-light`}>
          Con <span className="text-transparent" style={{ WebkitTextStroke: `1px ${showCalendar ? '#000000' : '#ffffff'}` }}>♥</span> por <a href="https://www.linkedin.com/in/claraiglesiasmarketing/" className="hover:underline">Clara Iglesias</a>
        </p>
        <p className={`${showCalendar ? 'text-black' : 'text-white'} text-sm font-light`}>
          <a href="https://github.com/claraiis/devacas_" className="hover:underline">Ver repositorio en Github</a>
        </p>
      </div>
    </footer>
  );
};

export default AppFooter;
