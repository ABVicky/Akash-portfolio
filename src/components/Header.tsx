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

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleWorkClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      setMenuOpen(false);
      setTimeout(() => {
        document.getElementById('archive-grid')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  };

  const navLinks = [
    { label: 'Work', href: '/#archive-grid', onClick: handleWorkClick, active: pathname === '/' },
    { label: 'About', href: '/about', active: pathname === '/about' },
  ];

  return (
    <>
      {/* ─── Main Header Bar ─── */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-[99995] transition-all duration-500 ${
          scrolled || menuOpen
            ? 'bg-[#FFFFFF]/98 backdrop-blur-xl border-b border-[#01564C]/20 shadow-[0_2px_24px_rgba(1,86,76,0.08)]'
            : 'bg-black/55 backdrop-blur-sm border-b border-white/10'
        }`}
      >
        <div className="px-5 md:px-12 flex justify-between items-center h-16 md:h-20">

          {/* ── Brand ── */}
          <Link href="/" className="group flex flex-col leading-none select-none z-10 relative">
            <span className={`font-serif text-lg md:text-xl font-bold tracking-[0.25em] transition-colors duration-300 ${
              scrolled || menuOpen ? 'text-[#000000]' : 'text-white'
            } group-hover:text-[#E9533A]`}>
              AKASH
            </span>
            <span className={`font-mono text-[7px] tracking-[0.35em] uppercase transition-colors duration-300 ${
              scrolled || menuOpen ? 'text-[#01564C]' : 'text-[#E9533A]'
            }`}>
              Est. 2026
            </span>
          </Link>

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
                  <motion.span
                    className="absolute bottom-0 left-5 right-5 h-[1.5px] bg-[#01564C] origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: active ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <span className="absolute bottom-0 left-5 right-5 h-[1px] bg-[#E9533A] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </Link>
              </Magnetic>
            ))}

            <span className={`w-px h-4 mx-2 ${scrolled ? 'bg-[#01564C]/25' : 'bg-white/20'}`} />

            <Magnetic>
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                className={`relative flex items-center gap-2 px-4 py-2 font-mono text-[10px] tracking-[0.25em] font-semibold uppercase transition-colors duration-300 cursor-pointer ${
                  scrolled ? 'text-[#000000]/70 hover:text-[#E9533A]' : 'text-white/90 hover:text-white'
                }`}
              >
                <span>{isMuted ? 'Muted' : 'Sound'}</span>
                <span className="flex items-end gap-[2px] h-3">
                  {[2, 3, 1, 2.5].map((h, i) => (
                    <span
                      key={i}
                      className="w-[2px] bg-current rounded-full transition-all duration-300"
                      style={{
                        height: isMuted ? '2px' : `${h * 4}px`,
                        animation: isMuted ? 'none' : `pulse ${0.7 + i * 0.15}s ease-in-out infinite alternate`,
                      }}
                    />
                  ))}
                </span>
              </button>
            </Magnetic>

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

          {/* ── Mobile Hamburger ── */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden relative z-10 flex flex-col justify-center items-center w-10 h-10 cursor-pointer gap-[5px]"
          >
            <motion.span
              animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`block w-6 h-[1.5px] origin-center ${scrolled || menuOpen ? 'bg-[#000000]' : 'bg-white'}`}
            />
            <motion.span
              animate={{ opacity: menuOpen ? 0 : 1, scaleX: menuOpen ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className={`block w-6 h-[1.5px] ${scrolled || menuOpen ? 'bg-[#000000]' : 'bg-white'}`}
            />
            <motion.span
              animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`block w-6 h-[1.5px] origin-center ${scrolled || menuOpen ? 'bg-[#000000]' : 'bg-white'}`}
            />
          </button>
        </div>
      </motion.header>

      {/* ─── Mobile Fullscreen Menu ─── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[99994] bg-[#FFFFFF] flex flex-col md:hidden"
          >
            {/* Content — starts below the header bar */}
            <div className="flex flex-col h-full pt-16 px-8 pb-10">

              {/* Nav Links — large serif */}
              <div className="flex flex-col gap-0 mt-10 flex-1">
                {navLinks.map(({ label, href, onClick, active }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="border-b border-[#01564C]/15"
                  >
                    <Link
                      href={href}
                      onClick={(e) => { onClick?.(e); setMenuOpen(false); }}
                      className={`flex items-center justify-between py-6 group transition-colors duration-300 ${
                        active ? 'text-[#01564C]' : 'text-[#000000] hover:text-[#E9533A]'
                      }`}
                    >
                      <span className="font-serif text-4xl font-bold tracking-wide">
                        {label}
                      </span>
                      <span className={`font-mono text-[9px] tracking-widest ${active ? 'text-[#01564C]' : 'text-[#000000]/30 group-hover:text-[#E9533A]'}`}>
                        {active ? '— ACTIVE' : '→'}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Footer strip */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="flex flex-col gap-5 pt-8 border-t border-[#01564C]/15"
              >
                <button
                  onClick={toggleMute}
                  className="flex items-center justify-between font-mono text-[11px] tracking-[0.25em] uppercase text-[#000000]/60 hover:text-[#E9533A] transition-colors cursor-pointer"
                >
                  <span>{isMuted ? '— Unmute Sound' : '— Mute Sound'}</span>
                  <span className="flex items-end gap-[2px] h-3">
                    {[2, 3, 1, 2.5].map((h, i) => (
                      <span key={i} className="w-[2px] bg-current rounded-full"
                        style={{ height: isMuted ? '2px' : `${h * 4}px` }} />
                    ))}
                  </span>
                </button>

                <a
                  href="mailto:akash@example.com"
                  className="flex items-center justify-between font-mono text-[11px] tracking-[0.25em] uppercase text-[#01564C] hover:text-[#E9533A] transition-colors"
                >
                  <span>— Get in Touch</span>
                  <span className="font-mono text-[9px] opacity-40">↗</span>
                </a>

                <p className="font-mono text-[8px] tracking-widest text-[#000000]/25 uppercase mt-2">
                  © 2026 Akash Photo Studio
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
