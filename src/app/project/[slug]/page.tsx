'use client';

import React, { use, useRef } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import portfolioData from '@/data/portfolio-manifest.json';
import TransitionLink from '@/components/TransitionLink';
import LightTable from '@/components/LightTable';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  // Find the project data
  const projectIndex = portfolioData.findIndex((p) => p.slug === slug);
  if (projectIndex === -1) {
    notFound();
  }

  const project = portfolioData[projectIndex];

  // Calculate prev/next projects for navigation
  const prevProject = portfolioData[(projectIndex - 1 + portfolioData.length) % portfolioData.length];
  const nextProject = portfolioData[(projectIndex + 1) % portfolioData.length];

  const containerRef = useRef<HTMLDivElement>(null);
  const wipeContainerRef = useRef<HTMLDivElement>(null);
  const wipeImageRef = useRef<HTMLDivElement>(null);
  const parallaxLeftRef = useRef<HTMLDivElement>(null);
  const parallaxRightRef = useRef<HTMLDivElement>(null);
  const horizontalSectionRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);

  const [prefersReduced, setPrefersReduced] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setPrefersReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setIsMobile(window.innerWidth < 768);
  }, []);

  useGSAP(() => {
    // Accessibility + mobile: disable heavy GSAP animations on small screens or reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobileDevice = window.innerWidth < 768;
    if (prefersReducedMotion || isMobileDevice) return;

    // --- MOMENT 1: Pinned vertical split reveal ---
    if (wipeContainerRef.current && wipeImageRef.current) {
      gsap.fromTo(
        wipeImageRef.current,
        { clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)' },
        {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          ease: 'none',
          scrollTrigger: {
            trigger: wipeContainerRef.current,
            start: 'top top',
            end: '+=100%',
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );
    }

    // --- MOMENT 2: Staggered image parallax ---
    if (parallaxLeftRef.current) {
      gsap.fromTo(
        parallaxLeftRef.current,
        { yPercent: 10 },
        {
          yPercent: -10,
          ease: 'none',
          scrollTrigger: {
            trigger: parallaxLeftRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }

    if (parallaxRightRef.current) {
      gsap.fromTo(
        parallaxRightRef.current,
        { yPercent: -15 },
        {
          yPercent: 15,
          ease: 'none',
          scrollTrigger: {
            trigger: parallaxRightRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }

    // --- MOMENT 3: Hero Cover Scale Zoom-out on Scroll ---
    const heroImage = document.querySelector('.hero-image');
    if (heroImage) {
      gsap.to(heroImage, {
        scale: 1.1,
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });
    }

    // --- MOMENT 4: Pinned Horizontal Filmstrip Scroll ---
    if (horizontalSectionRef.current && horizontalTrackRef.current) {
      const track = horizontalTrackRef.current;
      const getScrollAmount = () => {
        const trackWidth = track.scrollWidth;
        const windowWidth = window.innerWidth;
        return -(trackWidth - windowWidth);
      };

      gsap.to(track, {
        x: getScrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: horizontalSectionRef.current,
          start: 'top top',
          end: () => `+=${track.scrollWidth - window.innerWidth}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        }
      });
    }

    // Cleanup ScrollTriggers on unmount
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="bg-canvas text-foreground min-h-screen pb-16 md:pb-32 overflow-x-hidden">
      {/* 1. Full-bleed Hero Cover Image */}
      <section className="hero-section relative h-[100svh] w-full flex flex-col justify-between p-5 md:p-12 overflow-hidden select-none">
        <div className="absolute inset-0 z-0">
          <Image
            src={project.coverPath}
            alt={project.title}
            fill
            priority
            sizes="100vw"
            className="hero-image object-cover filter grayscale contrast-110 opacity-60"
            style={{ viewTransitionName: `project-image-${project.slug}` }}
          />
        </div>

        {/* Ambient Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-canvas/60 via-transparent to-canvas z-10 pointer-events-none" />

        <div className="relative z-20 flex justify-between items-center text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.25em] font-mono text-foreground/50 uppercase mt-14 md:mt-16">
          <TransitionLink href="/" className="hover:text-accent transition-colors duration-300">
            [ BACK TO ARCHIVE ]
          </TransitionLink>
          <span>{project.categoryLabel}</span>
        </div>

        {/* Dynamic Project Details Overlay */}
        <div className="relative z-20 flex flex-col md:flex-row md:items-end justify-between gap-8 mt-auto mb-16">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] text-accent uppercase mb-2">
              {project.location}
            </p>
            <h1 className="text-[clamp(2.5rem,10vw,6rem)] sm:text-7xl md:text-8xl font-serif font-bold tracking-wide leading-[1.0]">
              {project.title}
            </h1>
          </div>

          <div className="flex gap-16 font-mono text-[10px] tracking-wider text-foreground-muted border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-12">
            <div>
              <span className="text-foreground/30 block mb-1">YEAR</span>
              {project.year}
            </div>
            <div>
              <span className="text-foreground/30 block mb-1">CAMERA</span>
              Leica M11 / 35mm Summilux
            </div>
          </div>
        </div>
      </section>

      {/* Sparse Project Introduction Statement */}
      <section className="py-14 md:py-24 px-5 md:px-12 max-w-4xl mx-auto text-center">
        <span className="font-mono text-[9px] tracking-[0.3em] text-accent uppercase block mb-6">
          ARTISTIC STATEMENT
        </span>
        <p className="font-serif text-xl sm:text-2xl md:text-3xl font-light leading-relaxed text-foreground/80 italic">
          &ldquo;This series captures the quiet, haunting space between movements. Where the city breathes, shadows elongate, and light becomes the primary actor on an empty stage.&rdquo;
        </p>
      </section>

      {/* MOMENT 1: Pinned Wipe Split Screen Sequence */}
      {project.imagePaths.length >= 2 && (
        <section 
          ref={wipeContainerRef} 
          className="wipe-container relative h-screen w-full overflow-hidden bg-black flex items-center justify-center"
        >
          {/* Base Background Image */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={project.imagePaths[0]}
              alt="Sequence base"
              fill
              sizes="100vw"
              className="object-cover filter grayscale contrast-115 opacity-55"
            />
          </div>

          {/* Wipe Overlay Image */}
          <div ref={wipeImageRef} className="absolute inset-0 w-full h-full z-10">
            <Image
              src={project.imagePaths[1]}
              alt="Sequence wipe overlay"
              fill
              sizes="100vw"
              className="object-cover filter contrast-110"
            />
          </div>

          <div className="absolute bottom-12 left-6 md:left-12 z-20 max-w-md font-mono text-[9px] tracking-widest text-foreground/60 bg-canvas/80 backdrop-blur-md px-4 py-2 border border-[#01564C]/25">
            [ PINNED SEQUENCE: SLIDE TO INTERTWINE THE NARRATIVES ]
          </div>
        </section>
      )}

      {/* MOMENT 2: Staggered Double Parallax Images */}
      {project.imagePaths.length >= 3 && (
        <section className="py-16 md:py-48 px-5 md:px-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center justify-center overflow-visible">
            {/* Left Parallax Column */}
            <div 
              ref={parallaxLeftRef} 
              className="col-span-1 md:col-span-5 relative aspect-[3/4] w-full overflow-hidden bg-canvas-light border border-[#01564C]/25"
            >
              <Image
                src={project.imagePaths[0]}
                alt="Detail parallax left"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover filter grayscale"
              />
              <div className="absolute bottom-4 left-4 font-mono text-[8px] tracking-widest text-foreground/40">
                FRAME_01A / LEFT_PERSPECTIVE
              </div>
            </div>

            {/* Middle Muted Text spacing filler */}
            <div className="col-span-1 md:col-span-2 text-center py-6">
              <span className="h-[1px] w-12 bg-[#01564C]/50 inline-block mb-4" />
              <p className="font-mono text-[9px] tracking-[0.3em] text-foreground/30 uppercase">
                Dual Contrast
              </p>
            </div>

            {/* Right Parallax Column */}
            <div 
              ref={parallaxRightRef} 
              className="col-span-1 md:col-span-5 relative aspect-[3/4] w-full overflow-hidden bg-canvas-light border border-[#01564C]/25 md:mt-24"
            >
              <Image
                src={project.imagePaths[2] || project.coverPath}
                alt="Detail parallax right"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 font-mono text-[8px] tracking-widest text-foreground/40">
                FRAME_01B / LIGHT_INTERSECT
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MOMENT 3: Pinned Horizontal Filmstrip Scroll Showcase */}
      <section
        ref={(prefersReduced || isMobile) ? null : horizontalSectionRef}
        className="horizontal-scroll-section relative bg-white overflow-hidden min-h-[60vh] md:min-h-screen flex flex-col justify-center py-14 md:py-24 border-t border-b border-[#01564C]/25"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full mb-12 flex flex-col sm:flex-row justify-between sm:items-end relative z-10 select-none gap-4">
          <div>
            <span className="font-mono text-[9px] tracking-[0.3em] text-accent uppercase block mb-2">
              FILMSTRIP ARCHIVE
            </span>
            <h2 className="font-serif text-2xl md:text-4xl font-medium tracking-wide">
              Horizontal Narrative stills
            </h2>
          </div>
          <span className="font-mono text-[9px] tracking-widest text-foreground/30">
            {prefersReduced ? "[ DRAG HORIZONTALLY TO VIEW ]" : "[ SCROLL VERTICALLY TO SLIDE NARRATIVE ]"}
          </span>
        </div>

        {/* Sliding horizontal track — native scroll on mobile */}
        <div
          ref={(prefersReduced || isMobile) ? null : horizontalTrackRef}
          className={
            (prefersReduced || isMobile)
              ? 'flex gap-4 overflow-x-auto px-5 py-4 w-full scrollbar-none select-none'
              : 'flex gap-8 items-center justify-start px-6 md:px-12 w-max select-none'
          }
        >
          {/* Cover card slide */}
          <div className="relative w-[80vw] md:w-[48vw] aspect-[16/10] overflow-hidden bg-black flex-shrink-0 border border-[#01564C]/25 hover:border-[#E9533A] transition-colors duration-300 group">
            <Image
              src={project.coverPath}
              alt="Filmstrip cover still"
              fill
              sizes="(max-width: 768px) 80vw, 40vw"
              className="object-cover filter grayscale group-hover:grayscale-0 transition-all duration-[1s] ease-out scale-100 group-hover:scale-102"
            />
            <div className="absolute bottom-4 left-4 font-mono text-[8px] tracking-widest text-foreground/40 bg-canvas/80 backdrop-blur-md px-2.5 py-1 border border-[#01564C]/25">
              PANEL_00 // STILL_COVER
            </div>
          </div>

          {/* Dynamic detail photo slides - Capped at max 5 highlight images */}
          {project.imagePaths.slice(0, 5).map((path, idx) => (
            <div 
              key={path} 
              className="relative w-[80vw] md:w-[48vw] aspect-[16/10] overflow-hidden bg-black flex-shrink-0 border border-[#01564C]/25 hover:border-[#E9533A] transition-colors duration-300 group"
            >
              <Image
                src={path}
                alt={`Filmstrip frame ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 80vw, 40vw"
                className="object-cover filter grayscale group-hover:grayscale-0 transition-all duration-[1s] ease-out scale-100 group-hover:scale-102"
              />
              <div className="absolute bottom-4 left-4 font-mono text-[8px] tracking-widest text-foreground/40 bg-canvas/80 backdrop-blur-md px-2.5 py-1 border border-[#01564C]/25">
                PANEL_0{idx + 1} // STILL_STORY_0{idx + 1}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Photographer's Interactive Scattered Light Table (renders full gallery lightbox) */}
      <LightTable imagePaths={project.imagePaths} projectTitle={project.title} />

      {/* 3. Prev / Next Navigation Footer */}
      <section className="border-t border-[#01564C]/25 mt-16 md:mt-32 pt-10 md:pt-16 px-5 md:px-12 max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-stretch gap-4 md:gap-6">
        {/* Prev Project link */}
        <TransitionLink 
          href={`/project/${prevProject.slug}`}
          className="flex-1 border border-[#01564C]/25 hover:border-[#01564C] hover:bg-[#01564C]/10 p-8 transition-all duration-500 text-left flex flex-col justify-between group"
          data-cursor="pointer"
        >
          <span className="font-mono text-[9px] tracking-widest text-foreground/30">
            PREVIOUS NARRATIVE
          </span>
          <div className="mt-4">
            <span className="font-serif text-lg font-light text-foreground group-hover:text-accent transition-colors duration-300">
              ← {prevProject.title}
            </span>
          </div>
        </TransitionLink>

        {/* Next Project link - High visual emphasis */}
        <TransitionLink 
          href={`/project/${nextProject.slug}`}
          className="flex-[2] bg-[#01564C]/10 border border-[#01564C] hover:border-[#E9533A] p-8 transition-all duration-500 text-left flex flex-col justify-between relative group overflow-hidden"
          data-cursor="pointer"
        >
          {/* Hover next cover image flash */}
          <div className="absolute inset-0 z-0 bg-black overflow-hidden opacity-0 group-hover:opacity-10 transition-opacity duration-750">
            <Image
              src={nextProject.coverPath}
              alt={nextProject.title}
              fill
              sizes="50vw"
              className="object-cover filter scale-105 group-hover:scale-100 transition-transform duration-[1.5s]"
            />
          </div>

          <span className="font-mono text-[9px] tracking-widest text-accent z-10 uppercase">
            NEXT UP
          </span>
          
          <div className="mt-8 flex justify-between items-baseline z-10">
            <span className="font-serif text-2xl md:text-4xl font-semibold text-foreground group-hover:text-accent transition-colors duration-300">
              {nextProject.title} &rarr;
            </span>
            <span className="font-mono text-[10px] tracking-widest text-foreground-muted">
              {nextProject.year} &bull; {nextProject.location}
            </span>
          </div>
        </TransitionLink>
      </section>
    </div>
  );
}
