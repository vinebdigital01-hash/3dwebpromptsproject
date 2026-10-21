import React, { useRef, useEffect } from 'react';

interface HeroDeviceStageProps {
  videoUrl?: string;
  posterUrl?: string;
  macbookImageUrl?: string;
}

export const HeroDeviceStage: React.FC<HeroDeviceStageProps> = ({
  videoUrl = 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/valmora.mp4',
  posterUrl = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=75',
  macbookImageUrl = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&auto=format&fit=crop&q=80',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [videoUrl]);

  return (
    <div className="relative w-full flex items-center justify-center select-none py-2 overflow-visible">
      {/* Soft colored ambient glow behind devices */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] sm:w-[95%] h-[80%] rounded-full blur-3xl pointer-events-none -z-10 bg-blue-500/20"
      />

      {/* ========================================================
          MOBILE VIEW (< 768px): iPhone ONLY, 78% width, max 320px
          ======================================================== */}
      <div className="md:hidden w-[78%] max-w-[320px] mx-auto animate-float-6px will-change-transform">
        {/* iPhone 15 Pro Titanium Frame */}
        <div className="relative w-full aspect-[9/19.5] rounded-[38px] p-[2.5px] bg-gradient-to-b from-[#d4d2cc] via-[#a8a69f] to-[#7a7873] shadow-[0_20px_45px_-10px_rgba(0,0,0,0.85)] ring-1 ring-white/20">
          {/* Inner Display Bezel */}
          <div className="relative w-full h-full rounded-[35px] bg-black p-[3.5px] pt-[13px] overflow-hidden flex flex-col justify-start border border-[#1a1a1d]">
            {/* Dynamic Island */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-30 w-[28%] min-w-[32px] max-w-[52px] h-[9px] bg-black rounded-full flex items-center justify-between px-1.5 shadow-inner ring-1 ring-white/10 pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0a0a10] ring-1 ring-white/10 flex items-center justify-center">
                <div className="w-0.5 h-0.5 rounded-full bg-blue-600/60" />
              </div>
              <div className="w-1 h-1 rounded-full bg-[#111116]" />
            </div>

            {/* Inner Screen Video with WebP Poster */}
            <div className="relative w-full flex-1 rounded-[29px] overflow-hidden bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                src={videoUrl}
                poster={posterUrl}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="w-full h-full object-cover object-top"
              />

              {/* iOS Home Indicator Bar */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-12 h-[2.5px] bg-white/40 rounded-full pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TABLET & DESKTOP (>= 768px): MacBook Centered with iPhone at Bottom-Right
          ========================================================================= */}
      <div className="hidden md:flex relative w-full max-w-[680px] items-center justify-center animate-float-6px will-change-transform">
        {/* MacBook Pro 16" */}
        <div className="relative w-full aspect-[16/10] rounded-t-[20px] p-[2.5px] bg-gradient-to-b from-[#4a4d53] via-[#26282c] to-[#141518] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]">
          {/* Bezel */}
          <div className="relative w-full h-full rounded-t-[18px] bg-[#0c0d0f] p-[8px] md:p-[10px] flex flex-col justify-start overflow-hidden border border-black/80">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-[14%] min-w-[50px] max-w-[90px] h-[12px] md:h-[15px] bg-[#0c0d0f] rounded-b-[7px] flex items-center justify-center gap-1 shadow-md border-b border-x border-black">
              <div className="w-1.5 h-1.5 rounded-full bg-[#050507] ring-1 ring-white/10" />
              <div className="w-1 h-1 rounded-full bg-emerald-400/80 animate-pulse" />
            </div>

            {/* Screen Content: Full website, not zoomed or cut off */}
            <div className="relative w-full flex-1 rounded-t-[10px] md:rounded-t-[12px] overflow-hidden bg-black">
              <img
                src={macbookImageUrl}
                alt="3D Website Experience Desktop Preview"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-top"
              />

              {/* 40px top dark gradient for readability */}
              <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/80 via-black/35 to-transparent pointer-events-none z-10" />
            </div>
          </div>

          {/* Lower Unibody Aluminium Base Deck */}
          <div className="absolute -bottom-3 inset-x-[-2%] h-3.5 bg-gradient-to-b from-[#2a2c31] via-[#1a1b1e] to-[#0e0f11] rounded-b-[12px] border-t border-white/15 flex items-start justify-center shadow-lg">
            <div className="w-16 h-1 bg-[#0c0d0f] rounded-b-sm border-b border-white/10" />
          </div>
        </div>

        {/* iPhone overlapping right bottom corner (28% of laptop on tablet, 25% on desktop) */}
        <div className="absolute -bottom-4 right-0 w-[28%] lg:w-[25%] max-w-[170px] z-20 transition-transform duration-300 drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)]">
          <div className="relative w-full aspect-[9/19.5] rounded-[30px] p-[2px] bg-gradient-to-b from-[#d4d2cc] via-[#a8a69f] to-[#7a7873] shadow-2xl ring-1 ring-white/20">
            <div className="relative w-full h-full rounded-[28px] bg-black p-[2.5px] pt-[11px] overflow-hidden flex flex-col justify-start border border-[#1a1a1d]">
              {/* Dynamic Island */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 z-30 w-[28%] min-w-[26px] max-w-[44px] h-[8px] bg-black rounded-full flex items-center justify-between px-1 shadow-inner ring-1 ring-white/10 pointer-events-none">
                <div className="w-1 h-1 rounded-full bg-blue-600/60" />
                <div className="w-0.5 h-0.5 rounded-full bg-[#111116]" />
              </div>

              {/* Video Screen */}
              <div className="relative w-full flex-1 rounded-[24px] overflow-hidden bg-black flex items-center justify-center">
                <video
                  src={videoUrl}
                  poster={posterUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-white/40 rounded-full pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
