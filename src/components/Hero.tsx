import React, { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
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
      className="relative min-h-[100dvh] w-full bg-[#050508] overflow-x-hidden flex flex-col justify-center pt-[104px] sm:pt-[120px] lg:pt-[136px] pb-12 sm:pb-16 select-none"
    >
      {/* 1. Subtle Noise Texture Overlay */}
      <div className="absolute inset-0 bg-noise pointer-events-none z-0 opacity-35" />

      {/* 2. Soft Blue Light from Top-Left */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[65vw] h-[65vw] max-w-[900px] max-h-[900px] bg-[radial-gradient(ellipse_70%_60%_at_15%_10%,rgba(59,130,246,0.18),transparent_65%)]" />
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#050508] to-transparent" />
      </div>

      {/* 
        Rule 0: One container max-width 1280px, margin auto, padding-inline clamp(20px, 4vw, 48px).
        Grid: 1fr 1.1fr on desktop, 64px gap (40px on tablet), align-items center, min-height calc(100dvh - 136px).
      */}
      <div className="relative z-10 w-full max-w-[1280px] 2xl:max-w-[1440px] mx-auto px-[clamp(20px,4vw,48px)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-[64px] items-center min-h-[calc(100dvh-136px)]">
          {/* LEFT COLUMN: Text Block (Centered on tablet portrait 768-1023px, Left on mobile & desktop) */}
          <div className="flex flex-col justify-center text-left md:max-lg:text-center md:max-lg:items-center md:max-lg:max-w-[640px] md:max-lg:mx-auto">
            {/* Top Badge: 20px bottom rhythm, sits 56px below menu (clear 40px+ gap), 12px, 0.12em spacing, 80% white */}
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.25)] text-white/80 font-typewriter text-[12px] uppercase tracking-[0.12em] font-mono mb-5 self-start md:max-lg:self-center transition-all duration-700 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>500+ MASTER PROMPTS · $10K WEB</span>
            </div>

            {/* Headline:
                Desktop: clamp(44px, 4.6vw, 72px) (up to 88px on 1920px+), line-height 1.0, letter-spacing -0.035em, max-width 600px.
                Tablet portrait: 56px centered.
                Mobile: clamp(34px, 9vw, 44px), line-height 1.04, left aligned, no single word alone on last line.
                Exactly 3 lines: "Build $10,000" / "3D websites with" / "one prompt."
                $10,000: serif italic, solid blue to warm gold gradient, soft blue glow behind.
            */}
            <h1
              style={{ transitionDelay: '60ms' }}
              className={`font-heading font-semibold text-[clamp(34px,9vw,44px)] sm:text-[48px] md:max-lg:text-[56px] lg:text-[clamp(44px,4.6vw,72px)] 2xl:text-[clamp(44px,4.6vw,88px)] leading-[1.04] lg:leading-[1.0] tracking-[-0.035em] text-white max-w-[600px] mb-5 transition-all duration-700 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
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

            {/* Subline: 18px (16px on mobile), 14px bottom rhythm, muted white; 3D WebGL Architect with thin gradient underline */}
            <p
              style={{ transitionDelay: '120ms' }}
              className={`text-[16px] sm:text-[18px] font-body text-white/70 mb-3.5 leading-normal transition-all duration-700 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Become a{' '}
              <span className="text-white font-medium relative inline-block after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-gradient-to-r after:from-blue-400 after:via-indigo-400 after:to-amber-400">
                3D WebGL Architect
              </span>{' '}
              charging $15k per site
            </p>

            {/* Body Text: max 500px wide, 17px (15px mobile), line-height 1.6, 70% white, 32px bottom rhythm */}
            <p
              style={{ transitionDelay: '180ms' }}
              className={`max-w-[500px] text-[15px] sm:text-[17px] font-body text-white/70 leading-[1.6] mb-8 transition-all duration-700 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Stop spending 6 months learning WebGL, Three.js, and GLSL shaders. Copy our vault of 500+ battle-tested one-shot prompts to deploy jaw-dropping 3D interactive experiences in minutes.
            </p>

            {/* Buttons: 54px tall, rounded-full, one-line text, side-by-side on desktop & tablet portrait, stacked on mobile, 12px gap, 16px bottom rhythm */}
            <div
              style={{ transitionDelay: '240ms' }}
              className={`w-full flex flex-col sm:flex-row items-stretch sm:items-center md:max-lg:justify-center gap-3 mb-4 transition-all duration-700 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              {/* Main Button: Solid Electric Blue, soft glow, lifts 2px, min 44px tap target */}
              <button
                type="button"
                onClick={() => {
                  try { sound.playSuccess(); } catch {}
                  onFreeDownloadClick();
                }}
                onMouseEnter={() => {
                  try { sound.playHover(); } catch {}
                }}
                className="w-full sm:w-auto h-[54px] min-h-[44px] px-6 sm:px-7 rounded-full text-[14px] sm:text-[15px] font-body font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_8px_25px_rgba(37,99,235,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
              >
                <span>Get 30 free prompts</span>
                <span className="text-white/80">→</span>
              </button>

              {/* Second Button: See-through with 1px border and gold sparkle, min 44px tap target */}
              <button
                type="button"
                onClick={() => {
                  try { sound.playSuccess(); } catch {}
                  onUnlockClick();
                }}
                onMouseEnter={() => {
                  try { sound.playHover(); } catch {}
                }}
                className="w-full sm:w-auto h-[54px] min-h-[44px] px-5 sm:px-6 rounded-full text-[14px] sm:text-[15px] font-body font-medium text-white/90 bg-white/[0.04] hover:bg-white/[0.08] border border-white/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Unlock vault · ₹49</span>
              </button>
            </div>

            {/* Trust Line: 13px, normal letter spacing (no wide spacing), green check, 14px bottom rhythm, never cut off */}
            <div
              style={{ transitionDelay: '300ms' }}
              className={`text-[13px] font-body text-zinc-400 tracking-normal flex items-center md:max-lg:justify-center gap-1.5 mb-3.5 transition-all duration-700 flex-wrap ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span>Free instant download · PDF + portal · No card needed</span>
            </div>

            {/* Under Trust Line: 5 overlapping avatar circles + "98 builders viewing now" with pulsing green dot */}
            <div
              style={{ transitionDelay: '360ms' }}
              className={`flex items-center md:max-lg:justify-center gap-3 transition-all duration-700 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="flex -space-x-2 shrink-0">
                {AVATAR_URLS.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="3D Builder"
                    loading="lazy"
                    className="w-6 h-6 rounded-full border-2 border-[#050508] object-cover ring-1 ring-white/10"
                  />
                ))}
              </div>

              <div className="flex items-center gap-2 text-[12px] font-body text-zinc-300">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span>
                  <strong className="text-white font-semibold">98 builders</strong> viewing now
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 54% Visual (Laptop 100% of column, Phone right:0, 40px below builders on mobile) */}
          <div
            style={{ transitionDelay: '420ms' }}
            className={`flex flex-col items-center justify-center w-full mt-10 lg:mt-0 md:max-lg:w-[88%] md:max-lg:mx-auto transition-all duration-700 overflow-visible ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <HeroDeviceStage />
          </div>
        </div>
      </div>
    </section>
  );
};
