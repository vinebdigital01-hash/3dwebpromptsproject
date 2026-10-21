import React, { useRef, useEffect } from 'react';

interface IPhoneMockupProps {
  videoUrl: string;
  posterUrl?: string;
  title?: string;
  className?: string;
  isMuted?: boolean;
}

export const IPhoneMockup: React.FC<IPhoneMockupProps> = ({
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
      {/* 1. BUTTON HINTS (Protruding from Rails) */}
      <div className="absolute -left-[1.5px] sm:-left-[2px] top-[18%] w-[1.5px] sm:w-[2px] h-[10px] sm:h-[14px] bg-gradient-to-r from-[#8e8d89] to-[#b3b1ab] rounded-l-sm" />
      <div className="absolute -left-[1.5px] sm:-left-[2px] top-[25%] w-[1.5px] sm:w-[2px] h-[16px] sm:h-[22px] bg-gradient-to-r from-[#8e8d89] to-[#b3b1ab] rounded-l-sm" />
      <div className="absolute -left-[1.5px] sm:-left-[2px] top-[33%] w-[1.5px] sm:w-[2px] h-[16px] sm:h-[22px] bg-gradient-to-r from-[#8e8d89] to-[#b3b1ab] rounded-l-sm" />
      <div className="absolute -right-[1.5px] sm:-right-[2px] top-[24%] w-[1.5px] sm:w-[2px] h-[22px] sm:h-[30px] bg-gradient-to-l from-[#8e8d89] to-[#b3b1ab] rounded-r-sm" />

      {/* 2. NATURAL TITANIUM OUTER CHASSIS (aspect-ratio 9/19.5) */}
      <div className="relative w-full aspect-[9/19.5] rounded-[24px] xs:rounded-[28px] sm:rounded-[34px] md:rounded-[38px] p-[2px] sm:p-[2.5px] md:p-[3px] bg-gradient-to-b from-[#d4d2cc] via-[#a8a69f] to-[#7a7873] shadow-[0_20px_45px_-10px_rgba(0,0,0,0.85)] ring-1 ring-white/20">
        {/* Specular Highlight Running Down Rails */}
        <div className="absolute left-[2px] top-4 bottom-4 w-[1px] bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />
        <div className="absolute right-[2px] top-4 bottom-4 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-white/40 pointer-events-none" />

        {/* 3. INNER DISPLAY BEZEL */}
        <div className="relative w-full h-full rounded-[22px] xs:rounded-[26px] sm:rounded-[32px] md:rounded-[36px] bg-black p-[2.5px] sm:p-[3.5px] pt-[10px] sm:pt-[13px] overflow-hidden flex flex-col justify-start border border-[#1a1a1d]">
          {/* DYNAMIC ISLAND PILL CUTOUT - Sits cleanly inside top bezel frame */}
          <div className="absolute top-1 sm:top-1.5 left-1/2 -translate-x-1/2 z-30 w-[28%] min-w-[26px] max-w-[46px] h-[7px] sm:h-[9px] bg-black rounded-full flex items-center justify-between px-1 shadow-inner ring-1 ring-white/10">
            {/* Front Camera Lens */}
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#0a0a10] ring-1 ring-white/10 flex items-center justify-center">
              <div className="w-0.5 h-0.5 rounded-full bg-blue-600/60" />
            </div>
            {/* TrueDepth Sensor */}
            <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-[#111116]" />
          </div>

          {/* INNER SCREEN (9:19.5, Pure Black Canvas, Mobile Screenshot/Video scaled to fit top center) */}
          <div className="relative w-full flex-1 rounded-[16px] xs:rounded-[20px] sm:rounded-[26px] md:rounded-[30px] overflow-hidden bg-black flex items-center justify-center">
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

            {/* Subtle Top Glass Reflection */}
            <div className="absolute inset-x-0 top-0 h-10 sm:h-14 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />

            {/* iOS Home Indicator Bar */}
            <div className="absolute bottom-1 sm:bottom-1.5 left-1/2 -translate-x-1/2 w-8 sm:w-12 h-[2px] sm:h-[2.5px] bg-white/40 rounded-full pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. SOFT DIFFUSE CONTACT SHADOW */}
      <div className="w-[85%] h-3 sm:h-5 bg-black/80 blur-md sm:blur-xl -mt-1 sm:-mt-2 rounded-full pointer-events-none" />
    </div>
  );
};
