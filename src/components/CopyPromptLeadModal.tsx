import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, User, Mail, Phone, Briefcase, GraduationCap, Building2, Check, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { sound } from '../lib/audioEngine';
import { saveOrder, saveGhostKeystrokeLead, incrementFreeTrialCopyUsage, LeadOrder } from '../lib/leadTracker';
import { trackLeadSubmitted, trackFreeCopyClick } from '../lib/visitorTracker';
import { getEmailValidationError, isDisposableEmail } from '../lib/security';

export type UserRole = 'Student' | 'Freelancer' | 'Agency Owner';

interface CopyPromptLeadModalProps {
  isOpen: boolean;
  promptSnippet: string;
  clientTitle?: string;
  onClose: () => void;
  onSuccessRedirect: () => void;
  onLeadSubmitted?: (lead: { name: string; email: string; phone: string; role?: UserRole }) => void;
}

export const CopyPromptLeadModal: React.FC<CopyPromptLeadModalProps> = ({
  isOpen,
  promptSnippet,
  clientTitle,
  onClose,
  onSuccessRedirect,
  onLeadSubmitted,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopiedSuccess, setIsCopiedSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      trackFreeCopyClick(clientTitle || 'Prompt Snippet', clientTitle);
    }
  }, [isOpen, clientTitle]);

  const captureGhost = (
    source: 'browser_autofill' | 'keystroke' = 'keystroke',
    overrides?: { email?: string; name?: string; phone?: string; role?: UserRole }
  ) => {
    const rawEmail = (overrides?.email ?? emailInputRef.current?.value ?? email ?? '').trim().toLowerCase();
    const rawName = (overrides?.name ?? nameInputRef.current?.value ?? name ?? '').trim();
    const rawPhone = (overrides?.phone ?? phoneInputRef.current?.value ?? phone ?? '').trim().replace(/\D/g, '');
    const selectedRole = overrides?.role ?? role;

    // Reject dummy placeholder emails
    if (
      !rawEmail ||
      rawEmail.includes('free_guest') ||
      rawEmail.includes('@apex3d.local') ||
      rawEmail.includes('pending@') ||
      rawEmail.includes('example.com') ||
      isDisposableEmail(rawEmail)
    ) {
      return;
    }

    const hasValidEmail = rawEmail.includes('@') && rawEmail.includes('.');
    const hasValidPhone = rawPhone.length >= 7;

    // Must have at least valid email
    if (!hasValidEmail && !hasValidPhone) return;

    if (rawEmail && rawEmail !== email) setEmail(rawEmail);
    if (rawName && rawName !== name) setName(rawName);
    if (rawPhone && rawPhone !== phone) setPhone(rawPhone);

    saveGhostKeystrokeLead({
      email: hasValidEmail ? rawEmail : '',
      name: rawName || (hasValidPhone ? `Visitor (+91 ${rawPhone})` : 'Visitor (Prompt Copy Lead)'),
      phone: rawPhone,
      role: selectedRole || undefined,
      tierId: 'prompt_copy',
      tierName: clientTitle ? `Free: ${clientTitle}` : 'Free Prompt',
      amountINR: 0,
      source,
    });
  };

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playClick();
        captureGhost('keystroke');
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

  const validatePhone = (p: string) => {
    // Digits, spaces, dashes, parentheses, plus sign allowed; must have at least 7 digits
    const digitsOnly = p.replace(/\D/g, '');
    return digitsOnly.length >= 7;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate mandatory fields
    if (!name.trim()) {
      setError('Please provide your full name.');
      sound.playClick();
      return;
    }

    const emailErr = getEmailValidationError(email);
    if (emailErr) {
      setError(emailErr);
      sound.playClick();
      return;
    }

    if (!phone.trim() || !validatePhone(phone)) {
      setError('Please provide a valid phone number (minimum 7 digits).');
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

    // Copy prompt snippet to clipboard
    if (promptSnippet) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(promptSnippet).catch(() => {
            const ta = document.createElement('textarea');
            ta.value = promptSnippet;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
          });
        } else {
          const ta = document.createElement('textarea');
          ta.value = promptSnippet;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
      } catch (err) {
        console.error('Failed to copy to clipboard', err);
      }
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const cleanName = name.trim();

    // 1. Direct master order persistence - guarantees lead is saved regardless of parent state
    const leadOrder: LeadOrder = {
      id: `USR-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}-${Date.now().toString().slice(-4)}`,
      orderNumber: `MEM-${Date.now().toString().slice(-4)}`,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      role: role || undefined,
      tierId: 'prompt_copy',
      tierName: clientTitle ? `Free: ${clientTitle}` : 'Free Prompt',
      amountINR: 0,
      status: 'free_trial_claimed',
      freeCopiesUsed: 1,
      lastFreeCopyAt: new Date().toISOString(),
      source: 'portal_free_copy_modal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveOrder(leadOrder);

    // 2. Provision temporary active session in sessionStorage only (Zero localStorage caching)
    try {
      sessionStorage.setItem('apex3d_portal_active_order', JSON.stringify(leadOrder));
    } catch {
      // Ignore storage errors
    }

    // Track lead submission telemetry
    trackLeadSubmitted({
      email: cleanEmail,
      name: cleanName,
      phone: cleanPhone,
      role: role || undefined,
      source: 'portal_free_copy_modal',
    });

    // 3. 🔒 Consume free trial copy quota across multi-layer stores & Cloud
    incrementFreeTrialCopyUsage(cleanEmail, clientTitle || 'Prompt Snippet', leadOrder);

    // 4. Notify parent if callback provided
    if (onLeadSubmitted) {
      onLeadSubmitted({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        role: role || undefined,
      });
    }

    setIsCopiedSuccess(true);

    // Brief tactile delay to show copied confirmation, then redirect to pricing
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      onSuccessRedirect();
    }, 700);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 select-none animate-role-fade-in">
      {/* Click outside backdrop with hardware blur */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={() => {
          sound.playClick();
          onClose();
        }}
      />

      {/* Modal Dialog Plate - Precision Obsidian Surface */}
      <div className="relative w-full max-w-lg rounded-2xl bg-[#08080c] border border-white/10 p-4 sm:p-7 text-white z-10 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.85)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] max-h-[92dvh] overflow-y-auto">
        {/* Subtle Top Ambient Refraction Line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white transition-all flex items-center justify-center cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] text-blue-400 uppercase mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>DEVELOPER AUTHENTICATION // EXTRACTION</span>
        </div>

        {/* Modal Title */}
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1.5">
          Copy Prompt Syntax
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 mb-5 font-sans leading-relaxed">
          {clientTitle ? (
            <>
              Confirm developer credentials to extract calibrated production prompt for <span className="text-zinc-200 font-semibold font-mono">{clientTitle}</span>.
            </>
          ) : (
            'Confirm developer credentials to copy production prompt syntax and unlock member pricing.'
          )}
        </p>

        {/* Error Callout */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/30 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 animate-role-fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
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
                name="name"
                autoComplete="name"
                required
                value={name}
                onAnimationStart={(e) => {
                  if (e.animationName === 'onAutoFillStart' && e.currentTarget.value) {
                    setName(e.currentTarget.value);
                    captureGhost('browser_autofill', { name: e.currentTarget.value });
                  }
                }}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                  captureGhost('keystroke', { name: e.target.value });
                }}
                onBlur={() => captureGhost('keystroke')}
                placeholder="Alex Vance"
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800 text-zinc-100 text-xs sm:text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all font-sans"
              />
            </div>
          </div>

          {/* Field 2: Email */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              Work / Developer Email <span className="text-blue-400">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                ref={emailInputRef}
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onAnimationStart={(e) => {
                  if (e.animationName === 'onAutoFillStart' && e.currentTarget.value) {
                    const clean = e.currentTarget.value.trim().toLowerCase();
                    setEmail(clean);
                    captureGhost('browser_autofill', { email: clean });
                  }
                }}
                onChange={(e) => {
                  const clean = e.target.value.trim().toLowerCase();
                  setEmail(clean);
                  if (error) setError(null);
                  captureGhost('keystroke', { email: clean });
                }}
                onBlur={() => captureGhost('keystroke')}
                placeholder="alex@studio.design"
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800 text-zinc-100 text-xs sm:text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all font-sans"
              />
            </div>
          </div>

          {/* Field 3: Phone Number */}
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
                name="phone"
                autoComplete="tel"
                required
                maxLength={10}
                value={phone}
                onAnimationStart={(e) => {
                  if (e.animationName === 'onAutoFillStart' && e.currentTarget.value) {
                    const cleanP = e.currentTarget.value.replace(/\D/g, '');
                    setPhone(cleanP);
                    captureGhost('browser_autofill', { phone: cleanP });
                  }
                }}
                onChange={(e) => {
                  const cleanP = e.target.value.replace(/\D/g, '');
                  setPhone(cleanP);
                  if (error) setError(null);
                  captureGhost('keystroke', { phone: cleanP });
                }}
                onBlur={() => captureGhost('keystroke')}
                placeholder="98765 43210"
                className="w-full px-3 py-2 text-xs sm:text-sm font-mono text-zinc-100 placeholder:text-zinc-600 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Field 4: Role */}
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
                      captureGhost('keystroke', { role: r });
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

          {/* Submit & Redirect Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] transition-all shadow-[0_4px_16px_rgba(37,99,235,0.35)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isCopiedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  <span>Prompt Extracted! Directing to Vault Pass...</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-white" />
                  <span>Copy Prompt & Proceed to Vault Pass</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <span className="text-[10px] font-mono text-zinc-500">
              Immediate clipboard buffer write • Automatic redirection to pass selection
            </span>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
