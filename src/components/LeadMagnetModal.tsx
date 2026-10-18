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
import { saveOrder, saveGhostKeystrokeLead, LeadOrder } from '../lib/leadTracker';
import { sendInstantLeadMagnetOrAbandonedEmail } from '../lib/resendEmail';
import { getEmailValidationError, isDisposableEmail } from '../lib/security';
import { safeLocalStorage, safeSessionStorage } from '../lib/safeStorage';

export type UserRole = 'Student' | 'Freelancer' | 'Agency Owner';

interface LeadMagnetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessRedirect: () => void;
}

// Triggers download of the authentic, interactive 3D WebGL Prompts PDF
const trigger30PromptsPdfDownload = (_userName?: string, _userRole?: string) => {
  try {
    const pdfUrl = '/30_Production_3D_WebGL_Prompts_VineB.pdf';
    const isWebView =
      typeof navigator !== 'undefined' &&
      /Instagram|FBAN|FBAV|TikTok|Line|Twitter/i.test(navigator.userAgent);

    if (isWebView) {
      window.open(pdfUrl, '_blank');
      setTimeout(() => {
        window.location.href = pdfUrl;
      }, 350);
      return;
    }

    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = '30_Production_3D_WebGL_Prompts_VineB.pdf';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        if (a.parentNode) a.parentNode.removeChild(a);
      } catch {}
    }, 500);
  } catch (err) {
    console.error('PDF download error:', err);
    window.location.href = '/30_Production_3D_WebGL_Prompts_VineB.pdf';
  }
};

export const LeadMagnetModal: React.FC<LeadMagnetModalProps> = ({
  isOpen,
  onClose,
  onSuccessRedirect,
}) => {
  const [name, setName] = useState(() => safeLocalStorage.getItem('vineb_user_name') || '');
  const [phone, setPhone] = useState(() => safeLocalStorage.getItem('vineb_user_phone') || '');
  const [email, setEmail] = useState(() => safeLocalStorage.getItem('vineb_user_email') || '');
  const [role, setRole] = useState<UserRole | null>(
    () => (safeLocalStorage.getItem('vineb_user_role') as UserRole) || 'Freelancer'
  );

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [mounted, setMounted] = useState(() => typeof window !== 'undefined');

  // Input refs for direct DOM browser autofill extraction
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleGhostAutoSave = (
    emailOverride?: string,
    nameOverride?: string,
    phoneOverride?: string,
    source: 'browser_autofill' | 'keystroke' | 'lead_magnet' = 'keystroke'
  ) => {
    try {
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
      try {
        saveGhostKeystrokeLead(leadData);
      } catch (err) {
        console.debug('Ghost save notice:', err);
      }

      // 2. Cache in storage & provision Client Portal member preview
      try {
        safeLocalStorage.setItem('vineb_user_name', leadName);
        safeLocalStorage.setItem('vineb_user_email', cleanEmail);
        if (cleanPhone) safeLocalStorage.setItem('vineb_user_phone', cleanPhone);

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
        safeSessionStorage.setItem('apex3d_portal_active_order', JSON.stringify(memberSession));
      } catch {
        // storage error ignored
      }
    } catch {
      // overall guard
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    try {
      document.body.style.overflow = 'hidden';
    } catch {}

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        try {
          sound.playClick();
          handleGhostAutoSave();
        } catch {}
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      try {
        document.body.style.overflow = originalOverflow;
      } catch {}
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, email, name, phone]);

  // Real-time Browser Autofill Detection
  useEffect(() => {
    if (isOpen) {
      const triggerAutofillCheck = () => {
        try {
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
        } catch {}
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

  // Automated 3-second countdown to transport user into Member Portal upon successful submission
  useEffect(() => {
    if (!isSubmittedSuccess) return;
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev !== null && prev <= 1) {
          clearInterval(timer);
          setIsSubmittedSuccess(false);
          onClose();
          window.location.hash = '#portal';
          return 0;
        }
        return prev !== null ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmittedSuccess, onClose]);

  if (!isOpen || !mounted) return null;

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleClose = () => {
    try {
      sound.playClick();
    } catch {}
    handleGhostAutoSave();
    setError(null);
    setIsSubmittedSuccess(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isSubmittedSuccess) return;
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError('Please provide your full name.');
      try { sound.playClick(); } catch {}
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit WhatsApp number.');
      try { sound.playClick(); } catch {}
      return;
    }

    const emailErr = getEmailValidationError(email);
    if (emailErr) {
      setError(emailErr);
      try { sound.playClick(); } catch {}
      return;
    }

    if (!role) {
      setError('Please select whether you are a Student, Freelancer, or Agency Owner.');
      try { sound.playClick(); } catch {}
      return;
    }

    setIsSubmitting(true);
    try { sound.playSuccess(); } catch {}

    // Persist details safely so future pricing checkout is prefilled instantly
    try {
      safeLocalStorage.setItem('vineb_user_name', name.trim());
      safeLocalStorage.setItem('vineb_user_phone', cleanPhone);
      safeLocalStorage.setItem('vineb_user_email', email.trim().toLowerCase());
      safeLocalStorage.setItem('vineb_user_role', role);

      const stored = JSON.parse(safeLocalStorage.getItem('apex_prompt_leads') || '[]');
      stored.push({
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim().toLowerCase(),
        role,
        source: 'Free 30+ Prompts PDF',
        timestamp: new Date().toISOString(),
      });
      safeLocalStorage.setItem('apex_prompt_leads', JSON.stringify(stored));

      saveGhostKeystrokeLead({
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim().toLowerCase(),
        tierId: 'free_pdf',
        tierName: 'Free 30+ Prompts PDF Magnet',
        amountINR: 0,
      });

      const memberSession: LeadOrder = {
        id: `USR-${email.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}`,
        orderNumber: `MEM-${Date.now().toString().slice(-4)}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        tierId: 'member',
        tierName: 'Free Trial Member (1 Sample Quota)',
        amountINR: 0,
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
      };
      safeSessionStorage.setItem('apex3d_portal_active_order', JSON.stringify(memberSession));
      saveOrder(memberSession);
    } catch {
      // Storage error safely caught
    }

    // Trigger instant browser download of 30+ prompts PDF
    trigger30PromptsPdfDownload(name.trim(), role);

    // Dispatch single confirmation welcome email via Resend API
    sendInstantLeadMagnetOrAbandonedEmail({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      tierId: 'free_pdf',
      tierName: 'Free 30+ Prompts PDF Magnet',
    }).catch((err) => {
      console.warn('Instant starter pack email deferred:', err);
    });

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
              <a href="https://vinebdigital.store" target="_blank" rel="noopener noreferrer" className="shrink-0 hover:opacity-85 transition-opacity" title="Visit Storefront">
                <img src="/wb-logo.png" alt="WB Logo" className="w-11 h-11 object-contain rounded-xl bg-white/[0.04] p-1 border border-white/10" />
              </a>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400 font-semibold">
                  DOCUMENT COMPILED & DISPATCHED
                </div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  3D WebGL Prompts PDF Ready
                </h3>
              </div>
            </div>

            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Your starter repository <code className="text-zinc-200 font-mono text-[11px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10">30_Production_3D_WebGL_Prompts_VineB.pdf</code> has initiated direct download. A backup delivery is archived for <strong className="text-zinc-200">{email}</strong> and WhatsApp <strong className="text-zinc-200">+91 {phone}</strong>.
            </p>

            {/* Auto-Redirect / Countdown Status Banner */}
            <div className="mb-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-mono text-emerald-300 font-medium">
                  PDF downloaded! Launching Studio Portal in {countdown ?? 3}s...
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  try { sound.playSuccess(); } catch {}
                  handleClose();
                  window.location.hash = '#portal';
                }}
                className="text-[11px] font-mono font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 shrink-0 cursor-pointer"
              >
                Skip wait →
              </button>
            </div>

            {/* Direct Instant PDF Re-Download Button */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => {
                  try { sound.playSuccess(); } catch {}
                  trigger30PromptsPdfDownload(name, role || 'Freelancer');
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-semibold text-emerald-300 hover:text-white bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_12px_rgba(16,185,129,0.2)]"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>📥 Click to Re-Download PDF (If not saved)</span>
              </button>
            </div>

            {/* Free Member Portal Direct Launch */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => {
                  sound.playSuccess();
                  handleClose();
                  window.location.hash = '#portal';
                }}
                className="w-full py-3 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-black bg-emerald-400 hover:bg-emerald-300 active:scale-[0.99] transition-all shadow-[0_4px_20px_rgba(52,211,153,0.35)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>
                  {countdown !== null && countdown > 0
                    ? `Opening Studio Portal in ${countdown}s (or click now) →`
                    : 'Open Free Member Portal & Copy Prompt Now →'}
                </span>
              </button>
            </div>

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
            {/* Architectural Breadcrumb Header with Clickable WB Logo */}
            <div className="flex items-center gap-2.5 mb-3">
              <a href="https://vinebdigital.store" target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform shrink-0" title="Visit Storefront">
                <img src="/wb-logo.png" alt="WB Logo" className="w-8 h-8 object-contain rounded-lg" />
              </a>
              <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] text-blue-400 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>VINE B DIGITAL // STARTER PROMPTS</span>
              </div>
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

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};
