const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Paths
const logoPath = path.resolve('public/wb-logo.png');
const outputPdfPath = path.resolve('public/30_Production_3D_WebGL_Prompts_VineB.pdf');

// Setup Document: Exactly 1 Page A4 (595.28 x 841.89 points)
const doc = new PDFDocument({
  size: 'A4',
  margin: 0,
  autoFirstPage: false,
  bufferPages: true,
  info: {
    Title: '3D WebGL Production Prompts — Member Access Pass — Vine B Digital',
    Author: 'Vine B Digital (vinebdigital.store)',
    Subject: 'Member Access Pass: 30 Production 3D WebGL Prompts',
    Keywords: 'Three.js, WebGL, React 19, Claude 3.7 Sonnet, Cursor, AI Prompts',
    CreationDate: new Date()
  }
});

const writeStream = fs.createWriteStream(outputPdfPath);
doc.pipe(writeStream);

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 30;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2; // 535.28

// Target Portal & Store URLs (Buttons & links only - never raw text)
const PORTAL_URL = 'https://3dwebprompts-vineb.vercel.app/#portal';
const PRICING_URL = 'https://3dwebprompts-vineb.vercel.app/#pricing';
const STORE_URL = 'https://vinebdigital.store';

// Palette
const COLOR_BG = '#06070a';
const COLOR_SURFACE = '#0f111a';
const COLOR_BORDER = '#202436';
const COLOR_BORDER_SUBTLE = '#181b29';
const COLOR_ACCENT = '#38bdf8';       // Sky Cyan
const COLOR_ACCENT_GREEN = '#10b981'; // Emerald Green
const COLOR_TEXT = '#f8fafc';         // Pure White
const COLOR_TEXT_MUTED = '#94a3b8';   // Slate 400
const COLOR_TEXT_DIM = '#64748b';     // Slate 500
const COLOR_CODE_BG = '#090a12';
const COLOR_AMBER = '#f59e0b';

// Helper to draw a styled interactive button
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
// SINGLE PAGE: MEMBER PORTAL ACCESS PASS
// ==========================================
doc.addPage();

// Background & Top Accent Glow
doc.save();
doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill(COLOR_BG);
doc.rect(0, 0, PAGE_WIDTH, 3).fill(COLOR_ACCENT);
doc.restore();

// ------------------------------------------
// 1. TOP HEADER (Y = 16 to 46)
// ------------------------------------------
const headerY = 16;
if (fs.existsSync(logoPath)) {
  doc.image(logoPath, MARGIN, headerY, { fit: [28, 28] });
  doc.link(MARGIN, headerY, 28, 28, STORE_URL);
}

// Brand Title beside Logo
doc.font('Helvetica-Bold').fontSize(10).fillColor(COLOR_TEXT);
doc.text('VINE B DIGITAL', MARGIN + 36, headerY + 2);
doc.font('Helvetica').fontSize(7.5).fillColor(COLOR_TEXT_DIM);
doc.text('// 3D WebGL Production Blueprint Repository • Studio Edition', MARGIN + 36, headerY + 14);

// Top Right Portal Access Button (Button plate only, no raw URL)
const topBtnW = 140;
const topBtnH = 22;
const topBtnX = PAGE_WIDTH - MARGIN - topBtnW;
drawButton(doc, topBtnX, headerY + 2, topBtnW, topBtnH, '⚡ Open Studio Portal →', PORTAL_URL, COLOR_SURFACE, COLOR_ACCENT, 8);

// Hairline Divider
doc.save();
doc.rect(MARGIN, 50, CONTENT_WIDTH, 0.5).fill(COLOR_BORDER_SUBTLE);
doc.restore();

// ------------------------------------------
// 2. HERO TITLE & STATUS BADGE (Y = 62 to 142)
// ------------------------------------------
let curY = 62;

// Eyebrow Pill
doc.save();
const eyebrowText = '🔑 OFFICIAL AUTHENTICATED ACCESS PASS • STUDIO EDITION';
doc.font('Helvetica-Bold').fontSize(7.5);
const ebW = doc.widthOfString(eyebrowText) + 16;
const ebX = (PAGE_WIDTH - ebW) / 2;
doc.roundedRect(ebX, curY, ebW, 18, 9).fill('#081626');
doc.roundedRect(ebX, curY, ebW, 18, 9).stroke('#0284c7');
doc.fillColor('#38bdf8').text(eyebrowText, ebX + 8, curY + 5);
doc.restore();
curY += 25;

// Main Headline
doc.font('Helvetica-Bold').fontSize(19).fillColor(COLOR_TEXT);
const heroTitle = 'YOUR 30+ 3D WEBGL PROMPTS ARE READY';
doc.text(heroTitle, (PAGE_WIDTH - doc.widthOfString(heroTitle)) / 2, curY);
curY += 24;

// Subtitle
doc.font('Helvetica').fontSize(8.5).fillColor(COLOR_TEXT_MUTED);
const heroSub = 'To ensure zero outdated code and enable 1-click clipboard copying with live 60 FPS previews,';
const heroSub2 = 'all 30 production prompts are delivered inside the official Studio Portal.';
doc.text(heroSub, (PAGE_WIDTH - doc.widthOfString(heroSub)) / 2, curY);
curY += 13;
doc.text(heroSub2, (PAGE_WIDTH - doc.widthOfString(heroSub2)) / 2, curY);
curY += 18;

// 4 Feature Pills Row
const pills = [
  'Claude 3.7 Sonnet Calibrated',
  'Cursor & ChatGPT o3-mini',
  '60 FPS Frame Budget',
  'Zero External 3D Models'
];
let pillX = MARGIN + 6;
pills.forEach((p) => {
  doc.font('Helvetica-Bold').fontSize(7.5);
  const pw = doc.widthOfString(p) + 14;
  doc.roundedRect(pillX, curY, pw, 18, 9).fill(COLOR_SURFACE);
  doc.roundedRect(pillX, curY, pw, 18, 9).stroke(COLOR_BORDER);
  doc.fillColor(COLOR_TEXT).text(p, pillX + 7, curY + 5);
  pillX += pw + 8;
});
curY += 28;

// ------------------------------------------
// 3. MAIN AUTHENTICATED ACCESS CARD (Y = 170 to 385)
// ------------------------------------------
const passCardY = curY;
const passCardH = 215;
doc.save();
doc.roundedRect(MARGIN, passCardY, CONTENT_WIDTH, passCardH, 8).fill('#081226');
doc.roundedRect(MARGIN, passCardY, CONTENT_WIDTH, passCardH, 8).stroke('#2563eb');

// Eyebrow Tag inside pass
doc.roundedRect(MARGIN + 16, passCardY + 14, 180, 17, 4).fill('#1e3a8a');
doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#93c5fd');
doc.text('🔐 HOW TO LOG IN & COPY YOUR PROMPTS', MARGIN + 22, passCardY + 18);

// Headline
doc.font('Helvetica-Bold').fontSize(12.5).fillColor('#ffffff');
doc.text('Use Your Registered Email to Unlock All 30 Prompts', MARGIN + 16, passCardY + 38);

// 3-Step Clear Instructions
const steps = [
  {
    num: '1',
    title: 'USE YOUR REGISTERED EMAIL ADDRESS:',
    desc: 'Access is automatically pre-authorized for the email address you entered on the website when requesting this pass.'
  },
  {
    num: '2',
    title: 'CLICK THE ACCESS BUTTON BELOW:',
    desc: 'Launch the official Studio Portal directly in your browser. (No password or complex setup required).'
  },
  {
    num: '3',
    title: 'ONE-CLICK COPY INTO CLAUDE OR CURSOR:',
    desc: 'Click "Copy Prompt" on any blueprint to copy the unminified Three.js component code with full shaders directly into your AI editor.'
  }
];

let stepY = passCardY + 56;
steps.forEach((s) => {
  doc.save();
  // Step Number Badge
  doc.roundedRect(MARGIN + 16, stepY, 18, 18, 4).fill('#1e3a8a');
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#60a5fa');
  doc.text(s.num, MARGIN + 22, stepY + 4);

  // Step Title & Desc
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff');
  doc.text(s.title, MARGIN + 40, stepY + 1);

  doc.font('Helvetica').fontSize(7.5).fillColor('#cbd5e1');
  doc.text(s.desc, MARGIN + 40, stepY + 13, { width: CONTENT_WIDTH - 60, lineGap: 1.5 });
  doc.restore();
  stepY += 32;
});

// Big Styled Button (Button plate only, no raw URL displayed)
const bigBtnY = passCardY + 160;
drawButton(
  doc,
  MARGIN + 16,
  bigBtnY,
  CONTENT_WIDTH - 32,
  40,
  '🚀 OPEN STUDIO PORTAL & ACCESS ALL 30 PROMPTS NOW →',
  PORTAL_URL,
  COLOR_ACCENT_GREEN,
  '#000000',
  10.5
);
doc.restore();

curY = passCardY + passCardH + 14;

// ------------------------------------------
// 4. WHAT'S INSIDE YOUR UNLOCKED REPOSITORY (Y = 400 to 535)
// ------------------------------------------
doc.font('Helvetica-Bold').fontSize(10).fillColor(COLOR_TEXT);
doc.text('WHAT IS INCLUDED IN YOUR FREE 30-PROMPT STUDIO REPOSITORY:', MARGIN, curY);
curY += 15;

const categories = [
  {
    badge: 'CYBER & AGENCY',
    title: 'Hazmat Reactive Shield & Threat Grid',
    tech: 'Three.js • Instanced Dodecahedron • GLSL Simplex Noise',
    val: '$14,500 Client Value'
  },
  {
    badge: 'FINTECH & TRADING',
    title: 'Institutional 3D Liquidity Order Book',
    tech: 'Three.js + React 19 • Dynamic Depth Mountain • Raycaster Crosshair',
    val: '$24,000 Client Value'
  },
  {
    badge: 'SPATIAL & LUXURY',
    title: 'Liquid Mercury Audio-Reactive Kinetic Mesh',
    tech: 'Raymarching Signed Distance Field (SDF) • Chromatic Dispersion',
    val: '$18,500 Client Value'
  }
];

categories.forEach((cat) => {
  doc.save();
  const ch = 36;
  doc.roundedRect(MARGIN, curY, CONTENT_WIDTH, ch, 5).fill(COLOR_SURFACE);
  doc.roundedRect(MARGIN, curY, CONTENT_WIDTH, ch, 5).stroke(COLOR_BORDER);

  // Category Badge
  doc.roundedRect(MARGIN + 8, curY + 8, 88, 18, 3).fill(COLOR_CODE_BG);
  doc.font('Helvetica-Bold').fontSize(6.5).fillColor(COLOR_ACCENT);
  doc.text(cat.badge, MARGIN + 12, curY + 13);

  // Title & Tech
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLOR_TEXT);
  doc.text(cat.title, MARGIN + 104, curY + 7);

  doc.font('Helvetica').fontSize(7).fillColor(COLOR_TEXT_MUTED);
  doc.text(cat.tech, MARGIN + 104, curY + 20);

  // Value Pill
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_ACCENT_GREEN);
  const valW = doc.widthOfString(cat.val);
  doc.text(cat.val, PAGE_WIDTH - MARGIN - valW - 12, curY + 13);

  doc.restore();
  curY += ch + 6;
});

curY += 8;

// ------------------------------------------
// 5. COMMERCIAL EXPANSION VAULT UPGRADE (Y = 550 to 765)
// ------------------------------------------
const upH = 195;
doc.save();
doc.roundedRect(MARGIN, curY, CONTENT_WIDTH, upH, 8).fill('#0b1120');
doc.roundedRect(MARGIN, curY, CONTENT_WIDTH, upH, 8).stroke('#2563eb');

// Eyebrow Tag
doc.roundedRect(MARGIN + 16, curY + 12, 185, 17, 4).fill('#1e3a8a');
doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#bfdbfe');
doc.text('👑 OPTIONAL COMMERCIAL UPGRADE', MARGIN + 22, curY + 16);

// Headline
doc.font('Helvetica-Bold').fontSize(12.5).fillColor('#ffffff');
doc.text('Unlock All 500+ Production 3D Architectures', MARGIN + 16, curY + 35);

doc.font('Helvetica').fontSize(8).fillColor('#cbd5e1');
const upDesc = `Need the full production library for high-ticket agency deliverables?
- Instant 1-click clipboard copy for all 500+ commercial 3D WebGL architectures
- Calibrated for Claude 3.7 Sonnet Extended Thinking, Cursor Composer & ChatGPT o3-mini
- 10+ Complete Next.js, Vite & React 19 production boilerplate GitHub repositories
- Full Commercial Reseller Rights: Ship client projects without attribution`;
doc.text(upDesc, MARGIN + 16, curY + 53, { width: CONTENT_WIDTH - 32, lineGap: 3 });

// Dual Pricing Row
const priceY = curY + 118;
doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLOR_ACCENT);
const priceText = '⚡ ONE-DAY SPRINT PASS: ₹49   |   👑 LIFETIME VIP PASS: ₹299';
doc.text(priceText, (PAGE_WIDTH - doc.widthOfString(priceText)) / 2, priceY);

// Dual Buttons (Button plates only, no raw URL displayed)
const upBtnY = priceY + 16;
const halfBtnW = (CONTENT_WIDTH - 40) / 2;

// Button 1: Open Free Studio Portal
drawButton(
  doc,
  MARGIN + 16,
  upBtnY,
  halfBtnW,
  34,
  '🚀 OPEN FREE STUDIO PORTAL →',
  PORTAL_URL,
  COLOR_ACCENT_GREEN,
  '#000000',
  8.5
);

// Button 2: Unlock Full Vault
drawButton(
  doc,
  MARGIN + 24 + halfBtnW,
  upBtnY,
  halfBtnW,
  34,
  '👑 UNLOCK ALL 500+ VAULT @ ₹49 →',
  PRICING_URL,
  '#2563eb',
  '#ffffff',
  8.5
);
doc.restore();

// ------------------------------------------
// 6. FOOTER (Y = 805 to 830)
// ------------------------------------------
const footY = 805;
doc.save();
doc.rect(MARGIN, footY, CONTENT_WIDTH, 0.5).fill(COLOR_BORDER_SUBTLE);

// Logo link in footer
doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_ACCENT);
doc.text('vinebdigital.store', MARGIN, footY + 8, { link: STORE_URL });
doc.link(MARGIN, footY + 6, 80, 14, STORE_URL);

doc.font('Helvetica').fontSize(7.5).fillColor(COLOR_TEXT_DIM);
doc.text('Official Commercial Blueprint Access Pass • Calibrated for Claude 3.7 & Cursor', MARGIN + 88, footY + 8);

const pageStr = 'Page 1 of 1';
doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_TEXT_MUTED);
doc.text(pageStr, PAGE_WIDTH - MARGIN - doc.widthOfString(pageStr), footY + 8);
doc.restore();

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
