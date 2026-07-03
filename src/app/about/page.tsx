'use client';

import React from 'react';
import { motion } from 'framer-motion';
import TransitionLink from '@/components/TransitionLink';
import Magnetic from '@/components/Magnetic';

export default function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  } as const;

  return (
    <main className="bg-canvas text-foreground min-h-screen pt-24 md:pt-36 pb-16 md:pb-24 px-5 md:px-12 max-w-6xl mx-auto overflow-x-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-24"
      >
        {/* Left Column: Heading and Contact Links */}
        <div className="col-span-1 md:col-span-5 flex flex-col justify-between">
          <motion.div variants={itemVariants} className="space-y-4 md:space-y-6">
            <span className="font-mono text-[9px] tracking-[0.3em] text-accent uppercase block">
              BIOGRAPHY & PHILOSOPHY
            </span>
            <h1 className="font-serif text-[clamp(2.5rem,8vw,4rem)] md:text-6xl font-bold leading-[1.1] tracking-wide">
              The Art <br />
              of the <br />
              <span className="font-light italic text-accent">Unseen Frame</span>
            </h1>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-10 md:mt-32 space-y-8">
            <div className="space-y-2">
              <span className="font-mono text-[8px] tracking-[0.25em] text-foreground/40 uppercase block">
                Direct Contact
              </span>
              <Magnetic>
                <a
                  href="mailto:hello@akash.photography"
                  className="font-serif text-lg text-foreground hover:text-accent transition-colors duration-300 block"
                >
                  hello@akash.photography
                </a>
              </Magnetic>
              <span className="font-mono text-[9px] text-foreground-muted block">
                +1 (213) 555-0198 &bull; Los Angeles, CA
              </span>
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[8px] tracking-[0.25em] text-foreground/40 uppercase block">
                Social Networks
              </span>
              <div className="flex gap-6 font-mono text-[9px] tracking-widest text-foreground-muted uppercase">
                <Magnetic>
                  <a href="#" className="hover:text-accent transition-colors duration-300">
                    Instagram
                  </a>
                </Magnetic>
                <Magnetic>
                  <a href="#" className="hover:text-accent transition-colors duration-300">
                    Vimeo
                  </a>
                </Magnetic>
                <Magnetic>
                  <a href="#" className="hover:text-accent transition-colors duration-300">
                    Readcv
                  </a>
                </Magnetic>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Bio Narrative and Clients */}
        <div className="col-span-1 md:col-span-7 space-y-12">
          <motion.div 
            variants={itemVariants} 
            className="font-serif text-lg sm:text-xl font-light leading-relaxed text-foreground/80 space-y-6"
          >
            <p>
              I make frames that feel like film stills from a movie that was never made. Based in Los Angeles and working globally, my practice focuses on editorial campaigns, cinematic production stills, and long-form personal photography projects.
            </p>
            <p>
              Drawing inspiration from neo-noir cinema, brutalist architecture, and the emotional resonance of empty spaces, my work explores the quiet boundaries between light and shadow. I believe that minimal composition carries the maximum narrative weight.
            </p>
            <p>
              Rather than chasing perfect digital rendering, my craft is rooted in film heritage — embracing analog textures, natural lens abberation, and atmospheric color grades that reflect a dark, moody visual signature.
            </p>
          </motion.div>

          {/* Selected Representation & Press */}
          <motion.div variants={itemVariants} className="border-t border-[#01564C] pt-8 space-y-6">
            <span className="font-mono text-[8px] tracking-[0.25em] text-foreground/40 uppercase block">
              COLLABORATORS / PRESS
            </span>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 font-serif text-sm tracking-wide text-foreground/60">
              <div>A24 Films</div>
              <div>RSA Films</div>
              <div>Leica Camera USA</div>
              <div>Anonymous Content</div>
              <div>Kinfolk Magazine</div>
              <div>Cereal Magazine</div>
              <div>Sundance Institute</div>
              <div>Director&apos;s Guild of America</div>
            </div>
          </motion.div>

          {/* Features / Capabilities */}
          <motion.div variants={itemVariants} className="border-t border-[#01564C] pt-8 space-y-6">
            <span className="font-mono text-[8px] tracking-[0.25em] text-foreground/40 uppercase block">
              CAPABILITIES & SERVICES
            </span>
            <ul className="font-mono text-[10px] tracking-widest text-foreground-muted uppercase space-y-2 list-none">
              <li>&mdash; Cinematic Unit Still Photography</li>
              <li>&mdash; Editorial & Fashion Campaign Direction</li>
              <li>&mdash; Specialized Analog Film Emulation Design</li>
              <li>&mdash; Location Scouting & Scenic Photography</li>
            </ul>
          </motion.div>

          {/* Back to Work CTA */}
          <motion.div variants={itemVariants} className="pt-8">
            <TransitionLink 
              href="/#archive-grid" 
              className="inline-block border border-[#01564C] hover:border-[#E9533A] hover:bg-[#E9533A]/10 px-6 py-3 font-mono text-[10px] tracking-[0.2em] uppercase transition-all duration-300"
              data-cursor="pointer"
            >
              [ VIEW ARCHIVE OF WORK ]
            </TransitionLink>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
