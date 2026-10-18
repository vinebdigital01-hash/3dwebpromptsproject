import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Sparkles, ArrowRight, ShieldCheck, Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { sound } from '../lib/audioEngine';

interface FlagshipLandingShowcaseProps {
  onUnlockClick: () => void;
}

export interface FlagshipItem {
  id: string;
  name: string;
  badge: string;
  category: string;
  clientValuation: string;
  videoUrl: string;
  description: string;
  techStack: string[];
  specs: string[];
  tokens: string;
  promptArchitecture: string;
}

export const FLAGSHIP_LANDING_PAGES: FlagshipItem[] = [
  {
    id: 'valmora',
    name: 'VALMORA',
    badge: 'LANDING PAGE // PREMIUM',
    category: 'Haute-Couture Spatial Architecture',
    clientValuation: '$28,500',
    videoUrl: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/valmora.mp4',
    description: 'An ultra-luxury architectural & haute-couture editorial landing page with brutalist typography, fluid cinematic physics, and obsidian aesthetic.',
    techStack: ['React 19', 'Tailwind CSS v4', 'WebGL Shaders', 'Kinetic Typography'],
    specs: ['Brutalist Kinetic Typography', 'Fluid Spatial Physics', 'Obsidian Haute-Couture Theme', 'Ray-Traced Ambient Shadowing'],
    tokens: '3,850 TOKENS',
    promptArchitecture: `Act as an Awwwards Site of the Year Creative Technologist.
Recreate the VALMORA haute-couture editorial landing page experience in React 19 + Tailwind CSS + WebGL.

VISUAL & INTERACTIVE BLUEPRINT:
1. TYPOGRAPHY & LAYOUT:
   - Oversized brutalist display headings paired with high-contrast serif italic accents.
   - Editorial asymmetric grid layout with floating luxury coordinates and specimen serial numbers.
   - Ultra-dark obsidian background (#060609) with ambient hairline borders (rgba(255,255,255,0.08)).

2. MOTION & DYNAMICS:
   - Fluid scroll momentum with inertial damping for imagery and editorial text columns.
   - Magnetic hover physics on all interactive CTA pills with subtle specular shine sweeps.
   - Canvas-backed volumetric smoke/fluid turbulence reacting to cursor velocity.

3. DELIVERABLE SPECIFICATIONS:
   - Pure responsive architecture (Mobile, Tablet, 4K Ultrawide).
   - Zero layout shifts (CLS < 0.01), sub-16ms frame budget (60 FPS locked).
   - Calibrated for one-shot compilation with Claude 3.7 Sonnet & Cursor Composer.`
  },
  {
    id: 'selene',
    name: 'SELENE',
    badge: 'LUNAR EXPEDITION // EARTHRISE',
    category: 'Celestial Parallax & Spatial Storytelling',
    clientValuation: '$36,000',
    videoUrl: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/selene.mp4',
    description: 'A lunar expedition site where the dust clears onto the Moon and the Earth rises over the horizon — six parallax layers, a trajectory that inks itself to 384,400 km, and a mission reel that slides past on the scroll.',
    techStack: ['React 19', 'Canvas Parallax', 'SVG Trajectory Physics', 'Hardware Acceleration'],
    specs: ['6 Parallax Celestial Layers', '384,400 km Dynamic Trajectory', 'Scroll-Linked Mission Reel', 'Zero Animation Library Overhead'],
    tokens: '3,920 TOKENS',
    promptArchitecture: `# SELENE — Lunar Expedition Earthrise Site Rebuild Prompt

Act as a Principal Creative Engineer. Build the complete SELENE Lunar Expedition site in pure React 19 + Tailwind CSS + HTML5 Canvas.

CORE ARCHITECTURE:
1. SIX CELESTIAL PARALLAX LAYERS:
   - Deep cosmic starfield with subtle Poisson-disc stellar brightness flicker.
   - Distant lunar horizon with dust particulate dispersion cleared by scroll acceleration.
   - Photorealistic Earthrise sphere with Rayleigh atmosphere atmospheric rim glow shader.
   - Foreground lander telemetry HUD with monospace latitude/longitude data streams.

2. TRAJECTORY ENGINE:
   - SVG vector path calculating the Trans-Lunar Injection (TLI) orbit.
   - Path inks itself proportionally to window.scrollY, reaching precisely 384,400 km at the touchdown milestone.
   - Interactive milestones with tactile acoustic clicks and coordinate telemetry readouts.

3. MISSION REEL:
   - Horizontal scroll-jacking reel sliding cinematic mission logs across the screen with zero layout jank.
   - Full keyboard accessibility and reduced-motion fallback compliance.`
  },
  {
    id: 'ora',
    name: 'Ora',
    badge: 'GENEVA HOROLOGY // CANVAS SCRUB',
    category: 'Scroll-Scrubbed Canvas Horology',
    clientValuation: '$42,000',
    videoUrl: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/ora-v2.mp4',
    description: 'A Geneva watch storefront built on a scroll-scrubbed canvas: 240 decoded WebP frames taken apart chapter by chapter behind a real-progress preloader, with no animation library anywhere in the dependency list.',
    techStack: ['HTML5 Canvas', '240 Decoded Frames', 'Zero-Dep Animation', 'WebP Memory Buffer'],
    specs: ['240 Decoded WebP Frames', 'Zero Animation Library Overhead', 'True-Progress Chapter Scrub', 'Native 60 FPS Hardware Interpolation'],
    tokens: '4,150 TOKENS',
    promptArchitecture: `Act as a High-End Performance Web Engineer.
Build the Ora Geneva watch storefront using a pure scroll-scrubbed HTML5 Canvas engine with ZERO animation libraries.

TECHNICAL SPECIFICATIONS:
1. 240-FRAME WEBP BUFFER:
   - Pre-decode an array of 240 high-resolution WebP frames into an offscreen ImageBitmap array.
   - Render a high-precision real-progress numeric preloader (0% -> 100%) tracking actual asset byte transfer.
   - Scrub the active frame via requestAnimationFrame + linear interpolation (lerp factor 0.08) against scroll progress.

2. CHAPTER DECONSTRUCTION:
   - Chapter 1: The Bezel & Fluted Case specular light sweep.
   - Chapter 2: The Mechanical Tourbillon exploded-view complication.
   - Chapter 3: The Sapphire Crystal double-dome anti-reflective coating.
   - Chapter 4: The Bespoke Alligator Leather strap tailoring.

3. ZERO-DEPENDENCY CONSTRAINT:
   - No GSAP, no Framer Motion, no Three.js.
   - 100% pure vanilla Canvas 2D context with hardware GPU acceleration.
   - Flawless performance on mobile Safari & high-refresh desktop monitors.`
  },
  {
    id: 'fluxora',
    name: 'Fluxora',
    badge: 'AGENCY PAGE // VISOR AMBER',
    category: 'Cinematic Visor Light & High-Trust Proof',
    clientValuation: '$31,000',
    videoUrl: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/fluxora.mp4',
    description: 'Amber light raking across a visor, a headline that breaks to italic serif on the word doing the work, and the proof stacked underneath it — an agency page arguing for people over machines.',
    techStack: ['React 19', 'Tailwind CSS v4', 'Custom GLSL Visor Rake', 'Editorial Grid'],
    specs: ['Amber Visor Light Rake Shaders', 'Italic Serif Typography Break', 'High-Trust Agency Proof Grid', 'Sub-14ms Response Time'],
    tokens: '3,600 TOKENS',
    promptArchitecture: `Act as an Award-Winning Creative Director & Frontend Architect.
Build the Fluxora agency landing page — arguing for human craft and intuition over generic machines.

DESIGN SYSTEM & VISUAL HOOK:
1. THE VISOR LIGHT RAKE:
   - Implement an amber light ray (#f59e0b) raking diagonally across the hero helmet/visor element.
   - Light displacement velocity reacts organically to mouse position and inertial scroll speed.
   - High-contrast specular reflections cutting across deep matte charcoal surfaces.

2. EDITORIAL TYPOGRAPHY BREAK:
   - Dynamic headline structure: crisp neo-grotesque sans-serif that intentionally breaks to high-fashion italic serif on the pivotal emotional word.
   - Subtle animated hairline underlines and micro-spaced tabular category badges.

3. THE PROOF STACK:
   - Stacked quantitative social proof cards underneath the fold featuring real deliverables, live metrics, and verified agency receipts.
   - Magnetic card hover states with warm amber radial illumination.`
  },
];

export const FlagshipLandingShowcase: React.FC<FlagshipLandingShowcaseProps> = ({ onUnlockClick }) => {
  const [activeItem, setActiveItem] = useState<FlagshipItem>(FLAGSHIP_LANDING_PAGES[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [inspectedPrompt, setInspectedPrompt] = useState<FlagshipItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const handleSelectTab = (item: FlagshipItem) => {
    sound.playClick();
    setActiveItem(item);
    setIsPlaying(true);
    const video = videoRefs.current[item.id];
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  };

  const togglePlay = () => {
    sound.playClick();
    const video = videoRefs.current[activeItem.id];
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    sound.playClick();
    const video = videoRefs.current[activeItem.id];
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleCopyPrompt = (item: FlagshipItem) => {
    sound.playSuccess();
    navigator.clipboard.writeText(item.promptArchitecture);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <section id="flagship-rebuilds" className="relative py-20 sm:py-28 md:py-32 bg-[#040407] border-t border-white/10 select-none overflow-hidden">
      {/* Subtle Ambient Radial Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/10 via-purple-600/5 to-transparent blur-3xl pointer-events-none -z-0" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 relative z-10">
        
        {/* Editorial Eyebrow & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono text-amber-400 uppercase tracking-widest mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>FLAGSHIP PRODUCTION REBUILDS • 4 MASTERPIECE BLUEPRINTS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white">
              Valmora, Selene, Ora & <span className="accent-text-gradient font-display italic font-normal">Fluxora</span>
            </h2>
          </div>

          <div className="max-w-md">
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed mb-4">
              4 world-class landing pages reverse-engineered into calibrated, one-shot prompts for Claude 3.7 & Cursor. Pure WebGL, canvas frame-scrubbing, and zero-math celestial physics.
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> 100% Tested Production Blueprints
              </span>
              <span>•</span>
              <span className="text-zinc-400">$137,500 Total Client Value</span>
            </div>
          </div>
        </div>

        {/* 4 Navigation Selector Pills */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 mb-8">
          {FLAGSHIP_LANDING_PAGES.map((item, idx) => {
            const isActive = activeItem.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item)}
                className={`relative text-left p-3.5 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                  isActive
                    ? 'bg-zinc-900/90 border-blue-500/50 shadow-[0_0_24px_rgba(59,130,246,0.25)] ring-1 ring-blue-500/30'
                    : 'bg-zinc-950/60 border-white/10 hover:border-white/20 hover:bg-zinc-900/40 text-zinc-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] sm:text-[11px] font-mono tracking-wider uppercase text-blue-400 font-semibold">
                      0{idx + 1} // {item.badge.split('//')[0].trim()}
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {item.clientValuation}
                    </span>
                  </div>
                  <h3 className={`text-base sm:text-xl font-bold tracking-tight mb-1 ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                    {item.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-zinc-500 font-sans line-clamp-2 leading-relaxed">
                    {item.category}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-500">{item.tokens}</span>
                  <span className={`flex items-center gap-1 font-semibold ${isActive ? 'text-blue-400' : 'text-zinc-500'}`}>
                    {isActive ? 'Active Reel' : 'Inspect'} <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                {isActive && (
                  <motion.div
                    layoutId="activePillGlow"
                    className="absolute inset-0 rounded-2xl border-2 border-blue-400 pointer-events-none -z-0"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Panoramic Cinema Screen for Active Flagship Item */}
        <div className="relative rounded-2xl sm:rounded-3xl border border-white/15 bg-black/80 shadow-[0_32px_80px_rgba(0,0,0,0.9)] overflow-hidden">
          {/* Top Cinema Header Bar */}
          <div className="px-4 sm:px-6 py-3.5 bg-zinc-950/90 border-b border-white/10 flex items-center justify-between gap-4 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                <span>LIVE PREVIEW: {activeItem.name.toUpperCase()}</span>
              </span>
              <span className="hidden sm:inline text-zinc-600">|</span>
              <span className="hidden sm:inline text-zinc-400">{activeItem.badge}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={togglePlay}
                className="px-3 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 border border-blue-500/40 text-blue-300 hover:text-white transition-all flex items-center gap-1.5 text-[11px]"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>
            </div>
          </div>

          {/* Video Container (16:9 Aspect Ratio) */}
          <div className="relative aspect-video w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
            {FLAGSHIP_LANDING_PAGES.map((item) => (
              <video
                key={item.id}
                ref={(el) => { videoRefs.current[item.id] = el; }}
                src={item.videoUrl}
                autoPlay={item.id === activeItem.id}
                loop
                muted={isMuted}
                playsInline
                preload="metadata"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  item.id === activeItem.id ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
              />
            ))}

            {/* Gradient Scrim for Legibility at Bottom */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none z-20" />

            {/* Floating Telemetry Box at Bottom */}
            <div className="absolute bottom-4 sm:bottom-6 inset-x-4 sm:inset-x-8 z-30 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="max-w-2xl bg-black/75 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 shadow-2xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-blue-300 font-mono text-[10px] uppercase font-bold tracking-wide">
                    {activeItem.badge}
                  </span>
                  <span className="text-emerald-400 font-mono text-xs font-bold">
                    Client Value: {activeItem.clientValuation}
                  </span>
                </div>
                <h4 className="text-lg sm:text-2xl font-bold text-white mb-2 tracking-tight">
                  {activeItem.name}
                </h4>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                  {activeItem.description}
                </p>

                {/* Tech Pills */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3.5">
                  {activeItem.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/10"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                <button
                  onClick={() => setInspectedPrompt(activeItem)}
                  className="px-4 sm:px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-semibold transition-all active:scale-95 flex items-center gap-2 shadow-lg backdrop-blur-md"
                >
                  <Terminal className="w-4 h-4 text-blue-400" />
                  <span>Inspect Prompt</span>
                </button>

                <button
                  onClick={onUnlockClick}
                  className="px-5 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 shadow-[0_0_24px_rgba(59,130,246,0.5)] ring-1 ring-blue-400/50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Unlock Blueprint (From ₹49)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {FLAGSHIP_LANDING_PAGES.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectTab(item)}
              className="p-4 sm:p-5 rounded-2xl bg-zinc-950/40 border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-white group-hover:text-blue-400 transition-colors">
                  {item.name}
                </span>
                <span className="text-[11px] font-mono text-emerald-400">{item.clientValuation}</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-zinc-400 font-sans">
                {item.specs.slice(0, 3).map((spec, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-blue-400 font-mono mt-0.5">•</span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>

      {/* Blueprint Inspection Lightbox Modal */}
      <AnimatePresence>
        {inspectedPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl rounded-2xl bg-[#09090f] border border-white/15 p-6 sm:p-8 text-white shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-blue-400 uppercase tracking-wider mb-1">
                    <span>{inspectedPrompt.badge}</span>
                    <span>•</span>
                    <span className="text-emerald-400">{inspectedPrompt.clientValuation} Valuation</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {inspectedPrompt.name} — Architecture Blueprint
                  </h3>
                </div>

                <button
                  onClick={() => setInspectedPrompt(null)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all text-xs font-mono"
                >
                  ESC / CLOSE
                </button>
              </div>

              {/* Modal Body / Prompt Text */}
              <div className="my-4 overflow-y-auto pr-2 space-y-4">
                <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-300 flex items-center justify-between">
                  <span>Tested with Claude 3.7 Sonnet & Cursor Composer • One-Shot Ready</span>
                  <span className="font-mono text-zinc-400">{inspectedPrompt.tokens}</span>
                </div>

                <div className="relative">
                  <pre className="p-4 sm:p-5 rounded-xl bg-black border border-white/10 text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed overflow-x-auto selection:bg-blue-600/30">
                    {inspectedPrompt.promptArchitecture}
                  </pre>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => handleCopyPrompt(inspectedPrompt)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {copiedId === inspectedPrompt.id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-zinc-400" />
                      <span>Copy Full Blueprint</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setInspectedPrompt(null);
                    onUnlockClick();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Get Complete 500+ Vault (From ₹49)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
