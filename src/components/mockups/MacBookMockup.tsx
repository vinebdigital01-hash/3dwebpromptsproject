import React, { useRef, useEffect } from 'react';

interface MacBookMockupProps {
  videoUrl: string;
  posterUrl?: string;
  title?: string;
  className?: string;
  isMuted?: boolean;
}

export const MacBookMockup: React.FC<MacBookMockupProps> = ({
  videoUrl,
  posterUrl,
  className = '',
  isMuted = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = isMuted;
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {});
    }
  }, [videoUrl, isMuted]);

  return (
    <div className={`relative select-none flex flex-col items-center w-full ${className}`}>
      {/* 1. LID & DISPLAY ASSEMBLY (aspect-ratio 16/10) */}
      <div className="relative w-full aspect-[16/10] max-w-[720px] rounded-t-[18px] sm:rounded-t-[22px] p-[2px] sm:p-[2.5px] bg-gradient-to-b from-[#4a4d53] via-[#26282c] to-[#141518] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]">
        {/* Subtle Top Metallic Highlight */}
        <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

        {/* Display Outer Bezel */}
        <div className="relative w-full h-full rounded-t-[16px] sm:rounded-t-[20px] bg-[#0c0d0f] p-[6px] sm:p-[9px] md:p-[10px] flex flex-col justify-start overflow-hidden border border-black/80">
          {/* Top Bezel Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-[14%] min-w-[45px] max-w-[100px] h-[9px] sm:h-[14px] md:h-[16px] bg-[#0c0d0f] rounded-b-[6px] sm:rounded-b-[8px] flex items-center justify-center gap-1 sm:gap-1.5 shadow-md border-b border-x border-black">
            {/* Camera Lens */}
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#050507] ring-1 ring-white/10 flex items-center justify-center">
              <div className="w-0.5 h-0.5 rounded-full bg-blue-500/60" />
            </div>
            {/* Green Sensor LED */}
            <div className="w-1 h-1 rounded-full bg-emerald-400/80 animate-pulse" />
          </div>

          {/* INNER SCREEN (16:10, Pure Black Canvas, Scaled Down Full-Page Video) */}
          <div className="relative w-full flex-1 rounded-t-[10px] sm:rounded-t-[12px] overflow-hidden bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              key={videoUrl}
              src={videoUrl}
              poster={posterUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              className="w-full h-full object-cover object-top"
            />

            {/* Exactly 40px dark gradient at top of screen so menu text is readable */}
            <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none z-10" />

            {/* Subtle Screen Ambient Reflection (Top Edge Sheen) */}
            <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none z-10" />
          </div>
        </div>
      </div>

      {/* 2. CHASSIS HINGE & BOTTOM BASE DECK */}
      <div className="relative w-[105%] max-w-[756px] -mt-[1px] flex flex-col items-center">
        {/* Silver Hinge Line Below Screen */}
        <div className="w-[16%] h-[3px] sm:h-[4px] bg-gradient-to-r from-[#1c1d20] via-[#52565e] to-[#1c1d20] rounded-t-sm" />

        {/* Lower Unibody Aluminium Deck */}
        <div className="relative w-full h-[10px] sm:h-[14px] md:h-[16px] rounded-b-[10px] sm:rounded-b-[14px] bg-gradient-to-b from-[#2a2c31] via-[#1a1b1e] to-[#0e0f11] shadow-[0_10px_20px_rgba(0,0,0,0.9)] border-t border-white/15 flex items-start justify-center">
          {/* Centered Thumb Notch Cutout */}
          <div className="w-[12%] min-w-[45px] max-w-[80px] h-[3px] sm:h-[4px] bg-[#0c0d0f] rounded-b-[4px] sm:rounded-b-[6px] border-b border-x border-white/5" />
        </div>

        {/* 3. RUBBER FEET (Visible below body) */}
        <div className="w-full flex justify-between px-[6%] -mt-[1px]">
          <div className="w-6 sm:w-8 h-[2px] sm:h-[3px] bg-[#0a0a0c] rounded-b-full shadow-sm" />
          <div className="w-6 sm:w-8 h-[2px] sm:h-[3px] bg-[#0a0a0c] rounded-b-full shadow-sm" />
        </div>

        {/* 4. SOFT DIFFUSE CONTACT SHADOW */}
        <div className="w-[94%] h-5 sm:h-7 bg-black/80 blur-xl -mt-2 rounded-full pointer-events-none" />
      </div>
    </div>
  );
};
