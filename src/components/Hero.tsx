import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { HeroDeviceStage, HERO_SHOWCASE_VIDEOS, ShowcaseVideo } from './mockups/HeroDeviceStage';
import { sound } from '../lib/audioEngine';

interface HeroProps {
  onUnlockClick: () => void;
  onTerminalClick?: () => void;
  onFreeDownloadClick: () => void;
}

const DESKTOP_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
];

const MOBILE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
];

export const Hero: React.FC<HeroProps> = ({
  onUnlockClick,
  onFreeDownloadClick,
}) => {
  const [mounted, setMounted] = useState(false);

  // Pick a random prompt showcase video on reload or first visit for mobile MacBook
  const [randomMobileVideo] = useState<ShowcaseVideo>(() => {
    const randomIndex = Math.floor(Math.random() * HERO_SHOWCASE_VIDEOS.length);
    return HERO_SHOWCASE_VIDEOS[randomIndex];
  });
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const mobileLidRef = useRef<HTMLDivElement>(null);
  const mobileHeroTrackRef = useRef<HTMLDivElement>(null);
  const mobileHeroFrameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure muted autoplay works seamlessly on iOS Safari & Android
  useEffect(() => {
    if (mobileVideoRef.current) {
      mobileVideoRef.current.defaultMuted = true;
      mobileVideoRef.current.muted = true;
      mobileVideoRef.current.play().catch(() => {});
    }
  }, [randomMobileVideo]);

  // Scroll-pinned close-to-open interaction ONLY on mobile devices (< 768px)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth >= 768) return;

    let rafId: number | null = null;
    const PIN_DISTANCE = 280;

    const updateLidAndPin = () => {
      if (window.innerWidth >= 768) return;

      const track = mobileHeroTrackRef.current;
      const frame = mobileHeroFrameRef.current;
      const lid = mobileLidRef.current;

      let scrolled = 0;
      if (track) {
        const rect = track.getBoundingClientRect();
        scrolled = -rect.top;
      } else {
        scrolled = window.scrollY || document.documentElement.scrollTop || 0;
      }

      // 1. PINNING: stays fixed at top: 0 while scrolling 0 -> PIN_DISTANCE, then absolute to scroll down
      if (frame) {
        if (scrolled < PIN_DISTANCE) {
          frame.style.position = 'fixed';
          frame.style.top = '0px';
          frame.style.left = '0px';
          frame.style.right = '0px';
          frame.style.width = '100%';
        } else {
          frame.style.position = 'absolute';
          frame.style.top = `${PIN_DISTANCE}px`;
          frame.style.left = '0px';
          frame.style.right = '0px';
          frame.style.width = '100%';
        }
      }

      // 2. 3D LID ANGLE: smoothly opens from 38deg to 0deg (flat open)
      if (lid) {
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          lid.style.transform = 'perspective(1000px) rotateX(0deg)';
          return;
        }

        const progress = Math.min(1, Math.max(0, scrolled / PIN_DISTANCE));
        const angle = 38 * (1 - progress);
        lid.style.transform = `perspective(1000px) rotateX(${angle.toFixed(1)}deg)`;
      }
    };

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateLidAndPin);
    };

    updateLidAndPin();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <section id="hero" className="w-full relative select-none">
      {/* =========================================================================
          1. MOBILE HERO (max-width: 767px)
          Order: menu bar → badge → headline → MACBOOK → sub-line → FREE card → PAID card → small line → trust line
          Pinned in place during scroll 0 -> 280px until MacBook is fully open (0deg), then scrolls down
          ========================================================================= */}
      <div
        ref={mobileHeroTrackRef}
        className="md:hidden relative w-full"
        style={{ height: 'calc(100svh + 280px)' }}
      >
        <div
          ref={mobileHeroFrameRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '100svh',
            maxHeight: '100dvh',
            overflow: 'hidden',
          }}
          className="w-full bg-[#0B0D12] overflow-hidden flex flex-col justify-start px-4 pt-[calc(56px+env(safe-area-inset-top,0px)+8px)] pb-2 z-20 pointer-events-auto touch-pan-y"
        >
          {/* Faint ambient light at the top: radial-gradient(60% 40% at 50% 0%, rgba(59,130,246,0.10), transparent) */}
          <div
            className="absolute top-0 inset-x-0 h-[360px] pointer-events-none -z-10"
            style={{
              background: 'radial-gradient(60% 40% at 50% 0%, rgba(59,130,246,0.10), transparent)',
            }}
          />

          {/* Static Grain Texture at 3% opacity */}
          <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none -z-10" />

          {/* ──────── 1. BADGE ──────── */}
          <div
            style={{ transitionDuration: '300ms' }}
            className={`h-[26px] px-2.5 rounded-full border border-white/10 bg-white/[0.03] inline-flex items-center gap-1.5 self-center shrink-0 transition-all will-change-[transform,opacity] ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shrink-0" />
            <span className="text-[11px] font-medium text-white/90 whitespace-nowrap">
              30+ prompts free · no card needed
            </span>
          </div>

          {/* ──────── 2. HEADLINE ──────── */}
          <h1
            style={{ transitionDelay: '50ms', transitionDuration: '300ms' }}
            className={`mt-1.5 text-center font-heading font-semibold text-[clamp(24px,7.5vw,32px)] leading-[1.04] tracking-[-0.035em] text-[#F5F5F7] shrink-0 transition-all will-change-[transform,opacity] ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            Build <span className="text-[#3B82F6] font-semibold">$10,000</span>
            <br />
            3D websites with
            <br />
            one prompt.
          </h1>

          {/* ──────── 3. MACBOOK MOCKUP (Directly under headline) ────────
              - Shows random prompt video on reload / first load
              - Scroll-synced close-to-open (38deg -> 0deg) on mobile devices only
              - Pinned in place during opening scroll track */}
          <div
            style={{ transitionDelay: '100ms', transitionDuration: '300ms' }}
            className={`w-full my-1.5 sm:my-2 max-w-[270px] xs:max-w-[290px] sm:max-w-[320px] mx-auto select-none pointer-events-none shrink-0 transition-all will-change-[transform,opacity] ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <div className="w-full flex flex-col items-center">
              {/* Display Assembly with 3D scroll sync (close-to-open) */}
              <div
                ref={mobileLidRef}
                style={{
                  transformOrigin: 'bottom center',
                  transform: 'perspective(1000px) rotateX(38deg)',
                  transition: 'transform 0.08s ease-out',
                }}
                className="relative w-full aspect-[16/10] rounded-t-[14px] p-[2px] bg-gradient-to-b from-[#4a4d53] via-[#26282c] to-[#141518] shadow-[0_24px_48px_-16px_rgba(0,0,0,0.8)] will-change-transform"
              >
                {/* Top Metallic Highlight */}
                <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" />

                {/* Display Bezel */}
                <div className="absolute inset-[2px] rounded-t-[12px] bg-[#0c0d0f] p-[4px] sm:p-[5px] flex flex-col justify-start overflow-hidden border border-black/80">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-[14%] min-w-[38px] max-w-[56px] h-[7px] bg-[#0c0d0f] rounded-b-[4px] flex items-center justify-center gap-1 shadow-md border-b border-x border-black">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#050507] ring-1 ring-white/10" />
                    <div className="w-1 h-1 rounded-full bg-emerald-400/80 animate-pulse" />
                  </div>

                  {/* Inner Screen: Random Prompt Video on Reload / First Load */}
                  <div className="relative w-full h-full rounded-t-[9px] overflow-hidden bg-black flex items-center justify-center">
                    <video
                      ref={mobileVideoRef}
                      key={randomMobileVideo.id}
                      src={randomMobileVideo.videoUrl}
                      poster={randomMobileVideo.posterUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover object-top"
                    />

                    {/* Top dark gradient */}
                    <div className="absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />

                    {/* 60 FPS WebGL live badge */}
                    <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[8px] font-mono text-white/90 flex items-center gap-1 pointer-events-none z-10 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>60 FPS WEBGL</span>
                    </div>

                    {/* Active prompt title badge */}
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[8px] font-mono text-white/70 pointer-events-none z-10">
                      {randomMobileVideo.name}
                    </div>

                    {/* Bottom fade into #0B0D12 */}
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0B0D12]/90 via-[#0B0D12]/40 to-transparent pointer-events-none z-10" />
                  </div>
                </div>
              </div>

              {/* Aluminium Base Deck */}
              <div className="relative w-[104%] -mt-[1px] flex flex-col items-center">
                <div className="w-[16%] h-[2.5px] bg-gradient-to-r from-[#1c1d20] via-[#52565e] to-[#1c1d20] rounded-t-sm" />
                <div className="relative w-full h-[7px] rounded-b-[9px] bg-gradient-to-b from-[#2a2c31] via-[#1a1b1e] to-[#0e0f11] shadow-[0_8px_16px_rgba(0,0,0,0.9)] border-t border-white/15 flex items-start justify-center">
                  <div className="w-8 h-0.5 bg-[#0c0d0f] rounded-b-sm border-b border-white/10" />
                </div>
                <div className="w-full flex justify-between px-[6%] -mt-[1px]">
                  <div className="w-3.5 h-[2px] bg-[#0a0a0c] rounded-b-full shadow-sm" />
                  <div className="w-3.5 h-[2px] bg-[#0a0a0c] rounded-b-full shadow-sm" />
                </div>
                <div className="w-[94%] h-2.5 bg-black/80 blur-lg -mt-1 rounded-full pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ──────── 4. SUB-LINE ──────── */}
          <p
            style={{ transitionDelay: '150ms', transitionDuration: '300ms' }}
            className={`mt-1 text-center text-[12px] xs:text-[13px] font-medium text-[#D1D5DB] leading-snug whitespace-nowrap shrink-0 transition-all will-change-[transform,opacity] ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            Become a <span className="text-[#FFFFFF]">3D WebGL Architect</span> · $15k/site
          </p>

          {/* ──────── 5. FREE / PAID BLOCK (main focus) ──────── */}
          <div
            style={{ transitionDelay: '200ms', transitionDuration: '300ms' }}
            className={`mt-2 w-full max-w-[310px] mx-auto flex flex-col gap-1.5 shrink-0 transition-all will-change-[transform,opacity] ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            {/* CARD A — FREE (on top, the main action, min-height 58px, padding 8px 12px) */}
            <button
              type="button"
              onClick={() => {
                try { sound.playSuccess(); } catch {}
                onFreeDownloadClick();
              }}
              className="w-full min-h-[58px] p-[8px_12px] rounded-[12px] bg-[#2563EB] text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] active:scale-[0.98] transition-transform duration-120 flex flex-col justify-between cursor-pointer"
            >
              {/* Row 1: tag "FREE" + "₹0" */}
              <div className="flex items-center justify-between w-full">
                <span className="px-1.5 py-0.5 rounded-[4px] bg-white/[0.18] text-[9.5px] font-bold text-white tracking-wide uppercase">
                  FREE
                </span>
                <span className="text-[15px] font-bold text-white tracking-tight">
                  ₹0
                </span>
              </div>

              {/* Row 2: "Get 30+ starter prompts" + Arrow */}
              <div className="flex items-center justify-between w-full mt-0.5">
                <span className="text-[14px] xs:text-[15px] font-semibold text-white tracking-tight whitespace-nowrap">
                  Get 30+ starter prompts
                </span>
                <span className="text-[16px] text-white font-medium ml-2 shrink-0">→</span>
              </div>

              {/* Row 3: "Instant download · no card needed" */}
              <div className="text-[11px] text-white/75 whitespace-nowrap">
                Instant download · no card needed
              </div>
            </button>

            {/* CARD B — PAID (below, the upgrade, min-height 58px, padding 8px 12px) */}
            <button
              type="button"
              onClick={() => {
                try { sound.playSuccess(); } catch {}
                onUnlockClick();
              }}
              className="w-full min-h-[58px] p-[8px_12px] rounded-[12px] bg-white/[0.03] border border-white/[0.12] text-left active:scale-[0.98] transition-transform duration-120 flex flex-col justify-between cursor-pointer"
            >
              {/* Row 1: tag "FULL VAULT" + Price "₹49" + strikethrough "₹499" */}
              <div className="flex items-center justify-between w-full">
                <span className="px-1.5 py-0.5 rounded-[4px] bg-white/[0.08] text-[9.5px] font-bold text-[#F5F5F7] tracking-wide uppercase">
                  FULL VAULT
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[15px] font-bold text-white tracking-tight">
                    ₹49
                  </span>
                  <span className="text-[11px] text-[#6B7280] line-through">
                    ₹499
                  </span>
                </div>
              </div>

              {/* Row 2: "Unlock all 500+ prompts" + Arrow */}
              <div className="flex items-center justify-between w-full mt-0.5">
                <span className="text-[14px] xs:text-[15px] font-semibold text-[#F5F5F7] tracking-tight whitespace-nowrap">
                  Unlock all 500+ prompts
                </span>
                <span className="text-[16px] text-[#F5F5F7] font-medium ml-2 shrink-0">→</span>
              </div>

              {/* Row 3: "One-time payment · lifetime updates" */}
              <div className="text-[11px] text-[#8B8F98] whitespace-nowrap">
                One-time payment · lifetime updates
              </div>
            </button>

            {/* Reassurance line under Card B */}
            <div className="mt-0.5 text-center text-[10.5px] text-[#6B7280] whitespace-nowrap">
              Start free. Upgrade only if you love it.
            </div>
          </div>

          {/* ──────── 6. TRUST LINE ──────── */}
          <div
            style={{ transitionDelay: '250ms', transitionDuration: '300ms' }}
            className={`mt-1.5 flex items-center justify-center gap-1.5 text-[11px] text-[#8B8F98] whitespace-nowrap shrink-0 transition-all will-change-[transform,opacity] ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <div className="flex -space-x-1 shrink-0">
              {MOBILE_AVATARS.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="Creator avatar"
                  className="w-[18px] h-[18px] rounded-full border border-[#0B0D12] object-cover"
                />
              ))}
            </div>
            <span>
              Used by <strong className="text-[#F5F5F7] font-medium">2,000+</strong> creators
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. TABLET & DESKTOP HERO (min-width: 768px) - 100% UNTOUCHED
          ========================================================================= */}
      <div className="hidden md:flex min-h-[100dvh] w-full bg-[#050508] overflow-x-hidden flex-col justify-center pt-[96px] lg:pt-[128px] pb-6 select-none relative">
        {/* Subtle Noise Texture */}
        <div className="absolute inset-0 bg-noise pointer-events-none z-0 opacity-30" />

        {/* Soft Ambient Light from Top-Left */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_65%)]" />
        </div>

        {/* Unified 1280px Container (matching floating top bar container exactly) */}
        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-[clamp(20px,4vw,48px)] my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[46%_54%] gap-6 lg:gap-10 xl:gap-12 items-center">
            
            {/* TEXT COLUMN */}
            <div className="flex flex-col justify-center text-left items-start max-w-[560px]">
              {/* Badge: Pill shape, blue glow, uppercase luxury tracking */}
              <div
                style={{ transitionDuration: '400ms' }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 shadow-[0_0_16px_rgba(59,130,246,0.25)] text-blue-300 text-[12px] font-mono tracking-widest uppercase mb-4 transition-all will-change-[transform,opacity] ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>30+ FREE MASTER PROMPTS · $10K WEB</span>
              </div>

              {/* Headline */}
              <h1
                style={{ transitionDelay: '60ms', transitionDuration: '400ms' }}
                className={`font-heading font-semibold text-[44px] md:text-[52px] lg:text-[clamp(44px,4.5vw,70px)] 2xl:text-[76px] leading-[1.04] lg:leading-[1.0] tracking-[-0.035em] text-white mb-3.5 transition-all will-change-[transform,opacity] ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}
              >
                Build{' '}
                <span className="font-serif-accent italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#fbbf24] drop-shadow-[0_0_24px_rgba(56,189,248,0.35)]">
                  $10,000
                </span>
                <br />
                3D websites with
                <br />
                one prompt.
              </h1>

              {/* Sub line */}
              <p
                style={{ transitionDelay: '120ms', transitionDuration: '400ms' }}
                className={`text-[17px] font-body text-white/75 max-w-[460px] leading-snug mb-4 transition-all will-change-[transform,opacity] ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}
              >
                Become a{' '}
                <span className="text-white font-medium relative inline-block after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-gradient-to-r after:from-blue-400 after:via-indigo-400 after:to-amber-400">
                  3D WebGL Architect
                </span>{' '}
                charging $15k per site
              </p>

              {/* Body Description */}
              <p
                style={{ transitionDelay: '160ms', transitionDuration: '400ms' }}
                className={`text-[16px] font-body text-white/65 max-w-[480px] leading-[1.6] mb-6 transition-all will-change-[transform,opacity] ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}
              >
                Stop spending 6 months learning WebGL, Three.js, and GLSL shaders. Copy our vault of 500+ battle-tested one-shot prompts to deploy jaw-dropping 3D interactive experiences in minutes.
              </p>

              {/* Action Row */}
              <div
                style={{ transitionDelay: '200ms', transitionDuration: '400ms' }}
                className={`w-full flex items-center justify-start gap-3.5 mb-4 transition-all will-change-[transform,opacity] ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    try { sound.playSuccess(); } catch {}
                    onFreeDownloadClick();
                  }}
                  onMouseEnter={() => {
                    try { sound.playHover(); } catch {}
                  }}
                  className="h-[52px] min-h-[44px] px-7 rounded-full text-[15px] font-body font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_4px_24px_rgba(37,99,235,0.45)] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
                >
                  <span>Get 30+ Free Prompts</span>
                  <ArrowRight className="w-4 h-4 text-white/80" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    try { sound.playSuccess(); } catch {}
                    onUnlockClick();
                  }}
                  onMouseEnter={() => {
                    try { sound.playHover(); } catch {}
                  }}
                  className="h-[52px] min-h-[44px] px-6 rounded-full text-[15px] font-body font-medium text-white/90 bg-white/[0.04] hover:bg-white/[0.08] border border-white/20 hover:border-white/30 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Unlock Vault · ₹49</span>
                </button>
              </div>

              {/* Social Proof */}
              <div
                style={{ transitionDelay: '260ms', transitionDuration: '400ms' }}
                className={`flex items-center justify-start gap-4 text-[13px] font-body text-zinc-300 transition-all will-change-[transform,opacity] ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}
              >
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-amber-400 text-[14px] leading-none">★★★★★</span>
                  <span>Loved by 2,000+ creators</span>
                </div>
                <span className="text-white/20">•</span>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <div className="flex -space-x-1.5 shrink-0">
                    {DESKTOP_AVATARS.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt="Builder"
                        className="w-5 h-5 rounded-full border border-[#050508] object-cover ring-1 ring-white/10"
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    <span>
                      <strong className="text-white font-semibold">98 builders</strong> active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* VISUAL COLUMN (MacBook + iPhone Stage on Tablet/Desktop) */}
            <div
              style={{ transitionDelay: '300ms', transitionDuration: '400ms' }}
              className={`w-full transition-all will-change-[transform,opacity] ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              <HeroDeviceStage />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
