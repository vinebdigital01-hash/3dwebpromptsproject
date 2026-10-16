export interface VaultItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Cyber & Agency' | 'Luxury' | 'E-Commerce' | 'Minimalist' | 'Advanced 3D' | 'Design Systems' | 'High-Ticket' | 'Agency Ops' | 'FinTech' | 'Spatial OS';
  filterGroup: 'Luxury Brands' | 'High-Ticket Agency' | 'E-Commerce 3D' | 'Spatial & WebGL' | 'AI Agents & Systems' | 'Design Systems';
  clientValue: string;
  testedModels: string[];
  tokens: number;
  highlightStat: string;
  description: string;
  tags: string[];
  promptArchitecture: string;
  keyFeatures: string[];
  videoUrl: string;
  poster: string;
  fpsBadge: string;
}

export const VAULT_CATALOG: VaultItem[] = [
  {
    id: 'hazmat-cyber',
    title: 'Hazmat Cybersecurity Master 3D Prompt',
    subtitle: 'Reactive WebGL Shield & Threat Grid Architecture',
    category: 'Cyber & Agency',
    filterGroup: 'High-Ticket Agency',
    clientValue: '$14,500',
    testedModels: ['Claude 3.7 Sonnet', 'Cursor Agent', 'ChatGPT o3'],
    tokens: 2840,
    highlightStat: '14.2x Agency Markup',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/7b76f1c1-600b-444f-a1a1-c51c831ec51a.mp4',
    poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1400&auto=format&fit=crop&q=80',
    fpsBadge: '60 FPS WEBGL',
    description: 'Deploys an interactive 3D threat detection core with particle breach vectors, real-time audio-reactive GLSL displacement, and mouse-parallax HUD overlays.',
    tags: ['WebGL 60FPS', 'GLSL Shaders', 'Three.js BufferGeometry'],
    keyFeatures: [
      'Interactive reactive particle containment field with 12,000 instanced vertices',
      'Dynamic breach pulse shader with custom chromatic aberration on mouse velocity',
      'HUD telemetry overlay with auto-calibrating camera orbit angles',
      'Production-tested bundle includes TypeScript + React 19 + Tailwind architecture'
    ],
    promptArchitecture: `Act as a Principal 3D Creative Technologist (Awwwards Site of the Year).
Build a production-ready, dark-mode Cybersecurity Enterprise Hero experience in React + Three.js + Tailwind CSS.

TECHNICAL CORE REQUIREMENTS:
1. THREE.JS VIEWPORT:
   - Create an instanced particle dodecahedron core surrounded by dual floating counter-rotating ring lattices.
   - Implement custom vertex shaders with Simplex noise displacement driven by (position + time * 0.4).
   - Mouse velocity must dynamically expand the threat containment radius and tint vertices from Electric Royal Blue (#3B82F6) to Alert Crimson (#FF0055).
2. PERFORMANCE:
   - Cap draw calls to < 18 using InstancedMesh and shared BufferGeometry.
   - Maintain strict 60 FPS on 1440p and mobile viewports with devicePixelRatio clamping.
3. DOM LAYER:
   - Layer floating telemetry readout with SVG radar sweeping lines and live latency pings.
   - Primary magnetic CTA with glassmorphic backing and glowing border sweep.`
  },
  {
    id: 'luxury-watchmaker',
    title: 'Luxury Watchmaker 3D One-Shot (Rolex/Audemars style)',
    subtitle: 'Photorealistic Chronograph Turntable with Physical Shaders',
    category: 'Luxury',
    filterGroup: 'Luxury Brands',
    clientValue: '$18,000',
    testedModels: ['Claude 3.7 Sonnet', 'ChatGPT o3-mini', 'Cursor'],
    tokens: 3120,
    highlightStat: '4.9/5 Client Rating',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/a3ee62c8-c674-48a3-84a9-e8269eefd621.mp4',
    poster: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1400&auto=format&fit=crop&q=80',
    fpsBadge: 'PBR TITANIUM 60FPS',
    description: 'Precision horology showcase featuring anisotropic brushed titanium textures, sapphire crystal refraction, ticking complication gear movements, and smooth camera angle switching.',
    tags: ['PBR Materials', 'Sapphire Glass', 'Ray-Traced Reflections'],
    keyFeatures: [
      'Multi-angle studio lighting: warm key light, titanium rim light, and soft overhead softbox',
      'Mechanical complication animation tied to high-precision performance.now() timestamps',
      'Dynamic strap material switcher: Oystersteel, Brushed Rose Gold, and Matte Rubber',
      'Exploded caseback view triggered on user scroll or camera focus click'
    ],
    promptArchitecture: `Generate an ultra-luxury interactive 3D Timepiece Showcase component for a Swiss horology house.
STACK: React 19, Three.js, Lucide Icons, Tailwind CSS.

KEY VISUAL SPECIFICATIONS:
- Watch Case: CylinderGeometry with beveled edges using MeshPhysicalMaterial (metalness: 0.95, roughness: 0.15, clearcoat: 1.0, clearcoatRoughness: 0.1).
- Bezel: Fluted ring geometry with anisotropic specular highlights.
- Sapphire Crystal: Double-dome mesh with transmission: 0.98, ior: 1.77, thickness: 1.2, chromaticAberration: 0.04.
- Hands: Chronograph second hand sweeping smoothly at 28,800 vph (8 ticks per second).
- Interaction: OrbitControls with polar angle clamping (30° to 105°) and smooth inertia damping (0.05).`
  },
  {
    id: 'nike-next-gen',
    title: 'Nike Next-Gen 3D Interactive Showcase',
    subtitle: 'Kinetic Footwear Exploded-View & Cushion Deform Engine',
    category: 'E-Commerce',
    filterGroup: 'E-Commerce 3D',
    clientValue: '$12,500',
    testedModels: ['Claude 3.7 Sonnet', 'Cursor', 'v0'],
    tokens: 2450,
    highlightStat: '11.8% Checkout Lift',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(22).webp',
    poster: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&auto=format&fit=crop&q=80',
    fpsBadge: 'KINETIC PHYSICS 60FPS',
    description: 'High-energy footwear visualizer with air-bubble spring deformation, colorway switching without reload, and exploded foam layer inspection.',
    tags: ['Kinetic Physics', 'Colorway Engine', 'Mobile 60FPS'],
    keyFeatures: [
      'Spring-damper physics on sole impact when dragged or scrubbed',
      'Instant colorway state selector (Triple Black, Neon Volt, Infrared Cyber)',
      'Exploded layer button showing carbon fiber plate, ZoomX foam, and knit upper',
      'Direct integration with high-conversion sticky Add to Bag drawer'
    ],
    promptArchitecture: `Build a cutting-edge athletic sneaker 3D product visualizer in React & Three.js.
Include dynamic sole deformation upon hover, exploded anatomy breakdown with annotation pins, and real-time palette swapping. Ensure 60 FPS mobile touch response and full keyboard accessibility.`
  },
  {
    id: 'chanel-fluid',
    title: 'Chanel No. 5 Glass & Fluid 3D Experience',
    subtitle: 'Refractive Amber Liquid & Chromatic Dispersion Shader',
    category: 'Luxury',
    filterGroup: 'Luxury Brands',
    clientValue: '$16,000',
    testedModels: ['Claude 3.7 Sonnet', 'ChatGPT o3'],
    tokens: 2690,
    highlightStat: '$16,000 Paid Client',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/3863f6a5-d963-4e26-ab94-4f5dae747954.mp4',
    poster: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&auto=format&fit=crop&q=80',
    fpsBadge: 'RAY-TRACED FLUID',
    description: 'Haute couture fragrance visualizer with real-time sloshing amber fluid physics inside an emerald-cut glass bottle with optical caustics.',
    tags: ['Glass Refraction', 'Fluid Dynamics', 'Optical Caustics'],
    keyFeatures: [
      'High index-of-refraction glass bottle with faceted emerald-cut edges',
      'Procedural liquid slosh physics responding to mouse drag acceleration',
      'Volumetric golden dust particle suspension inside the bottle',
      'Editorial typography layer with delicate serif headings and minimalist cues'
    ],
    promptArchitecture: `Construct a bespoke haute parfumerie 3D experience with optical glass refraction and procedural liquid dynamics in Three.js and React. Liquid must slosh with momentum matching mouse velocity and settle with realistic surface tension damping.`
  },
  {
    id: 'hypercar-configurator',
    title: 'Hypercar Bespoke 3D Studio Configurator',
    subtitle: 'Carbon Fiber Weave & Aerodynamic Wind Tunnel Particle Stream',
    category: 'Luxury',
    filterGroup: 'Luxury Brands',
    clientValue: '$28,000',
    testedModels: ['Claude 3.7 Sonnet', 'Cursor Agent', 'ChatGPT o3'],
    tokens: 3450,
    highlightStat: 'Client Deposit: $14,000',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(21).webp',
    poster: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&auto=format&fit=crop&q=80',
    fpsBadge: 'AERODYNAMIC PBR',
    description: 'Ultra-high-end automotive configurator featuring multi-coat metallic pearlescent paint, procedural carbon fiber normal mapping, and real-time wind tunnel smoke trails.',
    tags: ['Automotive 3D', 'Procedural Carbon', 'Aerodynamic Physics'],
    keyFeatures: [
      'Custom Clearcoat GLSL shader with microscopic metallic flake sparkle',
      'Toggleable wind tunnel particle streamline simulation reacting to bodywork geometry',
      'Interior 360 cockpit inspection with Alcantara stitching and illuminated dashboard',
      'Export high-res PDF client build summary with pricing calculator'
    ],
    promptArchitecture: `Generate an enterprise-grade 3D Automotive Configurator for an exotic hypercar manufacturer.
Include real-time PBR material paint swapping (Pearlescent Pearl, British Racing Green, Stealth Carbon), active aerodynamics flap animation, and particle smoke trails illustrating drag coefficients.`
  },
  {
    id: 'cartier-diamond-brilliance',
    title: 'Cartier High-Jewelry Diamond Brilliance 3D',
    subtitle: 'Ray-Traced Spectral Dispersion & Facet Sparkle Engine',
    category: 'Luxury',
    filterGroup: 'Luxury Brands',
    clientValue: '$19,500',
    testedModels: ['Claude 3.7 Sonnet', 'Cursor'],
    tokens: 3100,
    highlightStat: 'Sold to Swiss Jeweler',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/designs/alethia-video.mp4',
    poster: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1400&auto=format&fit=crop&q=80',
    fpsBadge: 'SPECTRAL DISPERSION',
    description: 'Bespoke diamond jewelry showcase calculating internal light reflections, spectral chromatic fire, and 58-facet brilliant-cut refractive sparkle.',
    tags: ['Diamond Shaders', 'Spectral Dispersion', 'Haute Joaillerie'],
    keyFeatures: [
      'Internal ray-bounce approximation creating rainbow dispersion flares',
      'Platinum 950 and 18K Yellow Gold prong mounting with brushed metal textures',
      'Pinch-to-zoom macro inspection revealing laser-inscribed serial authentication',
      'Curated audio cues mimicking gentle crystal resonance on rotation'
    ],
    promptArchitecture: `Architect a photorealistic 3D Diamond Solitaire Ring viewer with custom WebGL internal refraction shaders. Light entering facets must split into chromatic rainbow beams with bloom intensity tied to camera angle.`
  },
  {
    id: 'apple-espana',
    title: 'Apple España Spatial Architecture Design System',
    subtitle: 'VisionOS Glassmorphism & Depth-Layered Web Framework',
    category: 'Spatial OS',
    filterGroup: 'Spatial & WebGL',
    clientValue: '$22,000',
    testedModels: ['Claude 3.7 Sonnet', 'Cursor', 'Antigravity'],
    tokens: 2280,
    highlightStat: 'Awwwards Nominee',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(23).webp',
    poster: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&auto=format&fit=crop&q=80',
    fpsBadge: 'VISIONOS SPATIAL',
    description: 'Ultra-refined spatial interface framework with dynamic frosted glass material tiers, specular edge lighting, and depth-based z-index parallax.',
    tags: ['VisionOS UI', 'Frosted Specular', 'Depth Parallax'],
    keyFeatures: [
      'Tier-1, Tier-2, and Tier-3 Apple VisionOS backdrop glass formulas',
      'Specular highlight tracking user pointer across every UI tile boundary',
      'Spatial depth stack with 3D card tilt and spring transforms',
      'Modular component library for navigation bars, cards, tabs, and modals'
    ],
    promptArchitecture: `Architect an Apple VisionOS-inspired spatial design system in React 19 and Tailwind CSS.
Implement specular border highlights that reflect pointer coordinates, multi-tier backdrop blur depths, and fluid spring animations.`
  },
  {
    id: 'fintech-liquidity-pool',
    title: 'Institutional FinTech 3D Liquidity Order Book',
    subtitle: 'Real-Time WebGL Depth Mountain & High-Frequency Volume Mesh',
    category: 'FinTech',
    filterGroup: 'High-Ticket Agency',
    clientValue: '$24,000',
    testedModels: ['Claude 3.7 Sonnet', 'Cursor', 'ChatGPT o3'],
    tokens: 3350,
    highlightStat: 'Billed to Hedge Fund',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/6e6ad2ff-26c5-4fb6-90dc-ee4c3d596ca7.mp4',
    poster: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1400&auto=format&fit=crop&q=80',
    fpsBadge: 'SUB-12MS LIQUIDITY',
    description: 'Wall Street institutional trading visualizer transforming live order book bids and asks into a real-time undulating 3D topographic mesh with millisecond telemetry.',
    tags: ['FinTech 3D', 'WebGL Topography', 'Real-Time WebSockets'],
    keyFeatures: [
      'Continuous 3D bid/ask depth wall with color-graded liquidity density gradients',
      'Real-time WebSocket simulation pushing 50 updates per second without frame drops',
      'Interactive crosshair slice displaying cumulative bid volume and slippage estimates',
      'Dark obsidian UI with high-contrast emerald and crimson execution markers'
    ],
    promptArchitecture: `Create an institutional quantitative trading terminal featuring an interactive 3D Order Book Depth Mountain in Three.js and React. Vertex heights must morph smoothly based on simulated order flow.`
  },
  {
    id: 'quantum-defense-core',
    title: 'Autonomous Defense & Quantum Server Core 3D',
    subtitle: 'Encrypted Node Constellation & Satellite Telemetry Mesh',
    category: 'Cyber & Agency',
    filterGroup: 'High-Ticket Agency',
    clientValue: '$32,000',
    testedModels: ['Claude 3.7 Sonnet', 'Cursor Agent'],
    tokens: 3600,
    highlightStat: 'Closed $32k Enterprise',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/8b7c1764-b8c0-4d71-9b7e-6bd84bce04ad.mp4',
    poster: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1400&auto=format&fit=crop&q=80',
    fpsBadge: 'ORBITAL TELEMETRY',
    description: 'Enterprise cybersecurity fortress featuring an interactive 3D globe with orbital satellites, real-time cyberattack threat trajectories, and hardware telemetry readouts.',
    tags: ['Defense Tech', 'Orbital Globe', 'Shader Displacement'],
    keyFeatures: [
      'Geo-located 3D globe with glowing Bezier curve attack arcs connecting threat nodes',
      'Real-time packet inspection HUD with animated hex dumping and biometric scanlines',
      'Interactive drilldown into subterranean quantum server rack clusters',
      'High-contrast military aesthetic with phosphor green and tactical slate hues'
    ],
    promptArchitecture: `Develop an enterprise Autonomous Cyber Defense WebGL command console in React and Three.js. Render a wireframe earth with orbital defense nodes and animated attack telemetry ribbons.`
  },
  {
    id: 'rayban-spatial-glasses',
    title: 'Ray-Ban Meta Spatial Glasses 3D Showcase',
    subtitle: 'Smart Frame Turntable, HUD Projection & Acoustic Wave Engine',
    category: 'E-Commerce',
    filterGroup: 'E-Commerce 3D',
    clientValue: '$15,800',
    testedModels: ['Claude 3.7 Sonnet', 'Cursor'],
    tokens: 2850,
    highlightStat: '18% DTC Conversion Jump',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/51cb9ee2-498c-4f7f-8567-bf1bfe649987.mp4',
    poster: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1400&auto=format&fit=crop&q=80',
    fpsBadge: 'WEARABLE 3D CAD',
    description: 'Next-generation wearable visualizer demonstrating smart audio speaker chambers, dual ultra-wide camera lenses, and heads-up display projection cones.',
    tags: ['Wearables 3D', 'Lens Refraction', 'Micro-Acoustic Waves'],
    keyFeatures: [
      'Polarized lens tint transition based on ambient lighting toggle (Indoor / Bright Sunlight)',
      'Exploded temple hinge showing micro-battery and open-ear speaker drivers',
      'Interactive AR projection cone showing field-of-view capture area',
      'One-click prescription and frame color customizer'
    ],
    promptArchitecture: `Build a cutting-edge 3D product showcase for smart AI audio glasses in React + Three.js. Include exploded frame breakdown, soundwave emitter animation, and lens transmission toggles.`
  },
  {
    id: 'mechanical-keyboard-3d',
    title: 'Custom Mechanical Keyboard 3D Switch Soundboard',
    subtitle: 'Interactive Keycap Customizer & Realistic Audio Thock Synthesizer',
    category: 'E-Commerce',
    filterGroup: 'E-Commerce 3D',
    clientValue: '$11,500',
    testedModels: ['Claude 3.7 Sonnet', 'v0', 'Cursor'],
    tokens: 2600,
    highlightStat: '9.4x ROI for Creator Store',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(22).webp',
    poster: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1400&auto=format&fit=crop&q=80',
    fpsBadge: 'AUDIO-REACTIVE 60FPS',
    description: 'E-commerce visualizer for enthusiast mechanical keyboards featuring per-key RGB illumination, switch stem exploded views, and realistic Web Audio sound playback on keypress.',
    tags: ['Keycap PBR', 'Web Audio API', 'Interactive Keypress'],
    keyFeatures: [
      'Full 75% ANSI layout where typing on physical keyboard triggers 3D key depression',
      'Dynamic switch tester toggling Linear (Cream), Tactile (Holy Panda), and Clicky (Blue)',
      'Aluminum anodization color switcher with brass weight accent reflection',
      'Export custom layout JSON for instant manufacturing ordering'
    ],
    promptArchitecture: `Construct a 3D Mechanical Keyboard configurator in Three.js and React. Map physical keyboard inputs to 3D key animations with realistic mechanical acoustics synthesized via Web Audio API.`
  },
  {
    id: '3d-character-studio',
    title: '3D Character Studio & Mouse-Scrub Video Engine',
    subtitle: 'Interactive Canvas Video-Scrubbing & 3D Rig Sync',
    category: 'Advanced 3D',
    filterGroup: 'Spatial & WebGL',
    clientValue: '$11,200',
    testedModels: ['Claude 3.7 Sonnet', 'Cursor'],
    tokens: 2950,
    highlightStat: '60 FPS Scrubbing',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/a2f41146-9aef-429b-b606-91a852661960.mp4',
    poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=80',
    fpsBadge: 'CANVAS SCRUB 60FPS',
    description: 'Syncs high-resolution video frames or 3D skeletal rig rotations directly with user scroll position and mouse velocity without frame drops.',
    tags: ['Video-Scrub', 'ScrollSync', 'Skeletal Rig'],
    keyFeatures: [
      'Pre-cached canvas frame buffer ensuring zero micro-stutters during high-speed scrubbing',
      'Dual-mode fallback: seamless Canvas frame playback or WebGL 3D bone rotation',
      'Dynamic speed interpolation with cubic-bezier smoothing',
      'Step-by-step agency guide on exporting Blender animations for web delivery'
    ],
    promptArchitecture: `Develop a 60 FPS mouse-scrub and scroll-synced 3D character engine in React and TypeScript. Buffer high-performance canvas frames and interpolate timeline positions with smooth inertia.`
  },
  {
    id: 'dental-clinic-3d',
    title: 'High-Conversion 3D Dental Clinic System',
    subtitle: 'Interactive 3D Smile Simulator & High-Ticket Booking Flow',
    category: 'High-Ticket',
    filterGroup: 'High-Ticket Agency',
    clientValue: '$13,000',
    testedModels: ['Claude 3.7 Sonnet', 'Cursor'],
    tokens: 2750,
    highlightStat: '3.4x Booking Rate',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/Geno%20Trace.mp4',
    poster: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1400&auto=format&fit=crop&q=80',
    fpsBadge: '3D DENTAL SIMULATOR',
    description: 'Turnkey website system for cosmetic dental clinics featuring an interactive 3D teeth model, before-and-after smile slider, and conversion booking funnels.',
    tags: ['Medical 3D', 'High-Ticket B2B', 'Lead Funnel'],
    keyFeatures: [
      'Interactive 3D dental arch with clickable tooth quadrant inspection',
      'Veneers and whitening shade comparison toggle (A1 to B4 Vita shades)',
      'Automated qualification questionnaire capturing high-ticket patient leads',
      'Sold to local cosmetic clinics for $10,000 - $18,000 per setup'
    ],
    promptArchitecture: `Build a premium medical/dental clinic booking web app featuring an interactive 3D dental arch with quadrant highlighting and dynamic treatment consultation lead flow.`
  },
  {
    id: 'shopify-3d-exp',
    title: 'High-Conversion 3D Shopify Experience',
    subtitle: 'Headless Three.js Storefront with 360 Product Inspection',
    category: 'E-Commerce',
    filterGroup: 'E-Commerce 3D',
    clientValue: '$14,000',
    testedModels: ['Claude 3.7 Sonnet', 'Cursor', 'ChatGPT o3'],
    tokens: 2890,
    highlightStat: '+24% AOV Increase',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/51cb9ee2-498c-4f7f-8567-bf1bfe649987.mp4',
    poster: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1400&auto=format&fit=crop&q=80',
    fpsBadge: 'SHOPIFY HEADLESS',
    description: 'Headless e-commerce architecture pairing Three.js 360-degree rotation, exploded parts inspection, and instant Shopify cart dispatch.',
    tags: ['Shopify Headless', 'Cart API', '360 Turntable'],
    keyFeatures: [
      'Universal product viewer handling GLTF models and procedural fallbacks',
      'Direct Shopify Storefront API cart integration with optimistic updates',
      'Variant selection updating 3D textures in real time with zero flicker',
      'Mobile-optimized touch gestures with automatic pinch-to-zoom clamping'
    ],
    promptArchitecture: `Create a headless e-commerce 3D product experience with real-time 360 turntable inspection, variant material switching, and animated cart drawer slide-out.`
  },
  {
    id: 'voice-ai-outreach',
    title: 'Voice AI Agent Prompt + Client Outreach Pack',
    subtitle: 'Cold Outreach Templates & Pitch Decks That Close $10k Clients',
    category: 'Agency Ops',
    filterGroup: 'AI Agents & Systems',
    clientValue: '$25,000+',
    testedModels: ['Claude 3.7 Sonnet', 'ChatGPT o3', 'Human Closing'],
    tokens: 3600,
    highlightStat: '42% Meeting Rate',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/designs/anchor-ai-landing.mp4',
    poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&auto=format&fit=crop&q=80',
    fpsBadge: 'AGENCY PITCH ENGINE',
    description: 'Battle-tested cold email scripts, LinkedIn outreach sequences, and agency closing pitch decks used to secure 5-figure 3D web design retainers.',
    tags: ['Client Acquisition', 'Cold Email', 'Proposal Decks'],
    keyFeatures: [
      '14 personalized Loom video pitch scripts highlighting client 2D website flaws',
      'Proposal template with line-item 3D deliverables and payment milestones',
      'Commercial contract templates with revision caps and copyright transfer',
      'Step-by-step guide to finding high-ticket e-commerce and luxury brands'
    ],
    promptArchitecture: `Generate an agency client acquisition cold outreach sequence and video pitch script tailored for pitching $12,000 3D website redesigns to DTC brand founders.`
  },
  {
    id: '2000-design-systems',
    title: '2,000 AI-Readable Web Design Systems Repository',
    subtitle: 'Comprehensive Prompt Token & Color Harmony Repository',
    category: 'Design Systems',
    filterGroup: 'Design Systems',
    clientValue: '$15,000',
    testedModels: ['Claude 3.7 Sonnet', 'Cursor Agent', 'ChatGPT o3', 'v0'],
    tokens: 4200,
    highlightStat: '2,000 Systems Included',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(23).webp',
    poster: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1400&auto=format&fit=crop&q=80',
    fpsBadge: 'DESIGN TOKENS REPO',
    description: 'Curated library of 2,000 prompt formulas specifying exact hex tokens, typographic hierarchies, spring curves, and spacing math for instant AI generation.',
    tags: ['Design Tokens', 'Design Hierarchy', 'Multi-Industry'],
    keyFeatures: [
      'Covers SaaS, FinTech, Luxury E-Commerce, Web3, MedTech, and Hospitality',
      'Pre-formatted for direct copy-paste into Claude, Cursor, v0, and ChatGPT',
      'Includes Tailwind config JSON and CSS custom variable presets',
      'Eliminates generic AI slop with strict zero-pill rules and typographic discipline'
    ],
    promptArchitecture: `Provide a master design system specification prompt that outputs a production-grade UI design system across tokens, typography, grid math, and micro-interactions.`
  },
  {
    id: 'liquid-viscosity-shader',
    title: 'High-Viscosity Procedural Liquid & Mercury Shader',
    subtitle: 'Real-Time Surface Tension & Chromatic Sheen Physics',
    category: 'Advanced 3D',
    filterGroup: 'Spatial & WebGL',
    clientValue: '$16,500',
    testedModels: ['Claude 3.7 Sonnet', 'Cursor'],
    tokens: 3100,
    highlightStat: '60 FPS on iOS/Android',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/ed2c729e-76ce-4ad0-bad8-c57d67247ec7.mp4',
    poster: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=1400&auto=format&fit=crop&q=80',
    fpsBadge: 'MERCURY RAYMARCHING',
    description: 'Metaball-inspired liquid mercury shader with cursor inertia wake, iridescent specular sheen, and procedural droplet coalescence.',
    tags: ['Mercury Shader', 'Liquid Physics', 'GLSL Fragment'],
    keyFeatures: [
      'Real-time raymarching fragment shader running smoothly on mobile GPUs',
      'Mouse inertia wake leaves ripple trails that damp smoothly over time',
      'Custom color grading: Liquid Mercury, Bioluminescent Ocean, Rose Gold Lava',
      'Drop-in React component with zero external heavy physics engines required'
    ],
    promptArchitecture: `Code a custom GLSL liquid mercury shader in React Three Fiber that responds dynamically to pointer coordinates and scrolling velocity.`
  },
  {
    id: 'holographic-cardiology-heart',
    title: 'Surgical Cardiology 3D Holographic Heart Simulator',
    subtitle: 'Pulsing Ventricle Physics & Interactive Medical Stent Deployment',
    category: 'High-Ticket',
    filterGroup: 'High-Ticket Agency',
    clientValue: '$21,000',
    testedModels: ['Claude 3.7 Sonnet', 'Cursor Agent'],
    tokens: 3200,
    highlightStat: 'Billed to Biotech Firm',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/Geno%20Trace.mp4',
    poster: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=1400&auto=format&fit=crop&q=80',
    fpsBadge: 'BIOMEDICAL 3D',
    description: 'Interactive anatomical cardiology visualizer with real-time heartbeat contractions, transparent myocardium tissue inspection, and catheter stent simulation.',
    tags: ['Medical Hologram', 'Anatomical 3D', 'Biotech SaaS'],
    keyFeatures: [
      'Anatomically accurate 4-chamber heart with rhythmic pulse deformation',
      'Cross-section slider exposing internal valves and oxygenated blood flow vectors',
      'Catheter navigation step-by-step interactive patient consultation flow',
      'Contracted by private cardiology surgical group for $21,000'
    ],
    promptArchitecture: `Build an interactive 3D Medical Cardiology simulator in Three.js and React. Feature a rhythmic beating heart with procedural vertex shaders and cross-sectional valve inspection.`
  },
  {
    id: 'hermes-leather-craft',
    title: 'Hermès Leather Stitching & Micro-Texture Inspector',
    subtitle: 'Macro Zoom PBR Texture & Saddle Stitching Craftsmanship',
    category: 'Luxury',
    filterGroup: 'Luxury Brands',
    clientValue: '$17,000',
    testedModels: ['Claude 3.7 Sonnet', 'ChatGPT o3'],
    tokens: 2900,
    highlightStat: 'Awwwards Mobile Nominee',
    videoUrl: 'https://images.refero.design/styles/refero.design/video/a3ee62c8-c674-48a3-84a9-e8269eefd621.mp4',
    poster: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1400&auto=format&fit=crop&q=80',
    fpsBadge: 'LEATHER PBR GRAIN',
    description: 'Ultra-luxury leather goods showcase revealing individual saddle stitch thread tensions, natural leather grain pore normal maps, and gold foil stamping.',
    tags: ['Leather PBR', 'Saddle Stitch', 'Macro Inspection'],
    keyFeatures: [
      'Microscopic normal map detailing Togo and Epsom leather pebble textures',
      'Thread angle displacement modeling traditional two-needle French saddle stitch',
      'Foil stamping metallic shader with micro-embossing depth under grazing light',
      'Seamless 360 degree turntable with soft luxury studio environment map'
    ],
    promptArchitecture: `Architect an ultra-luxury 3D Leather Goods product inspection viewport with Three.js. Render photorealistic Togo leather grain with grazing light reflections and gold foil foil-emboss shaders.`
  },
  {
    id: 'retainer-closing-framework',
    title: '$15,000 Agency Retainer Closing Deck & Loom Framework',
    subtitle: 'Turnkey Client Acquisition Scripts, Objections & Proposals',
    category: 'Agency Ops',
    filterGroup: 'AI Agents & Systems',
    clientValue: '$30,000+',
    testedModels: ['Claude 3.7 Sonnet', 'Human Agency Closing'],
    tokens: 4100,
    highlightStat: 'Over $480,000 Closed',
    videoUrl: 'https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/designs/anchor-ai-landing.mp4',
    poster: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1400&auto=format&fit=crop&q=80',
    fpsBadge: 'HIGH-TICKET SOW',
    description: 'The exact battle-tested sales pitch scripts, contract clauses, and video audit framework that transformed $2k freelance developers into $15k agency owners.',
    tags: ['Sales Scripts', 'Proposal Decks', 'Contract Templates'],
    keyFeatures: [
      'Step-by-step Loom script diagnosing slow 2D websites and pitching 3D transformations',
      '8-page Notion proposal template with tier pricing ($8,500, $15,000, $25,000)',
      'Legal contract protection guaranteeing 50% deposit and zero revision creep',
      'Reseller agreement documentation permitting turnkey handover to other creators'
    ],
    promptArchitecture: `Generate a high-ticket agency sales script and proposal deck for pitching $15,000 3D website redesigns to DTC and B2B SaaS founders.`
  }
];

export const TESTIMONIALS = [
  {
    name: 'Marcus Vance',
    role: 'Founder, Vance Digital (London)',
    revenue: '$28,500 closed in 30 days',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    quote: 'We copied the Luxury Watchmaker prompt from the 500+ vault, adapted it for a Swiss jewelry client, and invoiced $18,000. It took 3 days instead of 3 weeks. APEX 3D paid for itself 18x over on our first project.'
  },
  {
    name: 'Elena Rostova',
    role: 'Lead Creative Tech, Studio Kroma (Berlin)',
    revenue: '3x Awwwards SOTD Nominee',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    quote: 'The 500+ prompts do not just generate code; they generate clean, 60 FPS Three.js shaders that pass strict QA. Having access to over 500+ production prompts makes our clients think we hired a 5-person WebGL team.'
  },
  {
    name: 'Devon Miller',
    role: 'Solo Web Designer (Austin, TX)',
    revenue: 'From $2k static sites to $14.5k retainers',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    quote: 'I used to charge $2k for static Webflow sites. After searching the 500+ prompt database and plugging in the Cyberpunk Hazmat prompt for a local security firm, I pitched $14,500 and they wired the 50% deposit same-day.'
  },
  {
    name: 'Aarav Patel',
    role: 'Creative Director, Apex India (Mumbai)',
    revenue: '₹14,50,000 Billed in 45 Days',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    quote: 'The lifetime VIP pass at ₹2,999 is unreal value. 500+ prompts with full commercial and reseller rights allowed our agency to deliver turnkey 3D portfolios to luxury brands across Mumbai, Dubai, and Singapore.'
  },
  {
    name: 'Farhan Siddiqui',
    role: 'Co-Founder, Nexus Interactive (Dubai)',
    revenue: '$34,000 Invoiced in Q1',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    quote: 'Deploying the Surgical Cardiology and Spatial CAD blueprints from the 500+ vault allowed us to pitch enterprise health-tech clients with working WebGL demos in under 24 hours. The closing rate skyrocketed.'
  },
  {
    name: 'Liam Chen',
    role: 'Design Engineer, Studio Kinetix (Singapore)',
    revenue: '$19,200 Monthly Retainer',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    quote: 'Having prompt syntax tailored for Claude 3.7 Sonnet saves us 40 hours per client build. Shading, physics, and canvas resizing are handled without tedious trial-and-error.'
  }
];

export const FAQS = [
  {
    q: 'How many prompts are included in the APEX 3D Vault?',
    a: 'We have over 500+ master prompts in the vault, spanning luxury horology, cybersecurity, 3D e-commerce configurators, Apple VisionOS spatial interfaces, WebGL particle physics, medical/dental 3D apps, and high-converting client pitch decks. All 500+ prompts are production-verified and updated weekly for models like Claude 3.7 Sonnet and Cursor.'
  },
  {
    q: 'Do I need to know 3D modeling or Blender?',
    a: 'No! Every prompt is 100% code-driven for React, Next.js, and Three.js. The prompts generate procedural geometries, physically-based materials, custom GLSL shaders, and responsive canvas viewports without requiring Blender modeling skills.'
  },
  {
    q: 'Which AI models support these prompts?',
    a: 'All prompts are rigorously tested and optimized for Claude 3.7 Sonnet, Cursor Agent, ChatGPT o3 / o3-mini, Antigravity, and v0. Each prompt card specifies the highest-performing model recommendation.'
  },
  {
    q: 'Can I use these to build websites for paying clients or resell them?',
    a: 'Yes! Every single plan — ₹49 (1-Day), ₹299 (1-Month), ₹699 (6-Month), and ₹2,999 (Lifetime) — includes Personal License, Commercial Agency License, AND Reseller License! You can deploy for clients, resell turnkey deliverables, and keep 100% of the profits with zero royalties.'
  },
  {
    q: 'What are the daily prompt copy limits for each plan?',
    a: 'The ₹49 1-Day Sprint allows 1 prompt copy per day from the 500+ vault. The ₹299 1-Month Plan allows 3 prompt copies per day plus lifetime updates. The ₹699 6-Month Plan allows 15 prompt copies per day plus lifetime updates. The ₹2,999 Lifetime VIP allows unlimited prompt copies across all 500+ prompts and lifetime updates forever.'
  },
  {
    q: 'How do I access the vault files after purchase?',
    a: 'Immediately upon checkout completion, you receive instant access to the APEX3D Member Dashboard, direct Google Drive download mirror, and GitHub private repository invitation containing all 500+ source code blueprints and documentation.'
  },
  {
    q: 'What is your refund policy?',
    a: 'Due to the instant digital delivery and proprietary intellectual property of the prompt architecture, code templates, and production design systems, all sales are strictly final and non-refundable. Once checkout is completed, full access to our private GitHub mirrors, direct Google Drive repos, and copy-paste syntax across all 500+ prompts is immediately and irreversibly provisioned.'
  },
  {
    q: 'Do I get future prompt updates?',
    a: 'Yes! The ₹299 (1-Month), ₹699 (6-Month), and ₹2,999 (Lifetime) plans all include lifetime updates with zero renewal fees. You receive all weekly prompt drops, model calibrations, and new shader packs added to our growing 500+ archive forever.'
  }
];
