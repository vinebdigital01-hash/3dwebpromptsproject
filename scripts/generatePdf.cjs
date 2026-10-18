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

// Target Portal & Pricing URLs (Buttons only - never raw text)
const PORTAL_URL = 'https://3dwebprompts-vineb.vercel.app/#portal';
const PRICING_URL = 'https://3dwebprompts-vineb.vercel.app/#pricing';
const STORE_URL = 'https://vinebdigital.store';

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
  pageDoc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(COLOR_BG);
  pageDoc.rect(0, 0, PAGE_WIDTH, 2.5).fill(COLOR_ACCENT);
  pageDoc.restore();
}

function drawHeader(pageDoc) {
  pageDoc.save();
  const headerY = 16;
  // WB Logo top-left (Clickable link to store)
  if (fs.existsSync(logoPath)) {
    pageDoc.image(logoPath, MARGIN, headerY, { fit: [26, 26] });
    pageDoc.link(MARGIN, headerY, 26, 26, STORE_URL);
  }

  // Header Title
  pageDoc.fillColor(COLOR_TEXT).font('Helvetica-Bold').fontSize(9);
  pageDoc.text('VINE B DIGITAL', MARGIN + 32, headerY + 2);
  pageDoc.fillColor(COLOR_TEXT_DIM).font('Helvetica').fontSize(7.5);
  pageDoc.text('// 3D WebGL Production Blueprint Repository • Studio Edition', MARGIN + 32, headerY + 13);

  // Top Right Portal Launch Button (Button plate only, no raw URL)
  const portalBtnW = 136;
  const portalBtnH = 22;
  const portalBtnX = PAGE_WIDTH - MARGIN - portalBtnW;
  pageDoc.roundedRect(portalBtnX, headerY + 2, portalBtnW, portalBtnH, 4).fill(COLOR_SURFACE);
  pageDoc.roundedRect(portalBtnX, headerY + 2, portalBtnW, portalBtnH, 4).stroke(COLOR_BORDER);
  pageDoc.fillColor(COLOR_ACCENT).font('Helvetica-Bold').fontSize(7.5);
  pageDoc.text('⚡ Studio Portal Access →', portalBtnX + 12, headerY + 8);
  pageDoc.link(portalBtnX, headerY + 2, portalBtnW, portalBtnH, PORTAL_URL);

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
    link: STORE_URL
  });
  pageDoc.link(MARGIN, footY + 6, 80, 14, STORE_URL);

  pageDoc.font('Helvetica').fontSize(7.5).fillColor(COLOR_TEXT_DIM);
  pageDoc.text('Official Commercial Blueprint Access Pass • Calibrated for Claude 3.7 & Cursor', MARGIN + 88, footY + 8);

  const pageStr = `Page ${pageNumber} of ${totalPages}`;
  pageDoc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_TEXT_MUTED);
  pageDoc.text(pageStr, PAGE_WIDTH - MARGIN - pageDoc.widthOfString(pageStr), footY + 8);
  pageDoc.restore();
}

// Helper to draw a prominent, styled interactive button
function drawButton(pageDoc, x, y, width, height, text, linkUrl, bgColor, textColor, fontSize = 9) {
  pageDoc.save();
  pageDoc.roundedRect(x, y, width, height, 6).fill(bgColor);
  pageDoc.roundedRect(x, y, width, height, 6).stroke('rgba(255, 255, 255, 0.15)');
  pageDoc.font('Helvetica-Bold').fontSize(fontSize).fillColor(textColor);
  const textW = pageDoc.widthOfString(text);
  const textX = x + (width - textW) / 2;
  const textY = y + (height - fontSize) / 2 - 0.5;
  pageDoc.text(text, textX, textY);
  pageDoc.link(x, y, width, height, linkUrl);
  pageDoc.restore();
}

// ==========================================
// PAGE 1: EXECUTIVE COVER & PORTAL ACCESS PASS
// ==========================================
doc.addPage();
drawBackground(doc);

// Prominent Centered WB Logo
if (fs.existsSync(logoPath)) {
  const logoSize = 64;
  const logoX = (PAGE_WIDTH - logoSize) / 2;
  const logoY = 46;
  doc.image(logoPath, logoX, logoY, { fit: [logoSize, logoSize] });
  doc.link(logoX, logoY, logoSize, logoSize, STORE_URL);

  doc.font('Helvetica').fontSize(8).fillColor(COLOR_ACCENT);
  const clickHint = '▲ Click Logo to visit official storefront: vinebdigital.store';
  doc.text(clickHint, (PAGE_WIDTH - doc.widthOfString(clickHint)) / 2, logoY + logoSize + 8, {
    link: STORE_URL
  });
  doc.link((PAGE_WIDTH - doc.widthOfString(clickHint)) / 2, logoY + logoSize + 6, doc.widthOfString(clickHint), 12, STORE_URL);
}

// Main Title Block
const titleY = 138;
doc.font('Helvetica-Bold').fontSize(21).fillColor(COLOR_TEXT);
const coverTitle = '3D WEBGL & SPATIAL MASTER PROMPTS';
doc.text(coverTitle, (PAGE_WIDTH - doc.widthOfString(coverTitle)) / 2, titleY);

doc.font('Helvetica-Bold').fontSize(10.5).fillColor(COLOR_ACCENT);
const coverSub = 'OFFICIAL PRODUCTION STARTER ARCHIVE // STUDIO PORTAL ACCESS PASS';
doc.text(coverSub, (PAGE_WIDTH - doc.widthOfString(coverSub)) / 2, titleY + 25);

// 4 Feature Badges Row
const pillRowY = titleY + 48;
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

// Main Access Pass Card: How to use your email to access prompts
const passY = pillRowY + 28;
const passH = 205;
doc.save();
doc.roundedRect(MARGIN, passY, CONTENT_WIDTH, passH, 8).fill('#08101e');
doc.roundedRect(MARGIN, passY, CONTENT_WIDTH, passH, 8).stroke('#2563eb');

// Eyebrow Tag inside pass
doc.roundedRect(MARGIN + 16, passY + 14, 195, 17, 4).fill('#1e3a8a');
doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#93c5fd');
doc.text('🔑 AUTHENTICATED ACCESS PASS • PORTAL UNLOCKED', MARGIN + 22, passY + 18);

// Headline
doc.font('Helvetica-Bold').fontSize(12.5).fillColor('#ffffff');
doc.text('How to Unlock & Copy Your 30 Production 3D Prompts', MARGIN + 16, passY + 38);

doc.font('Helvetica').fontSize(8.5).fillColor('#cbd5e1');
const passInstructions = `To ensure you always receive the latest unminified, zero-hallucination code with live Three.js viewports, all prompts are delivered directly inside the official Studio Portal.

THREE EASY STEPS TO COPY YOUR PROMPTS:
1. USE YOUR REGISTERED EMAIL:
   Access is automatically provisioned for the email address you entered on the download request form.
2. LAUNCH THE STUDIO PORTAL:
   Click the button below to open the interactive Studio Portal in your browser.
3. ONE-CLICK PROMPT COPY:
   Click "Copy Prompt" on any blueprint to copy the complete, unminified Three.js component code directly into Claude 3.7 Sonnet, Cursor, or ChatGPT.`;
doc.text(passInstructions, MARGIN + 16, passY + 56, { width: CONTENT_WIDTH - 32, lineGap: 3 });

// Big Styled Button (No raw URL displayed)
const btnPassY = passY + 158;
drawButton(
  doc,
  MARGIN + 16,
  btnPassY,
  CONTENT_WIDTH - 32,
  34,
  '🚀 OPEN STUDIO PORTAL & COPY PROMPTS NOW →',
  PORTAL_URL,
  '#10b981',
  '#000000',
  10
);
doc.restore();

// 3 Architecture Principles Cards (Fills lower page)
const archY = passY + passH + 16;
doc.font('Helvetica-Bold').fontSize(10.5).fillColor(COLOR_TEXT);
doc.text('PRODUCTION 3D WEBGL CODE ARCHITECTURE STANDARDS:', MARGIN, archY);

const standards = [
  {
    num: '60 FPS',
    title: 'Deterministic Frame Rate Budgeting',
    desc: 'Every prompt mandates RequestAnimationFrame throttling with delta-time compensation, preventing sluggish rendering on mobile batteries and low-power laptops.'
  },
  {
    num: '0 KB',
    title: 'Zero External .GLTF or .OBJ Asset Dependencies',
    desc: 'Components procedurally synthesize complex 3D meshes using InstancedBufferGeometry and GLSL Simplex Noise — eliminating slow 3D file loading times.'
  },
  {
    num: '100%',
    title: 'Strict GPU Memory Garbage Collection',
    desc: 'All geometries, materials, and textures implement automatic dispose() cycles on React unmount, guaranteeing zero browser memory leaks for enterprise clients.'
  }
];

let curStdY = archY + 18;
standards.forEach(s => {
  doc.save();
  const sh = 46;
  doc.roundedRect(MARGIN, curStdY, CONTENT_WIDTH, sh, 6).fill(COLOR_SURFACE);
  doc.roundedRect(MARGIN, curStdY, CONTENT_WIDTH, sh, 6).stroke(COLOR_BORDER);

  // Number Badge
  doc.roundedRect(MARGIN + 10, curStdY + 9, 38, 28, 4).fill(COLOR_CODE_BG);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR_ACCENT);
  doc.text(s.num, MARGIN + 13, curStdY + 18);

  // Title & Desc
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLOR_TEXT);
  doc.text(s.title, MARGIN + 56, curStdY + 9);

  doc.font('Helvetica').fontSize(7.5).fillColor(COLOR_TEXT_MUTED);
  doc.text(s.desc, MARGIN + 56, curStdY + 22, { width: CONTENT_WIDTH - 68, lineGap: 2 });
  doc.restore();
  curStdY += sh + 7;
});

// Trust Micro-Banner at bottom
const trustY = curStdY + 4;
doc.save();
doc.roundedRect(MARGIN, trustY, CONTENT_WIDTH, 24, 4).fill('#0c1322');
doc.roundedRect(MARGIN, trustY, CONTENT_WIDTH, 24, 4).stroke('#1e3a8a');
doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#60a5fa');
const trustStr = '✓ Official Authenticated Release • Pre-Approved for Your Registered Email • Free Commercial Reseller Rights';
doc.text(trustStr, (PAGE_WIDTH - doc.widthOfString(trustStr)) / 2, trustY + 8);
doc.restore();

drawFooter(doc, 1, 5);


// ==========================================
// HELPER TO RENDER A SPECIFICATION BLUEPRINT PAGE
// (No raw prompt text in PDF - directs to portal with registered email)
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
  videoUrl,
  featureOverview,
  architectureSpecs,
  proTip
}) {
  doc.addPage();
  drawBackground(doc);
  drawHeader(doc);

  let py = 56;

  // Eyebrow Row: Schema # + Status
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_ACCENT);
  doc.text(`UNLOCKED PRODUCTION BLUEPRINT // ${schemaNumber}`, MARGIN, py);
  
  const freeBadge = '✓ UNLOCKED FREE IN STUDIO PORTAL';
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

  // Media & Video Preview Box
  const mediaH = 92;
  doc.save();
  doc.roundedRect(MARGIN, py, CONTENT_WIDTH, mediaH, 6).fill(COLOR_SURFACE);
  doc.roundedRect(MARGIN, py, CONTENT_WIDTH, mediaH, 6).stroke(COLOR_BORDER);

  // Embed image
  const imgPath = path.join(assetsDir, imageName);
  if (fs.existsSync(imgPath)) {
    doc.image(imgPath, MARGIN + 6, py + 6, { fit: [124, 80] });
  }

  // Right details in Media Box
  const rX = MARGIN + 140;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(COLOR_TEXT);
  doc.text('Component Architecture & Live Preview', rX, py + 8);

  doc.font('Helvetica').fontSize(7.5).fillColor(COLOR_TEXT_MUTED);
  doc.text(featureOverview, rX, py + 22, { width: CONTENT_WIDTH - 150, lineGap: 2.5 });

  // Action Button inside Media Box (Video Reel)
  const vidBtnY = py + 58;
  const vidBtnW = 180;
  drawButton(doc, rX, vidBtnY, vidBtnW, 24, '▶ Watch 60FPS Video Reel', videoUrl, '#2563eb', '#ffffff', 8);
  doc.restore();

  py += mediaH + 14;

  // Architectural Deep-Dive & Shader Mechanics Card (Fills middle half)
  const specH = 265;
  doc.save();
  doc.roundedRect(MARGIN, py, CONTENT_WIDTH, specH, 6).fill(COLOR_CODE_BG);
  doc.roundedRect(MARGIN, py, CONTENT_WIDTH, specH, 6).stroke(COLOR_BORDER);

  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLOR_TEXT);
  doc.text('PROCEDURAL GRAPHICS & THREE.JS SHADER SPECIFICATION:', MARGIN + 14, py + 12);

  let specTextY = py + 28;
  architectureSpecs.forEach((spec, sIdx) => {
    doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR_ACCENT);
    doc.text(`${sIdx + 1}. ${spec.heading}`, MARGIN + 14, specTextY);
    specTextY += 12;

    doc.font('Helvetica').fontSize(7.5).fillColor('#cbd5e1');
    doc.text(spec.details, MARGIN + 14, specTextY, { width: CONTENT_WIDTH - 28, lineGap: 2.5 });
    specTextY += doc.heightOfString(spec.details, { width: CONTENT_WIDTH - 28, lineGap: 2.5 }) + 8;
  });
  doc.restore();

  py += specH + 12;

  // Access Pass & Portal 1-Click Copy Card (Primary conversion block)
  const passBoxH = 175;
  doc.save();
  doc.roundedRect(MARGIN, py, CONTENT_WIDTH, passBoxH, 6).fill('#081626');
  doc.roundedRect(MARGIN, py, CONTENT_WIDTH, passBoxH, 6).stroke('#0284c7');

  // Eyebrow
  doc.roundedRect(MARGIN + 14, py + 12, 175, 16, 4).fill('#0369a1');
  doc.font('Helvetica-Bold').fontSize(7).fillColor('#e0f2fe');
  doc.text('🔐 AUTHENTICATED MEMBER ACCESS', MARGIN + 20, py + 16);

  // Title
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#ffffff');
  doc.text('Copy Complete Production Prompt in Studio Portal', MARGIN + 14, py + 34);

  // Description explaining how to use email
  doc.font('Helvetica').fontSize(8).fillColor('#93c5fd');
  const copyInstr = `To maintain formatting integrity and copy the unminified code with complete GLSL vertex and fragment shaders:

👉 USE YOUR REGISTERED EMAIL:
Sign in to the Studio Portal using the email address you entered when downloading this PDF. Your account is pre-provisioned with 1-click clipboard copying, live 3D Three.js canvas inspection, and calibrated Claude 3.7 / Cursor execution parameters.`;
  doc.text(copyInstr, MARGIN + 14, py + 50, { width: CONTENT_WIDTH - 28, lineGap: 3 });

  // Big Styled Button (Button plate only, no raw URL)
  const copyBtnY = py + 125;
  drawButton(
    doc,
    MARGIN + 14,
    copyBtnY,
    CONTENT_WIDTH - 28,
    36,
    '⚡ OPEN STUDIO PORTAL & COPY THIS PROMPT →',
    PORTAL_URL,
    '#10b981',
    '#000000',
    9.5
  );
  doc.restore();

  py += passBoxH + 10;

  // Pro Tip Box (fills the remaining space cleanly)
  doc.save();
  doc.roundedRect(MARGIN, py, CONTENT_WIDTH, 26, 4).fill('#0f172a');
  doc.roundedRect(MARGIN, py, CONTENT_WIDTH, 26, 4).stroke('#334155');
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_AMBER);
  doc.text('PRO TIP FOR CLAUDE 3.7 & CURSOR: ', MARGIN + 10, py + 8);
  const tipLeadW = doc.widthOfString('PRO TIP FOR CLAUDE 3.7 & CURSOR: ');
  doc.font('Helvetica').fontSize(7.5).fillColor('#cbd5e1');
  doc.text(proTip, MARGIN + 10 + tipLeadW, py + 8, { width: CONTENT_WIDTH - 20 - tipLeadW });
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
  videoUrl: 'https://images.refero.design/styles/refero.design/video/7b76f1c1-600b-444f-a1a1-c51c831ec51a.mp4',
  featureOverview: 'Deploys an instanced particle dodecahedron core surrounded by dual counter-rotating ring lattices with Simplex noise displacement shaders and interactive pointer velocity ripples.',
  architectureSpecs: [
    {
      heading: 'THREE.JS VIEWPORT & INSTANCED MESH PIPELINE',
      details: 'Generates a procedural 12,000-vertex dodecahedron particle cluster enclosed by dual concentric counter-rotating ring lattices. Utilizes InstancedBufferGeometry to collapse thousands of drawing operations into a single GPU draw call.'
    },
    {
      heading: 'MATHEMATICAL GLSL SHADERS & THREAT SIMULATION',
      details: 'Displaces vertices dynamically using a 3D Simplex noise algorithm driven by time and position. Features interactive click-and-drag shockwave ripples that propagate along surface normals, accompanied by acceleration-based chromatic aberration and telemetry HUD.'
    },
    {
      heading: 'RESPONSIVE FRAME RATE BUDGETING & CLEAN DISPOSAL',
      details: 'Implements window resize listening with pixel-ratio clamping (Math.min(window.devicePixelRatio, 2)) to prevent mobile overheating. Incorporates complete geometry and material disposal handlers on component unmount.'
    }
  ],
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
  videoUrl: 'https://images.refero.design/styles/refero.design/video/6e6ad2ff-26c5-4fb6-90dc-ee4c3d596ca7.mp4',
  featureOverview: 'Wall Street institutional trading visualizer converting live order flow into an undulating 3D topographic volume mountain with interactive crosshair price slices.',
  architectureSpecs: [
    {
      heading: 'PARAMETRIC DEPTH MESH & HIGH-FREQUENCY BID/ASK BARS',
      details: 'Constructs a dual-colored wireframe volume terrain (emerald green bid side, infrared ask side). Deploys an array of instanced cylinder volume bars whose heights animate smoothly using spring physics driven by incoming simulated trading volume.'
    },
    {
      heading: 'INTERACTIVE CROSSHAIR & REAL-TIME RAYCASTING',
      details: 'Integrated Three.js Raycaster traces cursor ray intersections with the topographic mesh in real time. Projects an illuminated crosshair plane with dynamic price-slice readout HUD displaying sub-millisecond spread telemetry.'
    },
    {
      heading: 'DELTA-TIME COMPENSATION & BATTERY CONSERVATION',
      details: 'Animation loop utilizes delta-time calculations (clock.getDelta()) to guarantee consistent wave oscillation speeds across 60Hz, 120Hz ProMotion, and 144Hz gaming displays without CPU throttling.'
    }
  ],
  proTip: 'Instruct Cursor Composer to keep order book updates decoupled from React re-renders using useRef animation loops.'
});

// ==========================================
// PAGE 4: FREE PROMPT 03 — LIQUID MERCURY MESH
// ==========================================
renderPromptPage({
  pageNumber: 4,
  schemaNumber: '03',
  title: 'Liquid Mercury Audio-Reactive Kinetic Mesh',
  subtitle: 'Raymarching Signed Distance Field (SDF) Fluid Sculpture',
  category: 'Spatial & Luxury',
  clientValue: '$18,500',
  tokens: 3120,
  highlightStat: 'Raymarched SDF',
  techStack: 'Three.js + GLSL Fragment',
  imageName: 'liquid.jpg',
  videoUrl: 'https://images.refero.design/styles/refero.design/video/a0b127ff-8c85-4df5-9175-9e6b4dc622bb.mp4',
  featureOverview: 'Organic molten chrome fluid simulation created via raymarching signed distance fields (SDF) with real-time environment mapping, metallic fresnel, and audio-reactive frequency swells.',
  architectureSpecs: [
    {
      heading: 'PURE GLSL SIGNED DISTANCE FIELD (SDF) RAYMARCHING',
      details: 'Executes a single fullscreen quad rendering raymarched mathematical spheres blended together via smooth polynomial minimum (smin). Creates realistic molten liquid droplet fusion without heavy physics libraries.'
    },
    {
      heading: 'CHROMATIC DISPERSION & METALLIC PBR ENVIRONMENT MAPPING',
      details: 'Calculates dynamic surface normals using the gradient of the distance field. Simulates metallic chrome reflectance with chromatic dispersion — splitting red, green, and blue rays along surface tangents for luxury jewelry aesthetics.'
    },
    {
      heading: 'GPU CLAMPING CONTROLS FOR MOBILE RELIABILITY',
      details: 'Constrains raymarching iterations to a maximum of 48 steps with an early-exit epsilon threshold (0.001). Implements dynamic resolution scaling (0.75x fallback on mobile GPUs) ensuring flawless 60 FPS on iPhones and Android.'
    }
  ],
  proTip: 'Ask your AI agent to implement the smin smooth minimum polynomial to create realistic mercury droplet fusion.'
});

// ==========================================
// PAGE 5: 500+ MASTER VAULT DIRECTORY & UPGRADE PASS
// ==========================================
doc.addPage();
drawBackground(doc);
drawHeader(doc);

let p5Y = 56;

doc.font('Helvetica-Bold').fontSize(14).fillColor(COLOR_TEXT);
doc.text('500+ COMMERCIAL 3D ARCHITECTURES MASTER DIRECTORY', MARGIN, p5Y);
p5Y += 16;

doc.font('Helvetica').fontSize(8).fillColor(COLOR_TEXT_MUTED);
doc.text('The following commercial architectures are available inside the master vault. Use your registered email in the Studio Portal to access all free blueprints, or upgrade below.', MARGIN, p5Y);
p5Y += 15;

// 12 Flagship Locked Prompts in a tight, elegant table layout
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

  // Link to Portal
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_ACCENT);
  doc.text('⚡ Portal →', MARGIN + 468, rowY + 7);
  doc.link(MARGIN + 468, rowY + 4, 50, 14, PORTAL_URL);

  rowY += rowH;
});
doc.restore();

p5Y = rowY + 16;

// High-Impact Commercial Upgrade Card
const upCardH = 265;
doc.save();
doc.roundedRect(MARGIN, p5Y, CONTENT_WIDTH, upCardH, 8).fill('#0b1120');
doc.roundedRect(MARGIN, p5Y, CONTENT_WIDTH, upCardH, 8).stroke('#2563eb');

// Eyebrow Tag
doc.roundedRect(MARGIN + 16, p5Y + 14, 180, 18, 9).fill('#1e3a8a');
doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#bfdbfe');
doc.text('★ COMMERCIAL EXPANSION PASS', MARGIN + 24, p5Y + 19);

// Headline
doc.font('Helvetica-Bold').fontSize(14).fillColor('#ffffff');
doc.text('Command All 500+ Calibrated 3D Architectures', MARGIN + 16, p5Y + 38);

doc.font('Helvetica').fontSize(8.5).fillColor('#cbd5e1');
const upBenefits = `Upgrade today to command the world's most exhaustive commercial 3D WebGL prompt database. A single client deliverable recoups this investment over 250 times over.

ALL-ACCESS MEMBERSHIP INCLUDES:
- Instant One-Click Copy for all 500+ architectures inside the interactive Studio Portal
- Claude 3.7 Sonnet, Cursor Composer, and ChatGPT o3-mini calibrations
- 10+ Complete Next.js, Vite & React 19 boilerplate GitHub repositories
- Full Commercial Reseller Rights: Ship client projects without attribution
- Instant License Key activation delivered to WhatsApp and Email`;
doc.text(upBenefits, MARGIN + 16, p5Y + 58, { width: CONTENT_WIDTH - 32, lineGap: 3.5 });

// Dual Pricing Banner
const pBoxY = p5Y + 165;
doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#38bdf8');
const priceBanner = '⚡ ONE-DAY SPRINT PASS: ₹49   |   👑 LIFETIME VIP PASS: ₹299';
doc.text(priceBanner, (PAGE_WIDTH - doc.widthOfString(priceBanner)) / 2, pBoxY);

// Dual Buttons (Button plates only, no raw URL)
const btnRowY = pBoxY + 18;
const halfBtnW = (CONTENT_WIDTH - 40) / 2;

// Button 1: Open Free Studio Portal
drawButton(
  doc,
  MARGIN + 16,
  btnRowY,
  halfBtnW,
  36,
  '🚀 OPEN FREE STUDIO PORTAL →',
  PORTAL_URL,
  '#10b981',
  '#000000',
  9
);

// Button 2: Upgrade to Full Vault
drawButton(
  doc,
  MARGIN + 24 + halfBtnW,
  btnRowY,
  halfBtnW,
  36,
  '👑 UNLOCK ALL 500+ VAULT @ ₹49 →',
  PRICING_URL,
  '#2563eb',
  '#ffffff',
  9
);
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
