'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import portfolioData from '@/data/portfolio-manifest.json';
import ProjectCard from '@/components/ProjectCard';
import TransitionLink from '@/components/TransitionLink';
import Magnetic from '@/components/Magnetic';

// Lazy-load heavy components
const HeroCanvas = dynamic(() => import('@/components/HeroCanvas'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[#111] flex items-center justify-center">
      <span className="font-mono text-[10px] tracking-widest text-white/30 animate-pulse">
        PREPARING VIEWPORT...
      </span>
    </div>
  )
});

// Hide Camera HUD on touch devices — mouse coords meaningless on mobile
const CameraViewfinder = dynamic(
  () => import('@/components/CameraViewfinder'),
  { ssr: false }
);

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Dynamically extract categories from the manifest files folder structure
  const categories = useMemo(() => {
    const unique = new Set(portfolioData.map((p) => p.category));
    return ['all', ...Array.from(unique)];
  }, []);

  // Filtered portfolio list
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') return portfolioData;
    return portfolioData.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  // Determine landing hero image
  const heroImage = '/photos/personal/project-05-street-fragments/cover.png';

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
  };

  // Helper to format category labels dynamically using their metadata label
  const getCategoryLabel = (cat: string) => {
    if (cat === 'all') return 'All';
    const project = portfolioData.find((p) => p.category === cat);
    return project?.categoryLabel || cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const getCategoryCount = (cat: string) => {
    if (cat === 'all') return portfolioData.length;
    return portfolioData.filter((p) => p.category === cat).length;
  };

  return (
    <main className="relative min-h-screen bg-canvas overflow-x-hidden">
      {/* 1. Landing Hero Page */}
      <section className="relative h-[100svh] w-full flex flex-col justify-between p-5 md:p-12 overflow-hidden select-none">
        {/* R3F WebGL background — lazy on mobile */}
        <div className="absolute inset-0 z-0">
          {heroImage && (
            <HeroCanvas imageSrc={heroImage} />
          )}
        </div>

        {/* Camera HUD — self-guards on mobile via JS media query */}
        <CameraViewfinder />

        {/* Spacer to push content below fixed navbar (h-16 on mobile, h-20 on md) */}
        <div className="relative z-20 flex justify-between items-center text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.25em] font-mono text-white/70 uppercase pt-20 md:pt-24">
          <span>PORTFOLIO COLLECTION</span>
          <span>©2026</span>
        </div>

        {/* Hero headline */}
        <div className="relative z-20 flex flex-col items-start max-w-xl md:max-w-2xl mt-auto mb-6 md:mb-16 select-none">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <p className="font-mono text-[9px] md:text-xs tracking-[0.35em] md:tracking-[0.4em] text-accent uppercase mb-3 md:mb-4">
              Akash Vicky &mdash; Cinematic Vision
            </p>
            <h1 className="text-[clamp(2.25rem,8vw,4rem)] sm:text-5xl md:text-6xl font-serif font-bold text-white tracking-wide leading-[1.05] capitalize drop-shadow-lg">
              Capturing the <br />
              <span className="font-light italic text-accent">Cinematic Soul</span> of spaces
            </h1>
          </motion.div>

          <div className="hidden sm:flex flex-row gap-10 md:gap-20 mt-6 md:mt-8 w-full border-t border-white/20 pt-6 md:pt-8 text-[11px] font-mono text-white/65">
            <div className="flex flex-col gap-1 text-[8px] font-mono uppercase tracking-[0.2em] leading-relaxed">
              <span className="text-white/60 block mb-1">STORYTELLING</span>
              <span className="text-white font-serif text-[10px] lowercase italic">through film grain</span>
            </div>
            <div className="flex flex-col gap-1 text-[8px] font-mono uppercase tracking-[0.2em] leading-relaxed">
              <span className="text-white/60 block mb-1">CRAFT</span>
              <span className="text-white font-serif text-[10px] lowercase italic">without compromise</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1, duration: 1 }}
          onClick={() => {
            document.getElementById('archive-grid')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="relative z-20 mx-auto flex flex-col items-center gap-2 cursor-pointer hover:text-accent group transition-colors duration-300 pb-2"
        >
          <span className="font-mono text-[8px] md:text-[9px] tracking-[0.3em] text-white/60 group-hover:text-accent">
            SCROLL TO VIEW
          </span>
          <div className="h-7 md:h-8 w-[1px] bg-white/25 group-hover:bg-accent relative overflow-hidden transition-colors duration-300">
            <motion.div
              animate={{ y: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="absolute top-0 left-0 right-0 h-1/2 bg-accent"
            />
          </div>
        </motion.div>
      </section>

      {/* 2. Archive / Grid Section */}
      <section
        id="archive-grid"
        className="relative z-20 min-h-screen py-16 md:py-36 px-5 md:px-12 max-w-7xl mx-auto overflow-x-hidden"
      >
        {/* Center Plumb-Line — desktop only */}
        <div className="absolute left-1/2 top-48 bottom-24 dashed-rule-v pointer-events-none hidden lg:block" />

        {/* Category Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-4 border-b border-[#01564C]/25 pb-5 mb-10 md:mb-16 relative z-10">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[9px] md:text-[10px] tracking-widest text-accent uppercase font-bold">
              INDEX OF WORKS
            </span>
            <h2 className="font-serif text-xl md:text-3xl font-medium tracking-wide">
              Selected Archive
            </h2>
          </div>

          {/* Horizontally scrollable filter row on mobile */}
          <div className="flex gap-1 md:gap-4 text-[10px] tracking-[0.2em] font-mono uppercase overflow-x-auto pb-1 -mx-5 px-5 md:mx-0 md:px-0 scrollbar-none">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              const count = getCategoryCount(cat);
              return (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`relative shrink-0 px-3 md:px-4 py-2.5 hover:text-[#E9533A] transition-colors duration-300 cursor-pointer select-none flex items-center gap-1.5 ${
                    active ? 'text-[#01564C] font-bold' : 'text-[#000000]/60 font-semibold'
                  }`}
                >
                  <span className="relative z-10">{getCategoryLabel(cat)}</span>
                  <span className="text-[7px] font-mono text-[#BB2C2C] font-semibold">[{count < 10 ? `0${count}` : count}]</span>
                  {active && (
                    <motion.div
                      layoutId="active-filter-bg"
                      className="absolute inset-0 bg-[#01564C]/10 border-b-2 border-[#01564C]"
                      transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Responsive Project Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 md:gap-y-16 lg:gap-y-36 w-full items-start">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, idx) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={idx}
              />
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="relative z-20 border-t border-[#01564C]/20 py-12 px-6 md:px-12 text-[10px] font-mono text-foreground/50 flex flex-col md:flex-row justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <span>©2026 AKASH PHOTO STUDIO</span>
          <span className="text-[9px] tracking-wider text-foreground/50 flex flex-wrap items-center gap-1.5">
            Designed and Crafted by{' '}
            <Magnetic>
              <a 
                href="https://abvicky.in" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group-shimmer relative overflow-hidden text-white bg-[#E9533A] px-2 py-0.5 border border-[#E9533A] font-bold hover:bg-transparent hover:text-[#E9533A] hover:scale-105 active:scale-95 transition-all duration-300 text-[8px] tracking-widest uppercase rounded-sm inline-block shadow-sm"
              >
                Vicky Prasad Mahato
                <span className="badge-shimmer" />
              </a>
            </Magnetic>
          </span>
        </div>
        <div className="flex gap-6 items-start">
          <TransitionLink href="/about" className="hover:text-[#E9533A] transition-colors duration-300">ABOUT</TransitionLink>
          <a href="mailto:hello@akash.photography" className="hover:text-[#E9533A] transition-colors duration-300">EMAIL</a>
          <a href="#" className="hover:text-[#E9533A] transition-colors duration-300">INSTAGRAM</a>
        </div>
      </footer>
    </main>
  );
}
