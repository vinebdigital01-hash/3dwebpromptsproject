const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Paths
const logoPath = path.resolve('public/wb-logo.png');
const outputPdfPath = path.resolve('public/30_Production_3D_WebGL_Prompts_VineB.pdf');
const assetsDir = path.resolve('public/pdf-assets');

// Setup Document: A4 size, dark palette
const doc = new PDFDocument({
  size: 'A4',
  margin: 36, // 0.5 inch margins
  autoFirstPage: false,
  info: {
    Title: '3D WebGL & Spatial Prompts Starter Pack — Vine B Digital',
    Author: 'Vine B Digital',
    Subject: 'Official 3D Production Prompt Architectures & Free Samples',
    Keywords: 'Three.js, WebGL, 3D Web, Claude 3.7, Cursor, AI Prompts',
    CreationDate: new Date()
  }
});

const writeStream = fs.createWriteStream(outputPdfPath);
doc.pipe(writeStream);

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 36;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

// Colors
const COLOR_BG = '#08080d';
const COLOR_SURFACE = '#11121c';
const COLOR_SURFACE_BORDER = '#232538';
const COLOR_ACCENT = '#38bdf8'; // Sky cyan matching WB logo
const COLOR_ACCENT_GREEN = '#10b981';
const COLOR_TEXT = '#f8fafc';
const COLOR_TEXT_MUTED = '#94a3b8';
const COLOR_TEXT_DIM = '#64748b';
const COLOR_CODE_BG = '#06060a';

function drawBackground(pageDoc) {
  pageDoc.save();
  pageDoc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(COLOR_BG);
  // Subtle top gradient line
  pageDoc.rect(0, 0, PAGE_WIDTH, 3).fill(COLOR_ACCENT);
  pageDoc.restore();
}

function drawHeader(pageDoc, pageNumber, totalPages) {
  pageDoc.save();
  // WB Logo top-left
  if (fs.existsSync(logoPath)) {
    pageDoc.image(logoPath, MARGIN, 20, { fit: [28, 28] });
    pageDoc.link(MARGIN, 20, 28, 28, 'https://vinebdigital.store');
  }

  pageDoc.fillColor(COLOR_TEXT).font('Helvetica-Bold').fontSize(9);
  pageDoc.text('VINE B DIGITAL', MARGIN + 36, 23);
  pageDoc.fillColor(COLOR_TEXT_DIM).font('Helvetica').fontSize(8);
  pageDoc.text('// 3D WebGL Production Blueprint Repository', MARGIN + 36, 34);

  // Top Right Portal Link
  const portalText = '⚡ Open Studio Portal →';
  pageDoc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLOR_ACCENT);
  const textWidth = pageDoc.widthOfString(portalText);
  const portalX = PAGE_WIDTH - MARGIN - textWidth;
  pageDoc.text(portalText, portalX, 26, {
    link: 'https://vinebdigital.store/#portal'
  });
  pageDoc.link(portalX, 22, textWidth, 16, 'https://vinebdigital.store/#portal');

  // Separator line
  pageDoc.rect(MARGIN, 54, CONTENT_WIDTH, 0.75).fill(COLOR_SURFACE_BORDER);
  pageDoc.restore();
}

function drawFooter(pageDoc, pageNumber, totalPages) {
  pageDoc.save();
  pageDoc.rect(MARGIN, PAGE_HEIGHT - 38, CONTENT_WIDTH, 0.75).fill(COLOR_SURFACE_BORDER);

  // Logo link in footer
  pageDoc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR_ACCENT);
  pageDoc.text('vinebdigital.store', MARGIN, PAGE_HEIGHT - 28, {
    link: 'https://vinebdigital.store'
  });

  pageDoc.font('Helvetica').fontSize(8).fillColor(COLOR_TEXT_DIM);
  pageDoc.text('Confidential & Copyright (c) Vine B Digital. All rights reserved.', MARGIN + 90, PAGE_HEIGHT - 28);

  const pageStr = `Page ${pageNumber} of ${totalPages}`;
  pageDoc.font('Helvetica').fontSize(8).fillColor(COLOR_TEXT_MUTED);
  pageDoc.text(pageStr, PAGE_WIDTH - MARGIN - pageDoc.widthOfString(pageStr), PAGE_HEIGHT - 28);
  pageDoc.restore();
}

// ==========================================
// PAGE 1: COVER & EXECUTIVE ARCHITECTURE
// ==========================================
doc.addPage();
drawBackground(doc);

// Cover Header WB Logo (Large Clickable)
if (fs.existsSync(logoPath)) {
  const logoSize = 75;
  const logoX = (PAGE_WIDTH - logoSize) / 2;
  doc.image(logoPath, logoX, 60, { fit: [logoSize, logoSize] });
  doc.link(logoX, 60, logoSize, logoSize, 'https://vinebdigital.store');
  
  doc.font('Helvetica').fontSize(8.5).fillColor(COLOR_ACCENT);
  const clickHint = '▲ Click Logo to visit official storefront: vinebdigital.store';
  doc.text(clickHint, (PAGE_WIDTH - doc.widthOfString(clickHint)) / 2, 142, {
    link: 'https://vinebdigital.store'
  });
}

// Title Section
doc.font('Helvetica-Bold').fontSize(22).fillColor(COLOR_TEXT);
const title1 = '3D WEBGL & SPATIAL MASTER PROMPTS';
doc.text(title1, (PAGE_WIDTH - doc.widthOfString(title1)) / 2, 175);

doc.font('Helvetica-Bold').fontSize(13).fillColor(COLOR_ACCENT);
const sub1 = 'OFFICIAL PRODUCTION STARTER EDITION // FREE PROMPTS ARCHIVE';
doc.text(sub1, (PAGE_WIDTH - doc.widthOfString(sub1)) / 2, 205);

// Pills / Badges Bar
const badgeY = 235;
doc.save();
const badges = [
  'Claude 3.7 Sonnet Calibrated',
  'Cursor & ChatGPT o3-mini Ready',
  '60 FPS Frame Budget',
  'Zero AI Slop Guaranteed'
];
let badgeX = MARGIN + 10;
badges.forEach(b => {
  doc.font('Helvetica-Bold').fontSize(7.5);
  const w = doc.widthOfString(b) + 14;
  doc.roundedRect(badgeX, badgeY, w, 18, 9).fill(COLOR_SURFACE);
  doc.roundedRect(badgeX, badgeY, w, 18, 9).stroke(COLOR_SURFACE_BORDER);
  doc.fillColor(COLOR_ACCENT).text(b, badgeX + 7, badgeY + 5);
  badgeX += w + 8;
});
doc.restore();

// Executive Box
doc.save();
const boxY = 275;
doc.roundedRect(MARGIN, boxY, CONTENT_WIDTH, 230, 8).fill(COLOR_SURFACE);
doc.roundedRect(MARGIN, boxY, CONTENT_WIDTH, 230, 8).stroke(COLOR_SURFACE_BORDER);

doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR_TEXT);
doc.text('EXECUTIVE BLUEPRINT SPECIFICATION', MARGIN + 16, boxY + 16);

doc.font('Helvetica').fontSize(9).fillColor(COLOR_TEXT_MUTED);
const execText = `Welcome to the official Vine B Digital 3D WebGL starter collection. This document delivers production-grade, zero-slop prompt architectures designed to instruct modern coding models (Claude 3.7 Sonnet, Cursor Composer, and ChatGPT o3) into generating high-fidelity Three.js, React 19, and GLSL shader code in one single shot.

These blueprints eliminate common AI failure modes — such as unoptimized vertex loops, missing pointer events, and jerky CSS transitions — by pre-defining strict memory boundaries, 60 FPS requestAnimationFrame loops, instanced buffer geometries, and reactive camera matrices.

WHAT IS INCLUDED IN THIS FREE REPOSITORY:
- 100% Unlocked, Full-Text Production Prompt Architectures (Free Sample Tier)
- Interactive Links to Watch 60 FPS Video Previews of every live component
- Direct One-Click Links to inspect & copy each blueprint directly inside the Studio Portal
- Complete Commercial Directory of the Full 500+ Architecture Master Vault`;
doc.text(execText, MARGIN + 16, boxY + 36, { width: CONTENT_WIDTH - 32, lineGap: 3.5 });

// Interactive CTA Inside Box
const ctaBoxY = boxY + 175;
doc.roundedRect(MARGIN + 16, ctaBoxY, CONTENT_WIDTH - 32, 38, 6).fill('#1d4ed8');
doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff');
const ctaBoxText = '⚡ OPEN CLOUD STUDIO PORTAL (ONE-CLICK PROMPT COPY) →';
doc.text(ctaBoxText, (PAGE_WIDTH - doc.widthOfString(ctaBoxText)) / 2, ctaBoxY + 13, {
  link: 'https://vinebdigital.store/#portal'
});
doc.link(MARGIN + 16, ctaBoxY, CONTENT_WIDTH - 32, 38, 'https://vinebdigital.store/#portal');
doc.restore();

// How to Use Guide
const howY = 525;
doc.font('Helvetica-Bold').fontSize(11).fillColor(COLOR_TEXT);
doc.text('3-STEP WORKFLOW TO EXECUTE THESE PROMPTS:', MARGIN, howY);

const steps = [
  {
    num: '01',
    title: 'Select Component & Copy Prompt',
    desc: 'Scroll to your chosen architecture in this document, or click the direct portal link to copy the raw text with a single tap.'
  },
  {
    num: '02',
    title: 'Paste into Claude 3.7 Sonnet or Cursor Composer',
    desc: 'Open your terminal or IDE agent. Paste the prompt unmodified into your agent. The blueprint will structure the React 19 + Three.js code.'
  },
  {
    num: '03',
    title: 'Deploy Production Experience',
    desc: 'Run your local dev server. You now possess a commercial 3D interactive hero, procedural shader, or financial terminal billed at $14,000+.'
  }
];

let stepY = howY + 22;
steps.forEach(s => {
  doc.save();
  doc.roundedRect(MARGIN, stepY, CONTENT_WIDTH, 52, 6).fill(COLOR_SURFACE);
  doc.roundedRect(MARGIN, stepY, CONTENT_WIDTH, 52, 6).stroke(COLOR_SURFACE_BORDER);

  // Step Number
  doc.roundedRect(MARGIN + 12, stepY + 12, 28, 28, 4).fill(COLOR_CODE_BG);
  doc.font('Helvetica-Bold').fontSize(12).fillColor(COLOR_ACCENT);
  doc.text(s.num, MARGIN + 18, stepY + 20);

  // Step Content
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLOR_TEXT);
  doc.text(s.title, MARGIN + 48, stepY + 12);

  doc.font('Helvetica').fontSize(8.5).fillColor(COLOR_TEXT_MUTED);
  doc.text(s.desc, MARGIN + 48, stepY + 26, { width: CONTENT_WIDTH - 60 });
  doc.restore();
  stepY += 60;
});

// Footer
drawFooter(doc, 1, 5);


// ==========================================
// FREE PROMPT 1: HAZMAT CYBERSECURITY
// ==========================================
doc.addPage();
drawBackground(doc);
drawHeader(doc, 2, 5);

let curY = 65;

// Category & Title
doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR_ACCENT);
doc.text('FREE UNLOCKED PRODUCTION ARCHITECTURE // 01', MARGIN, curY);
curY += 14;

doc.font('Helvetica-Bold').fontSize(15).fillColor(COLOR_TEXT);
doc.text('Hazmat Cybersecurity Master 3D Prompt', MARGIN, curY);
curY += 18;

doc.font('Helvetica').fontSize(9).fillColor(COLOR_TEXT_MUTED);
doc.text('Reactive WebGL Shield & Threat Grid Architecture • Category: Cyber & Agency', MARGIN, curY);
curY += 16;

// Specs Row
doc.save();
const p1Badges = [
  'Client Value: $14,500',
  'Tokens: 2,840',
  '60 FPS WebGL',
  'Three.js + GLSL',
  '14.2x Agency Markup'
];
let bX = MARGIN;
p1Badges.forEach(b => {
  doc.font('Helvetica-Bold').fontSize(7.5);
  const w = doc.widthOfString(b) + 12;
  doc.roundedRect(bX, curY, w, 16, 4).fill(COLOR_SURFACE);
  doc.roundedRect(bX, curY, w, 16, 4).stroke(COLOR_SURFACE_BORDER);
  doc.fillColor(COLOR_ACCENT).text(b, bX + 6, curY + 4);
  bX += w + 6;
});
doc.restore();
curY += 26;

// Media & Action Bar Container
const mediaBoxHeight = 110;
doc.save();
doc.roundedRect(MARGIN, curY, CONTENT_WIDTH, mediaBoxHeight, 6).fill(COLOR_SURFACE);
doc.roundedRect(MARGIN, curY, CONTENT_WIDTH, mediaBoxHeight, 6).stroke(COLOR_SURFACE_BORDER);

// Embed Poster image
const hazmatImg = path.join(assetsDir, 'hazmat.jpg');
if (fs.existsSync(hazmatImg)) {
  doc.image(hazmatImg, MARGIN + 8, curY + 8, { fit: [140, 94] });
}

// Side Info & Clickable Buttons
const sideX = MARGIN + 160;
doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLOR_TEXT);
doc.text('Interactive Reactive Core & GLSL Displacement', sideX, curY + 12);

doc.font('Helvetica').fontSize(8).fillColor(COLOR_TEXT_MUTED);
doc.text('12,000 instanced vertices with dynamic Simplex noise shaders and real-time pointer velocity refraction.', sideX, curY + 26, { width: CONTENT_WIDTH - 170 });

// Action Button 1: Open Prompt on Website
const btn1Y = curY + 68;
doc.roundedRect(sideX, btn1Y, 155, 28, 4).fill(COLOR_ACCENT_GREEN);
doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#000000');
doc.text('⚡ Open & Copy in Portal', sideX + 16, btn1Y + 9, {
  link: 'https://vinebdigital.store/#portal?prompt=hazmat-cyber'
});
doc.link(sideX, btn1Y, 155, 28, 'https://vinebdigital.store/#portal?prompt=hazmat-cyber');

// Action Button 2: Watch Video
const btn2X = sideX + 165;
doc.roundedRect(btn2X, btn1Y, 140, 28, 4).fill('#2563eb');
doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#ffffff');
doc.text('▶ Watch 60FPS Video', btn2X + 14, btn1Y + 9, {
  link: 'https://images.refero.design/styles/refero.design/video/7b76f1c1-600b-444f-a1a1-c51c831ec51a.mp4'
});
doc.link(btn2X, btn1Y, 140, 28, 'https://images.refero.design/styles/refero.design/video/7b76f1c1-600b-444f-a1a1-c51c831ec51a.mp4');
doc.restore();

curY += mediaBoxHeight + 14;

// Code Blueprint Container
doc.save();
doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLOR_TEXT);
doc.text('COMPLETE AI PROMPT BLUEPRINT (COPY DIRECTLY INTO CLAUDE OR CURSOR):', MARGIN, curY);
curY += 14;

const codeBoxH = 430;
doc.roundedRect(MARGIN, curY, CONTENT_WIDTH, codeBoxH, 6).fill(COLOR_CODE_BG);
doc.roundedRect(MARGIN, curY, CONTENT_WIDTH, codeBoxH, 6).stroke(COLOR_SURFACE_BORDER);

const p1Prompt = `Act as a Principal 3D Creative Technologist (Awwwards Site of the Year).
Build a production-ready, dark-mode Cybersecurity Enterprise Hero experience in React + Three.js + Tailwind CSS.

TECHNICAL CORE REQUIREMENTS:
1. THREE.JS VIEWPORT & MESH ARCHITECTURE:
   - Create an instanced particle dodecahedron core surrounded by dual floating counter-rotating ring lattices.
   - Implement custom vertex shaders with Simplex noise displacement driven by (position + time * 0.4).
   - Vertex colors must interpolate between neon cyan (#00f2fe) and encrypted violet (#4facfe).
   - Camera orbits smoothly with lerped mouse inertia damping (lookAt lerp factor = 0.05).

2. REAL-TIME THREAT BREACH SIMULATION:
   - Clicking or dragging triggers an animated shockwave ripple pulse radiating outwards along mesh normals.
   - On cursor acceleration > 2.5, inject temporary chromatic aberration and glitch fragment jitter.
   - Telemetry HUD overlay with live latitude/longitude, encrypted packet counter, and 60 FPS counter.

3. RESPONSIVE ARCHITECTURE & CLEAN SHUTDOWN:
   - Automatically resize on window dimension changes with pixel ratio clamped at Math.min(window.devicePixelRatio, 2).
   - Proper Three.js geometry/material disposal on React unmount to eliminate GPU memory leaks.
   - Clean TypeScript interfaces with zero external heavy assets required.`;

doc.font('Courier').fontSize(8).fillColor('#38bdf8');
doc.text(p1Prompt, MARGIN + 12, curY + 12, {
  width: CONTENT_WIDTH - 24,
  lineGap: 3
});

// Portal Link at bottom of code
doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR_ACCENT);
const copyLink = '👉 Link to Prompt on Store: https://vinebdigital.store/#portal?prompt=hazmat-cyber';
doc.text(copyLink, MARGIN + 12, curY + codeBoxH - 18, {
  link: 'https://vinebdigital.store/#portal?prompt=hazmat-cyber'
});
doc.restore();

drawFooter(doc, 2, 5);


// ==========================================
// FREE PROMPT 2: FINTECH LIQUIDITY ORDER BOOK
// ==========================================
doc.addPage();
drawBackground(doc);
drawHeader(doc, 3, 5);

curY = 65;

doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR_ACCENT);
doc.text('FREE UNLOCKED PRODUCTION ARCHITECTURE // 02', MARGIN, curY);
curY += 14;

doc.font('Helvetica-Bold').fontSize(15).fillColor(COLOR_TEXT);
doc.text('Institutional FinTech 3D Liquidity Order Book', MARGIN, curY);
curY += 18;

doc.font('Helvetica').fontSize(9).fillColor(COLOR_TEXT_MUTED);
doc.text('Real-Time WebGL Depth Mountain & High-Frequency Volume Mesh • Category: FinTech', MARGIN, curY);
curY += 16;

// Specs Row
doc.save();
const p2Badges = [
  'Client Value: $24,000',
  'Tokens: 3,350',
  'Sub-12ms Liquidity',
  'Three.js + React',
  'Billed to Hedge Fund'
];
bX = MARGIN;
p2Badges.forEach(b => {
  doc.font('Helvetica-Bold').fontSize(7.5);
  const w = doc.widthOfString(b) + 12;
  doc.roundedRect(bX, curY, w, 16, 4).fill(COLOR_SURFACE);
  doc.roundedRect(bX, curY, w, 16, 4).stroke(COLOR_SURFACE_BORDER);
  doc.fillColor(COLOR_ACCENT).text(b, bX + 6, curY + 4);
  bX += w + 6;
});
doc.restore();
curY += 26;

// Media & Action Bar Container
doc.save();
doc.roundedRect(MARGIN, curY, CONTENT_WIDTH, mediaBoxHeight, 6).fill(COLOR_SURFACE);
doc.roundedRect(MARGIN, curY, CONTENT_WIDTH, mediaBoxHeight, 6).stroke(COLOR_SURFACE_BORDER);

// Embed Poster image
const fintechImg = path.join(assetsDir, 'fintech.jpg');
if (fs.existsSync(fintechImg)) {
  doc.image(fintechImg, MARGIN + 8, curY + 8, { fit: [140, 94] });
}

doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLOR_TEXT);
doc.text('Wall Street Quantitative Visualizer', sideX, curY + 12);

doc.font('Helvetica').fontSize(8).fillColor(COLOR_TEXT_MUTED);
doc.text('Continuous 3D bid/ask depth wall transforming 50 ticks/sec into an undulating topographic volume mesh.', sideX, curY + 26, { width: CONTENT_WIDTH - 170 });

// Action Button 1: Open Prompt on Website
doc.roundedRect(sideX, btn1Y, 155, 28, 4).fill(COLOR_ACCENT_GREEN);
doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#000000');
doc.text('⚡ Open & Copy in Portal', sideX + 16, btn1Y + 9, {
  link: 'https://vinebdigital.store/#portal?prompt=fintech-liquidity-pool'
});
doc.link(sideX, btn1Y, 155, 28, 'https://vinebdigital.store/#portal?prompt=fintech-liquidity-pool');

// Action Button 2: Watch Video
doc.roundedRect(btn2X, btn1Y, 140, 28, 4).fill('#2563eb');
doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#ffffff');
doc.text('▶ Watch 60FPS Video', btn2X + 14, btn1Y + 9, {
  link: 'https://images.refero.design/styles/refero.design/video/6e6ad2ff-26c5-4fb6-90dc-ee4c3d596ca7.mp4'
});
doc.link(btn2X, btn1Y, 140, 28, 'https://images.refero.design/styles/refero.design/video/6e6ad2ff-26c5-4fb6-90dc-ee4c3d596ca7.mp4');
doc.restore();

curY += mediaBoxHeight + 14;

// Code Blueprint Container
doc.save();
doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLOR_TEXT);
doc.text('COMPLETE AI PROMPT BLUEPRINT (COPY DIRECTLY INTO CLAUDE OR CURSOR):', MARGIN, curY);
curY += 14;

doc.roundedRect(MARGIN, curY, CONTENT_WIDTH, codeBoxH, 6).fill(COLOR_CODE_BG);
doc.roundedRect(MARGIN, curY, CONTENT_WIDTH, codeBoxH, 6).stroke(COLOR_SURFACE_BORDER);

const p2Prompt = `Create an institutional quantitative trading terminal featuring an interactive 3D Order Book Depth Mountain in Three.js and React 19.

CORE TRADING ARCHITECTURE:
1. TOPOGRAPHIC 3D DEPTH MESH:
   - Render a dual-sided extruded plane geometry representing Bid (Buy) and Ask (Sell) liquidity volumes.
   - Bids: Emerald green gradient (#10b981 to #059669) on negative X axis.
   - Asks: Crimson red gradient (#ef4444 to #b91c1c) on positive X axis.
   - Vertex heights (Y axis) morph smoothly in real-time based on simulated or WebSocket order flow.
   - Wireframe grid overlay sitting directly on top of shaded depth mountains with subtle opacity.

2. SUB-12MS TICK TELEMETRY:
   - High-frequency update loop executing via requestAnimationFrame without triggering React re-renders.
   - Interactive crosshair slice plane: Hovering over any price coordinate highlights depth slice and displays total cumulative volume, implied spread, and estimated slippage in a floating monospace glass HUD card.

3. HARDWARE & WEBGPU READY:
   - Pure responsive viewport adapting seamlessly from 4K ultrawide trading desk displays to mobile iOS Safari.
   - Camera pan and pitch controls with bounded limits to prevent upside-down orientation.
   - Calibrated for instant generation with Claude 3.7 Sonnet and Cursor Composer.`;

doc.font('Courier').fontSize(8).fillColor('#38bdf8');
doc.text(p2Prompt, MARGIN + 12, curY + 12, {
  width: CONTENT_WIDTH - 24,
  lineGap: 3
});

doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR_ACCENT);
const copyLink2 = '👉 Link to Prompt on Store: https://vinebdigital.store/#portal?prompt=fintech-liquidity-pool';
doc.text(copyLink2, MARGIN + 12, curY + codeBoxH - 18, {
  link: 'https://vinebdigital.store/#portal?prompt=fintech-liquidity-pool'
});
doc.restore();

drawFooter(doc, 3, 5);


// ==========================================
// FREE PROMPT 3: LIQUID VISCOSITY SHADER
// ==========================================
doc.addPage();
drawBackground(doc);
drawHeader(doc, 4, 5);

curY = 65;

doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR_ACCENT);
doc.text('FREE UNLOCKED PRODUCTION ARCHITECTURE // 03', MARGIN, curY);
curY += 14;

doc.font('Helvetica-Bold').fontSize(15).fillColor(COLOR_TEXT);
doc.text('High-Viscosity Procedural Liquid & Mercury Shader', MARGIN, curY);
curY += 18;

doc.font('Helvetica').fontSize(9).fillColor(COLOR_TEXT_MUTED);
doc.text('Real-Time Surface Tension & Chromatic Sheen Physics • Category: Advanced 3D', MARGIN, curY);
curY += 16;

// Specs Row
doc.save();
const p3Badges = [
  'Client Value: $16,500',
  'Tokens: 3,100',
  '60 FPS iOS/Android',
  'GLSL Raymarching',
  'React Three Fiber'
];
bX = MARGIN;
p3Badges.forEach(b => {
  doc.font('Helvetica-Bold').fontSize(7.5);
  const w = doc.widthOfString(b) + 12;
  doc.roundedRect(bX, curY, w, 16, 4).fill(COLOR_SURFACE);
  doc.roundedRect(bX, curY, w, 16, 4).stroke(COLOR_SURFACE_BORDER);
  doc.fillColor(COLOR_ACCENT).text(b, bX + 6, curY + 4);
  bX += w + 6;
});
doc.restore();
curY += 26;

// Media Box
doc.save();
doc.roundedRect(MARGIN, curY, CONTENT_WIDTH, mediaBoxHeight, 6).fill(COLOR_SURFACE);
doc.roundedRect(MARGIN, curY, CONTENT_WIDTH, mediaBoxHeight, 6).stroke(COLOR_SURFACE_BORDER);

const liquidImg = path.join(assetsDir, 'liquid.jpg');
if (fs.existsSync(liquidImg)) {
  doc.image(liquidImg, MARGIN + 8, curY + 8, { fit: [140, 94] });
}

doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLOR_TEXT);
doc.text('Iridescent Mercury Fluid Dynamics', sideX, curY + 12);

doc.font('Helvetica').fontSize(8).fillColor(COLOR_TEXT_MUTED);
doc.text('Metaball-inspired liquid mercury shader with cursor inertia wake, iridescent specular sheen, and droplet coalescence.', sideX, curY + 26, { width: CONTENT_WIDTH - 170 });

// Action Button 1: Open Prompt on Website
doc.roundedRect(sideX, btn1Y, 155, 28, 4).fill(COLOR_ACCENT_GREEN);
doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#000000');
doc.text('⚡ Open & Copy in Portal', sideX + 16, btn1Y + 9, {
  link: 'https://vinebdigital.store/#portal?prompt=liquid-viscosity-shader'
});
doc.link(sideX, btn1Y, 155, 28, 'https://vinebdigital.store/#portal?prompt=liquid-viscosity-shader');

// Action Button 2: Watch Video
doc.roundedRect(btn2X, btn1Y, 140, 28, 4).fill('#2563eb');
doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#ffffff');
doc.text('▶ Watch 60FPS Video', btn2X + 14, btn1Y + 9, {
  link: 'https://images.refero.design/styles/refero.design/video/ed2c729e-76ce-4ad0-bad8-c57d67247ec7.mp4'
});
doc.link(btn2X, btn1Y, 140, 28, 'https://images.refero.design/styles/refero.design/video/ed2c729e-76ce-4ad0-bad8-c57d67247ec7.mp4');
doc.restore();

curY += mediaBoxHeight + 14;

// Code Blueprint Container
doc.save();
doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLOR_TEXT);
doc.text('COMPLETE AI PROMPT BLUEPRINT (COPY DIRECTLY INTO CLAUDE OR CURSOR):', MARGIN, curY);
curY += 14;

doc.roundedRect(MARGIN, curY, CONTENT_WIDTH, codeBoxH, 6).fill(COLOR_CODE_BG);
doc.roundedRect(MARGIN, curY, CONTENT_WIDTH, codeBoxH, 6).stroke(COLOR_SURFACE_BORDER);

const p3Prompt = `Code a custom GLSL liquid mercury shader in React Three Fiber that responds dynamically to pointer coordinates and scrolling velocity.

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
   - Zero external heavy physics libraries — pure WebGL fragment shader implementation.`;

doc.font('Courier').fontSize(8).fillColor('#38bdf8');
doc.text(p3Prompt, MARGIN + 12, curY + 12, {
  width: CONTENT_WIDTH - 24,
  lineGap: 3
});

doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR_ACCENT);
const copyLink3 = '👉 Link to Prompt on Store: https://vinebdigital.store/#portal?prompt=liquid-viscosity-shader';
doc.text(copyLink3, MARGIN + 12, curY + codeBoxH - 18, {
  link: 'https://vinebdigital.store/#portal?prompt=liquid-viscosity-shader'
});
doc.restore();

drawFooter(doc, 4, 5);


// ==========================================
// PAGE 5: FULL VAULT DIRECTORY & UPGRADE
// ==========================================
doc.addPage();
drawBackground(doc);
drawHeader(doc, 5, 5);

curY = 65;

doc.font('Helvetica-Bold').fontSize(16).fillColor(COLOR_TEXT);
doc.text('500+ MASTER VAULT DIRECTORY & UPGRADE PASS', MARGIN, curY);
curY += 18;

doc.font('Helvetica').fontSize(8.5).fillColor(COLOR_TEXT_MUTED);
doc.text('Explore the commercial architectures locked inside the master vault. Click any architecture to inspect video reel on the live site.', MARGIN, curY);
curY += 16;

// Table of locked high-ticket prompts
const lockedPrompts = [
  { id: 'valmora', title: 'VALMORA Haute-Couture Kinetic Spatial', val: '$28,500', cat: 'Luxury', reel: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/valmora.mp4' },
  { id: 'selene', title: 'SELENE Lunar Expedition Earthrise Engine', val: '$36,000', cat: 'Spatial 3D', reel: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/selene.mp4' },
  { id: 'ora', title: 'ORA Geneva Watchmaker 240 WebP Canvas', val: '$22,000', cat: 'Luxury', reel: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/ora-v2.mp4' },
  { id: 'fluxora', title: 'Fluxora Amber Visor Editorial Motion', val: '$19,500', cat: 'Agency Ops', reel: 'https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/previews/fluxora.mp4' },
  { id: 'luxury-watchmaker', title: 'PBR Sapphire Chronograph Turntable', val: '$18,000', cat: 'Luxury', reel: 'https://images.refero.design/styles/refero.design/video/c04b8df7-f655-46ba-b7e6-7019808e0ddc.mp4' },
  { id: 'nike-next-gen', title: 'Aerodynamic Hyper-Sneaker Exploded View', val: '$21,000', cat: 'E-Commerce', reel: 'https://images.refero.design/styles/refero.design/video/9fb05b0a-3373-455b-b9f1-d703e7c81d33.mp4' },
  { id: 'hypercar-configurator', title: 'Aerospace Carbon Fiber Hypercar Configurator', val: '$32,000', cat: 'Luxury', reel: 'https://images.refero.design/styles/refero.design/video/a1bf33c4-754e-4f11-9689-5198d0ce4fa1.mp4' },
  { id: 'quantum-defense-core', title: 'Autonomous Defense & Quantum Server Core', val: '$26,000', cat: 'Cyber & AI', reel: 'https://images.refero.design/styles/refero.design/video/6b173e6a-733c-44e8-8a82-35e69aa40532.mp4' },
  { id: 'cartier-diamond-brilliance', title: 'Cartier Diamond Spectral Refraction 3D', val: '$30,000', cat: 'Luxury', reel: 'https://images.refero.design/styles/refero.design/video/b51778c1-6547-498c-b0fc-dd7bcfa72852.mp4' }
];

doc.save();
let rowY = curY;
lockedPrompts.forEach((p, idx) => {
  const isAlt = idx % 2 === 1;
  const rowH = 24;
  doc.rect(MARGIN, rowY, CONTENT_WIDTH, rowH).fill(isAlt ? COLOR_SURFACE : COLOR_CODE_BG);
  doc.rect(MARGIN, rowY, CONTENT_WIDTH, rowH).stroke(COLOR_SURFACE_BORDER);

  // Status Pill
  doc.font('Helvetica-Bold').fontSize(7).fillColor('#fbbf24');
  doc.text('🔒 LOCKED', MARGIN + 8, rowY + 8);

  // Title
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR_TEXT);
  doc.text(p.title, MARGIN + 62, rowY + 8);

  // Category & Value
  doc.font('Helvetica').fontSize(7.5).fillColor(COLOR_TEXT_DIM);
  doc.text(`${p.cat} | Billed ${p.val}`, MARGIN + 275, rowY + 8);

  // Link to Video Reel
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#60a5fa');
  doc.text('▶ Video Reel', MARGIN + 380, rowY + 8, { link: p.reel });
  doc.link(MARGIN + 380, rowY + 4, 55, 16, p.reel);

  // Link to Inspect on Store
  const storePromptUrl = `https://vinebdigital.store/#portal?prompt=${p.id}`;
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_ACCENT);
  doc.text('⚡ Inspect →', MARGIN + 450, rowY + 8, { link: storePromptUrl });
  doc.link(MARGIN + 450, rowY + 4, 60, 16, storePromptUrl);

  rowY += rowH;
});
doc.restore();

curY = rowY + 20;

// High-Converting Upgrade Card
doc.save();
const upH = 260;
doc.roundedRect(MARGIN, curY, CONTENT_WIDTH, upH, 8).fill('#0c1222');
doc.roundedRect(MARGIN, curY, CONTENT_WIDTH, upH, 8).stroke('#2563eb');

// Top highlight bar
doc.roundedRect(MARGIN + 16, curY + 16, 170, 20, 10).fill('#1e3a8a');
doc.font('Helvetica-Bold').fontSize(8).fillColor('#93c5fd');
doc.text('COMMERCIAL LICENSE EXPANSION', MARGIN + 26, curY + 22);

doc.font('Helvetica-Bold').fontSize(16).fillColor('#ffffff');
doc.text('Unlock All 500+ Production 3D Architectures', MARGIN + 16, curY + 48);

doc.font('Helvetica').fontSize(9).fillColor('#cbd5e1');
const upText = `Elevate your client deliverables from generic templates to high-ticket, Awwwards-winning spatial web experiences. A single commercial client project pays for this pass over 250 times over.

MEMBERSHIP PRIVILEGES INCLUDE:
- Instant One-Click Copy for all 500+ prompts in the interactive Studio Portal
- Full Claude 3.7 Sonnet, Cursor Composer, and ChatGPT o3 calibrations
- 10+ Complete Next.js & React 19 boilerplate repositories with zero config
- Commercial Reseller Rights: Package deliverables directly into your client pitches
- Instant Delivery via WhatsApp and Email with official license key activation`;
doc.text(upText, MARGIN + 16, curY + 70, { width: CONTENT_WIDTH - 32, lineGap: 3 });

// Pricing Dual Pill
const priceY = curY + 185;
doc.font('Helvetica-Bold').fontSize(11).fillColor('#38bdf8');
doc.text('⚡ ONE-DAY SPRINT PASS: ₹49  |  👑 LIFETIME VIP PASS: ₹299', (PAGE_WIDTH - doc.widthOfString('⚡ ONE-DAY SPRINT PASS: ₹49  |  👑 LIFETIME VIP PASS: ₹299')) / 2, priceY);

// Big CTA Button
const bigBtnY = priceY + 22;
doc.roundedRect(MARGIN + 30, bigBtnY, CONTENT_WIDTH - 60, 36, 6).fill(COLOR_ACCENT_GREEN);
doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#000000');
const bigBtnText = 'UNLOCK FULL VAULT ACCESS NOW @ VINEBDIGITAL.STORE →';
doc.text(bigBtnText, (PAGE_WIDTH - doc.widthOfString(bigBtnText)) / 2, bigBtnY + 12, {
  link: 'https://vinebdigital.store/#pricing'
});
doc.link(MARGIN + 30, bigBtnY, CONTENT_WIDTH - 60, 36, 'https://vinebdigital.store/#pricing');
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
