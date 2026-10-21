import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { sound } from '../lib/audioEngine';
import { HeroDeviceStage } from './mockups/HeroDeviceStage';

interface HeroProps {
  onUnlockClick: () => void;
  onTerminalClick?: () => void;
  onFreeDownloadClick: () => void;
}

const AVATAR_URLS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80',
];

export const Hero: React.FC<HeroProps> = ({
  onUnlockClick,
  onFreeDownloadClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-[100dvh] w-full bg-[#050508] overflow-hidden flex flex-col justify-center pt-[115px] sm:pt-[125px] lg:pt-[130px] pb-14 sm:pb-18 px-4 sm:px-8 lg:px-12 select-none"
    >
      {/* 1. Subtle Noise Texture Overlay */}
      <div className="absolute inset-0 bg-noise pointer-events-none z-0 opacity-40" />

      {/* 2. Soft Blue Light from Top-Left */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[65vw] h-[65vw] max-w-[900px] max-h-[900px] bg-[radial-gradient(circle_at_20%_15%,rgba(59,130,246,0.16),transparent_65%)]" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#050508] to-transparent" />
      </div>

      {/* 3. Centered 1280px Two-Column Grid: 45% Text / 55% Visual */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12 items-center">
        {/* LEFT COLUMN: 45% Text */}
        <div className="lg:col-span-5 flex flex-col justify-center text-left">
          {/* Top Badge: 24px bottom rhythm */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.25)] text-blue-300 font-typewriter text-[12px] uppercase tracking-[0.14em] font-mono mb-6 self-start transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>500+ MASTER PROMPTS · $10K WEB</span>
          </div>

          {/* Headline: 72px desktop / 44px mobile, 1.0 line height, balanced lines, 24px bottom rhythm */}
          <h1
            style={{ transitionDelay: '60ms' }}
            className={`font-heading font-semibold text-[42px] xs:text-[44px] sm:text-[56px] lg:text-[72px] leading-[1.0] lg:leading-[1.02] tracking-[-0.03em] text-white mb-6 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Build{' '}
            <span className="font-serif-accent italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">
              $10,000
            </span>
            <br />
            3D websites
            <br />
            with one prompt.
          </h1>

          {/* Subline: 18px muted white, white with thin gradient underline, 16px bottom rhythm */}
          <p
            style={{ transitionDelay: '120ms' }}
            className={`text-[16px] sm:text-[18px] font-body text-white/70 mb-4 leading-normal transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Become a{' '}
            <span className="text-white font-medium relative inline-block after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-gradient-to-r after:from-blue-400 after:via-indigo-400 after:to-amber-400">
              3D WebGL Architect
            </span>{' '}
            charging $15k per site
          </p>

          {/* Body Text: max 520px wide, 17px, line height 1.6, 70% white, 40px bottom rhythm */}
          <p
            style={{ transitionDelay: '180ms' }}
            className={`max-w-[520px] text-[15px] sm:text-[17px] font-body text-white/70 leading-[1.6] mb-10 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Stop spending 6 months learning WebGL, Three.js, and GLSL shaders. Copy our vault of 500+ battle-tested one-shot prompts to deploy jaw-dropping 3D interactive experiences in minutes.
          </p>

          {/* Buttons: 56px height, rounded-full, one-line text, side by side, 12px gap, 20px bottom rhythm */}
          <div
            style={{ transitionDelay: '240ms' }}
            className={`w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {/* Main Button: Solid Electric Blue, Soft Glow, Lifts 2px */}
            <button
              type="button"
              onClick={() => {
                try { sound.playSuccess(); } catch {}
                onFreeDownloadClick();
              }}
              onMouseEnter={() => {
                try { sound.playHover(); } catch {}
              }}
              className="h-[56px] px-7 rounded-full text-[15px] font-body font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_8px_25px_rgba(37,99,235,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
            >
              <span>Get 30 free prompts</span>
              <span className="text-white/80">→</span>
            </button>

            {/* Second Button: See-through with 1px border and gold sparkle */}
            <button
              type="button"
              onClick={() => {
                try { sound.playSuccess(); } catch {}
                onUnlockClick();
              }}
              onMouseEnter={() => {
                try { sound.playHover(); } catch {}
              }}
              className="h-[56px] px-6 rounded-full text-[15px] font-body font-medium text-white/90 bg-white/[0.04] hover:bg-white/[0.08] border border-white/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Unlock vault · ₹49</span>
            </button>
          </div>

          {/* Trust Line Below: Check in Green, 13px typewriter font */}
          <div
            style={{ transitionDelay: '300ms' }}
            className={`font-typewriter text-[13px] text-zinc-400 tracking-wider flex items-center gap-1.5 mb-4 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="text-emerald-400 font-bold">✓</span>
            <span>Free instant download · PDF + portal · No card needed</span>
          </div>

          {/* Row of 5 Overlapping Avatars + "98 builders viewing now" with Pulsing Green Dot */}
          <div
            style={{ transitionDelay: '360ms' }}
            className={`flex items-center gap-3 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="flex -space-x-2">
              {AVATAR_URLS.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt="3D Builder"
                  className="w-6 h-6 rounded-full border-2 border-[#050508] object-cover ring-1 ring-white/10"
                />
              ))}
            </div>

            <div className="flex items-center gap-2 text-[12px] font-typewriter text-zinc-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>
                <strong className="text-white font-semibold">98 builders</strong> viewing now
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 55% Visual (Centered Laptop + Phone overlapping ~15% at bottom right) */}
        <div
          style={{ transitionDelay: '420ms' }}
          className={`lg:col-span-7 flex flex-col items-center justify-center w-full mt-6 lg:mt-0 scale-90 sm:scale-100 origin-center transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <HeroDeviceStage />
        </div>
      </div>
    </section>
  );
};
