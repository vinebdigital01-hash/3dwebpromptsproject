import React from 'react';

interface PartnerPlatform {
  name: string;
  tagline: string;
  svg: React.ReactNode;
}

const PLATFORMS: PartnerPlatform[] = [
  {
    name: 'Webflow',
    tagline: 'Enterprise CMS & 3D Embeds',
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 1024 1024" fill="currentColor">
        <path d="M1000.9 313.4L738.7 825.2l-149.3-.1 106.8-208.5c-89.9 8.2-180.7 49-216.9 146.4l-75.5 62.1-155.6-.1 107.5-207.7c-90.1 7.4-180.8 48.7-217.1 146.4l-74.8 61.4L23.1 825 241 401.7l158.4-.1-118.7 228.3c44.8-54.8 116.1-90.2 195.9-90.2 12.8 0 25.6.9 38.2 2.6L631 313.4l155.6-.1-120.9 231.2c44.9-54.8 116.1-90.3 195.8-90.3 12.9 0 25.7.9 38.3 2.6l101.1-143.4h.1z" />
      </svg>
    ),
  },
  {
    name: 'Framer',
    tagline: 'Interactive Canvas & Shaders',
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z" />
      </svg>
    ),
  },
  {
    name: 'Spline',
    tagline: '3D Spatial Design & WebGL',
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 128 128" fill="currentColor">
        <path d="M64 4C30.9 4 4 30.9 4 64s26.9 60 60 60 60-26.9 60-60S97.1 4 64 4zm28.7 81.3c-2.4 4.8-6.1 8.8-10.9 11.5-4.8 2.7-10.4 4.1-16.5 4.1-8.5 0-15.6-2.6-21.2-7.8-5.6-5.2-8.5-12.2-8.5-21 0-8.8 2.8-15.8 8.4-21 5.6-5.2 12.8-7.8 21.6-7.8 6 0 11.4 1.3 16.1 3.9 4.7 2.6 8.3 6.3 10.7 11.1l-10.3 6.1c-1.6-3.1-3.9-5.5-6.8-7.1-2.9-1.6-6.2-2.4-9.8-2.4-5.3 0-9.6 1.6-13 4.8-3.4 3.2-5 7.4-5 12.5s1.7 9.4 5.1 12.6c3.4 3.2 7.8 4.8 13.2 4.8 3.7 0 7.1-.9 10-2.6 2.9-1.7 5.2-4.1 6.8-7.2l10.2 5.9z" />
      </svg>
    ),
  },
  {
    name: 'Three.js',
    tagline: 'Production WebGL Shaders',
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 256 256" fill="currentColor">
        <path d="M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z" />
      </svg>
    ),
  },
  {
    name: 'Linear',
    tagline: 'High-Velocity Sprints',
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 100 100" fill="currentColor">
        <path d="M1.2 57.3c1.7 15.3 8.8 29.2 19.9 39.4l41.5-41.5c-4.4-4.4-10-7.3-16.1-8.3L1.2 57.3zm3.1-15.6l45.4-11.2c6.1 1 11.7 3.9 16.1 8.3L24.3 80.3C13.2 70.1 6.1 56.2 4.3 41.7zm59.6-14c11.1 10.2 18.2 24.1 19.9 39.4l-45.4 11.2c-6.1-1-11.7-3.9-16.1-8.3l41.6-42.3zm31.8 14.6c-1.7-15.3-8.8-29.2-19.9-39.4L37.3 44.4c4.4 4.4 10 7.3 16.1 8.3l42.3-14.4z" />
      </svg>
    ),
  },
  {
    name: 'Figma',
    tagline: 'Vector & Component Systems',
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 38 57" fill="currentColor">
        <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0zM0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0zM0 28.5A9.5 9.5 0 0 1 9.5 19H19v19H9.5A9.5 9.5 0 0 1 0 28.5zM0 9.5A9.5 9.5 0 0 1 9.5 0H19v19H9.5A9.5 9.5 0 0 1 0 9.5zM19 0h9.5a9.5 9.5 0 1 1 0 19H19V0z" />
      </svg>
    ),
  },
  {
    name: 'Vercel',
    tagline: 'Edge CDN & Next.js Deployments',
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 1155 1000" fill="currentColor">
        <path d="m577.3 0 577.4 1000H0z" />
      </svg>
    ),
  },
  {
    name: 'GSAP',
    tagline: 'High-Performance Physics & Scroll',
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    name: 'Raycast',
    tagline: 'Developer Velocity Workflows',
    svg: (
      <svg className="h-6 w-auto" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0a12 12 0 1 0 12 12A12 12 0 0 0 12 0zm0 3.6a8.4 8.4 0 0 1 8.4 8.4 8.35 8.35 0 0 1-2.46 5.94l-5.94-5.94V3.6zm0 16.8a8.4 8.4 0 0 1-8.4-8.4 8.35 8.35 0 0 1 2.46-5.94l5.94 5.94v8.4z" />
      </svg>
    ),
  },
];

export const AgencyMarquee: React.FC = () => {
  // Double list for smooth, seamless infinite scroll
  const marqueeItems = [...PLATFORMS, ...PLATFORMS];

  return (
    <section className="relative w-full py-8 sm:py-10 bg-[#06060b] border-y border-white/5 overflow-hidden will-change-transform transform-gpu select-none">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-20 bg-blue-500/[0.03] blur-3xl pointer-events-none" />

      {/* Authority Headline */}
      <div className="text-center mb-6 px-4">
        <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-white/40">
          TRUSTED BY <span className="text-white/80 font-bold">2,400+ LEADING CREATIVE AGENCIES</span> & STUDIOS BUILDING ON
        </p>
      </div>

      {/* Marquee Wrapper with Smooth Lateral Gradient Fade Masks */}
      <div className="relative w-full overflow-hidden">
        {/* Left Edge Scrim */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-36 bg-gradient-to-r from-[#06060b] to-transparent z-10" />

        {/* Right Edge Scrim */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-36 bg-gradient-to-l from-[#06060b] to-transparent z-10" />

        {/* Infinite Scrolling Track */}
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] items-center gap-10 sm:gap-14 py-2">
          {marqueeItems.map((platform, idx) => (
            <div
              key={`${platform.name}-${idx}`}
              className="group flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 cursor-default"
            >
              {/* Grayscale Icon with Hover Brightness */}
              <div className="text-white/40 group-hover:text-white transition-colors duration-300 shrink-0">
                {platform.svg}
              </div>

              {/* Platform Typography */}
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-semibold tracking-tight text-white/50 group-hover:text-white transition-colors duration-300">
                  {platform.name}
                </span>
                <span className="text-[10px] font-mono text-white/30 hidden md:block">
                  {platform.tagline}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
