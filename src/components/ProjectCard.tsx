'use client';

import React, { useRef, useState, useEffect } from 'react';
import TransitionLink from '@/components/TransitionLink';
import Image from 'next/image';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useAudio } from '@/context/AudioContext';

interface ProjectCardProps {
  project: {
    id: string;
    slug: string;
    category: string;
    title: string;
    year: string;
    location: string;
    categoryLabel: string;
    coverPath: string;
  };
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [use3D, setUse3D] = useState(false);
  const { playShutterSound } = useAudio();

  // Motion values for smooth 3D tilt
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  // Spring physics for tilt smoothing
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  useEffect(() => {
    // Disable 3D tilt if user prefers reduced motion or is on touch-only device
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    setUse3D(!prefersReducedMotion && hasFinePointer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!use3D || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Mouse coordinates relative to card center
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;

    // Calculate rotation angle (max 10 degrees)
    const rX = -(mouseY / (height / 2)) * 10;
    const rY = (mouseX / (width / 2)) * 10;

    rotateX.set(rX);
    rotateY.set(rY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  // Determine irregular grid styles based on index for a cinematic editorial flow
  const getGridClasses = (idx: number) => {
    const Layouts = [
      {
        aspect: 'aspect-[4/3]', // Landscape
        width: 'col-span-1 sm:col-span-1 md:col-span-7',
      },
      {
        aspect: 'aspect-[3/4]', // Portrait
        width: 'col-span-1 sm:col-span-1 md:col-span-5 md:ml-[8.33%]',
      },
      {
        aspect: 'aspect-[16/9]', // Wide
        width: 'col-span-1 sm:col-span-2 md:col-span-6 md:mt-16',
      },
      {
        aspect: 'aspect-[4/3]', // Landscape
        width: 'col-span-1 sm:col-span-1 md:col-span-6',
      },
      {
        aspect: 'aspect-[3/4]', // Portrait
        width: 'col-span-1 sm:col-span-1 md:col-span-4 md:ml-[16.66%] md:-mt-12',
      },
      {
        aspect: 'aspect-[16/9]', // Wide
        width: 'col-span-1 sm:col-span-2 md:col-span-7 md:ml-[8.33%]',
      }
    ];

    return Layouts[idx % Layouts.length];
  };

  const layout = getGridClasses(index);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setIsHovered(true);
        playShutterSound();
      }}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full overflow-visible group ${layout.width}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <TransitionLink 
        href={`/project/${project.slug}`} 
        className="block w-full h-full"
        data-cursor="view"
      >
        <motion.div
          style={{
            rotateX: rotateXSpring,
            rotateY: rotateYSpring,
            transformStyle: 'preserve-3d',
            perspective: 1000,
          }}
          className="w-full h-full relative"
        >
          {/* Card frame border */}
          <div className="absolute inset-0 border border-[#01564C]/25 pointer-events-none z-10 transition-colors duration-500 group-hover:border-[#01564C]" />

          {/* Image Container with aspect ratio */}
          <div className={`relative w-full ${layout.aspect} overflow-hidden bg-canvas-light transition-transform duration-700 ease-out group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]`}>
            {/* Top Right Film Count Index Badge (Secondary Red) */}
            <div className="absolute top-3 right-3 z-20 font-mono text-[7px] tracking-[0.2em] text-[#BB2C2C] bg-black px-1.5 py-0.5 border border-[#BB2C2C]">
              IDX_0{index + 1}
            </div>

            {/* Dark tint overlay */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-colors duration-500 z-10" />

            {/* Cinematic Lens Flare Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#01564C]/10 via-transparent to-[#E9533A]/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />

            <Image
              src={project.coverPath}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-1000 ease-[0.16,1,0.3,1] scale-100 group-hover:scale-105 filter grayscale contrast-110 group-hover:grayscale-0"
              priority={index < 2}
              style={{ viewTransitionName: `project-image-${project.slug}` }}
            />

            {/* Rangefinder Focusing Split-Patch Emulation (Awwwards-tier custom interactive focus patch) */}
            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
              <motion.div
                animate={{
                  borderColor: isHovered ? '#01564C' : '#E9533A',
                  scale: isHovered ? 1.05 : 1,
                }}
                transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                className="w-[28%] h-[20%] border-[1.5px] border-dashed relative overflow-hidden bg-black/20 backdrop-blur-[0.5px] transition-colors duration-300"
              >
                {/* Offset duplicate image inside focus patch */}
                <motion.div
                  className="absolute w-full h-full"
                  animate={{
                    x: isHovered ? 0 : 8,
                    y: isHovered ? 0 : 4,
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                  style={{
                    width: '357%',
                    height: '500%',
                    left: '-128.5%',
                    top: '-200%',
                  }}
                >
                  <Image
                    src={project.coverPath}
                    alt="Rangefinder split align texture"
                    fill
                    sizes="15vw"
                    className="object-cover filter contrast-125 opacity-70"
                  />
                </motion.div>

                {/* Focus HUD indicator on patch margin */}
                <div className="absolute bottom-1 right-1 font-mono text-[6px] font-bold tracking-widest text-[#E9533A] uppercase scale-90">
                  {isHovered ? 'LOCK // 0.0mm' : 'ALIGN // +4.5mm'}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Project Details Overlay - Minimalist & Editorial */}
          <div className="relative mt-4 flex items-baseline justify-between w-full text-left">
            <div>
              <h3 className="font-serif text-lg md:text-xl font-medium tracking-wide text-foreground group-hover:text-accent transition-colors duration-300">
                {project.title}
              </h3>
              <p className="font-mono text-[10px] tracking-wider text-foreground-muted mt-1 uppercase">
                {project.location} &mdash; {project.categoryLabel}
              </p>
            </div>
            
            <div className="text-right">
              <span className="font-mono text-[11px] tracking-widest text-foreground-muted group-hover:text-foreground transition-colors duration-300 font-light">
                {project.year}
              </span>
            </div>
          </div>
        </motion.div>
      </TransitionLink>
    </motion.div>
  );
}
