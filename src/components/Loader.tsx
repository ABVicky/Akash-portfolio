'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAudio } from '@/context/AudioContext';

const FLASH_IMAGES = [
  '/photos/Drink/WhatsApp Image 2026-07-04 at 2.03.36 PM (1).jpeg',
  '/photos/Food/WhatsApp Image 2026-07-04 at 2.02.12 PM.jpeg',
  '/photos/Jewellery/WhatsApp Image 2026-07-04 at 3.07.31 PM (1).jpeg',
  '/photos/personal/project-05-street-fragments/01.jpg',
  '/photos/Drink/WhatsApp Image 2026-07-04 at 2.03.36 PM.jpeg',
];

const SHUTTER_SPEEDS = [
  '1/8000',
  '1/4000',
  '1/2000',
  '1/1000',
  '1/500',
  '1/250',
  '1/125',
  '1/60',
  '1/30',
  '1/15',
  '1/8',
  '1/4',
  '1/2',
  '1.0"',
  'LOCK',
];

export default function Loader() {
  const { playShutterSound } = useAudio();
  const [showLoader, setShowLoader] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const hasTriggeredShutter = useRef(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    // Cycle through images for the flash-cut effect
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % FLASH_IMAGES.length);
    }, 180);

    // Smooth deterministic progress ticker over 2.7s
    const startTime = performance.now();
    const duration = 2650; 
    let rAFId: number;

    const animateProgress = () => {
      const elapsed = performance.now() - startTime;
      const nextProgress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(nextProgress);

      if (nextProgress === 100 && !hasTriggeredShutter.current) {
        hasTriggeredShutter.current = true;
        playShutterSound();
      }

      if (nextProgress < 100) {
        rAFId = requestAnimationFrame(animateProgress);
      }
    };

    rAFId = requestAnimationFrame(animateProgress);

    // Auto complete loader at exactly 3.0s
    const timeout = setTimeout(() => {
      handleComplete();
    }, 3000);

    return () => {
      clearInterval(imageInterval);
      cancelAnimationFrame(rAFId);
      clearTimeout(timeout);
    };
  }, [playShutterSound]);

  const handleComplete = () => {
    document.body.style.overflow = '';
    setShowLoader(false);
  };

  // Derive current virtual shutter speed indicator
  const speedIndex = Math.min(
    SHUTTER_SPEEDS.length - 1,
    Math.floor((progress / 100) * SHUTTER_SPEEDS.length)
  );
  const currentSpeed = SHUTTER_SPEEDS[speedIndex];

  return (
    <AnimatePresence>
      {showLoader && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          onClick={handleComplete}
          className="fixed inset-0 z-[999999] bg-[#FFFFFF] flex flex-col justify-between p-8 md:p-12 select-none cursor-pointer"
        >
          {/* Background Flash Images (Slowly clarify blur on progress) */}
          <div className="absolute inset-0 z-0 bg-white overflow-hidden">
            {FLASH_IMAGES.map((src, index) => (
              <div
                key={src}
                className="absolute inset-0 transition-opacity duration-75 ease-in-out"
                style={{
                  opacity: index === currentImageIndex ? 0.35 : 0,
                  filter: `blur(${(100 - progress) * 0.15}px) brightness(95%) grayscale(100%)`,
                }}
              >
                <Image
                  src={src}
                  alt="Cinematic intro frame"
                  fill
                  sizes="100vw"
                  priority
                  className="object-cover scale-105"
                />
              </div>
            ))}
          </div>

          {/* Autofocus Viewfinder Box Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <motion.div
              style={{
                width: `${72 - (progress * 0.25)}%`,
                height: `${72 - (progress * 0.25)}%`,
                borderColor: progress === 100 ? '#01564C' : 'rgba(233, 83, 58, 0.55)',
              }}
              className="max-w-[440px] max-h-[320px] border-[1.5px] border-dashed relative flex items-center justify-center transition-colors duration-300"
            >
              {/* Corner brackets */}
              <span className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 transition-colors duration-300 ${progress === 100 ? 'border-[#01564C]' : 'border-[#E9533A]/75'}`} />
              <span className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 transition-colors duration-300 ${progress === 100 ? 'border-[#01564C]' : 'border-[#E9533A]/75'}`} />
              <span className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 transition-colors duration-300 ${progress === 100 ? 'border-[#01564C]' : 'border-[#E9533A]/75'}`} />
              <span className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 transition-colors duration-300 ${progress === 100 ? 'border-[#01564C]' : 'border-[#E9533A]/75'}`} />

              {/* Central crosshair */}
              <span className="w-3 h-[1px] bg-black/20 absolute" />
              <span className="h-3 w-[1px] bg-black/20 absolute" />

              {/* HUD readout stats */}
              <div className="absolute bottom-2 left-4 font-mono text-[8px] font-bold tracking-[0.25em] text-[#E9533A] uppercase transition-colors duration-300">
                {progress === 100 ? 'AF_LOCK // OK' : `EXPOSING // ${progress}%`}
              </div>
              <div className="absolute bottom-2 right-4 font-mono text-[8px] font-bold tracking-[0.2em] text-[#000000]/65">
                TV: {currentSpeed}
              </div>
            </motion.div>
          </div>

          {/* Top minimal brand indicator */}
          <div className="relative z-10 flex justify-between items-center text-[10px] tracking-[0.25em] font-mono text-foreground/60 font-bold uppercase">
            <span>Archive Vol. I</span>
            <span>Est. 2026</span>
          </div>

          {/* Central Logo Wordmark Reveal */}
          <div className="relative z-10 flex flex-col items-center justify-center grow">
            <motion.h1 
              initial={{ letterSpacing: '0.15em', opacity: 0, scale: 0.96 }}
              animate={{ letterSpacing: '0.45em', opacity: 1, scale: 1 }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-8xl lg:text-9xl font-serif text-center font-bold text-foreground text-glow"
            >
              AKASH
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xs md:text-sm tracking-[0.6em] font-sans font-bold uppercase text-[#E9533A] mt-4 text-center"
            >
              Photography & Film
            </motion.p>
          </div>

          {/* Bottom Controls / Skip */}
          <div className="relative z-10 flex justify-between items-end">
            <div className="text-[10px] tracking-widest font-mono text-[#01564C] font-bold flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E9533A] animate-pulse" />
              <span>CALIBRATING LENS OPTICS...</span>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleComplete();
              }}
              className="text-[10px] tracking-[0.3em] font-mono text-[#000000]/80 hover:text-[#E9533A] transition-colors duration-300 uppercase py-2 cursor-pointer font-bold"
            >
              [ SKIP INTRO ]
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
