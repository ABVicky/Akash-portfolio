'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [cursorType, setCursorType] = useState<'default' | 'view' | 'close' | 'pointer'>('default');

  // Fast inner focal dot coordinates (instant tracking)
  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  // Staggered coordinate tracking for the RGB chromatic aberration rings
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Ring 1 (Primary Config - Deep Green #01564C)
  const greenSpringConfig = { damping: 26, stiffness: 260, mass: 0.4 };
  const greenX = useSpring(cursorX, greenSpringConfig);
  const greenY = useSpring(cursorY, greenSpringConfig);

  // Ring 2 (Secondary Config - Deep Red #BB2C2C)
  const redSpringConfig = { damping: 29, stiffness: 210, mass: 0.65 };
  const redX = useSpring(cursorX, redSpringConfig);
  const redY = useSpring(cursorY, redSpringConfig);

  // Ring 3 (Accent Config - Orange-Red #E9533A)
  const accentSpringConfig = { damping: 32, stiffness: 160, mass: 0.9 };
  const accentX = useSpring(cursorX, accentSpringConfig);
  const accentY = useSpring(cursorY, accentSpringConfig);
  
  // Velocity and rotation values for dynamic stretch
  const scaleX = useMotionValue(1);
  const scaleY = useMotionValue(1);
  const rotate = useMotionValue(0);

  // Spring configurations for stretching
  const scaleXSpring = useSpring(scaleX, { damping: 22, stiffness: 250 });
  const scaleYSpring = useSpring(scaleY, { damping: 22, stiffness: 250 });
  const rotateSpring = useSpring(rotate, { damping: 28, stiffness: 180 });

  useEffect(() => {
    // Disable custom cursor if reduced motion is preferred
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Detect if device supports hovering (has fine pointer like mouse)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    if (!mediaQuery.matches) return;

    setIsVisible(true);
    document.body.classList.add('custom-cursor-active');

    let lastX = 0;
    let lastY = 0;
    let lastT = performance.now();
    let rAFId: number;

    const moveCursor = (e: MouseEvent) => {
      // Set instant raw position
      rawX.set(e.clientX);
      rawY.set(e.clientY);

      // Set target spring positions
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      const now = performance.now();
      const dt = now - lastT;
      if (dt > 10) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const speed = Math.min(2.0, dist / dt);

        if (speed > 0.05) {
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          scaleX.set(1 + speed * 0.45);
          scaleY.set(Math.max(0.35, 1 - speed * 0.3));
          rotate.set(angle);
        }

        lastX = e.clientX;
        lastY = e.clientY;
        lastT = now;
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isClickable = 
        target.closest('a') || 
        target.closest('button') || 
        target.closest('[role="button"]') ||
        target.closest('.clickable') ||
        target.closest('[data-cursor="pointer"]');

      const customCursorData = target.closest('[data-cursor]');
      const cursorVal = customCursorData ? customCursorData.getAttribute('data-cursor') : null;

      if (cursorVal === 'view') {
        setCursorType('view');
      } else if (cursorVal === 'close') {
        setCursorType('close');
      } else if (isClickable) {
        setCursorType('pointer');
      } else {
        setCursorType('default');
      }
    };

    const decayTicker = () => {
      const curSX = scaleX.get();
      const curSY = scaleY.get();
      
      scaleX.set(curSX + (1 - curSX) * 0.12);
      scaleY.set(curSY + (1 - curSY) * 0.12);
      
      rAFId = requestAnimationFrame(decayTicker);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    rAFId = requestAnimationFrame(decayTicker);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(rAFId);
      document.body.classList.remove('custom-cursor-active');
    };
  }, [cursorX, cursorY, scaleX, scaleY, rotate, rawX, rawY]);

  if (!isVisible) return null;

  // Staggered sizes based on types
  const cursorSizes = {
    default: 26,
    pointer: 44,
    view: 84,
    close: 84,
  };

  const currentSize = cursorSizes[cursorType];

  // Strictly palette variables
  const colorPrimary = '#01564C';
  const colorSecondary = '#BB2C2C';
  const colorAccent = '#E9533A';

  const variants = {
    default: {
      width: 26,
      height: 26,
      backgroundColor: 'rgba(1, 86, 76, 0)',
      border: `1.5px solid rgba(1, 86, 76, 0.35)`,
      borderRadius: '50%',
      x: '-50%',
      y: '-50%',
    },
    pointer: {
      width: 48,
      height: 48,
      backgroundColor: 'rgba(233, 83, 58, 0.05)',
      border: `1.5px dashed ${colorAccent}`,
      borderRadius: '50%',
      x: '-50%',
      y: '-50%',
    },
    view: {
      width: 84,
      height: 84,
      backgroundColor: 'rgba(1, 86, 76, 0.15)',
      border: `1.5px solid ${colorPrimary}`,
      borderRadius: '50%',
      x: '-50%',
      y: '-50%',
    },
    close: {
      width: 84,
      height: 84,
      backgroundColor: 'rgba(187, 44, 44, 0.15)',
      border: `1.5px solid ${colorSecondary}`,
      borderRadius: '50%',
      x: '-50%',
      y: '-50%',
    }
  };

  return (
    <>
      {/* 1. Fast Inner Focal Target Dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999999] w-1.5 h-1.5 bg-[#E9533A] rounded-full -translate-x-1/2 -translate-y-1/2 mix-blend-multiply"
        style={{
          x: rawX,
          y: rawY,
        }}
      />

      {/* 2. RGB Chromatic Aberration Trailing Lens Rings (strictly palette colors) */}
      {/* Primary Channel - Deep Green */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999996] border border-[#01564C]/70 rounded-full flex items-center justify-center mix-blend-multiply"
        style={{
          x: greenX,
          y: greenY,
          width: currentSize,
          height: currentSize,
          scaleX: scaleXSpring,
          scaleY: scaleYSpring,
          rotate: rotateSpring,
          transform: 'translate(-50%, -50%)',
          transformOrigin: 'center center',
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      />

      {/* Secondary Channel - Deep Red */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999997] border border-[#BB2C2C]/70 rounded-full flex items-center justify-center mix-blend-multiply"
        style={{
          x: redX,
          y: redY,
          width: currentSize,
          height: currentSize,
          scaleX: scaleXSpring,
          scaleY: scaleYSpring,
          rotate: rotateSpring,
          transform: 'translate(-50%, -50%)',
          transformOrigin: 'center center',
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      />

      {/* Accent Channel - Orange-Red */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999998] border border-[#E9533A]/70 rounded-full flex items-center justify-center mix-blend-multiply"
        style={{
          x: accentX,
          y: accentY,
          width: currentSize,
          height: currentSize,
          scaleX: scaleXSpring,
          scaleY: scaleYSpring,
          rotate: rotateSpring,
          transform: 'translate(-50%, -50%)',
          transformOrigin: 'center center',
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      />

      {/* 3. Rangefinder Focus HUD & Overlay Bracket Info */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999999] flex items-center justify-center mix-blend-multiply"
        style={{
          x: greenX, // Follows green channel coordinate as the neutral middle
          y: greenY,
          width: currentSize,
          height: currentSize,
          scaleX: scaleXSpring,
          scaleY: scaleYSpring,
          rotate: rotateSpring,
          transform: 'translate(-50%, -50%)',
          transformOrigin: 'center center',
        }}
      >
        {/* Autofocus Viewfinder Bracket Snaps */}
        <motion.span 
          className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#E9533A]"
          animate={{ 
            x: cursorType === 'pointer' ? 3 : cursorType === 'view' ? 5 : 0, 
            y: cursorType === 'pointer' ? 3 : cursorType === 'view' ? 5 : 0 
          }}
          transition={{ type: 'spring', stiffness: 250, damping: 20 }}
        />
        <motion.span 
          className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#E9533A]"
          animate={{ 
            x: cursorType === 'pointer' ? -3 : cursorType === 'view' ? -5 : 0, 
            y: cursorType === 'pointer' ? 3 : cursorType === 'view' ? 5 : 0 
          }}
          transition={{ type: 'spring', stiffness: 250, damping: 20 }}
        />
        <motion.span 
          className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#E9533A]"
          animate={{ 
            x: cursorType === 'pointer' ? 3 : cursorType === 'view' ? 5 : 0, 
            y: cursorType === 'pointer' ? -3 : cursorType === 'view' ? -5 : 0 
          }}
          transition={{ type: 'spring', stiffness: 250, damping: 20 }}
        />
        <motion.span 
          className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#E9533A]"
          animate={{ 
            x: cursorType === 'pointer' ? -3 : cursorType === 'view' ? -5 : 0, 
            y: cursorType === 'pointer' ? -3 : cursorType === 'view' ? -5 : 0 
          }}
          transition={{ type: 'spring', stiffness: 250, damping: 20 }}
        />

        {/* View / Close text overrides */}
        {cursorType === 'view' && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[#E9533A] font-mono tracking-widest text-[8px] font-bold"
          >
            VIEW
          </motion.span>
        )}
        {cursorType === 'close' && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[#BB2C2C] font-mono tracking-widest text-[8px] font-bold"
          >
            CLOSE
          </motion.span>
        )}

        {/* Floating Rangefinder Focal HUD Info */}
        <span className="absolute left-[110%] top-[-8px] font-mono text-[7px] tracking-[0.2em] text-[#E9533A] select-none whitespace-nowrap bg-white px-1.5 py-0.5 border border-[#01564C] shadow-sm">
          {cursorType === 'pointer' ? 'LOCK_AF // ON' : cursorType === 'view' ? 'SHUTTER_RDY' : 'A: 50mm f/1.2'}
        </span>
      </motion.div>
    </>
  );
}
