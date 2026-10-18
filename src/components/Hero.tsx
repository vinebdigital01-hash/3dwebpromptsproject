import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Terminal, Sparkles, Gift, Check } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sound } from '../lib/audioEngine';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroProps {
  onUnlockClick: () => void;
  onTerminalClick: () => void;
  onFreeDownloadClick: () => void;
}

const BG_IMAGE_1 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_125121_afb71ce9-9c64-4c54-90b5-c89c0764c052.png&w=1920&q=85';

const BG_IMAGE_2 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_135737_0da59642-725b-451a-997b-b0283d95a42a.png&w=1280&q=85';

const ROLES = [
  '3D WebGL Architect',
  'High-Ticket Creative',
  'Visionary Studio Owner',
  'Awwwards SOTD Creator',
];

export const Hero: React.FC<HeroProps> = ({ onUnlockClick, onTerminalClick, onFreeDownloadClick }) => {
  const [roleIndex, setRoleIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const revealDivRef = useRef<HTMLDivElement>(null);
  const gridPatternRef = useRef<SVGGElement>(null);

  // Parallax elements refs for GSAP ScrollTrigger
  const bgParallaxRef = useRef<HTMLDivElement>(null);
  const gridWrapperRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadingRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const ctaGroupRef = useRef<HTMLDivElement>(null);
  const socialProofRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);

  const mousePos = useRef({
    currentX: -999,
    currentY: -999,
    targetX: -999,
    targetY: -999,
    gridTargetX: 0,
    gridTargetY: 0,
    gridX: 0,
    gridY: 0,
  });

  // Cycle roles every 2.4s
  useEffect(() => {
    const timer = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROLES.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  // GSAP ScrollTrigger Multi-Plane Parallax for Hero Headline & Background Elements
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

      // 1. Background Imagery Parallax (moves down slower than scroll rate for deep perspective recess)
      if (bgParallaxRef.current) {
        gsap.to(bgParallaxRef.current, {
          yPercent: 22,
          scale: 1.05,
          ease: 'none',
          scrollTrigger: scrollTriggerConfig,
        });
      }

      // 2. Cyber grid background layer (gentle parallax drift and subtle fade)
      if (gridWrapperRef.current) {
        gsap.to(gridWrapperRef.current, {
          yPercent: 12,
          opacity: 0.06,
          ease: 'none',
          scrollTrigger: scrollTriggerConfig,
        });
      }

      // 3. Telemetry HUD Arc Parallax (floats upward slightly with horizontal shift)
      if (hudRef.current) {
        gsap.to(hudRef.current, {
          y: -75,
          x: 18,
          opacity: 0.25,
          ease: 'none',
          scrollTrigger: scrollTriggerConfig,
        });
      }

      // 4. Hero Headline Elements Multi-plane Differential Parallax
      // Eyebrow badge (gentle upward float + fade)
      if (eyebrowRef.current) {
        gsap.to(eyebrowRef.current, {
          y: -42,
          opacity: 0.35,
          ease: 'none',
          scrollTrigger: scrollTriggerConfig,
        });
      }

      // Main Headline (fastest upward float to establish foreground depth prominence)
      if (headlineRef.current) {
        gsap.to(headlineRef.current, {
          y: -80,
          opacity: 0.3,
          ease: 'none',
          scrollTrigger: scrollTriggerConfig,
        });
      }

      // Cycling Role Subheading (differential float)
      if (subheadingRef.current) {
        gsap.to(subheadingRef.current, {
          y: -60,
          opacity: 0.38,
          ease: 'none',
          scrollTrigger: scrollTriggerConfig,
        });
      }

      // Description text
      if (descriptionRef.current) {
        gsap.to(descriptionRef.current, {
          y: -48,
          opacity: 0.45,
          ease: 'none',
          scrollTrigger: scrollTriggerConfig,
        });
      }

      // High-conversion CTA button group
      if (ctaGroupRef.current) {
        gsap.to(ctaGroupRef.current, {
          y: -34,
          opacity: 0.55,
          ease: 'none',
          scrollTrigger: scrollTriggerConfig,
        });
      }

      // Social Proof member ratings bar
      if (socialProofRef.current) {
        gsap.to(socialProofRef.current, {
          y: -20,
          opacity: 0.65,
          ease: 'none',
          scrollTrigger: scrollTriggerConfig,
        });
      }

      // Scroll Cue (fades out early during the initial scroll descent)
      if (scrollCueRef.current) {
        gsap.to(scrollCueRef.current, {
          y: -24,
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

  // Spotlight mask and grid parallax loop (Hardware-accelerated CSS mask, zero canvas, zero base64)
  useEffect(() => {
    const container = containerRef.current;
    const revealDiv = revealDivRef.current;
    if (!container || !revealDiv) return;

    let animId: number;
    let isVisible = true;
    let lastRenderX = -9999;
    let lastRenderY = -9999;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    let cachedRect: DOMRect = revealDiv.getBoundingClientRect();
    const updateRect = () => {
      if (revealDiv) cachedRect = revealDiv.getBoundingClientRect();
    };
    window.addEventListener('resize', updateRect, { passive: true });

    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX - cachedRect.left;
      const y = e.clientY - cachedRect.top;
      mousePos.current.targetX = x;
      mousePos.current.targetY = y;

      const normX = x / (cachedRect.width || 1) - 0.5;
      const normY = y / (cachedRect.height || 1) - 0.5;
      mousePos.current.gridTargetX = normX * 18;
      mousePos.current.gridTargetY = normY * 18;
    };

    container.addEventListener('mousemove', onMouseMove, { passive: true });

    const loop = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(loop);
        return;
      }

      mousePos.current.currentX += (mousePos.current.targetX - mousePos.current.currentX) * 0.12;
      mousePos.current.currentY += (mousePos.current.targetY - mousePos.current.currentY) * 0.12;

      mousePos.current.gridX += (mousePos.current.gridTargetX - mousePos.current.gridX) * 0.06;
      mousePos.current.gridY += (mousePos.current.gridTargetY - mousePos.current.gridY) * 0.06;

      if (gridPatternRef.current) {
        gridPatternRef.current.setAttribute(
          'transform',
          `translate(${mousePos.current.gridX.toFixed(1)}, ${mousePos.current.gridY.toFixed(1)})`
        );
      }

      // Only update mask if cursor coordinates moved by > 0.5px
      const curX = mousePos.current.currentX;
      const curY = mousePos.current.currentY;
      if (Math.abs(curX - lastRenderX) > 0.5 || Math.abs(curY - lastRenderY) > 0.5) {
        lastRenderX = curX;
        lastRenderY = curY;

        if (curX > -100 && curY > -100) {
          const mask = `radial-gradient(circle 260px at ${curX.toFixed(1)}px ${curY.toFixed(1)}px, black 35%, rgba(0, 0, 0, 0.5) 60%, transparent 100%)`;
          revealDiv.style.maskImage = mask;
          revealDiv.style.webkitMaskImage = mask;
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener('resize', updateRect);
      container.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <div
      id="hero"
      ref={containerRef}
      className="relative min-h-[100dvh] w-full bg-[#050508] overflow-hidden flex flex-col justify-between pt-20 sm:pt-24 pb-8 sm:pb-10 px-4 sm:px-10 lg:px-16 select-none will-change-transform transform-gpu"
    >
      {/* Layer 1: Parallax Grid Background (z-0) with GSAP ScrollTrigger */}
      <div ref={gridWrapperRef} className="absolute inset-0 pointer-events-none opacity-20 z-0 will-change-transform transform-gpu">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="cyber-grid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <g ref={gridPatternRef}>
                <path
                  d="M 48 0 L 0 0 0 48"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="0.6"
                />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cyber-grid)" />
        </svg>
      </div>

      {/* Layer 2 & 3: Background Imagery Wrapper with GSAP ScrollTrigger Parallax (z-10 to z-30) */}
      <div
        ref={bgParallaxRef}
        className="absolute -top-[15%] -bottom-[15%] -left-[5%] -right-[5%] pointer-events-none will-change-transform transform-gpu overflow-hidden"
      >
        {/* Layer 2: Base Cinematic Image / Spatial Hardware with Ken Burns (z-10) */}
        <div
          className="absolute inset-0 bg-cover bg-center animate-ken-burns z-10 opacity-70"
          style={{ backgroundImage: `url('${BG_IMAGE_1}')` }}
        />

        {/* Dark Gradient Overlay for Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/30 z-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-black/60 z-20 pointer-events-none" />


        {/* Layer 3: Cursor Spotlight Reveal Layer (z-30) */}
        <div
          ref={revealDivRef}
          className="absolute inset-0 bg-cover bg-center pointer-events-none z-30 transition-opacity duration-300 opacity-90"
          style={{ backgroundImage: `url('${BG_IMAGE_2}')` }}
        />
      </div>

      {/* Layer 4: Concentric Arc Telemetry Stats HUD (Monochrome Silver/White) with GSAP ScrollTrigger Parallax */}
      <div
        ref={hudRef}
        className="absolute inset-y-0 right-0 pointer-events-none z-40 hidden xl:block w-auto h-full max-w-[420px] will-change-transform transform-gpu opacity-75"
      >
        <svg
          viewBox="0 0 380 700"
          preserveAspectRatio="xMaxYMid meet"
          className="h-full w-auto"
        >
          <defs>
            <linearGradient id="arcGradBlue" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
              <stop offset="25%" stopColor="#60a5fa" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#818cf8" stopOpacity="0.6" />
              <stop offset="85%" stopColor="#60a5fa" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="arcGradAmber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
              <stop offset="35%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="75%" stopColor="#f59e0b" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Arc 1: r=330 */}
          <path
            d="M 20 180 A 330 330 0 0 1 350 490"
            fill="none"
            stroke="url(#arcGradBlue)"
            strokeWidth="1.4"
          />
          <circle cx="280" cy="330" r="3.4" fill="#60a5fa" />
          <circle cx="280" cy="330" r="7" fill="none" stroke="#60a5fa" strokeOpacity="0.4" strokeWidth="1" />
          <text x="298" y="334" fill="#60a5fa" fontSize="28" fontFamily="'JetBrains Mono', monospace" fontWeight="700">
            2,400+
          </text>
          <text x="300" y="350" fill="rgba(147,197,253,0.9)" fontSize="8.5" fontFamily="'JetBrains Mono', monospace" fontWeight="600" letterSpacing="2">
            SHIPPED IN 3D
          </text>

          {/* Arc 2: r=395 */}
          <path
            d="M 0 100 A 395 395 0 0 1 365 590"
            fill="none"
            stroke="url(#arcGradAmber)"
            strokeWidth="1.2"
            strokeDasharray="4 6"
          />
          <circle cx="340" cy="220" r="3.4" fill="#fbbf24" />
          <circle cx="340" cy="220" r="7" fill="none" stroke="#fbbf24" strokeOpacity="0.4" strokeWidth="1" />
          <text x="230" y="196" fill="#fbbf24" fontSize="28" fontFamily="'JetBrains Mono', monospace" fontWeight="700">
            500+
          </text>
          <text x="232" y="212" fill="rgba(253,230,138,0.9)" fontSize="8.5" fontFamily="'JetBrains Mono', monospace" fontWeight="600" letterSpacing="2">
            MASTER PROMPTS
          </text>

          {/* Arc 3: r=460 */}
          <path
            d="M 0 40 A 460 460 0 0 1 380 660"
            fill="none"
            stroke="rgba(52,211,153,0.3)"
            strokeWidth="1.0"
          />
          <circle cx="340" cy="480" r="3.4" fill="#34d399" />
          <text x="260" y="504" fill="#34d399" fontSize="28" fontFamily="'JetBrains Mono', monospace" fontWeight="700">
            98.4%
          </text>
          <text x="262" y="520" fill="rgba(110,231,183,0.9)" fontSize="8.5" fontFamily="'JetBrains Mono', monospace" fontWeight="600" letterSpacing="2">
            CLIENT RETENTION
          </text>
        </svg>
      </div>

      {/* Layer 5: Hero Text & Conversion Block (z-50) */}
      <div className="relative z-50 max-w-2xl xl:max-w-3xl my-auto">
        {/* Eyebrow */}
        <div
          ref={eyebrowRef}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md text-[11px] font-mono tracking-widest text-blue-300 mb-6 will-change-transform transform-gpu"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Gateway to the *Augmented $10,000 Web* • 500+ Master Prompts</span>
        </div>

        {/* Headline */}
        <h1
          ref={headlineRef}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.06] mb-4 sm:mb-5 will-change-transform transform-gpu"
        >
          Build <span className="font-display italic font-normal text-white accent-text-gradient">$10,000</span> 3D Websites
          <br className="hidden sm:inline" /> With A Single Prompt.
        </h1>

        {/* Cycling Role Subheading */}
        <div
          ref={subheadingRef}
          className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-base text-white/70 font-mono mb-6 will-change-transform transform-gpu"
        >
          <span className="text-white/40">Become</span>
          <span
            key={roleIndex}
            className="text-blue-300 font-semibold font-display italic text-base sm:text-xl border-b border-blue-400/60 pb-0.5 animate-role-fade-in"
          >
            {ROLES[roleIndex]}
          </span>
          <span className="text-white/40">charging $15k per site</span>
        </div>

        {/* Description */}
        <p
          ref={descriptionRef}
          className="text-sm sm:text-base text-white/80 max-w-xl leading-relaxed mb-8 font-sans will-change-transform transform-gpu"
        >
          Stop spending 6 months learning WebGL, Three.js, and GLSL shaders. Copy our vault of 500+ battle-tested one-shot prompts to deploy jaw-dropping 3D interactive experiences in minutes.
        </p>

        {/* Dual High-Conversion CTAs: Free Starter PDF + Vault Pass */}
        <div
          ref={ctaGroupRef}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 mb-3 will-change-transform transform-gpu"
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
            className="group relative inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-bold text-white bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 active:scale-95 shadow-[0_0_24px_rgba(59,130,246,0.5)] ring-1 ring-blue-400/50 overflow-hidden cursor-pointer"
          >
            <Gift className="w-4 h-4 text-emerald-300 animate-pulse" />
            <span>Download Free 30+ Prompts PDF</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Secondary Ghost Button: Paid Vault Unlock */}
          <button
            onClick={() => {
              sound.playSuccess();
              onUnlockClick();
            }}
            onMouseEnter={() => sound.playHover()}
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-semibold text-white/90 bg-black/60 hover:bg-blue-600/10 border border-white/20 hover:border-blue-400/40 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Unlock All 500+ Vault (From ₹49)</span>
          </button>
        </div>

        {/* Micro-Trust Proof Underneath Buttons (Instant reassurance for cold ad traffic) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] font-mono text-zinc-400 mb-7">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <Check className="w-3.5 h-3.5 text-emerald-400" /> 100% Free Instant Download
          </span>
          <span>•</span>
          <span>Direct PDF + Portal Access</span>
          <span>•</span>
          <span className="text-zinc-500">Zero Credit Card Required</span>
        </div>

        {/* Social Proof Bar */}
        <div
          ref={socialProofRef}
          className="flex items-center gap-3 text-xs text-white/60 font-mono will-change-transform transform-gpu"
        >
          <div className="flex -space-x-2">
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
                className="w-7 h-7 rounded-full border border-black object-cover"
              />
            ))}
          </div>
          <span>4.9/5 Rating from 850+ Studio Owners</span>
        </div>
      </div>

      {/* Bottom Scroll Cue */}
      <div
        ref={scrollCueRef}
        className="relative z-50 flex flex-col items-center justify-center pt-4 will-change-transform transform-gpu"
      >
        <a
          href="#theater"
          onClick={(e) => {
            e.preventDefault();
            sound.playClick();
            document.querySelector('#theater')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="group flex flex-col items-center gap-2 text-white/40 hover:text-white transition-colors"
        >
          <span className="text-[10px] uppercase font-mono tracking-[0.2em]">Scroll to Explore</span>
          <div className="w-4 h-7 rounded-full border border-white/20 flex items-start justify-center p-0.5">
            <div className="w-1 h-2 rounded-full bg-white animate-scroll-down" />
          </div>
        </a>
      </div>
    </div>
  );
};
