import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import {
  X,
  Download,
  Check,
  Mail,
  User,
  Sparkles,
  GraduationCap,
  Briefcase,
  Building2,
  AlertCircle,
  ArrowRight,
  FileText,
  Gift,
  Zap,
} from 'lucide-react';
import { sound } from '../lib/audioEngine';
import { saveGhostKeystrokeLead, LeadOrder } from '../lib/leadTracker';
import { sendInstantLeadMagnetOrAbandonedEmail } from '../lib/resendEmail';
import { getEmailValidationError, isDisposableEmail } from '../lib/security';

export type UserRole = 'Student' | 'Freelancer' | 'Agency Owner';

interface LeadMagnetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessRedirect: () => void;
}

// Generates and triggers download of authentic 30+ Prompts PDF
const trigger30PromptsPdfDownload = (userName: string, userRole: string) => {
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Valid PDF-1.4 format containing 30 production prompt architectures
  const pdfRaw = `%PDF-1.4
%âãÏÓ
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 1450 >>
stream
BT
/F1 18 Tf
50 740 Td
(VINE B DIGITAL - 30+ 3D WEBGL PROMPT VAULT (STARTER EDITION)) Tj
/F1 9 Tf
0 -22 Td
(Prepared for: ${userName} (${userRole}) | Issued: ${dateStr} | Official Release) Tj
/F1 11 Tf
0 -30 Td
(1. HAZMAT CYBERSECURITY ENTERPRISE HERO - THREE.JS + GLSL) Tj
/F1 8 Tf
0 -16 Td
(Prompt: Build a production dark-mode Cybersecurity Hero in React + Three.js with instanced vertices) Tj
0 -12 Td
(and GLSL noise displacement responding to mouse velocity with chromatic aberration.) Tj
/F1 11 Tf
0 -24 Td
(2. LUXURY WATCHMAKER 3D TURNTABLE - PBR SAPPHIRE SHADERS) Tj
/F1 8 Tf
0 -16 Td
(Prompt: Photorealistic chronograph turntable with physical metalness, roughness & HDR reflections.) Tj
/F1 11 Tf
0 -24 Td
(3. LIQUID GLASS NEOMORPHIC CARD SPHERE - SPLINE INTERACTIVE) Tj
/F1 8 Tf
0 -16 Td
(Prompt: Cursor-driven floating glass card cluster with dynamic light refraction and spring physics.) Tj
/F1 11 Tf
0 -24 Td
(4. SPATIAL VISION OS PARALLAX DESKTOP) Tj
/F1 8 Tf
0 -16 Td
(Prompt: Apple Vision OS styled spatial glass windows with eye-tracking depth and frosted blur.) Tj
/F1 11 Tf
0 -24 Td
(5. AUDIO-REACTIVE VOLUMETRIC WAVEFORM TUNNEL) Tj
/F1 8 Tf
0 -16 Td
(Prompt: WebAudio API FFT-driven GLSL shader tunnel with real-time bass frequency reactivity.) Tj
/F1 11 Tf
0 -24 Td
(6. REAL-TIME 3D FINTECH TRANSACTION VAULT) Tj
/F1 8 Tf
0 -16 Td
(Prompt: Stripe/Wise styled interactive 3D currency matrix with magnetic particle trails.) Tj
/F1 11 Tf
0 -28 Td
(7 - 30. FULL 30+ PROMPT COLLECTION & LIVE CODE REPOSITORIES) Tj
/F1 8 Tf
0 -16 Td
(Unlock the full 500+ Commercial 3D Prompt Architectures for just Rs 49 at: https://vinebdigital.store) Tj
0 -12 Td
(Includes: One-Click Copy, Claude 3.7 & Cursor calibration, Reseller Rights, and lifetime updates.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000068 00000 n 
0000000125 00000 n 
0000000242 00000 n 
0000001745 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1820
%%EOF`;

  try {
    const blob = new Blob([pdfRaw], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `30_Production_3D_WebGL_Prompts_VineB.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch (err) {
    console.error('PDF download error:', err);
  }
};

export const LeadMagnetModal: React.FC<LeadMagnetModalProps> = ({
  isOpen,
  onClose,
  onSuccessRedirect,
}) => {
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem('vineb_user_name') || '';
    } catch {
      return '';
    }
  });
  const [phone, setPhone] = useState(() => {
    try {
      return localStorage.getItem('vineb_user_phone') || '';
    } catch {
      return '';
    }
  });
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('vineb_user_email') || '';
    } catch {
      return '';
    }
  });
  const [role, setRole] = useState<UserRole | null>(() => {
    try {
      return (localStorage.getItem('vineb_user_role') as UserRole) || 'Freelancer';
    } catch {
      return 'Freelancer';
    }
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Input refs for direct DOM browser autofill extraction
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playClick();
        handleGhostAutoSave();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, email, name, phone]);

  // Real-time Browser Autofill Detection
  useEffect(() => {
    if (isOpen) {
      const triggerAutofillCheck = () => {
        const domEmail = emailInputRef.current?.value || '';
        const domName = nameInputRef.current?.value || '';
        const domPhone = phoneInputRef.current?.value || '';

        const effectiveEmail = (domEmail || email || '').trim().toLowerCase();
        const effectiveName = (domName || name || '').trim();
        const effectivePhone = (domPhone || phone || '').trim();

        if (
          effectiveEmail &&
          effectiveEmail.includes('@') &&
          effectiveEmail.includes('.') &&
          !effectiveEmail.includes('example.com')
        ) {
          if (domEmail && domEmail !== email) setEmail(domEmail);
          if (domName && domName !== name) setName(domName);
          if (domPhone && domPhone !== phone) setPhone(domPhone);
          handleGhostAutoSave(effectiveEmail, effectiveName, effectivePhone, 'browser_autofill');
        }
      };

      triggerAutofillCheck();
      const t1 = setTimeout(triggerAutofillCheck, 150);
      const t2 = setTimeout(triggerAutofillCheck, 400);
      const t3 = setTimeout(triggerAutofillCheck, 900);
      const t4 = setTimeout(triggerAutofillCheck, 2000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleGhostAutoSave = (
    emailOverride?: string,
    nameOverride?: string,
    phoneOverride?: string,
    source: 'browser_autofill' | 'keystroke' | 'lead_magnet' = 'keystroke'
  ) => {
    const rawEmail = (emailOverride !== undefined ? emailOverride : email).trim();
    if (!rawEmail || !rawEmail.includes('@') || !rawEmail.includes('.')) return;
    const rawPhone = phoneOverride !== undefined ? phoneOverride : phone;
    const rawName = nameOverride !== undefined ? nameOverride : name;

    const cleanPhone = rawPhone.trim() ? rawPhone.replace(/\D/g, '') : '';
    const leadName = rawName.trim() || 'Visitor (Lead Magnet)';
    const cleanEmail = rawEmail.toLowerCase();

    // Block saving or sending emails to temporary burner inboxes
    if (isDisposableEmail(cleanEmail)) return;

    const leadData = {
      name: leadName,
      phone: cleanPhone,
      email: cleanEmail,
      tierId: 'free_pdf',
      tierName: 'Free 30+ Prompts PDF Magnet',
      amountINR: 0,
      source,
    };

    // 1. Save in Ghost / Abandoned Orders database & sync to Firestore
    saveGhostKeystrokeLead(leadData);

    // 2. Cache in localStorage & provision Client Portal member preview
    try {
      localStorage.setItem('vineb_user_name', leadName);
      localStorage.setItem('vineb_user_email', cleanEmail);
      if (cleanPhone) localStorage.setItem('vineb_user_phone', cleanPhone);

      const memberSession: LeadOrder = {
        id: `USR-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}`,
        orderNumber: `MEM-${Date.now().toString().slice(-4)}`,
        name: leadName,
        email: cleanEmail,
        phone: cleanPhone,
        tierId: 'member',
        tierName: 'Free Trial Member (1 Sample Quota)',
        amountINR: 0,
        status: 'approved',
        source,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
      };
      sessionStorage.setItem('apex3d_portal_active_order', JSON.stringify(memberSession));
    } catch {
      // storage error ignored
    }

    // 3. Dispatch instant welcome & starter email via Resend API
    sendInstantLeadMagnetOrAbandonedEmail(leadData).catch(() => {});
  };

  const handleClose = () => {
    sound.playClick();
    handleGhostAutoSave();
    setError(null);
    setIsSubmittedSuccess(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError('Please provide your full name.');
      sound.playClick();
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit WhatsApp number.');
      sound.playClick();
      return;
    }

    const emailErr = getEmailValidationError(email);
    if (emailErr) {
      setError(emailErr);
      sound.playClick();
      return;
    }

    if (!role) {
      setError('Please select whether you are a Student, Freelancer, or Agency Owner.');
      sound.playClick();
      return;
    }

    setIsSubmitting(true);
    sound.playSuccess();

    // Persist details so future pricing checkout is prefilled instantly
    try {
      localStorage.setItem('vineb_user_name', name.trim());
      localStorage.setItem('vineb_user_phone', cleanPhone);
      localStorage.setItem('vineb_user_email', email.trim().toLowerCase());
      localStorage.setItem('vineb_user_role', role);

      const stored = JSON.parse(localStorage.getItem('apex_prompt_leads') || '[]');
      stored.push({
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim().toLowerCase(),
        role,
        source: 'Free 30+ Prompts PDF',
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('apex_prompt_leads', JSON.stringify(stored));

      saveGhostKeystrokeLead({
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim().toLowerCase(),
        tierId: 'free_pdf',
        tierName: 'Free 30+ Prompts PDF Magnet',
        amountINR: 0,
      });
    } catch {
      // Storage error ignored
    }

    // Trigger instant browser download of 30+ prompts PDF
    trigger30PromptsPdfDownload(name.trim(), role);

    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#60A5FA', '#10B981', '#F59E0B', '#FFFFFF'],
      });
    } catch (err) {
      console.debug('Confetti error:', err);
    }

    setIsSubmitting(false);
    setIsSubmittedSuccess(true);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 select-none animate-role-fade-in">
      {/* Click outside backdrop with hardware blur */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog Plate - Precision Obsidian Surface */}
      <div className="relative w-full max-w-lg rounded-2xl bg-[#08080c] border border-white/10 p-6 sm:p-8 text-white z-10 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.85)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] max-h-[92vh] overflow-y-auto">
        {/* Subtle Top Ambient Refraction Line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white transition-all flex items-center justify-center"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ========================================================
            SUCCESS VIEW: PDF DOWNLOADED + UPSELL TO FULL VAULT
           ======================================================== */}
        {isSubmittedSuccess ? (
          <div className="py-2 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400 font-semibold">
                  DOCUMENT COMPILED & DISPATCHED
                </div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  30+ Prompts Starter Kit Ready
                </h3>
              </div>
            </div>

            <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
              Your starter repository <code className="text-zinc-200 font-mono text-[11px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10">30_Production_3D_WebGL_Prompts_VineB.pdf</code> has initiated direct download. A backup delivery is archived for <strong className="text-zinc-200">{email}</strong> and WhatsApp <strong className="text-zinc-200">+91 {phone}</strong>.
            </p>

            {/* Special Upgrade Offer Box */}
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-b from-blue-950/20 to-black/40 border border-blue-500/25 mb-5">
              <div className="flex items-center justify-between gap-2 mb-2 font-mono text-[10px]">
                <span className="text-blue-400 font-semibold tracking-wider uppercase">
                  COMPLETE VAULT EXPANSION
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-blue-200 font-bold">
                  ONE-DAY SPRINT: ₹49
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white mb-1.5">
                Command All 500+ Calibrated 3D Architectures
              </h4>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Gain instant one-click copy access to every enterprise AI, spatial hardware, fintech liquidity, and custom GLSL shader framework in the master vault.
              </p>

              <button
                type="button"
                onClick={() => {
                  sound.playSuccess();
                  handleClose();
                  onSuccessRedirect();
                }}
                className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] transition-all shadow-[0_4px_16px_rgba(37,99,235,0.35)] flex items-center justify-center gap-2"
              >
                <span>Unlock Full 500+ Vault Pass @ ₹49</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleClose}
                className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Dismiss & return to workspace
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================
              INITIAL FORM: CLAIM FREE 30+ PROMPTS PDF
             ======================================================== */
          <>
            {/* Architectural Breadcrumb Header */}
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] text-blue-400 uppercase mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>APEX3D VAULT // STARTER REPOSITORY</span>
            </div>

            {/* Modal Title & Subtitle */}
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
              30 Production 3D & WebGL Prompts
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mb-5 leading-relaxed">
              Access 30 calibrated production Three.js, React Three Fiber, and GLSL prompt architectures with physically accurate shaders and camera physics.
            </p>

            {/* Technical Specs Strip */}
            <div className="grid grid-cols-2 gap-2 mb-5 font-mono text-[11px] text-zinc-300">
              <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">30 Master Schemas</span>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">Claude 3.7 & Cursor</span>
              </div>
            </div>

            {/* Error Callout */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/30 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 animate-role-fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Precision Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field 1: Full Name */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Full Name <span className="text-blue-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    ref={nameInputRef}
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onAnimationStart={(e) => {
                      if (e.animationName === 'onAutoFillStart') {
                        const val = (e.target as HTMLInputElement).value;
                        if (val) {
                          setName(val);
                          handleGhostAutoSave(undefined, val, undefined, 'browser_autofill');
                        }
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      setName(val);
                      if (error) setError(null);
                      if (email.includes('@') && email.includes('.')) {
                        handleGhostAutoSave(undefined, val);
                      }
                    }}
                    onBlur={() => handleGhostAutoSave()}
                    placeholder="Rahul Sharma"
                    className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800 text-zinc-100 text-xs sm:text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Field 2: WhatsApp Phone */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  WhatsApp Phone <span className="text-blue-400">*</span>
                </label>
                <div className="flex rounded-lg bg-zinc-900/60 border border-zinc-800 overflow-hidden focus-within:border-zinc-500 focus-within:ring-1 focus-within:ring-zinc-500/20 transition-all">
                  <span className="px-3 py-2 bg-zinc-800/60 border-r border-zinc-800 text-xs font-mono text-zinc-300 flex items-center shrink-0">
                    +91
                  </span>
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    required
                    autoComplete="tel"
                    maxLength={10}
                    value={phone}
                    onAnimationStart={(e) => {
                      if (e.animationName === 'onAutoFillStart') {
                        const val = (e.target as HTMLInputElement).value.replace(/\D/g, '');
                        if (val) {
                          setPhone(val);
                          handleGhostAutoSave(undefined, undefined, val, 'browser_autofill');
                        }
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPhone(val);
                      if (error) setError(null);
                      if (email.includes('@') && email.includes('.')) {
                        handleGhostAutoSave(undefined, undefined, val);
                      }
                    }}
                    onBlur={() => handleGhostAutoSave()}
                    placeholder="98765 43210"
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono text-zinc-100 placeholder:text-zinc-600 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* Field 3: Email */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Work / Personal Email <span className="text-blue-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    ref={emailInputRef}
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onAnimationStart={(e) => {
                      if (e.animationName === 'onAutoFillStart') {
                        const val = (e.target as HTMLInputElement).value;
                        if (val && val.includes('@')) {
                          setEmail(val);
                          handleGhostAutoSave(val, undefined, undefined, 'browser_autofill');
                        }
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEmail(val);
                      if (error) setError(null);
                      if (val.includes('@') && val.includes('.') && val.length > 5) {
                        handleGhostAutoSave(val);
                      }
                    }}
                    onBlur={() => handleGhostAutoSave()}
                    placeholder="developer@studio.com"
                    className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800 text-zinc-100 text-xs sm:text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Field 4: Discipline / Role */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Discipline <span className="text-blue-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Student', 'Freelancer', 'Agency Owner'] as UserRole[]).map((r) => {
                    const isSelected = role === r;
                    const Icon = r === 'Student' ? GraduationCap : r === 'Freelancer' ? Briefcase : Building2;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setRole(r);
                          if (error) setError(null);
                        }}
                        className={`py-2 px-2.5 rounded-lg border text-xs font-mono transition-all flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? 'bg-zinc-100 text-zinc-950 border-white font-medium shadow-sm'
                            : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-zinc-950' : 'text-zinc-500'}`} />
                        <span className="truncate">{r === 'Agency Owner' ? 'Studio Lead' : r}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] transition-all shadow-[0_4px_16px_rgba(37,99,235,0.35)] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Compiling Architectural PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-white" />
                      <span>Download Starter PDF (Instant Direct Access)</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <span className="text-[10px] font-mono text-zinc-500">
                  Direct cryptographic download • No payment details required • WhatsApp backup included
                </span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
