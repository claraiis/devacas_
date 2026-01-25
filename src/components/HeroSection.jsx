import React from 'react';

const HeroSection = ({ heroOpacity, heroTitleRef, heroTyped }) => {
  return (
    <>
      <div className="h-screen" aria-hidden="true" />
      <div
        className="fixed inset-0 z-10 flex items-end transition-opacity duration-700 ease-in-out pointer-events-none"
        style={{ opacity: heroOpacity }}
      >
        <div className="w-full mx-auto px-6 md:px-16 md:pb-16">
          <h1
            ref={heroTitleRef}
            className="text-5xl md:text-6xl lg:text-8xl text-white w-full min-h-[6.4em] md:min-h-[2em]"
          >
            <span className="block md:whitespace-nowrap font-light tracking-tight mb-2">Convierte días sueltos en</span>
            <span className="block min-h-[2.4em] md:min-h-[1em] uppercase font-bold">{heroTyped || '\u00A0'}</span>
          </h1>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
