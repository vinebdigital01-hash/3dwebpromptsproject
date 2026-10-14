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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 select-none animate-role-fade-in">
      {/* Click outside backdrop with hardware blur */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={() => {
          sound.playClick();
          onClose();
        }}
      />

      {/* Modal Dialog Plate - Precision Obsidian Surface */}
      <div className="relative w-full max-w-lg rounded-2xl bg-[#08080c] border border-white/10 p-6 sm:p-8 text-white z-10 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.85)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] max-h-[92vh] overflow-y-auto">
        {/* Subtle Top Ambient Refraction Line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white transition-all flex items-center justify-center"
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
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
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
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
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
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ''));
                  if (error) setError(null);
                }}
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
