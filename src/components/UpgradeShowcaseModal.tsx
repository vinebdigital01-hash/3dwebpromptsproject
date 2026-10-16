import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Cpu,
  Sparkles,
  Award,
  Layers,
  Clock,
  ArrowRight,
  Check,
  ShieldCheck,
  Lock,
  Code2,
  FolderGit2,
  Zap,
  Download,
  ExternalLink,
} from 'lucide-react';
import { sound } from '../lib/audioEngine';

interface UpgradeShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  currentTierName?: string;
  triggerReason?: 'quota_exceeded' | 'manual';
}

interface UpgradeSlide {
  id: string;
  tabLabel: string;
  eyebrow: string;
  title: string;
  metricBadge: string;
  description: string;
  visualType: 'code_vault' | 'toolchain_rack' | 'shader_lab' | 'commercial_license' | 'vip_drops' | 'zero_expiry';
  keyPoints: string[];
}

const UPGRADE_SLIDES: UpgradeSlide[] = [
  {
    id: 'unmetered_vault',
    tabLabel: 'Unmetered Vault',
    eyebrow: 'CORE ADVANTAGE // RESTRICTION REMOVAL',
    title: 'Infinite 24/7 Prompt Synthesis Without Daily Caps',
    metricBadge: 'UNRESTRICTED COPIES // 0 LIMITS',
    description:
      'Eliminate the 1-copy daily threshold permanently. Copy, customize, and deploy all 50+ master 3D architectures simultaneously for unlimited client pitches.',
    visualType: 'code_vault',
    keyPoints: [
      'Unrestricted daily copies across all 6 high-ticket commercial tiers',
      'Average 2,800 to 4,200 tokens of precision Three.js + R3F specifications',
      'Pre-calibrated for Claude 3.7 Sonnet, Cursor Agent, and ChatGPT o3',
      'Instant copy button for full GLSL vertex shaders, scene lighting, and physics',
    ],
  },
  {
    id: 'hardware_racks',
    tabLabel: 'Hardware Racks',
    eyebrow: 'PRODUCTION STARTERS // ZERO SETUP LATENCY',
    title: 'Full Next.js 15 & React 19 Three.js Scaffolding',
    metricBadge: 'NPX SCAFFOLDS // 100% PRODUCTION READY',
    description:
      'Skip 20+ hours of boilerplate setup. Instant access to fully wired repositories with Drei helpers, post-processing bloom pipelines, and DRACO model compression.',
    visualType: 'toolchain_rack',
    keyPoints: [
      'Next.js 15 App Router + React Three Fiber + Tailwind CSS starter repository',
      'Photorealistic 3D Product Configurator with dynamic PBR material switching',
      'Rapier 3D physics engine template with rigid body colliders and inertia',
      'One-command terminal deployment via npx degit vinebdigital/apex3d-starter',
    ],
  },
  {
    id: 'glsl_shaders',
    tabLabel: 'GLSL Shaders',
    eyebrow: 'VISUAL COMPOSITING // 60 FPS WEBGL',
    title: 'Awwwards-Grade Liquid & Simplex Displacement Shaders',
    metricBadge: '12 CUSTOM SHADERS // < 11.2MS FRAME BUDGET',
    description:
      'Bespoke vertex and fragment shaders that standard CSS cannot achieve. Kinetic chromatic aberration on mouse velocity, raymarched volumetric fluids, and caustic glass.',
    visualType: 'shader_lab',
    keyPoints: [
      'Simplex Noise liquid wave displacement driven by mouse velocity',
      'Refractive glass caustics with physical chromatic dispersion',
      'Audio-reactive frequency spectrum displacement with fallback idle loops',
      'Strictly optimized for 60 FPS on 1440p and mobile viewports (< 18 draw calls)',
    ],
  },
  {
    id: 'commercial_license',
    tabLabel: 'Commercial Rights',
    eyebrow: 'LEGAL CLEARANCE // 100% ROYALTY-FREE',
    title: 'Perpetual Studio License & White-Label Commercial Rights',
    metricBadge: 'UNLIMITED CLIENT DEPLOYMENTS // ZERO ROYALTIES',
    description:
      'Ship 3D experiences for clients and charge $5,000 to $20,000 per project with complete peace of mind. White-label rights mean no attribution is ever required.',
    visualType: 'commercial_license',
    keyPoints: [
      'Legally indemnified commercial certificate with unique verification hash',
      'Deploy on unlimited client web applications and SaaS commercial products',
      'Zero royalties, zero revenue share, zero backlink requirement',
      'Official GST tax invoice (INV-2026-XXXX) for 100% business expense deduction',
    ],
  },
  {
    id: 'vip_drops',
    tabLabel: 'Weekly Drops',
    eyebrow: 'CONTINUOUS EVOLUTION // LIFETIME ARCHITECTURE',
    title: 'Weekly 3D Architecture Drops & Direct VIP Desk Access',
    metricBadge: '+4 ARCHITECTURES / MONTH // FOREVER',
    description:
      'The 3D web evolves weekly. You get every new prompt, shader rack, and configurator template pushed straight into your workstation vault for life.',
    visualType: 'vip_drops',
    keyPoints: [
      '4 to 6 new high-ticket 3D prompts added every single month',
      'Private WhatsApp & Discord channel for direct 1-on-1 Three.js debugging',
      'Custom prompt request privileges: tell us what you need for an upcoming client pitch',
      'Early access to WebGPU experimental shaders and spatial web prototypes',
    ],
  },
  {
    id: 'zero_expiry',
    tabLabel: 'Zero Expiry',
    eyebrow: 'PERMANENT ASSET // LIFETIME CLOUD WORKSTATION',
    title: '24-Hour Countdown Clock Permanently Dissolved',
    metricBadge: 'NEVER EXPIRES // PERMANENT ENCLAVE TOKEN',
    description:
      'Your 1-Day Sprint expires in hours. Upgrading to VIP locks in your permanent workstation login credentials forever, with zero recurring monthly charges.',
    visualType: 'zero_expiry',
    keyPoints: [
      'Eliminate the 24-hour expiration timer completely',
      'Permanent cloud session persistence across all your developer devices',
      'No subscription rebills: single one-time payment of ₹2,999',
      'Your ₹49 sprint investment is 100% credited towards your VIP license',
    ],
  },
];

export const UpgradeShowcaseModal: React.FC<UpgradeShowcaseModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  currentTierName = '1-Day Sprint Pass',
  triggerReason = 'quota_exceeded',
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeSlideIndex]);

  if (!isOpen) return null;

  const currentSlide = UPGRADE_SLIDES[activeSlideIndex];

  const handleNext = () => {
    sound.playClick();
    setActiveSlideIndex((prev) => (prev + 1) % UPGRADE_SLIDES.length);
  };

  const handlePrev = () => {
    sound.playClick();
    setActiveSlideIndex((prev) => (prev - 1 + UPGRADE_SLIDES.length) % UPGRADE_SLIDES.length);
  };

  const handleSelectTab = (idx: number) => {
    sound.playClick();
    setActiveSlideIndex(idx);
  };

  const handlePrimaryUpgradeClick = () => {
    sound.playSuccess();
    onUpgrade();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Click Outside Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Showcase Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        className="relative z-10 w-full max-w-4xl rounded-2xl sm:rounded-3xl bg-[#08080f] border border-amber-500/25 text-white shadow-[0_24px_70px_-15px_rgba(0,0,0,0.9),0_0_40px_-10px_rgba(245,158,11,0.12)] overflow-hidden flex flex-col my-auto"
      >
        {/* Subtle Ambient Top Glow Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

        {/* 1. TOP HEADER ENCLAVE BAR */}
        <div className="px-5 sm:px-8 pt-5 sm:pt-6 pb-4 border-b border-white/[0.08] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                VIP ALL-ACCESS UPGRADE ENCLAVE
              </span>

              {triggerReason === 'quota_exceeded' && (
                <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                  Trigger: 1-Day Daily Quota Exceeded (1/1 Used)
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
              Unlock Permanent VIP Studio Workstation
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
              Transition from {currentTierName} to permanent VIP All-Access. Zero recurring subscriptions, unmetered daily copies, full Three.js repositories, and commercial rights.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* ₹49 Credited Pill */}
            <div className="hidden sm:flex flex-col items-end text-right px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">
                Credit Applied
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                ₹49 Credited to VIP
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.06] transition-colors"
              title="Close showcase"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. DYNAMIC MOTION PILL SELECTOR (CAROUSEL TABS) */}
        <div className="px-5 sm:px-8 py-3 bg-[#06060b] border-b border-white/[0.06] overflow-x-auto scrollbar-none flex items-center gap-2">
          {UPGRADE_SLIDES.map((slide, idx) => {
            const isActive = idx === activeSlideIndex;
            return (
              <button
                key={slide.id}
                onClick={() => handleSelectTab(idx)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30'
                    : 'text-zinc-500 hover:text-zinc-300 bg-white/[0.02] hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <span className="text-[10px] text-zinc-600 font-normal">0{idx + 1}</span>
                <span>{slide.tabLabel}</span>
                {isActive && (
                  <motion.div
                    layoutId="activePillIndicator"
                    className="absolute inset-0 rounded-lg border border-amber-400/40 pointer-events-none"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* 3. CAROUSEL STAGE BODY */}
        <div className="p-5 sm:p-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
            >
              {/* Left Column: Feature Narrative & Concrete Deliverables */}
              <div className="lg:col-span-6 space-y-4">
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-amber-400 tracking-[0.16em] uppercase flex items-center gap-2">
                    <span>{currentSlide.eyebrow}</span>
                    <span>·</span>
                    <span className="text-zinc-500">SLIDE 0{activeSlideIndex + 1}/06</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {currentSlide.title}
                  </h3>

                  <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                    {currentSlide.description}
                  </p>
                </div>

                {/* Key Deliverables Matrix */}
                <div className="space-y-2 pt-2">
                  {currentSlide.keyPoints.map((point, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                    >
                      <div className="w-4 h-4 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-amber-400" />
                      </div>
                      <span className="text-xs text-zinc-300 font-sans leading-snug">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Metric Badge */}
                <div className="pt-2 flex items-center gap-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-lg bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                    {currentSlide.metricBadge}
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Telemetry / Concrete Interactive Surface */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl bg-[#050508] border border-white/[0.08] p-4 sm:p-5 relative overflow-hidden font-mono shadow-inner">
                  {/* Subtle Corner Hardware Screws */}
                  <div className="absolute top-2.5 left-2.5 w-1 h-1 rounded-full bg-white/20" />
                  <div className="absolute top-2.5 right-2.5 w-1 h-1 rounded-full bg-white/20" />
                  <div className="absolute bottom-2.5 left-2.5 w-1 h-1 rounded-full bg-white/20" />
                  <div className="absolute bottom-2.5 right-2.5 w-1 h-1 rounded-full bg-white/20" />

                  {/* Surface 1: Code Vault Visual */}
                  {currentSlide.visualType === 'code_vault' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 border-b border-white/[0.06] pb-2">
                        <span className="text-amber-400 flex items-center gap-1.5">
                          <Terminal className="w-3 h-3" />
                          <span>SYNTAX GENERATOR // UNRESTRICTED</span>
                        </span>
                        <span className="text-emerald-400">UNLIMITED COPIES ACTIVE</span>
                      </div>

                      <div className="p-3 rounded-xl bg-black/90 border border-white/[0.06] text-[11px] leading-relaxed text-blue-200/90 whitespace-pre-wrap select-text max-h-56 overflow-y-auto scrollbar-thin">
{`// ARCHITECTURE: CYBERSECURITY THREAT CORE (AWWWARDS GRADE)
import { Canvas, useFrame } from '@react-three/fiber';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';

export function CyberShield() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  // Unrestricted VIP Access: 50+ Complete Prompt Templates
  // Draw calls capped: < 14 | Target: 60 FPS WebGL
  useFrame(({ clock }) => {
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.15;
  });
  return <instancedMesh ref={meshRef} args={[geo, mat, 12000]} />;
}`}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                        <span>Tokens: ~3,480 / Master Architecture</span>
                        <span className="text-zinc-400">Claude 3.7 + Cursor Calibrated</span>
                      </div>
                    </div>
                  )}

                  {/* Surface 2: Toolchain Rack Visual */}
                  {currentSlide.visualType === 'toolchain_rack' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 border-b border-white/[0.06] pb-2">
                        <span className="text-emerald-400 flex items-center gap-1.5">
                          <Cpu className="w-3 h-3" />
                          <span>REPO RACK: APEX-STARTER-V2.4</span>
                        </span>
                        <span>NEXT.JS 15 + R19</span>
                      </div>

                      <div className="p-3 rounded-xl bg-black/90 border border-white/[0.06] space-y-2">
                        <div className="text-[10px] text-zinc-500">1-Command Terminal Scaffolding:</div>
                        <div className="flex items-center justify-between gap-2 p-2 rounded bg-white/[0.03] border border-white/[0.06] text-xs text-amber-300">
                          <code>npx degit vinebdigital/apex3d-starter my-spatial-app</code>
                          <button
                            onClick={() => {
                              sound.playClick();
                              navigator.clipboard.writeText('npx degit vinebdigital/apex3d-starter my-spatial-app');
                              setCopiedCodeSnippet(true);
                              setTimeout(() => setCopiedCodeSnippet(false), 2000);
                            }}
                            className="text-[10px] uppercase font-bold text-zinc-400 hover:text-white shrink-0 px-2 py-0.5 rounded bg-white/[0.06]"
                          >
                            {copiedCodeSnippet ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                          <span className="text-zinc-500 block">Physics:</span>
                          <span className="text-zinc-200 font-bold">Rapier 3D Integrated</span>
                        </div>
                        <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                          <span className="text-zinc-500 block">Post-Processing:</span>
                          <span className="text-zinc-200 font-bold">Selective Bloom FX</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Surface 3: Shader Lab Visual */}
                  {currentSlide.visualType === 'shader_lab' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 border-b border-white/[0.06] pb-2">
                        <span className="text-purple-400 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3" />
                          <span>GLSL SHADER COMPILER</span>
                        </span>
                        <span>GPU MEMORY: 34MB</span>
                      </div>

                      <div className="p-3 rounded-xl bg-black/90 border border-white/[0.06] text-[11px] leading-relaxed text-purple-200/90 whitespace-pre-wrap max-h-56 overflow-y-auto scrollbar-thin">
{`// GLSL FRAGMENT SHADER: CHROMATIC DISPERSION
uniform float uTime;
uniform vec2 uMouseVelocity;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  float aberration = length(uMouseVelocity) * 0.045;
  float r = texture2D(tDiffuse, uv + vec2(aberration, 0.0)).r;
  float g = texture2D(tDiffuse, uv).g;
  float b = texture2D(tDiffuse, uv - vec2(aberration, 0.0)).b;
  gl_FragColor = vec4(r, g, b, 1.0);
}`}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                        <span>FPS Budget: 60.0 FPS</span>
                        <span className="text-emerald-400">Zero Jank Assured</span>
                      </div>
                    </div>
                  )}

                  {/* Surface 4: Commercial License Visual */}
                  {currentSlide.visualType === 'commercial_license' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 border-b border-white/[0.06] pb-2">
                        <span className="text-amber-400 flex items-center gap-1.5">
                          <Award className="w-3 h-3" />
                          <span>COMMERCIAL RIGHTS DISPATCH</span>
                        </span>
                        <span className="text-emerald-400">PERPETUAL INDEMNITY</span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-zinc-400">Licensee Hash:</span>
                          <span className="text-amber-300 font-bold font-mono">LIC-VIP-84K2-91Q7</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-zinc-400">Client Projects:</span>
                          <span className="text-white font-bold">Unlimited Client Deliverables</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-zinc-400">Legal Attribution:</span>
                          <span className="text-emerald-400 font-bold">100% White-Label (None)</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-zinc-400">Tax Deductible:</span>
                          <span className="text-zinc-200 font-bold">Official GST Invoice Provided</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-300 flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>Authorized for multi-client billing up to $20,000 / project</span>
                      </div>
                    </div>
                  )}

                  {/* Surface 5: VIP Drops Visual */}
                  {currentSlide.visualType === 'vip_drops' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 border-b border-white/[0.06] pb-2">
                        <span className="text-blue-400 flex items-center gap-1.5">
                          <Layers className="w-3 h-3" />
                          <span>VAULT PIPELINE ROADMAP</span>
                        </span>
                        <span className="text-zinc-400">UPDATED WEEKLY</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                          <div>
                            <span className="text-white font-bold block text-xs">Spatial Vision OS Glass Canvas</span>
                            <span className="text-[10px] text-zinc-500 font-mono">Scheduled Drop: Week 1</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30 font-mono">
                            Ready
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                          <div>
                            <span className="text-white font-bold block text-xs">Kinetic Typography 3D Marquee</span>
                            <span className="text-[10px] text-zinc-500 font-mono">Scheduled Drop: Week 2</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 font-mono">
                            Testing
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                          <div>
                            <span className="text-white font-bold block text-xs">Direct WhatsApp VIP Helpdesk</span>
                            <span className="text-[10px] text-zinc-500 font-mono">1-on-1 Prompt Debugging</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">
                            Included
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Surface 6: Zero Expiry Visual */}
                  {currentSlide.visualType === 'zero_expiry' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 border-b border-white/[0.06] pb-2">
                        <span className="text-amber-400 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          <span>EXPIRATION ENGINE TELEMETRY</span>
                        </span>
                        <span className="text-zinc-400">SESSION AUTH</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                          <span className="text-[10px] font-mono text-red-400 block uppercase">1-Day Sprint Pass</span>
                          <span className="text-sm font-bold text-white mt-1 block">Expires in ~22h</span>
                          <span className="text-[10px] text-zinc-400 mt-1 block">Account locked at expiry</span>
                        </div>

                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                          <span className="text-[10px] font-mono text-emerald-400 block uppercase">VIP Lifetime Pass</span>
                          <span className="text-sm font-bold text-white mt-1 block">PERMANENT ACCESS</span>
                          <span className="text-[10px] text-zinc-400 mt-1 block">Zero recurring fees</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[10px] text-zinc-400 leading-relaxed">
                        Your ₹49 sprint purchase is deducted in real-time. Single one-time investment of ₹2,999 gives you permanent ownership of the entire ecosystem.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 4. FOOTER CONTROLS & CHECKOUT TRIGGER MATRIX */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 border-t border-white/[0.08] bg-[#06060a] flex flex-wrap items-center justify-between gap-4">
          {/* Carousel Step Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.06] transition-colors"
                title="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleNext}
                className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.06] transition-colors"
                title="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Indicator Bars */}
            <div className="flex items-center gap-1.5">
              {UPGRADE_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectTab(i)}
                  className={`h-1 rounded-full transition-all ${
                    i === activeSlideIndex ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/20 hover:bg-white/40'
                  }`}
                  title={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline-block">
              {activeSlideIndex + 1} of {UPGRADE_SLIDES.length}
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white text-xs font-mono tracking-wider transition-colors border border-white/[0.06]"
            >
              Stay on 1-Day Pass
            </button>

            <button
              onClick={handlePrimaryUpgradeClick}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-[0_4px_25px_-5px_rgba(245,158,11,0.5)] active:scale-[0.98] flex items-center gap-2"
            >
              <span>Upgrade to VIP Lifetime (₹2,999)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
