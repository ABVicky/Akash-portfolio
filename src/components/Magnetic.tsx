'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Only enable on devices with a fine pointer (desktop mouse) — no-op on touch
    const mq = window.matchMedia('(pointer: fine)');
    setEnabled(mq.matches);

    const handleMouseLeave = () => setPosition({ x: 0, y: 0 });
    const element = ref.current;
    if (element) element.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      if (element) element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!enabled || !ref.current) return;
    const { clientX, clientY } = e;
    const rect = ref.current.getBoundingClientRect();
    const x = clientX - (rect.left + rect.width / 2);
    const y = clientY - (rect.top + rect.height / 2);
    setPosition({ x: x * 0.35, y: y * 0.35 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}
