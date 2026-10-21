import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { HeroDeviceStage } from './mockups/HeroDeviceStage';

interface HeroProps {
  onUnlockClick: () => void;
  onTerminalClick?: () => void;
  onFreeDownloadClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onFreeDownloadClick,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleScrollToExamples = () => {
    const target = document.querySelector('#theater') || document.querySelector('#transformations');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] w-full bg-[#050508] overflow-x-hidden flex flex-col justify-start lg:justify-center pt-[88px] sm:pt-[96px] lg:pt-[128px] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] select-none"
    >
      {/* Subtle Noise Texture */}
      <div className="absolute inset-0 bg-noise pointer-events-none z-0 opacity-30" />

      {/* Soft Ambient Light from Top-Left */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_65%)]" />
      </div>

      {/* Unified 1280px Container (matching top bar container exactly) */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-[clamp(20px,4vw,48px)] my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6 lg:gap-10 xl:gap-12 items-center">
          {/* ========================================================
              TEXT COLUMN (45% on desktop, centered on mobile/tablet)
              ======================================================== */}
          <div className="flex flex-col justify-center text-center lg:text-left items-center lg:items-start max-w-[560px] mx-auto lg:mx-0">
            {/* 1. Badge: "30+ Free AI Prompts", pill shape, 12px, centered on mobile */}
            <div
              style={{ transitionDuration: '400ms' }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 shadow-[0_0_16px_rgba(59,130,246,0.25)] text-blue-300 text-[12px] font-medium font-body mb-3 sm:mb-4 transition-all will-change-[transform,opacity] ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>30+ Free AI Prompts</span>
            </div>

            {/* 2. Headline: 34px to 38px mobile, max 56px desktop, line-height 1.1, bold, max 3 lines */}
            <h1
              style={{ transitionDelay: '60ms', transitionDuration: '400ms' }}
              className={`font-heading font-bold text-[34px] sm:text-[38px] md:text-[48px] lg:text-[56px] leading-[1.1] tracking-[-0.03em] text-white mb-2.5 sm:mb-3 transition-all will-change-[transform,opacity] ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              Build{' '}
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#fbbf24]">
                $10,000
              </span>
              <br />
              3D websites with
              <br />
              one prompt.
            </h1>

            {/* 3. Sub line: one sentence, 16px, muted color, max 2 lines, max width 320px on mobile */}
            <p
              style={{ transitionDelay: '120ms', transitionDuration: '400ms' }}
              className={`text-[16px] font-body text-white/70 max-w-[320px] lg:max-w-[420px] leading-snug mb-4 sm:mb-5 transition-all will-change-[transform,opacity] ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              Deploy high-ticket 3D interactive experiences in minutes without coding WebGL.
            </p>

            {/* 4. Action Row: Main button full width on mobile + Second link */}
            <div
              style={{ transitionDelay: '180ms', transitionDuration: '400ms' }}
              className={`w-full flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-4 mb-3 sm:mb-3.5 transition-all will-change-[transform,opacity] ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              {/* Main Button: 52px tall, full width minus 20px each side on mobile, one line text */}
              <button
                type="button"
                onClick={onFreeDownloadClick}
                className="w-full sm:w-auto h-[52px] min-h-[44px] px-8 rounded-full text-[15px] font-body font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_4px_24px_rgba(37,99,235,0.45)] active:scale-95 transition-all flex items-center justify-center whitespace-nowrap cursor-pointer shrink-0"
              >
                Get 30+ Free Prompts
              </button>

              {/* Second Button: text link style "See examples ↓" */}
              <button
                type="button"
                onClick={handleScrollToExamples}
                className="min-h-[44px] px-4 py-2 text-[14px] font-body font-medium text-white/70 hover:text-white transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center"
              >
                See examples ↓
              </button>
            </div>

            {/* 5. Trust line: ★★★★★ Loved by 2,000+ creators, 13px, one line, normal letter spacing */}
            <div
              style={{ transitionDelay: '240ms', transitionDuration: '400ms' }}
              className={`text-[13px] font-body tracking-normal text-zinc-300 flex items-center justify-center lg:justify-start gap-1.5 whitespace-nowrap transition-all will-change-[transform,opacity] ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              <span className="text-amber-400 text-[14px] leading-none">★★★★★</span>
              <span>Loved by 2,000+ creators</span>
            </div>
          </div>

          {/* ========================================================
              VISUAL COLUMN (55% on desktop, iPhone only on mobile)
              ======================================================== */}
          <div
            style={{ transitionDelay: '300ms', transitionDuration: '400ms' }}
            className={`w-full mt-4 sm:mt-6 lg:mt-0 transition-all will-change-[transform,opacity] ${
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
