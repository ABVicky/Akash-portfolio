'use client';

import React, { useEffect, useState } from 'react';

export default function CameraViewfinder() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [battery, setBattery] = useState(100);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setCoords({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMove);

    // Slowly drain battery over time for organic realism!
    const batteryInterval = setInterval(() => {
      setBattery((prev) => (prev > 1 ? prev - 1 : 100));
    }, 12000);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      clearInterval(batteryInterval);
    };
  }, []);

  // Compute exposure slider dot index based on mouse Y coordinate
  const exposureDot = Math.max(-2, Math.min(2, Math.floor(((coords.y / (typeof window !== 'undefined' ? window.innerHeight : 1000)) * 5) - 2.5) * -1));

  return (
    <div className="fixed inset-0 z-[99990] pointer-events-none select-none flex flex-col justify-between pt-20 pb-6 px-6 md:px-12">
      {/* 1. Rule of Thirds Technical Grid Lines (thicker and higher opacity) */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-[0.16] border-[1.5px] border-[#01564C]">
        <div className="border-r-[1.5px] border-b-[1.5px] border-[#01564C]" />
        <div className="border-r-[1.5px] border-b-[1.5px] border-[#01564C]" />
        <div className="border-b-[1.5px] border-[#01564C]" />
        <div className="border-r-[1.5px] border-b-[1.5px] border-[#01564C]" />
        <div className="border-r-[1.5px] border-b-[1.5px] border-[#01564C]" />
        <div className="border-b-[1.5px] border-[#01564C]" />
        <div className="border-r-[1.5px] border-[#01564C]" />
        <div className="border-r-[1.5px] border-[#01564C]" />
        <div />
      </div>

      {/* 2. Top Banner Status HUD (larger font and bold weight) */}
      <div className="relative z-10 w-full flex justify-between items-center font-mono text-[9px] tracking-[0.25em] text-[#01564C] font-bold">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#E9533A] animate-pulse" />
            <span className="text-[#E9533A]">REC [STANDBY]</span>
          </span>
          <span className="hidden sm:inline">FORMAT: RAW+DNG</span>
          <span className="hidden md:inline">COLOR: LEICA_L_LOG</span>
        </div>
        
        {/* Shutter Settings */}
        <div className="flex items-center gap-6">
          <span>50mm f/1.2</span>
          <span>ISO 100</span>
          <span>1/250s</span>
          <div className="flex items-center gap-1.5">
            <span>BATT {battery}%</span>
            <div className="w-7 h-3.5 border-[1.5px] border-[#01564C] p-[1px] flex gap-[1px]">
              <span className="h-full bg-[#01564C]" style={{ width: `${Math.max(15, battery)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Left Margin: Distance Slider Focus Scale (bold weight, visible scale lines) */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2.5 font-mono text-[8px] tracking-widest text-[#01564C] items-center font-bold">
        <span>[ MF ]</span>
        <span className="h-10 w-[1.5px] bg-[#01564C]/55" />
        <span className={exposureDot === 2 ? "text-[#E9533A] font-extrabold" : ""}>INF</span>
        <span>•</span>
        <span className={exposureDot === 1 ? "text-[#E9533A] font-extrabold" : ""}>5.0m</span>
        <span>•</span>
        <span className={exposureDot === 0 ? "text-[#E9533A] font-extrabold" : ""}>1.2m</span>
        <span>•</span>
        <span className={exposureDot === -1 ? "text-[#E9533A] font-extrabold" : ""}>0.7m</span>
        <span>•</span>
        <span className={exposureDot === -2 ? "text-[#E9533A] font-extrabold" : ""}>0.3m</span>
        <span className="h-10 w-[1.5px] bg-[#01564C]/55" />
        <span className="text-[#01564C]/75">FOCUS</span>
      </div>

      {/* 4. Right Margin: Exposure Light Meter (bold weight, visible ticks) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 hidden md:flex flex-col gap-2 font-mono text-[8px] tracking-widest text-[#01564C] items-center font-bold">
        <span>+2.0</span>
        <span className={`w-1.5 h-1.5 rounded-full ${exposureDot === 2 ? 'bg-[#E9533A]' : 'bg-[#01564C]/70'}`} />
        <span>+1.0</span>
        <span className={`w-1.5 h-1.5 rounded-full ${exposureDot === 1 ? 'bg-[#E9533A]' : 'bg-[#01564C]/70'}`} />
        <span className={exposureDot === 0 ? 'text-[#E9533A] font-extrabold' : ''}>★ 0</span>
        <span className={`w-1.5 h-1.5 rounded-full ${exposureDot === -1 ? 'bg-[#E9533A]' : 'bg-[#01564C]/70'}`} />
        <span>-1.0</span>
        <span className={`w-1.5 h-1.5 rounded-full ${exposureDot === -2 ? 'bg-[#E9533A]' : 'bg-[#01564C]/70'}`} />
        <span>-2.0</span>
        <span className="text-[#01564C]/75 mt-2">EV</span>
      </div>

      {/* 5. Center Viewfinder Crosshair (more visible lines) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <span className="w-6 h-[1.5px] bg-[#01564C]/65" />
        <span className="h-6 w-[1.5px] bg-[#01564C]/65 absolute" />
        <span className="w-2.5 h-2.5 rounded-full border-[1.5px] border-[#01564C]/75 absolute" />
      </div>

      {/* 6. Bottom Status HUD (larger font, bold weight) */}
      <div className="relative z-10 w-full flex justify-between items-end font-mono text-[9px] tracking-[0.25em] text-[#01564C] font-bold">
        <div className="flex flex-col gap-1.5">
          <span>COORD_X: {coords.x}px</span>
          <span>COORD_Y: {coords.y}px</span>
        </div>

        <div className="text-right flex flex-col gap-1.5">
          <span>AF_AREA: SPOT [CENTER]</span>
          <span className="text-[#E9533A]">METERING: EVALUATIVE</span>
        </div>
      </div>
    </div>
  );
}
