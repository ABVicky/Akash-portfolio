'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';

// Simple deterministic pseudo-random generator to avoid SSR/client hydration mismatches
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

interface LightTableProps {
  imagePaths: string[];
  projectTitle: string;
}

export default function LightTable({ imagePaths, projectTitle }: LightTableProps) {
  const { playShutterSound } = useAudio();
  const boardRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Accessibility Check: Reduced motion
  const [prefersReduced, setPrefersReduced] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setPrefersReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const threshold = 50;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // swipe left -> next
        setActiveIdx((prev) => (prev !== null ? (prev + 1) % imagePaths.length : null));
        playShutterSound();
      } else {
        // swipe right -> prev
        setActiveIdx((prev) => (prev !== null ? (prev - 1 + imagePaths.length) % imagePaths.length : null));
        playShutterSound();
      }
    }
  };

  // Keyboard controls for lightbox navigation
  useEffect(() => {
    if (activeIdx === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveIdx(null);
        playShutterSound();
      } else if (e.key === 'ArrowRight') {
        setActiveIdx((prev) => (prev !== null ? (prev + 1) % imagePaths.length : null));
        playShutterSound();
      } else if (e.key === 'ArrowLeft') {
        setActiveIdx((prev) => (prev !== null ? (prev - 1 + imagePaths.length) % imagePaths.length : null));
        playShutterSound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIdx, imagePaths.length, playShutterSound]);

  // Select up to 16 images spread evenly across the full asset set to populate the table nicely
  const scatteredImages = useMemo(() => {
    if (imagePaths.length <= 16) return imagePaths.map((src, originalIdx) => ({ src, originalIdx }));
    
    const step = imagePaths.length / 16;
    return Array.from({ length: 16 }, (_, i) => {
      const idx = Math.floor(i * step);
      return { src: imagePaths[idx], originalIdx: idx };
    });
  }, [imagePaths]);

  // Pre-calculate fixed rotations, positions, and offsets to maintain consistency on render
  const scatteredCards = useMemo(() => {
    return scatteredImages.map((img, idx) => {
      // Use seeded deterministic values instead of Math.random() to solve SSR hydration warning
      const rotation = seededRandom(idx * 7) * 16 - 8; // -8deg to 8deg
      
      // Lay cards out in a loose 4x4 grid distribution on the desk coordinate space
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      
      // Calculate coordinates with minor deterministic offsets
      const left = 8 + col * 23 + (seededRandom(idx * 13) * 4 - 2); 
      const top = 10 + row * 21 + (seededRandom(idx * 19) * 4 - 2);
      
      return {
        ...img,
        rotation,
        left: `${left}%`,
        top: `${top}%`,
      };
    });
  }, [scatteredImages]);

  const handleCardClick = (originalIdx: number) => {
    setActiveIdx(originalIdx);
    playShutterSound();
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev !== null ? (prev + 1) % imagePaths.length : null));
    playShutterSound();
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev !== null ? (prev - 1 + imagePaths.length) % imagePaths.length : null));
    playShutterSound();
  };

  return (
    <section className="py-14 md:py-24 bg-canvas border-t border-[#01564C]/15 relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-5 md:px-12 mb-8 md:mb-12 flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <span className="font-mono text-[9px] tracking-[0.3em] text-accent font-bold uppercase block mb-2">
            THE ARCHIVE CONTACT SHEET
          </span>
          <h2 className="font-serif text-xl md:text-4xl font-semibold tracking-wide">
            Interactive Light Table
          </h2>
        </div>
        <span className="font-mono text-[9px] tracking-widest text-[#000000]/55 font-semibold">
          {(isMobile || prefersReduced)
            ? '[ TAP PHOTO TO VIEW FULLSCREEN ]'
            : '[ DRAG AND ARRANGE PRINTS • CLICK TO OPEN LIGHTBOX ]'
          }
        </span>
      </div>

      {/* Mobile: simple tap grid — Desktop: full scatter board */}
      {(isMobile || prefersReduced) ? (
        /* Mobile / reduced-motion: clean thumbnail tap grid */
        <div className="max-w-7xl mx-auto px-5 md:px-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {imagePaths.map((src, idx) => (
            <button
              key={src}
              onClick={() => handleCardClick(idx)}
              className="relative aspect-[3/4] bg-canvas-light border border-[#01564C] hover:border-[#E9533A] transition-colors duration-300 overflow-hidden group"
            >
              <Image
                src={src}
                alt={`${projectTitle} print ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-all duration-500"
              />
              <div className="absolute bottom-2 left-2 font-mono text-[7px] text-white bg-black/60 px-1.5 py-0.5">
                #{idx + 1}
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Rich UX: scattered draggable cards stack */
        <div 
          ref={boardRef} 
          className="relative max-w-7xl mx-auto h-[70vh] border border-[#01564C] bg-white overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(1, 86, 76, 0.15) 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        >
          {scatteredCards.map((card) => (
            <motion.div
              key={card.src}
              drag
              dragConstraints={boardRef}
              dragElastic={0.05}
              whileDrag={{ 
                scale: 1.08, 
                zIndex: 90, 
                boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
              }}
              onClick={() => handleCardClick(card.originalIdx)}
              style={{
                position: 'absolute',
                left: card.left,
                top: card.top,
                rotate: card.rotation,
                width: '18%',
                minWidth: '130px',
                maxWidth: '220px',
              }}
              className="aspect-[3/4] bg-black p-2 border border-[#01564C] shadow-lg cursor-grab active:cursor-grabbing hover:border-[#E9533A] transition-colors duration-300 group"
              data-cursor="view"
            >
              <div className="relative w-full h-[88%] bg-canvas-light overflow-hidden">
                <Image
                  src={card.src}
                  alt={`${projectTitle} scatter print`}
                  fill
                  sizes="20vw"
                  className="object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 pointer-events-none"
                />
              </div>
              <div className="flex justify-between items-center h-[12%] px-1 text-[8px] font-mono text-[#01564C] mt-0.5">
                <span>FRAME #{card.originalIdx + 1}</span>
                <span>AKASH</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Cinematic Theater Lightbox overlay */}
      <AnimatePresence>
        {activeIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[999999] bg-white/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-6 select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => {
              setActiveIdx(null);
              playShutterSound();
            }}
          >
            {/* Top Bar info */}
            <div className="flex justify-between items-center text-[10px] font-mono text-foreground/50 tracking-widest uppercase">
              <span>{projectTitle} &mdash; Theater View</span>
              <span>
                FRAME {activeIdx + 1} / {imagePaths.length}
              </span>
              <button 
                onClick={() => {
                  setActiveIdx(null);
                  playShutterSound();
                }}
                className="hover:text-accent transition-colors duration-300 flex items-center gap-2 cursor-pointer py-2"
              >
                <span>CLOSE</span>
                <X size={14} />
              </button>
            </div>

            {/* Main Central Image Frame */}
            <div className="relative w-full flex-grow h-0 flex items-center justify-center my-4 md:my-6">
              {/* Left Arrow Button */}
              <button
                onClick={handlePrev}
                className="absolute left-2 md:left-4 z-10 p-3 md:p-3 rounded-full bg-[#01564C]/10 border border-[#01564C] hover:border-[#E9533A] text-foreground/80 hover:text-[#E9533A] hover:bg-[#E9533A]/10 transition-all duration-300 cursor-pointer touch-manipulation"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>

              {/* High-res Image Wrapper */}
              <div 
                className="relative w-full max-w-[85vw] h-full max-h-[70vh] overflow-hidden flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={imagePaths[activeIdx]}
                  alt={`${projectTitle} high-res presentation`}
                  fill
                  priority
                  sizes="80vw"
                  className="object-contain filter contrast-105"
                />
              </div>

              {/* Right Arrow Button */}
              <button
                onClick={handleNext}
                className="absolute right-2 md:right-4 z-10 p-3 rounded-full bg-[#01564C]/10 border border-[#01564C] hover:border-[#E9533A] text-foreground/80 hover:text-[#E9533A] hover:bg-[#E9533A]/10 transition-all duration-300 cursor-pointer touch-manipulation"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Bottom Details Row */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left text-[9px] font-mono text-foreground/60 tracking-wide max-w-7xl mx-auto w-full border-t border-[#01564C] pt-4">
              <span>CAMERA: LEICA SL3 &bull; APO-SUMMICRON-SL 50 f/2 ASPH</span>
              <span className="text-[#01564C] hidden sm:inline">|</span>
              <span>EXPOSURE: ISO 100 &bull; 1/250s &bull; f/5.6</span>
              <span className="text-[#01564C] hidden sm:inline">|</span>
              <span>©2026 AKASH STUDIO</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
