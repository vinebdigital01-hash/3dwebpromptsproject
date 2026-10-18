const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Paths
const logoPath = path.resolve('public/wb-logo.png');
const outputPdfPath = path.resolve('public/30_Production_3D_WebGL_Prompts_VineB.pdf');
const assetsDir = path.resolve('public/pdf-assets');

// Setup Document: A4 size (595.28 x 841.89 points)
const doc = new PDFDocument({
  size: 'A4',
  margin: 32,
  autoFirstPage: false,
  bufferPages: true,
  info: {
    Title: '3D WebGL Production Blueprint Repository — Vine B Digital',
    Author: 'Vine B Digital (vinebdigital.store)',
    Subject: 'Free Production 3D WebGL Prompt Architectures',
    Keywords: 'Three.js, WebGL, React 19, Claude 3.7 Sonnet, Cursor, AI Prompts',
    CreationDate: new Date()
  }
});

const writeStream = fs.createWriteStream(outputPdfPath);
doc.pipe(writeStream);

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 32;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2; // 531.28

// Premium Dark Obsidian Palette (Matching website)
const COLOR_BG = '#06070a';
const COLOR_SURFACE = '#0f111a';
const COLOR_SURFACE_HOVER = '#161926';
const COLOR_BORDER = '#202436';
const COLOR_BORDER_SUBTLE = '#181b29';
const COLOR_ACCENT = '#38bdf8';      // Sky Cyan (matches WB logo)
const COLOR_ACCENT_GREEN = '#10b981';// Emerald Green
const COLOR_TEXT = '#f8fafc';        // Pure white
const COLOR_TEXT_MUTED = '#94a3b8';  // Slate 400
const COLOR_TEXT_DIM = '#64748b';    // Slate 500
const COLOR_CODE_BG = '#090a12';
const COLOR_AMBER = '#f59e0b';

function drawBackground(pageDoc) {
  pageDoc.save();
  // Deep obsidian background
  pageDoc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(COLOR_BG);
  // Refined top cyan accent highlight bar
  pageDoc.rect(0, 0, PAGE_WIDTH, 2.5).fill(COLOR_ACCENT);
  pageDoc.restore();
}

function drawHeader(pageDoc) {
  pageDoc.save();
  const headerY = 16;
  // WB Logo top-left (Clickable link to store)
  if (fs.existsSync(logoPath)) {
    pageDoc.image(logoPath, MARGIN, headerY, { fit: [26, 26] });
    pageDoc.link(MARGIN, headerY, 26, 26, 'https://vinebdigital.store');
  }

  // Header Title
  pageDoc.fillColor(COLOR_TEXT).font('Helvetica-Bold').fontSize(9);
  pageDoc.text('VINE B DIGITAL', MARGIN + 32, headerY + 2);
  pageDoc.fillColor(COLOR_TEXT_DIM).font('Helvetica').fontSize(7.5);
  pageDoc.text('// 3D WebGL Production Blueprint Repository • Free Edition', MARGIN + 32, headerY + 13);

  // Top Right Portal Launch Pill
  const portalBtnW = 126;
  const portalBtnH = 20;
  const portalBtnX = PAGE_WIDTH - MARGIN - portalBtnW;
  pageDoc.roundedRect(portalBtnX, headerY + 2, portalBtnW, portalBtnH, 4).fill(COLOR_SURFACE);
  pageDoc.roundedRect(portalBtnX, headerY + 2, portalBtnW, portalBtnH, 4).stroke(COLOR_BORDER);
  pageDoc.fillColor(COLOR_ACCENT).font('Helvetica-Bold').fontSize(7.5);
  pageDoc.text('⚡ Studio Portal Access →', portalBtnX + 8, headerY + 7);
  pageDoc.link(portalBtnX, headerY + 2, portalBtnW, portalBtnH, 'https://vinebdigital.store/#portal');

  // Hairline separator
  pageDoc.rect(MARGIN, 48, CONTENT_WIDTH, 0.5).fill(COLOR_BORDER_SUBTLE);
  pageDoc.restore();
}

function drawFooter(pageDoc, pageNumber, totalPages) {
  pageDoc.save();
  const footY = PAGE_HEIGHT - 32;
  pageDoc.rect(MARGIN, footY, CONTENT_WIDTH, 0.5).fill(COLOR_BORDER_SUBTLE);

  // Logo link in footer
  pageDoc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_ACCENT);
  pageDoc.text('vinebdigital.store', MARGIN, footY + 8, {
    link: 'https://vinebdigital.store'
  });
  pageDoc.link(MARGIN, footY + 6, 80, 14, 'https://vinebdigital.store');

  pageDoc.font('Helvetica').fontSize(7.5).fillColor(COLOR_TEXT_DIM);
  pageDoc.text('Official Commercial Schemas • Calibrated for Claude 3.7 & Cursor', MARGIN + 88, footY + 8);

  const pageStr = `Page ${pageNumber} of ${totalPages}`;
  pageDoc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_TEXT_MUTED);
  pageDoc.text(pageStr, PAGE_WIDTH - MARGIN - pageDoc.widthOfString(pageStr), footY + 8);
  pageDoc.restore();
}

// ==========================================
// PAGE 1: EXECUTIVE COVER & ARCHITECTURE MANIFESTO
// ==========================================
doc.addPage();
drawBackground(doc);

// Prominent Centered WB Logo
if (fs.existsSync(logoPath)) {
  const logoSize = 68;
  const logoX = (PAGE_WIDTH - logoSize) / 2;
  const logoY = 48;
  doc.image(logoPath, logoX, logoY, { fit: [logoSize, logoSize] });
  doc.link(logoX, logoY, logoSize, logoSize, 'https://vinebdigital.store');

  doc.font('Helvetica').fontSize(8).fillColor(COLOR_ACCENT);
  const clickHint = '▲ Click Logo to visit official storefront: vinebdigital.store';
  doc.text(clickHint, (PAGE_WIDTH - doc.widthOfString(clickHint)) / 2, logoY + logoSize + 8, {
    link: 'https://vinebdigital.store'
  });
  doc.link((PAGE_WIDTH - doc.widthOfString(clickHint)) / 2, logoY + logoSize + 6, doc.widthOfString(clickHint), 12, 'https://vinebdigital.store');
}

// Main Title Block
const titleY = 142;
doc.font('Helvetica-Bold').fontSize(21).fillColor(COLOR_TEXT);
const coverTitle = '3D WEBGL & SPATIAL MASTER PROMPTS';
doc.text(coverTitle, (PAGE_WIDTH - doc.widthOfString(coverTitle)) / 2, titleY);

doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR_ACCENT);
const coverSub = 'OFFICIAL PRODUCTION STARTER ARCHIVE // 100% UNLOCKED FREE SCHEMAS';
doc.text(coverSub, (PAGE_WIDTH - doc.widthOfString(coverSub)) / 2, titleY + 26);

// 4 Feature Badges Row
const pillRowY = titleY + 50;
const coverBadges = [
  'Claude 3.7 Sonnet Calibrated',
  'Cursor & ChatGPT o3-mini',
  '60 FPS Frame Budget',
  'Zero External 3D Models'
];
let pillX = MARGIN + 4;
coverBadges.forEach(b => {
  doc.font('Helvetica-Bold').fontSize(7.5);
  const bw = doc.widthOfString(b) + 14;
  doc.roundedRect(pillX, pillRowY, bw, 18, 9).fill(COLOR_SURFACE);
  doc.roundedRect(pillX, pillRowY, bw, 18, 9).stroke(COLOR_BORDER);
  doc.fillColor(COLOR_TEXT).text(b, pillX + 7, pillRowY + 5);
  pillX += bw + 8;
});

// Architecture Overview Card
const overY = pillRowY + 30;
const overH = 175;
doc.save();
doc.roundedRect(MARGIN, overY, CONTENT_WIDTH, overH, 8).fill(COLOR_SURFACE);
doc.roundedRect(MARGIN, overY, CONTENT_WIDTH, overH, 8).stroke(COLOR_BORDER);

doc.font('Helvetica-Bold').fontSize(10.5).fillColor(COLOR_TEXT);
doc.text('THE ONE-SHOT CREATIVE TECHNOLOGIST SPECIFICATION', MARGIN + 16, overY + 16);

doc.font('Helvetica').fontSize(8.5).fillColor(COLOR_TEXT_MUTED);
const overText = `Welcome to the official Vine B Digital 3D WebGL starter collection. Most AI prompts fail to generate usable 3D web code because they lack strict memory boundaries, fail to allocate instanced vertex buffers, or introduce sluggish physics loops.

Every blueprint in this repository is calibrated with deterministic constraints:
- 60 FPS RequestAnimationFrame throttling with delta-time compensation
- Instanced BufferGeometry eliminating draw-call overhead on mobile GPUs
- Mathematical GLSL Simplex Noise displacing vertices without external .GLTF/.OBJ dependencies
- Strict cleanup & dispose cycles on unmount to prevent browser memory leaks.

Use these prompts unmodified in Claude 3.7 Sonnet, Cursor Composer, or ChatGPT o3 to generate award-winning spatial web experiences in a single shot.`;
doc.text(overText, MARGIN + 16, overY + 34, { width: CONTENT_WIDTH - 32, lineGap: 3.5 });

// Interactive CTA inside Card
const ctaY = overY + 130;
doc.roundedRect(MARGIN + 16, ctaY, CONTENT_WIDTH - 32, 32, 6).fill('#1d4ed8');
doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#ffffff');
const ctaText = '⚡ OPEN INTERACTIVE STUDIO PORTAL (ONE-CLICK PROMPT COPY) →';
doc.text(ctaText, (PAGE_WIDTH - doc.widthOfString(ctaText)) / 2, ctaY + 11);
doc.link(MARGIN + 16, ctaY, CONTENT_WIDTH - 32, 32, 'https://vinebdigital.store/#portal');
doc.restore();

// 3-Step Execution Workflow Cards (Cleanly distributed to fill page naturally)
const flowY = overY + overH + 18;
doc.font('Helvetica-Bold').fontSize(10.5).fillColor(COLOR_TEXT);
doc.text('HOW TO EXECUTE THESE PRODUCTION PROMPTS:', MARGIN, flowY);

const executionSteps = [
  {
    num: '01',
    title: 'Select Component & Copy Full Architecture',
    desc: 'Review the 3 unlocked production blueprints on pages 2-4. Copy the complete prompt directly from this PDF or click the green button to open it inside the Studio Portal.'
  },
  {
    num: '02',
    title: 'Paste into Claude 3.7 Sonnet or Cursor Agent',
    desc: 'Create a new React 19 + Tailwind project. Paste the prompt unmodified into your agent. The blueprint forces the AI to output self-contained, compile-ready Three.js code.'
  },
  {
    num: '03',
    title: 'Deploy Production Experience to Vercel',
    desc: 'Run `npm run build` and ship. Your deployment delivers responsive 60 FPS interactive 3D motion physics that top creative agencies bill at $14,000 to $28,000+ per engagement.'
  }
];

let curStepY = flowY + 18;
executionSteps.forEach(s => {
  doc.save();
  const sh = 48;
  doc.roundedRect(MARGIN, curStepY, CONTENT_WIDTH, sh, 6).fill(COLOR_SURFACE);
  doc.roundedRect(MARGIN, curStepY, CONTENT_WIDTH, sh, 6).stroke(COLOR_BORDER);

  // Number Badge
  doc.roundedRect(MARGIN + 10, curStepY + 10, 28, 28, 4).fill(COLOR_CODE_BG);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR_ACCENT);
  doc.text(s.num, MARGIN + 16, curStepY + 18);

  // Title & Desc
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR_TEXT);
  doc.text(s.title, MARGIN + 46, curStepY + 10);

  doc.font('Helvetica').fontSize(7.5).fillColor(COLOR_TEXT_MUTED);
  doc.text(s.desc, MARGIN + 46, curStepY + 23, { width: CONTENT_WIDTH - 58, lineGap: 2 });
  doc.restore();
  curStepY += sh + 8;
});

// Trust Micro-Banner at bottom
const trustY = curStepY + 4;
doc.save();
doc.roundedRect(MARGIN, trustY, CONTENT_WIDTH, 26, 4).fill('#0c1322');
doc.roundedRect(MARGIN, trustY, CONTENT_WIDTH, 26, 4).stroke('#1e3a8a');
doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#60a5fa');
const trustStr = '✓ Official Authenticated Release • Verified Zero-Hallucination Schemas • Reseller Rights Included';
doc.text(trustStr, (PAGE_WIDTH - doc.widthOfString(trustStr)) / 2, trustY + 9);
doc.restore();

drawFooter(doc, 1, 5);


// ==========================================
// HELPER TO RENDER A FLAWLESS PROMPT PAGE
// ==========================================
function renderPromptPage({
  pageNumber,
  schemaNumber,
  title,
  subtitle,
  category,
  clientValue,
  tokens,
  highlightStat,
  techStack,
  imageName,
  portalPromptId,
  videoUrl,
  featureOverview,
  promptText,
  proTip
}) {
  doc.addPage();
  drawBackground(doc);
  drawHeader(doc);

  let py = 58;

  // Eyebrow Row: Schema # + Status
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_ACCENT);
  doc.text(`UNLOCKED PRODUCTION BLUEPRINT // ${schemaNumber}`, MARGIN, py);
  
  const freeBadge = '✓ 100% UNLOCKED FREE SAMPLE';
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_ACCENT_GREEN);
  doc.text(freeBadge, PAGE_WIDTH - MARGIN - doc.widthOfString(freeBadge), py);
  py += 14;

  // Title
  doc.font('Helvetica-Bold').fontSize(14).fillColor(COLOR_TEXT);
  doc.text(title, MARGIN, py);
  py += 17;

  // Subtitle
  doc.font('Helvetica').fontSize(8.5).fillColor(COLOR_TEXT_MUTED);
  doc.text(`${subtitle} • Category: ${category}`, MARGIN, py);
  py += 14;

  // Spec Badges Row
  const specs = [
    `Client Value: ${clientValue}`,
    `Tokens: ${tokens}`,
    highlightStat,
    techStack,
    'Claude 3.7 & Cursor'
  ];
  let sbX = MARGIN;
  specs.forEach(s => {
    doc.font('Helvetica-Bold').fontSize(7);
    const sw = doc.widthOfString(s) + 10;
    doc.roundedRect(sbX, py, sw, 15, 3).fill(COLOR_SURFACE);
    doc.roundedRect(sbX, py, sw, 15, 3).stroke(COLOR_BORDER);
    doc.fillColor(COLOR_ACCENT).text(s, sbX + 5, py + 4);
    sbX += sw + 5;
  });
  py += 22;

  // Media & Actions Row (Tight 85px box, zero awkward gaps)
  const mediaH = 88;
  doc.save();
  doc.roundedRect(MARGIN, py, CONTENT_WIDTH, mediaH, 6).fill(COLOR_SURFACE);
  doc.roundedRect(MARGIN, py, CONTENT_WIDTH, mediaH, 6).stroke(COLOR_BORDER);

  // Embed image
  const imgPath = path.join(assetsDir, imageName);
  if (fs.existsSync(imgPath)) {
    doc.image(imgPath, MARGIN + 6, py + 6, { fit: [120, 76] });
  }

  // Right details in Media Box
  const rX = MARGIN + 136;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR_TEXT);
  doc.text('Component Architecture & Live Preview', rX, py + 8);

  doc.font('Helvetica').fontSize(7.5).fillColor(COLOR_TEXT_MUTED);
  doc.text(featureOverview, rX, py + 22, { width: CONTENT_WIDTH - 146, lineGap: 2 });

  // Action Buttons inside Media Box
  const btnY = py + 52;
  const storeUrl = `https://vinebdigital.store/#portal?prompt=${portalPromptId}`;

  // Button 1: Open in Portal
  const btn1W = 160;
  doc.roundedRect(rX, btnY, btn1W, 26, 4).fill(COLOR_ACCENT_GREEN);
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#000000');
  doc.text('⚡ Open & Copy in Studio Portal', rX + 10, btnY + 8);
  doc.link(rX, btnY, btn1W, 26, storeUrl);

  // Button 2: Watch Video Reel
  const btn2W = 145;
  const btn2X = rX + btn1W + 10;
  doc.roundedRect(btn2X, btnY, btn2W, 26, 4).fill('#2563eb');
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff');
  doc.text('▶ Watch 60FPS Video Reel', btn2X + 12, btnY + 8);
  doc.link(btn2X, btnY, btn2W, 26, videoUrl);
  doc.restore();

  py += mediaH + 12;

  // Code Container: Clean, tightly fitted, beautiful Helvetica typography
  doc.save();
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR_TEXT);
  doc.text('COMPLETE AI PROMPT BLUEPRINT (COPY DIRECTLY INTO YOUR AGENT):', MARGIN, py);
  py += 14;

  // Calculate box height dynamically to fill page perfectly down to py=745
  const codeBoxHeight = 385;
  doc.roundedRect(MARGIN, py, CONTENT_WIDTH, codeBoxHeight, 6).fill(COLOR_CODE_BG);
  doc.roundedRect(MARGIN, py, CONTENT_WIDTH, codeBoxHeight, 6).stroke(COLOR_BORDER);

  // Code text using clean Helvetica with crisp syntax-like layout
  doc.font('Helvetica').fontSize(8).fillColor('#e2e8f0');
  doc.text(promptText, MARGIN + 14, py + 12, {
    width: CONTENT_WIDTH - 28,
    lineGap: 3
  });

  // Bottom action strip inside code box
  const copyStripY = py + codeBoxHeight - 24;
  doc.rect(MARGIN + 1, copyStripY, CONTENT_WIDTH - 2, 23).fill(COLOR_SURFACE);
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_ACCENT);
  const linkText = `👉 Direct Website URL: ${storeUrl}`;
  doc.text(linkText, MARGIN + 12, copyStripY + 7);
  doc.link(MARGIN + 12, copyStripY + 4, doc.widthOfString(linkText), 16, storeUrl);
  doc.restore();

  py += codeBoxHeight + 10;

  // Pro Tip Box (fills the remaining 35 points before footer cleanly)
  doc.save();
  doc.roundedRect(MARGIN, py, CONTENT_WIDTH, 28, 4).fill('#0f172a');
  doc.roundedRect(MARGIN, py, CONTENT_WIDTH, 28, 4).stroke('#334155');
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_AMBER);
  doc.text('PRO TIP FOR CLAUDE 3.7 & CURSOR: ', MARGIN + 10, py + 9);
  const tipLeadW = doc.widthOfString('PRO TIP FOR CLAUDE 3.7 & CURSOR: ');
  doc.font('Helvetica').fontSize(7.5).fillColor('#cbd5e1');
  doc.text(proTip, MARGIN + 10 + tipLeadW, py + 9, { width: CONTENT_WIDTH - 20 - tipLeadW });
  doc.restore();

  drawFooter(doc, pageNumber, 5);
}

// ==========================================
// PAGE 2: FREE PROMPT 01 — HAZMAT CYBERSECURITY
// ==========================================
renderPromptPage({
  pageNumber: 2,
  schemaNumber: '01',
  title: 'Hazmat Cybersecurity Master 3D Prompt',
  subtitle: 'Reactive WebGL Shield & Threat Grid Architecture',
  category: 'Cyber & Agency',
  clientValue: '$14,500',
  tokens: 2840,
  highlightStat: '60 FPS WebGL',
  techStack: 'Three.js + GLSL Shaders',
  imageName: 'hazmat.jpg',
  portalPromptId: 'hazmat-cyber',
  videoUrl: 'https://images.refero.design/styles/refero.design/video/7b76f1c1-600b-444f-a1a1-c51c831ec51a.mp4',
  featureOverview: 'Deploys an instanced particle dodecahedron core surrounded by dual counter-rotating ring lattices with Simplex noise displacement shaders and interactive pointer velocity ripples.',
  promptText: `Act as a Principal 3D Creative Technologist (Awwwards Site of the Year recipient).
Build a production-ready, dark-mode Cybersecurity Enterprise Hero experience in React 19 + Three.js + Tailwind CSS.

TECHNICAL CORE ARCHITECTURE:
1. THREE.JS VIEWPORT & INSTANCED MESHES:
   - Create an instanced particle dodecahedron core (12,000 vertices) enclosed by counter-rotating ring lattices.
   - Implement custom vertex shaders with Simplex noise displacement driven by: position + time * 0.4.
   - Interpolate vertex color gradients from neon cyan (#00f2fe) to encrypted violet (#4facfe).
   - Camera orbits smoothly with lerped mouse damping (lookAt lerp factor = 0.05).

2. REAL-TIME THREAT BREACH SIMULATION:
   - Clicking or dragging triggers an animated shockwave ripple pulse radiating outwards along mesh normals.
   - On cursor acceleration > 2.5, inject temporary chromatic aberration and glitch fragment jitter.
   - Telemetry HUD overlay with live latitude/longitude, encrypted packet counter, and 60 FPS counter.

3. RESPONSIVE ARCHITECTURE & CLEAN DISPOSAL:
   - Automatically resize on window dimension changes with pixel ratio clamped at Math.min(window.devicePixelRatio, 2).
   - Strict geometry and material cleanup on React unmount to eliminate GPU memory leaks.
   - Zero external .GLTF/.OBJ dependencies — fully self-contained WebGL procedural generation.`,
  proTip: 'In Claude 3.7 Sonnet, enable Extended Thinking mode for mathematical shader precision without NaN glitching.'
});

// ==========================================
// PAGE 3: FREE PROMPT 02 — FINTECH LIQUIDITY
// ==========================================
renderPromptPage({
  pageNumber: 3,
  schemaNumber: '02',
  title: 'Institutional FinTech 3D Liquidity Order Book',
  subtitle: 'Real-Time WebGL Depth Mountain & High-Frequency Volume Mesh',
  category: 'FinTech & Trading',
  clientValue: '$24,000',
  tokens: 3350,
  highlightStat: 'Sub-12ms Liquidity',
  techStack: 'Three.js + React 19',
  imageName: 'fintech.jpg',
  portalPromptId: 'fintech-liquidity-pool',
  videoUrl: 'https://images.refero.design/styles/refero.design/video/6e6ad2ff-26c5-4fb6-90dc-ee4c3d596ca7.mp4',
  featureOverview: 'Wall Street institutional trading visualizer converting live order flow into an undulating 3D topographic volume mountain with interactive crosshair price slices.',
  promptText: `Act as a Quantitative Frontend Engineer. Build an institutional trading terminal featuring an interactive 3D Order Book Depth Mountain in Three.js and React 19.

CORE TRADING SPECIFICATIONS:
1. TOPOGRAPHIC 3D DEPTH MESH:
   - Render a dual-sided extruded plane geometry representing Bid (Buy) and Ask (Sell) liquidity volumes.
   - Bids: Emerald green gradient (#10b981 to #059669) along the negative X axis.
   - Asks: Crimson red gradient (#ef4444 to #b91c1c) along the positive X axis.
   - Vertex heights (Y axis) morph smoothly in real-time based on simulated order book flow.
   - Wireframe grid overlay sitting directly over shaded depth mountains with subtle specular shine.

2. SUB-12MS TICK TELEMETRY:
   - High-frequency update loop executing via requestAnimationFrame without triggering React re-renders.
   - Interactive crosshair slice plane: Hovering over any price coordinate highlights depth slice and displays total cumulative volume, implied spread, and estimated slippage in a floating monospace glass HUD card.

3. HARDWARE & WEBGPU READY:
   - Pure responsive viewport adapting seamlessly from 4K ultrawide trading desk displays to mobile iOS Safari.
   - Camera pan and pitch controls with bounded limits to prevent upside-down orientation.
   - Calibrated for instant generation with Claude 3.7 Sonnet and Cursor Composer.`,
  proTip: 'Instruct Cursor to keep Three.js meshes outside React state to maintain sub-12ms frame budgets.'
});

// ==========================================
// PAGE 4: FREE PROMPT 03 — LIQUID VISCOSITY SHADER
// ==========================================
renderPromptPage({
  pageNumber: 4,
  schemaNumber: '03',
  title: 'High-Viscosity Procedural Liquid & Mercury Shader',
  subtitle: 'Real-Time Surface Tension & Chromatic Sheen Physics',
  category: 'Spatial & Shaders',
  clientValue: '$16,500',
  tokens: 3100,
  highlightStat: 'Mercury Raymarching',
  techStack: 'GLSL Fragment + R3F',
  imageName: 'liquid.jpg',
  portalPromptId: 'liquid-viscosity-shader',
  videoUrl: 'https://images.refero.design/styles/refero.design/video/ed2c729e-76ce-4ad0-bad8-c57d67247ec7.mp4',
  featureOverview: 'Raymarched procedural liquid mercury shader with cursor inertia wake, iridescent specular sheen, and dynamic metaball droplet coalescence running at 60 FPS on mobile.',
  promptText: `Act as a GLSL Shader Specialist. Code a custom procedural liquid mercury shader in React Three Fiber that responds dynamically to pointer coordinates and scrolling velocity.

PHYSICS & SHADER SPECIFICATIONS:
1. RAYMARCHING SURFACE TENSION:
   - Construct a Signed Distance Function (SDF) blending 5 metaball nodes using smooth minimum (smin polynomial).
   - Node 1 tracks the cursor with spring physics and damping.
   - Nodes 2-5 orbit gently with trigonometric harmonic frequencies (sin(t * 0.7), cos(t * 1.1)).
   - Implement normal calculation via gradient estimation: normalize(vec3(sdf(p + eps.xyy) - sdf(p - eps.xyy), ...)).

2. OPTICAL PROPERTIES & SPECULAR SHEEN:
   - Metallic reflection using Fresnel approximation (Schlick's formula with F0 = 0.95 for polished liquid chrome).
   - Dynamic environment mapping with chromatic dispersion (splitting red, green, and blue rays along normal tangents).
   - High-contrast specular highlights reacting to dynamic virtual directional light source.

3. MOBILE PERFORMANCE CONTROLS:
   - Maximum raymarching steps = 48 with step distance threshold = 0.001.
   - Resolution scale toggle supporting 0.75x on mobile screens to ensure solid 60 FPS on iOS and Android.
   - Zero external heavy physics libraries — pure WebGL fragment shader implementation.`,
  proTip: 'Ask your AI agent to implement the smin smooth minimum polynomial to create realistic mercury droplet fusion.'
});

// ==========================================
// PAGE 5: 500+ MASTER VAULT DIRECTORY & UPGRADE PASS
// ==========================================
doc.addPage();
drawBackground(doc);
drawHeader(doc);

let p5Y = 58;

doc.font('Helvetica-Bold').fontSize(14).fillColor(COLOR_TEXT);
doc.text('500+ COMMERCIAL 3D ARCHITECTURES MASTER DIRECTORY', MARGIN, p5Y);
p5Y += 16;

doc.font('Helvetica').fontSize(8).fillColor(COLOR_TEXT_MUTED);
doc.text('The following commercial architectures are locked inside the master vault. Click any item to inspect its video demonstration on the live site.', MARGIN, p5Y);
p5Y += 15;

// 12 Flagship Locked Prompts in a tight, elegant 2-column or full table layout
const lockedCatalog = [
  { id: 'valmora', title: 'VALMORA Haute-Couture Spatial Editorial', val: '$28,500', cat: 'Luxury', reel: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/valmora.mp4' },
  { id: 'selene', title: 'SELENE Lunar Earthrise 384,400km Engine', val: '$36,000', cat: 'Spatial 3D', reel: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/selene.mp4' },
  { id: 'ora', title: 'ORA Geneva Watchmaker 240 WebP Canvas', val: '$22,000', cat: 'Luxury', reel: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/ora-v2.mp4' },
  { id: 'fluxora', title: 'Fluxora Amber Visor High-Ticket Agency', val: '$19,500', cat: 'Agency Ops', reel: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/fluxora.mp4' },
  { id: 'luxury-watchmaker', title: 'PBR Sapphire Chronograph 3D Turntable', val: '$18,000', cat: 'Luxury', reel: 'https://images.refero.design/styles/refero.design/video/c04b8df7-f655-46ba-b7e6-7019808e0ddc.mp4' },
  { id: 'nike-next-gen', title: 'Aerodynamic Hyper-Sneaker Exploded View', val: '$21,000', cat: 'E-Commerce', reel: 'https://images.refero.design/styles/refero.design/video/9fb05b0a-3373-455b-b9f1-d703e7c81d33.mp4' },
  { id: 'hypercar-configurator', title: 'Aerospace Carbon Fiber Hypercar Config', val: '$32,000', cat: 'Luxury', reel: 'https://images.refero.design/styles/refero.design/video/a1bf33c4-754e-4f11-9689-5198d0ce4fa1.mp4' },
  { id: 'quantum-defense-core', title: 'Autonomous Defense & Quantum Server Mesh', val: '$26,000', cat: 'Cyber & AI', reel: 'https://images.refero.design/styles/refero.design/video/6b173e6a-733c-44e8-8a82-35e69aa40532.mp4' },
  { id: 'cartier-diamond-brilliance', title: 'Cartier Diamond Spectral Refraction 3D', val: '$30,000', cat: 'Luxury', reel: 'https://images.refero.design/styles/refero.design/video/b51778c1-6547-498c-b0fc-dd7bcfa72852.mp4' },
  { id: 'apple-espana', title: 'Spatial Hardware Unboxing & Magnetic Glass', val: '$27,000', cat: 'Spatial OS', reel: 'https://images.refero.design/styles/refero.design/video/fba1280a-9d22-48f8-b3ee-2d7c570b55c2.mp4' },
  { id: 'holographic-cardiology-heart', title: 'Surgical Cardiology 3D Holographic Heart', val: '$34,000', cat: 'High-Ticket', reel: 'https://images.refero.design/styles/refero.design/video/45167f63-38e5-4d7a-b5e1-ee2877a565d7.mp4' },
  { id: 'hermes-leather-craft', title: 'Hermes Leather Micro-Texture Specular PBR', val: '$23,000', cat: 'Luxury', reel: 'https://images.refero.design/styles/refero.design/video/c444fae8-07cb-4b77-a8a2-11e7c5b1695f.mp4' }
];

doc.save();
let rowY = p5Y;
const rowH = 21;
lockedCatalog.forEach((p, idx) => {
  const isAlt = idx % 2 === 1;
  doc.rect(MARGIN, rowY, CONTENT_WIDTH, rowH).fill(isAlt ? COLOR_SURFACE : COLOR_CODE_BG);
  doc.rect(MARGIN, rowY, CONTENT_WIDTH, rowH).stroke(COLOR_BORDER_SUBTLE);

  // Status Pill
  doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#fbbf24');
  doc.text('🔒 LOCKED', MARGIN + 8, rowY + 7);

  // Title
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_TEXT);
  doc.text(p.title, MARGIN + 58, rowY + 7);

  // Category & Value
  doc.font('Helvetica').fontSize(7).fillColor(COLOR_TEXT_DIM);
  doc.text(`${p.cat} • Value: ${p.val}`, MARGIN + 280, rowY + 7);

  // Link to Video Reel
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#60a5fa');
  doc.text('▶ Video Reel', MARGIN + 395, rowY + 7);
  doc.link(MARGIN + 395, rowY + 4, 52, 14, p.reel);

  // Link to Inspect on Store
  const storePromptUrl = `https://vinebdigital.store/#portal?prompt=${p.id}`;
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_ACCENT);
  doc.text('⚡ Inspect →', MARGIN + 460, rowY + 7);
  doc.link(MARGIN + 460, rowY + 4, 60, 14, storePromptUrl);

  rowY += rowH;
});
doc.restore();

p5Y = rowY + 16;

// High-Impact Commercial Upgrade Card (Fills bottom half flawlessly)
const upCardH = 265;
doc.save();
doc.roundedRect(MARGIN, p5Y, CONTENT_WIDTH, upCardH, 8).fill('#0b1120');
doc.roundedRect(MARGIN, p5Y, CONTENT_WIDTH, upCardH, 8).stroke('#2563eb');

// Eyebrow Tag
doc.roundedRect(MARGIN + 16, p5Y + 14, 180, 18, 9).fill('#1e3a8a');
doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#bfdbfe');
doc.text('★ COMMERCIAL EXPANSION PASS', MARGIN + 24, p5Y + 19);

// Headline
doc.font('Helvetica-Bold').fontSize(15).fillColor('#ffffff');
doc.text('Unlock All 500+ Calibrated 3D Architectures', MARGIN + 16, p5Y + 40);

doc.font('Helvetica').fontSize(8.5).fillColor('#cbd5e1');
const upBenefits = `Upgrade today to command the world's most exhaustive commercial 3D WebGL prompt database. A single client deliverable recoups this investment over 250 times over.

ALL-ACCESS MEMBERSHIP INCLUDES:
- Instant One-Click Copy for all 500+ architectures inside the interactive Studio Portal
- Claude 3.7 Sonnet, Cursor Composer, and ChatGPT o3-mini calibrations
- 10+ Complete Next.js, Vite & React 19 boilerplate GitHub repositories
- Full Commercial Reseller Rights: Ship client projects without attribution
- Instant License Key activation delivered to WhatsApp and Email`;
doc.text(upBenefits, MARGIN + 16, p5Y + 60, { width: CONTENT_WIDTH - 32, lineGap: 3.5 });

// Dual Pricing Pill
const pBoxY = p5Y + 175;
doc.font('Helvetica-Bold').fontSize(11).fillColor('#38bdf8');
const priceBanner = '⚡ ONE-DAY SPRINT PASS: ₹49  |  👑 LIFETIME VIP PASS: ₹299';
doc.text(priceBanner, (PAGE_WIDTH - doc.widthOfString(priceBanner)) / 2, pBoxY);

// Large Glowing Button
const bigBtnY = pBoxY + 20;
const bigBtnH = 36;
doc.roundedRect(MARGIN + 24, bigBtnY, CONTENT_WIDTH - 48, bigBtnH, 6).fill(COLOR_ACCENT_GREEN);
doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000');
const bigBtnLabel = 'UNLOCK COMPLETE 500+ VAULT PASS @ VINEBDIGITAL.STORE →';
doc.text(bigBtnLabel, (PAGE_WIDTH - doc.widthOfString(bigBtnLabel)) / 2, bigBtnY + 13);
doc.link(MARGIN + 24, bigBtnY, CONTENT_WIDTH - 48, bigBtnH, 'https://vinebdigital.store/#pricing');
doc.restore();

drawFooter(doc, 5, 5);

// Finalize Document
doc.end();

writeStream.on('finish', () => {
  console.log('PDF Generation Complete! Successfully wrote to:', outputPdfPath);
  const stats = fs.statSync(outputPdfPath);
  console.log('File size:', stats.size, 'bytes');
});
writeStream.on('error', (err) => {
  console.error('PDF Generation Error:', err);
});
