import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, User, Mail, Phone, Briefcase, GraduationCap, Building2, Check, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { sound } from '../lib/audioEngine';

export type UserRole = 'Student' | 'Freelancer' | 'Agency Owner';

interface CopyPromptLeadModalProps {
  isOpen: boolean;
  promptSnippet: string;
  clientTitle?: string;
  onClose: () => void;
  onSuccessRedirect: () => void;
}

export const CopyPromptLeadModal: React.FC<CopyPromptLeadModalProps> = ({
  isOpen,
  promptSnippet,
  clientTitle,
  onClose,
  onSuccessRedirect,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopiedSuccess, setIsCopiedSuccess] = useState(false);
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

  const validatePhone = (p: string) => {
    // Digits, spaces, dashes, parentheses, plus sign allowed; must have at least 7 digits
    const digitsOnly = p.replace(/\D/g, '');
    return digitsOnly.length >= 7;
  };

  const validateEmail = (e: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
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

    if (!email.trim() || !validateEmail(email)) {
      setError('Please enter a valid email address.');
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
        navigator.clipboard.writeText(promptSnippet);
      } catch (err) {
        console.error('Failed to copy to clipboard', err);
      }
    }

    // Persist lead details to localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('apex_prompt_leads') || '[]');
      stored.push({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        promptTarget: clientTitle || 'General Prompt',
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('apex_prompt_leads', JSON.stringify(stored));
    } catch {
      // Ignore storage errors
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 select-none">
      {/* Click outside backdrop with lightweight blur */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={() => {
          sound.playClick();
          onClose();
        }}
      />

      {/* Modal Dialog Plate */}
      <div className="relative w-full max-w-lg rounded-3xl bg-[#090914] border border-white/20 p-6 sm:p-8 text-white z-10 shadow-2xl shadow-black max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 text-[11px] font-mono mb-3 border border-blue-500/30">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>PROMPT SYNTAX ACCESS VERIFICATION</span>
        </div>

        {/* Modal Title */}
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1.5">
          Copy Prompt Syntax
        </h3>
        <p className="text-xs sm:text-sm text-white/60 mb-6 font-sans leading-relaxed">
          {clientTitle ? (
            <>
              Access calibrated production prompt for <span className="text-blue-300 font-semibold">{clientTitle}</span>. All fields are mandatory to copy and unlock pricing.
            </>
          ) : (
            'Complete your details to copy the production prompt syntax and unlock exclusive bundle pricing.'
          )}
        </p>

        {/* Error Callout */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/30 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 animate-role-fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Alex Vance"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Field 2: Email */}
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
                placeholder="alex@studio.design"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Field 3: Phone Number */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
              Phone Number <span className="text-red-400 font-bold">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="+1 (555) 234-5678"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Field 4: Role (Student, Freelancer, Agency Owner) */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-2">
              Select Your Profile <span className="text-red-400 font-bold">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Option 1: Student */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setRole('Student');
                  if (error) setError(null);
                }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                  role === 'Student'
                    ? 'bg-blue-600/25 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.07] hover:border-white/20'
                }`}
              >
                <GraduationCap className={`w-4 h-4 mb-1.5 ${role === 'Student' ? 'text-blue-400' : 'text-white/50'}`} />
                <span className="text-xs font-semibold">Student</span>
              </button>

              {/* Option 2: Freelancer */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setRole('Freelancer');
                  if (error) setError(null);
                }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                  role === 'Freelancer'
                    ? 'bg-blue-600/25 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.07] hover:border-white/20'
                }`}
              >
                <Briefcase className={`w-4 h-4 mb-1.5 ${role === 'Freelancer' ? 'text-blue-400' : 'text-white/50'}`} />
                <span className="text-xs font-semibold">Freelancer</span>
              </button>

              {/* Option 3: Agency Owner */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setRole('Agency Owner');
                  if (error) setError(null);
                }}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                  role === 'Agency Owner'
                    ? 'bg-blue-600/25 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.07] hover:border-white/20'
                }`}
              >
                <Building2 className={`w-4 h-4 mb-1.5 ${role === 'Agency Owner' ? 'text-blue-400' : 'text-white/50'}`} />
                <span className="text-xs font-semibold">Agency Owner</span>
              </button>
            </div>
          </div>

          {/* Submit & Redirect Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isCopiedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Prompt Copied! Redirecting to Pricing...</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-white" />
                  <span>Copy Prompt & Continue to Pricing</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <span className="text-[11px] font-mono text-white/40">
              Instant clipboard copy • Auto-redirects to Vault Pricing & Licenses
            </span>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
