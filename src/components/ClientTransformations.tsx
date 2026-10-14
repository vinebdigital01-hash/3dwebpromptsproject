import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Maximize2, Copy, Check, ArrowUpRight, Sparkles, X, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { sound } from '../lib/audioEngine';
import { CopyPromptLeadModal } from './CopyPromptLeadModal';

export interface TransformationItem {
  id: string;
  client: string;
  headline: string;
  subheadline: string;
  videoUrl: string;
  category: 'Enterprise AI & SaaS' | 'Spatial CAD & Hardware' | 'Global FinTech & Quant' | 'Avant-Garde Studio';
  contractValue: string;
  transformationStory: {
    before: string;
    after: string;
  };
  promptTechnique: string;
  techStack: string[];
  metrics: string[];
  featured?: boolean;
  accentColor: 'cobalt' | 'gold' | 'emerald';
  promptSnippet: string;
}

const TRANSFORMATIONS: TransformationItem[] = [
  {
    id: 'apple',
    client: 'Apple Watch Ultra 4',
    headline: 'Spatial Titanium Hardware Configurator',
    subheadline: 'Precision aerospace titanium surfacing with physically accurate anisotropic roughness & real-time CAD reflections.',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/a3ee62c8-c674-48a3-84a9-e8269eefd621.mp4',
    category: 'Spatial CAD & Hardware',
    contractValue: '$36,000 Client SOW',
    transformationStory: {
      before: 'Studio spent $18,000 on Cinema 4D pre-render server farms with static mp4 video loops that offered zero interactive user control.',
      after: 'Replaced with 60fps real-time client-side WebGL viewport generated in 15 minutes using Claude 3.7 with sub-12ms frame rendering.'
    },
    promptTechnique: 'Roughness-Mapped Anisotropic Metal & PBR Fresnel Environment',
    techStack: ['Three.js', 'React Three Fiber', 'GLSL Custom Shader', 'PBR Materials'],
    metrics: ['Zero Render Farm Cost', 'Locked 60fps WebGL', '+184% Time on Page'],
    featured: true,
    accentColor: 'gold',
    promptSnippet: `// Claude 3.7 System Prompt Excerpt: Spatial Titanium Precision
Create a production React Three Fiber canvas rendering an aerospace-grade titanium chassis.
- Material: MeshPhysicalMaterial with roughnessMap derived from procedural anisotropic brushed metal noise.
- Lighting: 3-point studio softbox setup + IBL HDRI environment map with dynamic Fresnel rim lighting (#F59E0B ambient rim).
- Interaction: Smooth dual-axis rotational dampening on pointer move with inertia (friction: 0.94).
- Target: Zero GC pauses, sub-12ms frame time budget.`
  },
  {
    id: 'dala',
    client: 'Dala',
    headline: 'Your workplace has the answer. Just ask Dala for it.',
    subheadline: 'Ambient knowledge intelligence engine with procedural volumetric fluid shaders and reactive neural node mesh.',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/3863f6a5-d963-4e26-ab94-4f5dae747954.mp4',
    category: 'Enterprise AI & SaaS',
    contractValue: '$24,500 Studio Fee',
    transformationStory: {
      before: 'Engineers struggled with 6 months of custom WebGL shader development, dropping frames on enterprise laptops.',
      after: 'Calibrated APEX3D prompt created an ultra-lightweight GPU fluid field running under 42KB gzip with 60fps responsiveness.'
    },
    promptTechnique: 'Procedural Volumetric Fluid Shader & Neural Node Mesh',
    techStack: ['WebGL 2.0', 'Fragment Shaders', 'Tailwind CSS', 'TypeScript'],
    metrics: ['42KB Gzip Footprint', '3.2x User Engagement', '0 Dropped Frames'],
    featured: true,
    accentColor: 'cobalt',
    promptSnippet: `// Claude 3.7 Prompt: Enterprise Ambient Fluid Intelligence
Generate a high-performance WebGL fragment shader representing living corporate intelligence.
- Raymarched volumetric density field reacting to ambient audio frequencies.
- Color matrix: Deep cobalt (#1D4ED8) into warm indigo (#4338CA) with crisp white energy crests.
- Interactive vortex suction on cursor hover with smooth spring decay.`
  },
  {
    id: 'wise',
    client: 'Wise',
    headline: 'Borderless Kinetic Liquidity Architecture',
    subheadline: 'High-frequency cross-border currency routing visualizer with kinetic velocity particles and dynamic curve extrusion.',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/6e6ad2ff-26c5-4fb6-90dc-ee4c3d596ca7.mp4',
    category: 'Global FinTech & Quant',
    contractValue: '$42,000 Enterprise Contract',
    transformationStory: {
      before: 'Static 2D SVG country charts caused heavy mobile DOM reflows and felt like traditional legacy banking.',
      after: 'Interactive multi-currency spatial globe simulation that lifted cross-border transfer conversions by +28%.'
    },
    promptTechnique: 'Kinetic Velocity Particles & Dynamic Curve Extrusion',
    techStack: ['Three.js Instancing', 'Geodesic Math', 'TypeScript', 'Web Workers'],
    metrics: ['+28% Transfer Conversion', '14 Global Currencies', 'Sub-40ms TTI'],
    accentColor: 'emerald',
    promptSnippet: `// Cursor Composer Prompt: High-Frequency Liquidity Routing
Build an instanced mesh of 10,000 currency transit packets along Bézier spline arcs connecting global financial capitals.
- GPU vertex extrusion with velocity-stretching and trail decay.
- Real-time exchange rate switcher mutating spline colors from emerald (#059669) to cobalt (#2563EB).`
  },
  {
    id: 'resend',
    client: 'Resend',
    headline: 'Dark Silicon Developer Infrastructure',
    subheadline: 'Developer-first email engine showcase with hardware-accelerated beam raymarching and monolithic dark glass prisms.',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/7b76f1c1-600b-444f-a1a1-c51c831ec51a.mp4',
    category: 'Enterprise AI & SaaS',
    contractValue: '$19,500 Launch Package',
    transformationStory: {
      before: 'Flat monospace terminal code snippets failed to convey the micro-second velocity of the underlying API.',
      after: 'Cinematic dark silicon beam visualizer went viral on X, bringing in 12,000 developer account signups on launch day.'
    },
    promptTechnique: 'Sub-Pixel Anti-Aliased Beam Raymarching & Glass Prisms',
    techStack: ['Raw WebGL', 'Custom Post-Processing', 'React 19', 'Next.js'],
    metrics: ['12,000 Launch Day Signups', 'Viral Product Demo', '0.4ms Render Time'],
    accentColor: 'cobalt',
    promptSnippet: `// Claude 3.7 Prompt: Dark Silicon Raymarched Laser Prism
Design an obsidian optical chamber where monochromatic laser beams penetrate tinted transmission glass prisms.
- Dispersion optics: Cauchy equation for chromatic light splitting.
- Tactile keyboard hotkeys: Press [Space] to fire a test API packet through the glass array.`
  },
  {
    id: 'monopo',
    client: 'monopo saigon',
    headline: 'Avant-Garde Kinetic Brand Portal',
    subheadline: 'Surreal multi-layer depth choreography with dual-axis mouse physics and chromatic dispersion passes.',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/a2f41146-9aef-429b-b606-91a852661960.mp4',
    category: 'Avant-Garde Studio',
    contractValue: '$28,000 Campaign Fee',
    transformationStory: {
      before: 'Design team spent 3 weeks prototyping in After Effects unable to translate complex fluid timing to production code.',
      after: 'Shipped production React component in 48 hours; won Awwwards Site of the Month with +140% inbound agency inquiries.'
    },
    promptTechnique: 'Dual-Axis Mouse Physics & Chromatic Dispersion Passes',
    techStack: ['React Three Fiber', 'PostProcessing', 'SmoothScroll', 'Tailwind'],
    metrics: ['Awwwards SOTM Winner', '+140% Retainer Rate', '100/100 Lighthouse Perf'],
    accentColor: 'gold',
    promptSnippet: `// Claude 3.7 Prompt: Kinetic Avant-Garde Portfolio Showreel
Create an interactive fluid spatial portal where high-res video textures drape over cloth simulation physics.
- Mouse momentum dragging with spring damping (stiffness: 180, damping: 14).
- Lens distortion shader with subtle barrel aberration at edges.`
  },
  {
    id: 'launchdarkly',
    client: 'LaunchDarkly',
    headline: 'Real-Time Feature Orchestration Control Plane',
    subheadline: 'Zero-latency edge toggle mesh with state machine morphing and live boolean switch geometries.',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/8b7c1764-b8c0-4d71-9b7e-6bd84bce04ad.mp4',
    category: 'Enterprise AI & SaaS',
    contractValue: '$31,000 Enterprise Retainer',
    transformationStory: {
      before: 'Abstract architecture slides bored executive enterprise buyers during 90-day procurement cycles.',
      after: 'Tangible interactive switch matrix compressed the enterprise sales cycle from 90 days down to 21 days.'
    },
    promptTechnique: 'State Machine Morphing & Live Boolean Switch Geometries',
    techStack: ['Three.js', 'State Machines (XState)', 'TypeScript', 'WebAudio'],
    metrics: ['76% Sales Cycle Compression', 'Tier-1 Enterprise POC', '99.999% Reliability'],
    accentColor: 'emerald',
    promptSnippet: `// Cursor Prompt: Interactive Feature Flag Matrix
Build a responsive 3D control board with 64 interactive toggle micro-switches.
- Real-time state change propagation across connected hexagonal nodes.
- Haptic click audio FX synthesized with Web Audio API osc.frequency.setValueAtTime.`
  },
  {
    id: 'auros',
    client: 'Auros',
    headline: 'Algorithmic High-Frequency Quantum Capital',
    subheadline: 'Institutional liquidity topology visualizer with GPU instanced vector fields and real-time buffer streaming.',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/ed2c729e-76ce-4ad0-bad8-c57d67247ec7.mp4',
    category: 'Global FinTech & Quant',
    contractValue: '$55,000 Institutional Mandate',
    transformationStory: {
      before: 'Hedge fund website looked like generic commodity crypto tables with static stock charts.',
      after: 'Delivered an institutional-grade mathematical topology in 4 days that helped secure sovereign wealth capital.'
    },
    promptTechnique: 'GPU Instanced Vector Fields & Real-Time Buffer Streaming',
    techStack: ['Raw WebGL 2', 'GPU Instancing', 'SIMD Math', 'WebSockets'],
    metrics: ['Sovereign Wealth Mandate', '0.2ms Shader Overhead', 'Zero Garbage Collection'],
    accentColor: 'cobalt',
    promptSnippet: `// Claude 3.7 Prompt: High-Frequency Algorithmic Capital Topology
Synthesize a real-time order-book depth topology surface using GPU vertex textures.
- Vector field streamlines indicating liquidity migration with zero garbage collection.
- Deep obsidian backdrop (#050508) with cobalt (#1D4ED8) depth contour ridges.`
  },
  {
    id: 'anchor-ai',
    client: 'Anchor AI',
    headline: 'Autonomous AI Orchestration & Agent Operations',
    subheadline: 'Multi-agent command center with real-time vector streaming, procedural neural node topology, and glass telemetry HUD.',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/designs/anchor-ai-landing.mp4',
    category: 'Enterprise AI & SaaS',
    contractValue: '$38,500 Enterprise SOW',
    transformationStory: {
      before: 'Standard enterprise landing page with generic static 2D vector illustrations and low developer conversion.',
      after: 'Hyper-tactile autonomous agent landing experience that boosted enterprise pipeline bookings by +210%.'
    },
    promptTechnique: 'Real-Time Vector Streaming & Glass Telemetry HUD',
    techStack: ['React 19', 'WebGL 2.0', 'Motion', 'Tailwind CSS'],
    metrics: ['+210% Pipeline Bookings', '60fps GPU Mesh', '0.2s First Contentful Paint'],
    featured: true,
    accentColor: 'cobalt',
    promptSnippet: `// Claude 3.7 Prompt: Autonomous Agent Operations Command Center
Create a high-velocity enterprise AI landing page featuring live vector streaming telemetry.
- Hero viewport: Floating glass control prisms with frosted refraction (#050508 base, #2563EB cobalt accents).
- Interaction: Dual-action tactile keyboard hotkeys with instant agent node dispatching.
- Target: Zero render delays, sub-16ms frame budget, and responsive typography.`
  },
  {
    id: 'alethia',
    client: 'Alethia AI',
    headline: 'Deep Reasoning Neural Synthesis Engine',
    subheadline: 'Cognitive reasoning model interface with hyper-dimensional vector lattices and real-time inference latency HUD.',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/designs/alethia-video.mp4',
    category: 'Enterprise AI & SaaS',
    contractValue: '$44,000 Studio Retainer',
    transformationStory: {
      before: 'Complex mathematical benchmark papers presented as static PDF links that enterprise executives ignored.',
      after: 'Turned reasoning benchmarks into an interactive neural synthesis playground; closed 3 Fortune 500 pilots in 30 days.'
    },
    promptTechnique: 'Hyper-Dimensional Vector Lattice & Latency HUD',
    techStack: ['Three.js', 'Custom Post-Processing', 'TypeScript', 'Web Workers'],
    metrics: ['3 Fortune 500 Pilots', '99.98% Inference Uptime', '3.8x Dwell Time'],
    featured: true,
    accentColor: 'emerald',
    promptSnippet: `// Cursor Prompt: Neural Reasoning Vector Synthesis
Synthesize a deep cognitive intelligence interface with dynamic token stream visualizers.
- GPU vertex lattice morphing based on model confidence scoring.
- Emerald accent luminescence (#10B981) against obsidian void (#040407).
- Interactive query console with live streaming token simulation.`
  },
  {
    id: 'geno-trace',
    client: 'Geno Trace',
    headline: 'Bio-Computational Genomic Sequencing Topology',
    subheadline: 'Precision genomic sequencing visualizer with 3D double-helix spatial coordinates, CRISPR target markers, and molecular raymarching.',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/Geno%20Trace.mp4',
    category: 'Spatial CAD & Hardware',
    contractValue: '$48,000 Life Sciences SOW',
    transformationStory: {
      before: 'Biotech lab relied on archaic academic 2D charts and static microscopic screenshots for venture fundraising.',
      after: 'Interactive 3D genomic sequencing topology secured $14M Series A oversubscribed round within 6 weeks.'
    },
    promptTechnique: 'Molecular Raymarching & CRISPR Coordinate Splines',
    techStack: ['Three.js InstancedMesh', 'GLSL Raymarching', 'WebAudio', 'React 19'],
    metrics: ['$14M Series A Secured', '120k DNA Base Pairs', 'Sub-8ms Render Loop'],
    featured: true,
    accentColor: 'gold',
    promptSnippet: `// Claude 3.7 Prompt: Precision Genomic Spatial Topology
Design an interactive 3D genomic exploration viewport with instanced nucleotide base pairs.
- Spatial helix coordinates with dynamic CRISPR target highlighting.
- Ambient warm gold lighting (#F59E0B) reflecting off molecular bonds.
- Smooth camera focal shifting on marker selection with kinetic inertia.`
  },
  {
    id: 'cyber-matrix-21',
    client: 'Apex Kinetic Matrix',
    headline: 'Spatial Cyber Kinetic Grid & Holographic Wireframe',
    subheadline: 'High-density holographic grid topology with animated reactive particle nodes and tactile spatial parallax depth.',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(21).webp',
    category: 'Avant-Garde Studio',
    contractValue: '$32,000 Creative Fee',
    transformationStory: {
      before: 'Client landing page had flat static stock imagery that felt generic and failed to convert enterprise tech leads.',
      after: 'Integrated animated holographic cyber matrix with sub-millisecond responsiveness, lifting conversion rate by +175%.'
    },
    promptTechnique: 'Animated Holographic Wireframe & Reactive Grid Drift',
    techStack: ['CSS 3D Engine', 'GSAP ScrollTrigger', 'SVG Matrix', 'React 19'],
    metrics: ['+175% Lead Conversion', 'Zero CPU Stutter', 'Sub-50KB Asset Footprint'],
    accentColor: 'cobalt',
    promptSnippet: `// Claude 3.7 Prompt: Holographic Cyber Matrix Hero Architecture
Generate a high-density cybernetic wireframe grid with multi-axis perspective parallax.
- Floating telemetry badges with live ping counters and coordinate coordinates.
- Cobalt grid lines (#1D4ED8) with subtle ambient light falloff.
- Smooth scroll-linked camera translation using GSAP ScrollTrigger.`
  },
  {
    id: 'quantum-obsidian-20',
    client: 'Quantum Obsidian',
    headline: 'Dark Obsidian Quantum Particle Hologram',
    subheadline: 'Volumetric dark glass diffraction with quantum light dispersion and multi-tier spatial parallax depth.',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(20).webp',
    category: 'Spatial CAD & Hardware',
    contractValue: '$39,000 Enterprise Package',
    transformationStory: {
      before: 'Hardware client was using static 3D renders that looked flat on dark mode mobile devices.',
      after: 'Created dark obsidian quantum dispersion experience that won Awwwards Developer Award and +320% social shares.'
    },
    promptTechnique: 'Volumetric Obsidian Diffraction & Quantum Dispersion',
    techStack: ['WebGL Shaders', 'PBR Glass', 'Motion', 'Tailwind CSS'],
    metrics: ['Awwwards Dev Award', '+320% Social Shares', '60fps Mobile Performance'],
    accentColor: 'gold',
    promptSnippet: `// Cursor Prompt: Volumetric Obsidian Particle Hologram
Build an ultra-luxurious dark obsidian refractive viewport with quantum light scattering.
- Glass transmission shader with spectral Cauchy dispersion along rim edges.
- Deep emerald and gold ambient accents (#059669 / #D97706).
- Gyroscope & cursor tilt responsiveness with dampened spring physics.`
  }
];

type CategoryFilter = 'All' | 'Enterprise AI & SaaS' | 'Spatial CAD & Hardware' | 'Global FinTech & Quant' | 'Avant-Garde Studio';

interface ClientTransformationsProps {
  onUnlockClick: () => void;
}

// Fisher-Yates array shuffle to randomize client transformation deliverables across sessions
function shuffleArray<T>(array: readonly T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const ClientTransformations: React.FC<ClientTransformationsProps> = ({ onUnlockClick }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [activeModalItem, setActiveModalItem] = useState<TransformationItem | null>(null);
  const [copyLeadItem, setCopyLeadItem] = useState<TransformationItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pull content from shuffled array preventing the same deliverable from always appearing first
  const shuffledTransformations = useMemo(() => shuffleArray(TRANSFORMATIONS), []);

  const filteredItems = useMemo(() => {
    return activeCategory === 'All'
      ? shuffledTransformations
      : shuffledTransformations.filter(item => item.category === activeCategory);
  }, [activeCategory, shuffledTransformations]);

  const handleCopyPrompt = (item: TransformationItem) => {
    sound.playClick();
    setCopyLeadItem(item);
  };

  return (
    <section id="transformations" className="relative py-24 sm:py-32 px-6 sm:px-10 lg:px-16 bg-[#050508] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400 uppercase tracking-widest mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Real-World Proof of Work · {shuffledTransformations.length} Client Case Studies</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Client Transformations. <span className="accent-text-gradient font-display italic font-normal">Command $15k–$55k</span> Per Build.
            </h2>
            <p className="text-sm sm:text-base text-white/60 max-w-2xl font-sans">
              Watch real-world deliverables shipped using our 500+ calibrated prompt vault. Hover any card to trigger cinematic playback and inspect the exact prompt syntax.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                sound.playClick();
                onUnlockClick();
              }}
              className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Unlock 500+ Prompts</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filter Bar (Functional interactive buttons per frontend design) */}
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-2">
          {(['All', 'Enterprise AI & SaaS', 'Spatial CAD & Hardware', 'Global FinTech & Quant', 'Avant-Garde Studio'] as CategoryFilter[]).map((cat) => {
            const count = cat === 'All' ? shuffledTransformations.length : shuffledTransformations.filter(t => t.category === cat).length;
            const isActive = activeCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => {
                  sound.playClick();
                  setActiveCategory(cat);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5'
                }`}
              >
                {cat} <span className="ml-1 text-[11px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Balanced, Perfectly Aligned 3-Column Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {filteredItems.map((item) => {
            return (
              <TransformationCard
                key={item.id}
                item={item}
                onInspect={() => {
                  sound.playClick();
                  setActiveModalItem(item);
                }}
                onUnlock={onUnlockClick}
              />
            );
          })}
        </div>
      </div>

      {/* Cinematic Modal for Deep Inspection */}
      <AnimatePresence>
        {activeModalItem && (
          <TransformationModal
            item={activeModalItem}
            isCopied={copiedId === activeModalItem.id}
            onCopy={() => handleCopyPrompt(activeModalItem)}
            onClose={() => setActiveModalItem(null)}
            onUnlock={() => {
              setActiveModalItem(null);
              onUnlockClick();
            }}
          />
        )}
      </AnimatePresence>

      {/* Copy Prompt Syntax Lead Capture Verification Modal */}
      <CopyPromptLeadModal
        isOpen={!!copyLeadItem}
        promptSnippet={copyLeadItem?.promptSnippet || ''}
        clientTitle={copyLeadItem ? `${copyLeadItem.client} (${copyLeadItem.headline})` : undefined}
        onClose={() => setCopyLeadItem(null)}
        onSuccessRedirect={() => {
          if (copyLeadItem) {
            setCopiedId(copyLeadItem.id);
            setTimeout(() => setCopiedId(null), 3000);
          }
          setCopyLeadItem(null);
          setActiveModalItem(null);
          onUnlockClick();
        }}
      />
    </section>
  );
};

// ==========================================
// Individual Transformation Card Component
// ==========================================
interface TransformationCardProps {
  item: TransformationItem;
  onInspect: () => void;
  onUnlock: () => void;
}

const TransformationCard: React.FC<TransformationCardProps> = ({
  item,
  onInspect,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const isImageMedia = item.videoUrl.toLowerCase().endsWith('.webp') || item.videoUrl.toLowerCase().endsWith('.png') || item.videoUrl.toLowerCase().endsWith('.gif');

  // Border accents according to user requirements: subtle, premium thick borders, non-neon
  const borderClass = item.accentColor === 'gold'
    ? 'border-2 border-amber-600/30 hover:border-amber-500/80'
    : item.accentColor === 'emerald'
    ? 'border-2 border-emerald-600/30 hover:border-emerald-500/80'
    : 'border-2 border-blue-600/30 hover:border-blue-500/80';

  const badgeTextColor = item.accentColor === 'gold'
    ? 'text-amber-400'
    : item.accentColor === 'emerald'
    ? 'text-emerald-400'
    : 'text-blue-400';

  // IntersectionObserver for viewport auto-play & scroll-out auto-pause:
  // Gracefully auto-plays muted video when scrolled into view, pauses when scrolled away or scrolled up
  useEffect(() => {
    const cardEl = cardRef.current;
    if (!cardEl || isImageMedia) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            if (videoRef.current && videoRef.current.paused) {
              const playPromise = videoRef.current.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => setIsPlaying(true))
                  .catch(() => {});
              }
            }
          } else if (!entry.isIntersecting || entry.intersectionRatio < 0.2) {
            if (videoRef.current && !videoRef.current.paused) {
              videoRef.current.pause();
              setIsPlaying(false);
            }
          }
        });
      },
      { threshold: [0.15, 0.35] }
    );

    observer.observe(cardEl);
    return () => observer.disconnect();
  }, [isImageMedia]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    sound.playHover();
    if (!isImageMedia && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    } else if (isImageMedia) {
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!isImageMedia && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else if (isImageMedia) {
      setIsPlaying(false);
    }
  };

  const togglePlayback = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (isImageMedia) {
      setIsPlaying(!isPlaying);
      return;
    }
    if (videoRef.current) {
      if (videoRef.current.paused) {
        sound.playClick();
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(() => {});
        }
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 1;
      setProgress((current / duration) * 100);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`h-full group relative rounded-2xl bg-[#090910] ${borderClass} transition-all duration-300 flex flex-col justify-between overflow-hidden will-change-transform transform-gpu touch-pan-y`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Top Video / Animated Media Container */}
      <div
        className="relative aspect-video w-full bg-black overflow-hidden cursor-pointer select-none shrink-0"
        onClick={togglePlayback}
      >
        {isImageMedia ? (
          <img
            src={item.videoUrl}
            alt={item.headline}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <video
            ref={videoRef}
            src={item.videoUrl}
            playsInline
            muted
            loop
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}

        {/* Subtle Bottom Scrim only for progress scrubber readability */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        {/* Video Scrubber Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-10 pointer-events-none">
          <div
            className={`h-full transition-all duration-100 ${
              item.accentColor === 'gold'
                ? 'bg-amber-500'
                : item.accentColor === 'emerald'
                ? 'bg-emerald-500'
                : 'bg-blue-600'
            }`}
            style={{ width: isImageMedia ? (isHovered || isPlaying ? '100%' : '0%') : `${progress}%` }}
          />
        </div>

        {/* Top Floating Info: Client Name & Commercial Fee (Clean, minimal, non-intrusive) */}
        <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 right-2.5 sm:right-3 flex items-center justify-between gap-2 text-xs z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-white/15 truncate max-w-[60%]">
            <span className="font-semibold text-white text-[11px] sm:text-xs tracking-wide truncate">{item.client}</span>
          </div>

          <div className="bg-black/75 backdrop-blur-md px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-white/15 font-mono text-[10px] sm:text-[11px] font-bold text-white shrink-0">
            <span className={badgeTextColor}>{item.contractValue}</span>
          </div>
        </div>

        {/* Center Hover & Touch Trigger Indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300">
          {!isPlaying && (
            <button
              onClick={togglePlayback}
              className="w-12 h-12 rounded-full bg-black/75 backdrop-blur-md border border-white/25 flex items-center justify-center text-white transition-all duration-300 pointer-events-auto shadow-xl hover:scale-105 active:scale-95"
              title="Play Preview"
            >
              {isImageMedia ? (
                <Sparkles className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </button>
          )}
        </div>

        {/* Bottom Pill: Click to Inspect (visible on mobile touch, hover on desktop) */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInspect();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/80 hover:bg-black text-white text-[10px] sm:text-[11px] font-mono border border-white/20 transition-all opacity-90 hover:opacity-100 shadow-md active:scale-95 backdrop-blur-sm"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Inspect</span>
          </button>
        </div>
      </div>

      {/* Card Content & Story */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Clean unboxed metadata with typographic separators (anti-slop rule) */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/50 mb-2 font-mono">
            <span className="text-white/75 truncate">{item.category}</span>
            <span className="text-white/25 font-sans" aria-hidden="true">•</span>
            <span>{item.techStack[0]}</span>
            <span className="text-white/25 font-sans" aria-hidden="true">•</span>
            <span className={badgeTextColor}>Verified SOW</span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white mb-2 leading-snug group-hover:text-blue-300 transition-colors line-clamp-2 min-h-[3.25rem]">
            {item.headline}
          </h3>

          <p className="text-xs sm:text-sm text-white/60 mb-4 line-clamp-2 leading-relaxed font-sans min-h-[2.5rem]">
            {item.subheadline}
          </p>

          {/* Before & After Agency Story Breakdown */}
          <div className="p-3 rounded-lg bg-black/40 border border-white/5 mb-4 space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <span className="font-mono text-[10px] uppercase font-bold text-red-400 shrink-0 pt-0.5">Before:</span>
              <p className="text-white/60 text-[11px] leading-tight line-clamp-2">{item.transformationStory.before}</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-mono text-[10px] uppercase font-bold text-emerald-400 shrink-0 pt-0.5">After:</span>
              <p className="text-white/80 text-[11px] leading-tight font-medium line-clamp-2">{item.transformationStory.after}</p>
            </div>
          </div>
        </div>

        {/* Footer Metrics & Inspect Button */}
        <div className="mt-auto">
          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-white/50 font-mono mb-4 border-t border-white/5 pt-3 min-h-[1.75rem]">
            {item.metrics.map((m, mIdx) => (
              <span key={mIdx} className="flex items-center gap-1 text-white/70">
                <span className="w-1 h-1 rounded-full bg-white/40" />
                {m}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onInspect}
              className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-1.5 active:scale-95 border border-white/10"
            >
              <span>Inspect Prompt Architecture</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Cinematic Deep Dive Modal Component
// ==========================================
interface TransformationModalProps {
  item: TransformationItem;
  isCopied: boolean;
  onCopy: () => void;
  onClose: () => void;
  onUnlock: () => void;
}

const TransformationModal: React.FC<TransformationModalProps> = ({
  item,
  isCopied,
  onCopy,
  onClose,
  onUnlock,
}) => {
  const [isModalMuted, setIsModalMuted] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-10 select-none">
      {/* Click outside backdrop with lightweight, performant blur */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={() => {
          sound.playClick();
          onClose();
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl bg-[#0b0b14] border-2 border-white/15 rounded-3xl overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white/70 hover:text-white border border-white/15 transition-all"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable Container for Video + Details */}
        <div className="overflow-y-auto w-full">
          {/* High-Res Video / Animated Showcase Area */}
          <div className="relative aspect-video w-full bg-black shrink-0 max-h-[48vh]">
            {item.videoUrl.toLowerCase().endsWith('.webp') ? (
              <img
                src={item.videoUrl}
                alt={item.headline}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={item.videoUrl}
                autoPlay
                loop
                playsInline
                muted={isModalMuted}
                className="w-full h-full object-cover"
              />
            )}

            {/* Sound Toggle (only for video formats) */}
            {!item.videoUrl.toLowerCase().endsWith('.webp') && (
              <button
                onClick={() => setIsModalMuted(!isModalMuted)}
                className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md text-white text-xs font-mono border border-white/15 hover:bg-black transition-all"
              >
                {isModalMuted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Muted Preview</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Audio Active</span>
                  </>
                )}
              </button>
            )}

            <div className="absolute top-4 left-4 z-20 bg-black/70 backdrop-blur-md px-3 py-1 rounded-md border border-white/15 text-xs font-mono text-white">
              <span className="font-bold">{item.client}</span> · {item.contractValue}
            </div>
          </div>

          {/* Transformation Dossier & Prompt Inspector */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <div className="text-xs font-mono text-blue-400 mb-1">{item.category}</div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">{item.headline}</h3>
                <p className="text-sm text-white/60">{item.subheadline}</p>
              </div>

              <div className="shrink-0 text-left sm:text-right">
                <div className="text-xs font-mono text-white/40">Verified Agency Fee</div>
                <div className="text-2xl font-bold text-amber-400 font-mono">{item.contractValue}</div>
              </div>
            </div>

            {/* Transformation Impact Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20">
                <div className="text-xs font-mono text-red-400 uppercase font-bold mb-2">Previous Client Bottleneck</div>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">{item.transformationStory.before}</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                <div className="text-xs font-mono text-emerald-400 uppercase font-bold mb-2">After APEX3D Prompt Bundle</div>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium">{item.transformationStory.after}</p>
              </div>
            </div>

            {/* Exact Prompt Syntax Inspector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-white/60 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Calibrated Claude 3.7 & Cursor Prompt Snippet</span>
                </div>
                <button
                  onClick={onCopy}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-medium transition-all active:scale-95"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-white" />
                      <span>Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-white" />
                      <span>Copy Prompt Syntax</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-xl bg-black/80 border border-white/10 p-4 font-mono text-xs text-blue-200/90 overflow-x-auto leading-relaxed">
                <pre>{item.promptSnippet}</pre>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-white/50 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Full commercial license included with VIP All-Access</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    sound.playClick();
                    onClose();
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-full text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  Close Inspector
                </button>
                <button
                  onClick={onUnlock}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>Unlock All 500+ Prompts</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
