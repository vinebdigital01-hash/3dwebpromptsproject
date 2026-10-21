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
  title = 'Mobile 3D WebGL',
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
    <div className={`relative select-none flex flex-col items-center ${className}`}>
      {/* 1. BUTTON HINTS (Protruding from Rails) */}
      {/* Action Button & Volume Up/Down on Left Rail */}
      <div className="absolute -left-[2px] sm:-left-[2.5px] top-[18%] w-[2.5px] h-[18px] bg-gradient-to-r from-[#8e8d89] to-[#b3b1ab] rounded-l-sm" />
      <div className="absolute -left-[2px] sm:-left-[2.5px] top-[26%] w-[2.5px] h-[34px] bg-gradient-to-r from-[#8e8d89] to-[#b3b1ab] rounded-l-sm" />
      <div className="absolute -left-[2px] sm:-left-[2.5px] top-[34%] w-[2.5px] h-[34px] bg-gradient-to-r from-[#8e8d89] to-[#b3b1ab] rounded-l-sm" />

      {/* Side / Power Button on Right Rail */}
      <div className="absolute -right-[2px] sm:-right-[2.5px] top-[24%] w-[2.5px] h-[48px] bg-gradient-to-l from-[#8e8d89] to-[#b3b1ab] rounded-r-sm" />

      {/* 2. NATURAL TITANIUM OUTER CHASSIS */}
      <div className="relative w-full aspect-[640/1280] max-w-[280px] rounded-[44px] sm:rounded-[52px] p-[3px] sm:p-[3.5px] bg-gradient-to-b from-[#d4d2cc] via-[#a8a69f] to-[#7a7873] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.85)] ring-1 ring-white/20">
        {/* Specular Highlight Running Down Left & Right Rails */}
        <div className="absolute left-[3px] top-6 bottom-6 w-[1px] bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />
        <div className="absolute right-[3px] top-6 bottom-6 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-white/40 pointer-events-none" />

        {/* Antenna Line Breaks */}
        <div className="absolute left-0 top-[12%] w-[3px] h-[2px] bg-[#5a5854]" />
        <div className="absolute right-0 top-[12%] w-[3px] h-[2px] bg-[#5a5854]" />
        <div className="absolute left-0 bottom-[12%] w-[3px] h-[2px] bg-[#5a5854]" />
        <div className="absolute right-0 bottom-[12%] w-[3px] h-[2px] bg-[#5a5854]" />

        {/* 3. INNER DISPLAY BEZEL */}
        <div className="relative w-full h-full rounded-[41px] sm:rounded-[49px] bg-black p-[7px] sm:p-[8.5px] overflow-hidden flex flex-col justify-start border border-[#1a1a1d]">
          {/* DYNAMIC ISLAND PILL CUTOUT */}
          <div className="absolute top-2.5 sm:top-3 left-1/2 -translate-x-1/2 z-30 w-[24%] min-w-[70px] max-w-[95px] h-[20px] sm:h-[24px] bg-black rounded-full flex items-center justify-between px-2 shadow-inner ring-1 ring-white/5">
            {/* Front Camera Lens */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#0a0a10] ring-1 ring-white/10 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-blue-600/60" />
            </div>
            {/* TrueDepth Sensor */}
            <div className="w-1.5 h-1.5 rounded-full bg-[#111116]" />
          </div>

          {/* INNER SCREEN (Pure Black Canvas Hosting Video) */}
          <div className="relative w-full flex-1 rounded-[34px] sm:rounded-[41px] overflow-hidden bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              key={videoUrl}
              src={videoUrl}
              poster={posterUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover object-center"
            />

            {/* Subtle Top Glass Reflection */}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />

            {/* iOS Home Indicator Bar */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/40 rounded-full pointer-events-none" />

            {/* Mobile Tag Pill */}
            <div className="absolute bottom-4 left-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-white/80 flex items-center gap-1 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>Touch Responsive</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SOFT DIFFUSE CONTACT SHADOW */}
      <div className="w-[85%] h-5 bg-black/80 blur-xl -mt-2 rounded-full pointer-events-none" />
    </div>
  );
};
