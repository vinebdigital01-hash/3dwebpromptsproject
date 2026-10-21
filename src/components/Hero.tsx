import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Sparkles, Gift, Check } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sound } from '../lib/audioEngine';
import { HeroDeviceStage } from './mockups/HeroDeviceStage';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroProps {
  onUnlockClick: () => void;
  onTerminalClick: () => void;
  onFreeDownloadClick: () => void;
}

const ROLES = [
  '3D WebGL Architect',
  'High-Ticket Creative',
  'Visionary Studio Owner',
  'Awwwards SOTD Creator',
];

export const Hero: React.FC<HeroProps> = ({ onUnlockClick, onTerminalClick, onFreeDownloadClick }) => {
  const [roleIndex, setRoleIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridPatternRef = useRef<SVGGElement>(null);

  // Parallax elements refs for GSAP ScrollTrigger
  const gridWrapperRef = useRef<HTMLDivElement>(null);
  const deviceStageRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadingRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const ctaGroupRef = useRef<HTMLDivElement>(null);
  const socialProofRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);

  // Cycle roles every 2.4s
  useEffect(() => {
    const timer = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROLES.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  // GSAP ScrollTrigger Parallax
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const scrollTriggerConfig = {
        trigger: container,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
        invalidateOnRefresh: true,
      };

      // Cyber grid background layer
      if (gridWrapperRef.current) {
        gsap.to(gridWrapperRef.current, {
          yPercent: 12,
          opacity: 0.05,
          ease: 'none',
          scrollTrigger: scrollTriggerConfig,
        });
      }

      // Device Showcase Stage Parallax
      if (deviceStageRef.current) {
        gsap.to(deviceStageRef.current, {
          y: -40,
          opacity: 0.8,
          ease: 'none',
          scrollTrigger: scrollTriggerConfig,
        });
      }

      // Headline Elements Parallax
      if (eyebrowRef.current) {
        gsap.to(eyebrowRef.current, {
          y: -30,
          opacity: 0.4,
          ease: 'none',
          scrollTrigger: scrollTriggerConfig,
        });
      }

      if (headlineRef.current) {
        gsap.to(headlineRef.current, {
          y: -55,
          opacity: 0.3,
          ease: 'none',
          scrollTrigger: scrollTriggerConfig,
        });
      }

      if (subheadingRef.current) {
        gsap.to(subheadingRef.current, {
          y: -42,
          opacity: 0.4,
          ease: 'none',
          scrollTrigger: scrollTriggerConfig,
        });
      }

      if (descriptionRef.current) {
        gsap.to(descriptionRef.current, {
          y: -35,
          opacity: 0.5,
          ease: 'none',
          scrollTrigger: scrollTriggerConfig,
        });
      }

      if (ctaGroupRef.current) {
        gsap.to(ctaGroupRef.current, {
          y: -25,
          opacity: 0.6,
          ease: 'none',
          scrollTrigger: scrollTriggerConfig,
        });
      }

      if (socialProofRef.current) {
        gsap.to(socialProofRef.current, {
          y: -15,
          opacity: 0.7,
          ease: 'none',
          scrollTrigger: scrollTriggerConfig,
        });
      }

      // Scroll Cue (fades out early)
      if (scrollCueRef.current) {
        gsap.to(scrollCueRef.current, {
          y: -20,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: '25% top',
            scrub: 0.6,
          },
        });
      }
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div
      id="hero"
      ref={containerRef}
      className="relative min-h-[100dvh] w-full bg-[#050508] overflow-hidden flex flex-col justify-between pt-20 sm:pt-24 pb-6 sm:pb-8 px-4 sm:px-8 lg:px-12 select-none will-change-transform transform-gpu"
    >
      {/* 1. CLEAN APPLE KEYNOTE STUDIO OVERHEAD LIGHTING (No old blurry stock photos!) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Soft Overhead Key Studio Light */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-5%,rgba(59,130,246,0.14),rgba(15,23,42,0.4)_50%,transparent_75%)]" />
        {/* Soft Secondary Floor Light */}
        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-[radial-gradient(ellipse_75%_40%_at_50%_100%,rgba(99,102,241,0.08),transparent_70%)]" />
        {/* Subtle Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050508]" />
      </div>

      {/* 2. REFINED SUBTLE CYBER GRID (z-0) */}
      <div ref={gridWrapperRef} className="absolute inset-0 pointer-events-none opacity-15 z-0 will-change-transform transform-gpu">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="clean-cyber-grid"
              width="54"
              height="54"
              patternUnits="userSpaceOnUse"
            >
              <g ref={gridPatternRef}>
                <path
                  d="M 54 0 L 0 0 0 54"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="0.5"
                />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#clean-cyber-grid)" />
        </svg>
      </div>

      {/* 3. TWO-COLUMN RESPONSIVE LAYOUT (z-20) */}
      <div className="relative z-20 w-full max-w-7xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center pt-2 sm:pt-4 pb-4">
        {/* LEFT COLUMN: High-Converting Copy & Direct CTAs */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center text-left">
          {/* Eyebrow */}
          <div
            ref={eyebrowRef}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md text-[11px] font-mono tracking-widest text-blue-300 mb-4 sm:mb-5 will-change-transform transform-gpu self-start"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Gateway to the *Augmented $10,000 Web* • 500+ Master Prompts</span>
          </div>

          {/* Headline */}
          <h1
            ref={headlineRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-[1.08] mb-3 sm:mb-4 will-change-transform transform-gpu"
          >
            Build <span className="font-display italic font-normal text-white accent-text-gradient">$10,000</span> 3D Websites
            <br className="hidden sm:inline" /> With A Single Prompt.
          </h1>

          {/* Cycling Role Subheading */}
          <div
            ref={subheadingRef}
            className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-white/70 font-mono mb-4 sm:mb-5 will-change-transform transform-gpu"
          >
            <span className="text-white/40">Become</span>
            <span
              key={roleIndex}
              className="text-blue-300 font-semibold font-display italic text-sm sm:text-lg border-b border-blue-400/60 pb-0.5 animate-role-fade-in"
            >
              {ROLES[roleIndex]}
            </span>
            <span className="text-white/40">charging $15k per site</span>
          </div>

          {/* Description */}
          <p
            ref={descriptionRef}
            className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed mb-6 font-sans will-change-transform transform-gpu"
          >
            Stop spending 6 months learning WebGL, Three.js, and GLSL shaders. Copy our vault of 500+ battle-tested one-shot prompts to deploy jaw-dropping 3D interactive experiences in minutes.
          </p>

          {/* Dual High-Conversion CTAs: Free Starter PDF + Vault Pass */}
          <div
            ref={ctaGroupRef}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5 mb-3 will-change-transform transform-gpu"
          >
            {/* Primary CTA: Free 30+ Prompts PDF Lead Magnet */}
            <button
              onClick={() => {
                try {
                  sound.playSuccess();
                } catch {}
                if (typeof onFreeDownloadClick === 'function') {
                  onFreeDownloadClick();
                }
              }}
              onMouseEnter={() => {
                try {
                  sound.playHover();
                } catch {}
              }}
              className="group relative inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 active:scale-95 shadow-[0_0_24px_rgba(59,130,246,0.5)] ring-1 ring-blue-400/50 overflow-hidden cursor-pointer"
            >
              <Gift className="w-4 h-4 text-emerald-300 animate-pulse" />
              <span>Download Free 30+ Prompts PDF</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Secondary Ghost Button: Paid Vault Unlock */}
            <button
              onClick={() => {
                sound.playSuccess();
                onUnlockClick();
              }}
              onMouseEnter={() => sound.playHover()}
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-semibold text-white/90 bg-black/60 hover:bg-blue-600/10 border border-white/20 hover:border-blue-400/40 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Unlock Vault (From ₹49)</span>
            </button>
          </div>

          {/* Micro-Trust Proof Underneath Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px] font-mono text-zinc-400 mb-5 sm:mb-6">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Check className="w-3 h-3 text-emerald-400" /> 100% Free Instant Download
            </span>
            <span>•</span>
            <span>Direct PDF + Portal</span>
            <span>•</span>
            <span className="text-zinc-500">Zero Card Required</span>
          </div>

          {/* Social Proof Bar */}
          <div
            ref={socialProofRef}
            className="flex items-center gap-2.5 text-[11px] sm:text-xs text-white/60 font-mono will-change-transform transform-gpu"
          >
            <div className="flex -space-x-1.5">
              {[
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
              ].map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt="Member"
                  className="w-6 h-6 rounded-full border border-black object-cover"
                />
              ))}
            </div>
            <span>4.9/5 Rating from 850+ Studio Owners</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Apple Keynote Dual Device Stage */}
        <div
          ref={deviceStageRef}
          className="lg:col-span-6 xl:col-span-6 flex flex-col items-center justify-center will-change-transform transform-gpu w-full mt-4 lg:mt-0"
        >
          <HeroDeviceStage />
        </div>
      </div>

      {/* Bottom Scroll Cue */}
      <div
        ref={scrollCueRef}
        className="relative z-20 flex flex-col items-center justify-center pt-2 will-change-transform transform-gpu"
      >
        <a
          href="#theater"
          onClick={(e) => {
            e.preventDefault();
            sound.playClick();
            document.querySelector('#theater')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="group flex flex-col items-center gap-1.5 text-white/40 hover:text-white transition-colors"
        >
          <span className="text-[10px] uppercase font-mono tracking-[0.2em]">Scroll to Explore</span>
          <div className="w-4 h-6 rounded-full border border-white/20 flex items-start justify-center p-0.5">
            <div className="w-1 h-1.5 rounded-full bg-white animate-scroll-down" />
          </div>
        </a>
      </div>
    </div>
  );
};
