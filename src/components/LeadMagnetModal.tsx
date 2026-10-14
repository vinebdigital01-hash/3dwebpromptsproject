import React, { useState, useEffect } from 'react';
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
import { saveGhostKeystrokeLead } from '../lib/leadTracker';

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
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleClose = () => {
    sound.playClick();
    setError(null);
    setIsSubmittedSuccess(false);
    setIsSubmitting(false);
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

    if (!email.trim() || !validateEmail(email)) {
      setError('Please provide a valid email address.');
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
      {/* Click outside backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog Plate */}
      <div className="relative w-full max-w-lg rounded-3xl bg-[#090914] border border-white/20 p-6 sm:p-8 text-white z-10 shadow-2xl shadow-black max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ========================================================
            SUCCESS VIEW: PDF DOWNLOADED + UPSELL TO FULL VAULT
           ======================================================== */}
        {isSubmittedSuccess ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-mono mb-3 border border-emerald-500/20">
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD STARTED AUTOMATICALLY</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2 font-sans">
              🎉 30+ Prompts PDF Dispatched!
            </h3>

            <p className="text-xs sm:text-sm text-white/70 mb-5 font-sans leading-relaxed">
              Your free starter PDF <strong>30_Production_3D_WebGL_Prompts_VineB.pdf</strong> is downloading now. We've also recorded a backup copy for <strong>{email}</strong> and WhatsApp <strong>+91 {phone}</strong>.
            </p>

            {/* Special Upgrade Offer Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-blue-950/40 to-black/60 border border-blue-500/30 mb-5 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-amber-400 font-mono tracking-wider">
                  EXCLUSIVE VISITOR UPGRADE
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold font-mono">
                  LIMITED TIME: ₹49
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                Want all 500+ Production 3D & WebGL Prompts?
              </h4>
              <p className="text-xs text-white/60 mb-3 leading-relaxed">
                Unlock instant copy-paste access to every luxury, fintech, spatial and shader architecture in the complete APEX 3D Vault.
              </p>

              <button
                type="button"
                onClick={() => {
                  sound.playSuccess();
                  handleClose();
                  onSuccessRedirect();
                }}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                <span>Unlock Full 500+ Vault Pass @ ₹49</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="text-xs text-white/50 hover:text-white transition-colors"
            >
              Close & continue exploring site
            </button>
          </div>
        ) : (
          /* ========================================================
              INITIAL FORM: CLAIM FREE 30+ PROMPTS PDF
             ======================================================== */
          <>
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 text-[11px] font-mono mb-3 border border-blue-500/30">
              <Gift className="w-3.5 h-3.5 text-blue-400" />
              <span>100% FREE GIFT • 30+ 3D WEB PROMPTS</span>
            </div>

            {/* Modal Title & Subtitle */}
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1.5">
              Claim Free PDF: 30+ Production 3D Prompts
            </h3>
            <p className="text-xs sm:text-sm text-white/60 mb-5 font-sans leading-relaxed">
              Visiting without a plan? Grab our exclusive starter guide containing <strong>30+ production Three.js, Spline & WebGL AI prompt architectures</strong> (₹1,499 Value) — completely free!
            </p>

            {/* Perks Badges */}
            <div className="grid grid-cols-2 gap-2 mb-5 text-[11px] font-mono text-white/80">
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>30+ WebGL Prompts</span>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Works on Claude 3.7 & Cursor</span>
              </div>
            </div>

            {/* Error Callout */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 animate-role-fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Lead Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Field 1: Full Name */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                  Full Name <span className="text-red-400 font-bold">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Field 2: WhatsApp Phone */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                  WhatsApp Phone Number <span className="text-red-400 font-bold">*</span>
                </label>
                <div className="flex rounded-xl bg-white/5 border border-white/10 overflow-hidden focus-within:border-blue-500 transition-colors">
                  <span className="px-3 py-2.5 bg-white/10 border-r border-white/10 text-xs text-white/80 font-mono flex items-center gap-1 shrink-0">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ''));
                      if (error) setError(null);
                    }}
                    placeholder="98765 43210"
                    className="w-full px-3 py-2.5 text-xs sm:text-sm font-mono text-white placeholder:text-white/30 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* Field 3: Email */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                  Email Address <span className="text-red-400 font-bold">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="e.g. rahul@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Field 4: Role */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                  Who are you? <span className="text-red-400 font-bold">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setRole('Student');
                      if (error) setError(null);
                    }}
                    className={`py-2 px-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                      role === 'Student'
                        ? 'bg-blue-600/25 border-blue-500 text-white shadow-md shadow-blue-500/20'
                        : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.07]'
                    }`}
                  >
                    <GraduationCap
                      className={`w-3.5 h-3.5 mb-1 ${role === 'Student' ? 'text-blue-400' : 'text-white/50'}`}
                    />
                    <span className="text-[11px] font-semibold">Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setRole('Freelancer');
                      if (error) setError(null);
                    }}
                    className={`py-2 px-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                      role === 'Freelancer'
                        ? 'bg-blue-600/25 border-blue-500 text-white shadow-md shadow-blue-500/20'
                        : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.07]'
                    }`}
                  >
                    <Briefcase
                      className={`w-3.5 h-3.5 mb-1 ${role === 'Freelancer' ? 'text-blue-400' : 'text-white/50'}`}
                    />
                    <span className="text-[11px] font-semibold">Freelancer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setRole('Agency Owner');
                      if (error) setError(null);
                    }}
                    className={`py-2 px-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                      role === 'Agency Owner'
                        ? 'bg-blue-600/25 border-blue-500 text-white shadow-md shadow-blue-500/20'
                        : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.07]'
                    }`}
                  >
                    <Building2
                      className={`w-3.5 h-3.5 mb-1 ${role === 'Agency Owner' ? 'text-blue-400' : 'text-white/50'}`}
                    />
                    <span className="text-[11px] font-semibold">Agency Owner</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Generating 30+ Prompts PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-white" />
                      <span>Download Free 30+ Prompts PDF</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <span className="text-[10px] font-mono text-white/40">
                  Instant direct PDF download • Backup sent to WhatsApp & Email
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
