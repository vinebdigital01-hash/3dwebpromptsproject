import React, { useRef, useEffect, useState } from 'react';

export interface ShowcaseVideo {
  id: string;
  name: string;
  subtitle: string;
  videoUrl: string;
  posterUrl: string;
}

export const HERO_SHOWCASE_VIDEOS: ShowcaseVideo[] = [
  {
    id: 'valmora',
    name: 'VALMORA',
    subtitle: 'Haute-Couture Kinetic Spatial Architecture',
    videoUrl: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/valmora.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=480&auto=format&fit=crop&q=75',
  },
  {
    id: 'selene',
    name: 'SELENE',
    subtitle: 'Lunar Expedition Earthrise Parallax Engine',
    videoUrl: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/selene.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=720&auto=format&fit=crop&q=75',
  },
  {
    id: 'ora',
    name: 'ORA HOROLOGY',
    subtitle: 'Geneva Watch Scroll-Scrubbed Canvas Storefront',
    videoUrl: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/ora-v2.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=720&auto=format&fit=crop&q=75',
  },
  {
    id: 'fluxora',
    name: 'FLUXORA',
    subtitle: 'Human Craft Agency Visor Architecture',
    videoUrl: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/fluxora.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=720&auto=format&fit=crop&q=75',
  },
  {
    id: 'alethia',
    name: 'ALETHIA',
    subtitle: 'Bespoke Architectural Spatial Showcase',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/designs/alethia-video.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=720&auto=format&fit=crop&q=75',
  },
  {
    id: 'genotrace',
    name: 'GENO TRACE',
    subtitle: 'Bio-Spatial Particle & DNA Genomic Helix',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/Geno%20Trace.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=720&auto=format&fit=crop&q=75',
  },
  {
    id: 'anchor-ai',
    name: 'ANCHOR AI',
    subtitle: 'Autonomous Agentic Interface & Liquid Chrome',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/designs/anchor-ai-landing.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=720&auto=format&fit=crop&q=75',
  },
  {
    id: 'spatial-os',
    name: 'SPATIAL OS',
    subtitle: 'Kinetic WebGL Canvas & Dimensional UI',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/7b76f1c1-600b-444f-a1a1-c51c831ec51a.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=80',
  },
  {
    id: 'obsidian-cyber',
    name: 'OBSIDIAN CYBER',
    subtitle: 'Dark Raymarched Shader & Volumetric Atmosphere',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/6e6ad2ff-26c5-4fb6-90dc-ee4c3d596ca7.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1400&auto=format&fit=crop&q=80',
  },
  {
    id: 'fluid-luxury',
    name: 'FLUID LUXURY',
    subtitle: 'Curved Glass Distortion & Dynamic Specular',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/8b7c1764-b8c0-4d71-9b7e-6bd84bce04ad.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1400&auto=format&fit=crop&q=80',
  },
];

interface HeroDeviceStageProps {
  videoUrl?: string;
  posterUrl?: string;
}

export const HeroDeviceStage: React.FC<HeroDeviceStageProps> = ({
  videoUrl,
  posterUrl,
}) => {
  const macVideoRef = useRef<HTMLVideoElement>(null);
  const phoneVideoRef = useRef<HTMLVideoElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  // Detect PC/Desktop (>= 1024px)
  useEffect(() => {
    const checkViewport = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport, { passive: true });
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Pick a randomized video from the vault prompt library on reload if not explicitly passed
  const [activeItem] = useState<ShowcaseVideo>(() => {
    const randomIndex = Math.floor(Math.random() * HERO_SHOWCASE_VIDEOS.length);
    return HERO_SHOWCASE_VIDEOS[randomIndex];
  });

  const activeVideoUrl = videoUrl || activeItem.videoUrl;
  const activePosterUrl = posterUrl || activeItem.posterUrl;

  // Sync scroll position: ONLY for mobile devices (< 1024px)
  // On PC/desktop, DO NOT sync with scroll (remains static upright, as user requested)
  useEffect(() => {
    let rafId: number | null = null;
    const updateScroll = () => {
      // If PC / desktop, do not sync with scroll (remains fully open & static)
      if (window.innerWidth >= 1024) {
        setScrollProgress(1);
        return;
      }
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      // Over the first 200px of scroll on mobile, progress smoothly transitions 0 -> 1
      const progress = Math.min(1, Math.max(0, scrollY / 200));
      setScrollProgress(progress);
    };

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        updateScroll();
        rafId = null;
      });
    };

    updateScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  // Ensure both videos autoplay smoothly, looped and muted across all devices
  useEffect(() => {
    const startVideos = () => {
      if (macVideoRef.current) {
        macVideoRef.current.defaultMuted = true;
        macVideoRef.current.muted = true;
        macVideoRef.current.playsInline = true;
        const p1 = macVideoRef.current.play();
        if (p1 !== undefined) p1.catch(() => {});
      }
      if (phoneVideoRef.current) {
        phoneVideoRef.current.defaultMuted = true;
        phoneVideoRef.current.muted = true;
        phoneVideoRef.current.playsInline = true;
        const p2 = phoneVideoRef.current.play();
        if (p2 !== undefined) p2.catch(() => {});
      }
    };

    startVideos();

    // In case mobile browser low-power mode pauses video, wake up on first user gesture
    const handleGesture = () => {
      startVideos();
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('click', handleGesture);
    };
    window.addEventListener('touchstart', handleGesture, { passive: true });
    window.addEventListener('click', handleGesture, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleGesture);
      window.removeEventListener('click', handleGesture);
    };
  }, [activeVideoUrl]);

  // Lid angle:
  // On PC/desktop: always 0deg (upright, flat, no scroll sync)
  // On mobile: starts at 20deg (gentle greeting tilt showing screen clearly) and smoothly opens to 0deg as user scrolls
  const lidAngle = isDesktop ? 0 : 20 * (1 - scrollProgress);

  return (
    <div className="relative w-full flex items-center justify-center select-none py-1 sm:py-2 overflow-visible">
      {/* Soft colored ambient glow behind devices */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-[95%] h-[85%] rounded-full blur-2xl sm:blur-3xl pointer-events-none -z-10 bg-blue-500/25" />

      {/* Floating Hardware Composition */}
      <div className="relative w-full max-w-[330px] xs:max-w-[360px] sm:max-w-[480px] md:max-w-[560px] lg:max-w-[640px] xl:max-w-[680px] flex items-center justify-center animate-float-6px will-change-transform">
        
        {/* ==============================================================
            MACBOOK PRO
            - PC / Desktop: Upright, flat, static, no scroll sync
            - Mobile: Peeks above the bottom fold with live video & scroll-synced lid
            ============================================================== */}
        <div className="w-full flex flex-col items-center">
          {/* Hinged Lid & Display Assembly */}
          <div
            className="relative w-full aspect-[16/10] rounded-t-[18px] sm:rounded-t-[22px] p-[2px] sm:p-[2.5px] bg-gradient-to-b from-[#4a4d53] via-[#26282c] to-[#141518] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] will-change-transform transition-transform duration-75 ease-out"
            style={
              isDesktop
                ? undefined
                : {
                    transformOrigin: 'bottom center',
                    transform: `perspective(1000px) rotateX(${lidAngle}deg)`,
                  }
            }
          >
            {/* Top Metallic Highlight */}
            <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none z-20" />

            {/* Display Outer Bezel - absolute inset guarantees no aspect-ratio collapse */}
            <div className="absolute inset-[2px] sm:inset-[2.5px] rounded-t-[16px] sm:rounded-t-[20px] bg-[#0c0d0f] p-[6px] sm:p-[8px] md:p-[10px] flex flex-col justify-start overflow-hidden border border-black/80">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-[14%] min-w-[45px] max-w-[90px] h-[9px] sm:h-[13px] md:h-[15px] bg-[#0c0d0f] rounded-b-[6px] flex items-center justify-center gap-1 shadow-md border-b border-x border-black">
                <div className="w-1.5 h-1.5 rounded-full bg-[#050507] ring-1 ring-white/10" />
                <div className="w-1 h-1 rounded-full bg-emerald-400/80 animate-pulse" />
              </div>

              {/* Inner Screen: Plays Live 60 FPS WebGL Video on ALL Devices */}
              <div className="relative w-full h-full rounded-t-[10px] sm:rounded-t-[12px] overflow-hidden bg-black flex items-center justify-center">
                <video
                  ref={macVideoRef}
                  key={`mac-${activeVideoUrl}`}
                  src={activeVideoUrl}
                  poster={activePosterUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover object-top"
                />

                {/* Top dark gradient for menu contrast & readability */}
                <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/80 via-black/35 to-transparent pointer-events-none z-10" />

                {/* Top-Right LIVE DEMO Badge: Peeks into mobile fold immediately */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-blue-600/80 backdrop-blur-md border border-blue-400/40 text-[8px] sm:text-[9px] font-mono text-white flex items-center gap-1.5 pointer-events-none z-20 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold tracking-wider">LIVE DEMO</span>
                </div>

                {/* Bottom-left 60 FPS WebGL Badge */}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[8px] sm:text-[9px] font-mono text-white/90 flex items-center gap-1.5 pointer-events-none z-10 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>60 FPS WEBGL</span>
                </div>

                {/* Bottom-right Active Prompt Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[8px] sm:text-[9px] font-mono text-white/70 pointer-events-none z-10 hidden sm:block">
                  {activeItem.name}
                </div>
              </div>
            </div>
          </div>

          {/* Lower Unibody Aluminium Base Deck (stays grounded on floor plane) */}
          <div className="relative w-[105%] -mt-[1px] flex flex-col items-center">
            {/* Hinge Line */}
            <div className="w-[16%] h-[3px] bg-gradient-to-r from-[#1c1d20] via-[#52565e] to-[#1c1d20] rounded-t-sm" />

            {/* Aluminium Deck */}
            <div className="relative w-full h-[9px] sm:h-[13px] md:h-[15px] rounded-b-[10px] sm:rounded-b-[14px] bg-gradient-to-b from-[#2a2c31] via-[#1a1b1e] to-[#0e0f11] shadow-[0_10px_20px_rgba(0,0,0,0.9)] border-t border-white/15 flex items-start justify-center">
              <div className="w-12 sm:w-16 h-1 bg-[#0c0d0f] rounded-b-sm border-b border-white/10" />
            </div>

            {/* Rubber Feet */}
            <div className="w-full flex justify-between px-[6%] -mt-[1px]">
              <div className="w-5 sm:w-8 h-[2px] bg-[#0a0a0c] rounded-b-full shadow-sm" />
              <div className="w-5 sm:w-8 h-[2px] bg-[#0a0a0c] rounded-b-full shadow-sm" />
            </div>

            {/* Floor Contact Shadow */}
            <div className="w-[94%] h-4 sm:h-6 bg-black/80 blur-xl -mt-2 rounded-full pointer-events-none" />
          </div>
        </div>

        {/* ==============================================================
            IPHONE 15 PRO: Standing at Bottom-Right Corner
            - PC / Desktop: Visible (lg:block)
            - Mobile: HIDDEN (Mac only, no iPhone on mobile devices)
            ============================================================== */}
        <div
          style={{ transform: 'rotate(-5deg)' }}
          className="hidden lg:block absolute -bottom-2 sm:-bottom-4 -right-1 sm:right-0 w-[27%] sm:w-[25%] lg:w-[24%] min-w-[78px] xs:min-w-[88px] sm:min-w-[110px] max-w-[160px] z-20 transition-transform duration-300 drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)]"
        >
          <div className="relative w-full aspect-[9/19.5] rounded-[22px] xs:rounded-[26px] sm:rounded-[32px] p-[2px] sm:p-[2.5px] bg-gradient-to-b from-[#d4d2cc] via-[#a8a69f] to-[#7a7873] shadow-2xl ring-1 ring-white/20">
            <div className="absolute inset-[2px] sm:inset-[2.5px] rounded-[20px] xs:rounded-[24px] sm:rounded-[30px] bg-black p-[2px] pt-[8px] xs:pt-[9px] sm:pt-[11px] overflow-hidden flex flex-col justify-start border border-[#1a1a1d]">
              {/* Dynamic Island */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 z-30 w-[28%] min-w-[22px] max-w-[42px] h-[6px] sm:h-[8.5px] bg-black rounded-full flex items-center justify-between px-1 shadow-inner ring-1 ring-white/10 pointer-events-none">
                <div className="w-1 h-1 rounded-full bg-blue-600/60" />
                <div className="w-0.5 h-0.5 rounded-full bg-[#111116]" />
              </div>

              {/* Inner Screen Video - Only loaded on desktop where iPhone is visible */}
              <div className="relative w-full h-full rounded-[16px] xs:rounded-[20px] sm:rounded-[24px] overflow-hidden bg-black flex items-center justify-center">
                <video
                  ref={phoneVideoRef}
                  key={`phone-${activeVideoUrl}`}
                  src={typeof window !== 'undefined' && window.innerWidth >= 1024 ? activeVideoUrl : undefined}
                  poster={activePosterUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="none"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 sm:w-8 h-[2px] bg-white/40 rounded-full pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
