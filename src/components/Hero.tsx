import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { HeroDeviceStage } from './mockups/HeroDeviceStage';
import { sound } from '../lib/audioEngine';

interface HeroProps {
  onUnlockClick: () => void;
  onTerminalClick?: () => void;
  onFreeDownloadClick: () => void;
}

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
];

export const Hero: React.FC<HeroProps> = ({
  onUnlockClick,
  onFreeDownloadClick,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] w-full bg-[#050508] overflow-x-hidden flex flex-col justify-start lg:justify-center pt-[92px] sm:pt-[104px] lg:pt-[128px] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] select-none"
    >
      {/* Subtle Noise Texture */}
      <div className="absolute inset-0 bg-noise pointer-events-none z-0 opacity-30" />

      {/* Soft Ambient Light from Top-Left */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_65%)]" />
      </div>

      {/* Unified 1280px Container (matching floating top bar container exactly) */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-[clamp(20px,4vw,48px)] my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[46%_54%] gap-6 lg:gap-10 xl:gap-12 items-center">
          
          {/* ========================================================
              TEXT COLUMN (46% on desktop, centered on mobile/tablet)
              ======================================================== */}
          <div className="flex flex-col justify-center text-center lg:text-left items-center lg:items-start max-w-[560px] mx-auto lg:mx-0">
            {/* 1. Badge: Pill shape, blue glow, uppercase luxury tracking */}
            <div
              style={{ transitionDuration: '400ms' }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 shadow-[0_0_16px_rgba(59,130,246,0.25)] text-blue-300 text-[11px] sm:text-[12px] font-mono tracking-widest uppercase mb-3 sm:mb-4 transition-all will-change-[transform,opacity] ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>30+ FREE MASTER PROMPTS · $10K WEB</span>
            </div>

            {/* 2. Headline: Editorial typography with high-contrast serif italic accent */}
            <h1
              style={{ transitionDelay: '60ms', transitionDuration: '400ms' }}
              className={`font-heading font-semibold text-[34px] sm:text-[44px] md:text-[52px] lg:text-[clamp(44px,4.5vw,70px)] 2xl:text-[76px] leading-[1.04] lg:leading-[1.0] tracking-[-0.035em] text-white mb-3 sm:mb-3.5 transition-all will-change-[transform,opacity] ${
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

            {/* 3. Sub line: Underlined 3D WebGL Architect */}
            <p
              style={{ transitionDelay: '120ms', transitionDuration: '400ms' }}
              className={`text-[15px] sm:text-[17px] font-body text-white/75 max-w-[340px] sm:max-w-[460px] leading-snug mb-3.5 sm:mb-4 transition-all will-change-[transform,opacity] ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              Become a{' '}
              <span className="text-white font-medium relative inline-block after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-gradient-to-r after:from-blue-400 after:via-indigo-400 after:to-amber-400">
                3D WebGL Architect
              </span>{' '}
              charging $15k per site
            </p>

            {/* 4. Body Description */}
            <p
              style={{ transitionDelay: '160ms', transitionDuration: '400ms' }}
              className={`text-[14px] sm:text-[16px] font-body text-white/65 max-w-[320px] sm:max-w-[480px] leading-[1.6] mb-5 sm:mb-6 transition-all will-change-[transform,opacity] ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              Stop spending 6 months learning WebGL, Three.js, and GLSL shaders. Copy our vault of 500+ battle-tested one-shot prompts to deploy jaw-dropping 3D interactive experiences in minutes.
            </p>

            {/* 5. Action Row: Full width on mobile, side-by-side on desktop */}
            <div
              style={{ transitionDelay: '200ms', transitionDuration: '400ms' }}
              className={`w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 mb-3.5 sm:mb-4 transition-all will-change-[transform,opacity] ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              {/* Main Button: 52px tall, full width on mobile, electric blue glow */}
              <button
                type="button"
                onClick={() => {
                  try { sound.playSuccess(); } catch {}
                  onFreeDownloadClick();
                }}
                onMouseEnter={() => {
                  try { sound.playHover(); } catch {}
                }}
                className="w-full sm:w-auto h-[52px] min-h-[44px] px-7 rounded-full text-[15px] font-body font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_4px_24px_rgba(37,99,235,0.45)] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
              >
                <span>Get 30+ Free Prompts</span>
                <ArrowRight className="w-4 h-4 text-white/80" />
              </button>

              {/* Secondary Ghost Button: Paid Vault Unlock */}
              <button
                type="button"
                onClick={() => {
                  try { sound.playSuccess(); } catch {}
                  onUnlockClick();
                }}
                onMouseEnter={() => {
                  try { sound.playHover(); } catch {}
                }}
                className="w-full sm:w-auto h-[52px] min-h-[44px] px-6 rounded-full text-[14px] sm:text-[15px] font-body font-medium text-white/90 bg-white/[0.04] hover:bg-white/[0.08] border border-white/20 hover:border-white/30 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Unlock Vault · ₹49</span>
              </button>
            </div>

            {/* 6. Social Proof Bar: 5-Star rating + Active Builders indicator */}
            <div
              style={{ transitionDelay: '260ms', transitionDuration: '400ms' }}
              className={`flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-[12px] sm:text-[13px] font-body text-zinc-300 transition-all will-change-[transform,opacity] ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-amber-400 text-[14px] leading-none">★★★★★</span>
                <span>Loved by 2,000+ creators</span>
              </div>
              <span className="hidden sm:inline text-white/20">•</span>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <div className="flex -space-x-1.5 shrink-0">
                  {AVATARS.map((src, i) => (
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

          {/* ========================================================
              VISUAL COLUMN (MacBook + iPhone Stage on ALL devices)
              ======================================================== */}
          <div
            style={{ transitionDelay: '300ms', transitionDuration: '400ms' }}
            className={`w-full mt-6 sm:mt-8 lg:mt-0 transition-all will-change-[transform,opacity] ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <HeroDeviceStage />
          </div>
        </div>
      </div>
    </section>
  );
};
