'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '@/context/AudioContext';
import Magnetic from '@/components/Magnetic';

export default function Header() {
  const pathname = usePathname();
  const { isMuted, toggleMute } = useAudio();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => setMenuOpen(false), [pathname]);

  const handleWorkClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      document.getElementById('archive-grid')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { label: 'Work', href: '/#archive-grid', onClick: handleWorkClick, active: pathname === '/' },
    { label: 'About', href: '/about', active: pathname === '/about' },
  ];

  return (
    <>
      {/* ─── Main Header ─── */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-[99995] transition-all duration-500 ${
          scrolled
            ? 'bg-[#FFFFFF]/95 backdrop-blur-xl border-b border-[#01564C]/20 shadow-[0_2px_24px_rgba(1,86,76,0.08)]'
            : 'bg-black/55 backdrop-blur-sm border-b border-white/10'
        }`}
      >
        <div className="px-6 md:px-12 flex justify-between items-center h-16 md:h-20">

          {/* ── Brand ── */}
          <Magnetic>
            <Link
              href="/"
              className="group flex flex-col leading-none select-none"
            >
              <span className={`font-serif text-lg md:text-xl font-bold tracking-[0.25em] transition-colors duration-300 ${scrolled ? 'text-[#000000]' : 'text-white'} group-hover:text-[#E9533A]`}>
                AKASH
              </span>
              <span className={`font-mono text-[7px] tracking-[0.35em] uppercase transition-colors duration-300 ${scrolled ? 'text-[#01564C]' : 'text-[#E9533A]'}`}>
                Est. 2026
              </span>
            </Link>
          </Magnetic>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ label, href, onClick, active }) => (
              <Magnetic key={label}>
                <Link
                  href={href}
                  onClick={onClick}
                  className={`relative px-5 py-2 font-mono text-[10px] tracking-[0.25em] font-semibold uppercase transition-colors duration-300 group ${
                    active
                      ? scrolled ? 'text-[#01564C]' : 'text-white font-bold'
                      : scrolled ? 'text-[#000000]/70 hover:text-[#01564C]' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {label}
                  {/* Active underline */}
                  <motion.span
                    className="absolute bottom-0 left-5 right-5 h-[1.5px] bg-[#01564C] origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: active ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                  {/* Hover underline */}
                  <span className="absolute bottom-0 left-5 right-5 h-[1px] bg-[#E9533A] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </Link>
              </Magnetic>
            ))}

            {/* Divider */}
            <span className={`w-px h-4 mx-2 ${scrolled ? 'bg-[#01564C]/25' : 'bg-white/20'}`} />

            {/* Sound toggle */}
            <Magnetic>
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                className={`relative flex items-center gap-2 px-4 py-2 font-mono text-[10px] tracking-[0.25em] font-semibold uppercase transition-colors duration-300 cursor-pointer ${
                  scrolled ? 'text-[#000000]/70 hover:text-[#E9533A]' : 'text-white/90 hover:text-white'
                }`}
              >
                <span>{isMuted ? 'Muted' : 'Sound'}</span>
                {/* Live waveform bars */}
                <span className="flex items-end gap-[2px] h-3">
                  {[2, 3, 1, 2.5].map((h, i) => (
                    <span
                      key={i}
                      className="w-[2px] bg-current rounded-full transition-all duration-300"
                      style={{
                        height: isMuted ? '2px' : `${h * 4}px`,
                        animationDelay: `${i * 0.15}s`,
                        animation: isMuted ? 'none' : `pulse ${0.7 + i * 0.15}s ease-in-out infinite alternate`,
                      }}
                    />
                  ))}
                </span>
              </button>
            </Magnetic>

            {/* Contact CTA pill */}
            <Magnetic>
              <a
                href="mailto:akash@example.com"
                className={`ml-3 px-5 py-2 font-mono text-[9px] tracking-[0.25em] font-bold uppercase border transition-all duration-300 rounded-full ${
                  scrolled
                    ? 'border-[#01564C] text-[#01564C] hover:bg-[#01564C] hover:text-white'
                    : 'border-white text-white hover:bg-white hover:text-[#000000]'
                }`}
              >
                Contact
              </a>
            </Magnetic>
          </nav>

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className={`md:hidden flex flex-col gap-[5px] p-2 cursor-pointer ${scrolled ? 'text-[#000000]' : 'text-white'}`}
          >
            <motion.span
              animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }}
              className="block w-6 h-[1.5px] bg-current origin-center transition-colors duration-300"
            />
            <motion.span
              animate={{ opacity: menuOpen ? 0 : 1, scaleX: menuOpen ? 0 : 1 }}
              className="block w-6 h-[1.5px] bg-current"
            />
            <motion.span
              animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }}
              className="block w-6 h-[1.5px] bg-current origin-center transition-colors duration-300"
            />
          </button>
        </div>
      </motion.header>

      {/* ─── Mobile Fullscreen Menu ─── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[99994] bg-white flex flex-col justify-center px-10 gap-10 md:hidden"
          >
            {/* Close button */}
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-6 right-6 font-mono text-[9px] tracking-widest text-[#000000]/50 hover:text-[#E9533A] transition-colors uppercase cursor-pointer"
            >
              [ CLOSE ]
            </button>

            {/* Brand watermark */}
            <span className="font-serif text-6xl font-bold text-[#01564C]/08 absolute top-1/2 left-8 -translate-y-1/2 pointer-events-none select-none">
              AKASH
            </span>

            {navLinks.map(({ label, href, onClick, active }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={href}
                  onClick={(e) => { onClick?.(e); setMenuOpen(false); }}
                  className={`font-serif text-5xl font-bold tracking-wide transition-colors duration-300 ${
                    active ? 'text-[#01564C]' : 'text-[#000000] hover:text-[#E9533A]'
                  }`}
                >
                  {label}
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.22, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-3 mt-4 border-t border-[#01564C]/15 pt-8"
            >
              <button
                onClick={() => { toggleMute(); }}
                className="font-mono text-sm tracking-[0.25em] uppercase text-[#000000]/60 hover:text-[#E9533A] transition-colors text-left cursor-pointer"
              >
                {isMuted ? '— Unmute Sound' : '— Mute Sound'}
              </button>
              <a
                href="mailto:akash@example.com"
                className="font-mono text-sm tracking-[0.25em] uppercase text-[#01564C] hover:text-[#E9533A] transition-colors"
              >
                — Get in Touch
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
