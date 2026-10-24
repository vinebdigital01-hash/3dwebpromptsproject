import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import {
  X,
  Check,
  ChevronRight,
  ShieldCheck,
  User,
  Mail,
  ArrowRight,
  Clock,
  ExternalLink,
  AlertCircle,
  MoreHorizontal,
  ChevronLeft,
  Smartphone,
  Lock,
  QrCode,
} from 'lucide-react';
import { PricingTier, Currency } from './PricingSection';
import { sound } from '../lib/audioEngine';
import {
  saveOrder,
  saveGhostKeystrokeLead,
  generateOrderNumber,
  getAdAttribution,
  LeadOrder,
} from '../lib/leadTracker';
import {
  trackCheckoutInitiate,
  trackCheckoutDropoff,
  trackAddPaymentInfo,
  trackPaymentSuccess,
} from '../lib/visitorTracker';
import { sendInstantLeadMagnetOrAbandonedEmail } from '../lib/resendEmail';
import { getAdminSettings, AdminSettings } from '../lib/adminSettings';
import { sanitizeInput, validateEmail, validateIndianPhone, getEmailValidationError, isDisposableEmail } from '../lib/security';
import {
  RazorpayBagsIllustration,
  ExitDoorIllustration,
  GooglePayIcon,
  PhonePeIcon,
  PaytmIcon,
  CredIcon,
  AmazonPayIcon,
  CardLogosGroup,
  BankLogosGroup,
  WalletLogosGroup,
} from './RazorpaySVGs';

interface CheckoutModalProps {
  isOpen: boolean;
  tier: PricingTier | null;
  currency: Currency;
  onClose: () => void;
}

type CheckoutView = 'options' | 'contact_edit' | 'success';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  tier,
  currency,
  onClose,
}) => {
  const [settings, setSettings] = useState<AdminSettings>(() => getAdminSettings());

  useEffect(() => {
    const handleSettingsUpdate = (e: any) => {
      if (e.detail) {
        setSettings(e.detail);
      } else {
        setSettings(getAdminSettings());
      }
    };
    window.addEventListener('apex_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('apex_settings_updated', handleSettingsUpdate);
  }, []);

  const merchantUpi = settings.merchantUpi;
  const merchantName = settings.merchantName;
  const supportEmail = settings.supportEmail;
  const sliceTxnNote = settings.transactionNote;

  const [mounted, setMounted] = useState<boolean>(false);
  const [view, setView] = useState<CheckoutView>('contact_edit');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showPaymentDonePopup, setShowPaymentDonePopup] = useState(false);
  const [showMobileQr, setShowMobileQr] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasLaunchedUpiApp, setHasLaunchedUpiApp] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [contactError, setContactError] = useState<string | null>(null);
  const [unsupportedMethod, setUnsupportedMethod] = useState<'cards' | 'netbanking' | 'wallet' | null>(null);

  // UTR verification state
  const [utrNumber, setUtrNumber] = useState('');
  const [senderUpiId, setSenderUpiId] = useState('');
  const [utrError, setUtrError] = useState<string | null>(null);
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);

  // Timer: 11:44 matching screenshot
  const [timerSeconds, setTimerSeconds] = useState(704); // 11:44 in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Autofill detection input refs
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Active Order Tracking
  const [currentOrder, setCurrentOrder] = useState<LeadOrder | null>(null);

  // Detect mobile device
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      const mobileDevice =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth < 768;
      setIsMobile(mobileDevice);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Intercept Escape key & lock scroll
  useEffect(() => {
    if (!isOpen || !tier) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playClick();
        if (showPaymentDonePopup) {
          setShowPaymentDonePopup(false);
        } else if (view === 'success') {
          handleCloseDirect();
        } else {
          setShowExitConfirm(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, tier, view, showPaymentDonePopup]);

  // Reset state on open & detect browser autofill in real time
  useEffect(() => {
    if (isOpen && tier) {
      trackCheckoutInitiate(tier.id, tier.priceINR, tier.name);
      setView('contact_edit');
      setShowExitConfirm(false);
      setShowPaymentDonePopup(false);
      setShowMobileQr(false);
      setHasLaunchedUpiApp(false);
      setContactError(null);
      setUnsupportedMethod(null);
      setUtrError(null);
      setTimerSeconds(704); // 11:44 as shown in screenshot
      setUtrNumber('');
      setSenderUpiId('');

      // Browser Autofill Detection: Only triggers when DOM inputs are actively populated by browser autofill
      const handleInputAutofill = () => {
        try {
          const domEmail = emailInputRef.current?.value || '';
          const domName = nameInputRef.current?.value || '';
          const domPhone = phoneInputRef.current?.value || '';

          if (domEmail && domEmail.includes('@') && domEmail.includes('.') && !domEmail.includes('example.com')) {
            setEmail(domEmail);
            if (domName) setName(domName);
            if (domPhone) setPhone(domPhone);
            handleGhostAutoSave(domEmail, domName, domPhone, 'browser_autofill');
          }
        } catch {}
      };

      const emailEl = emailInputRef.current;
      if (emailEl) {
        emailEl.addEventListener('change', handleInputAutofill);
      }
      return () => {
        if (emailEl) {
          emailEl.removeEventListener('change', handleInputAutofill);
        }
      };
    }
  }, [isOpen, tier]);

  // Direct auto-trigger for mobile/iPhone UPI intent
  useEffect(() => {
    if (isOpen && tier && isMobile && view === 'options') {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      if (isMobileDevice) {
        // Automatically attempt to invoke native UPI app sheet
        const timer = setTimeout(() => {
          try {
            window.location.href = upiPayload;
            setHasLaunchedUpiApp(true);
          } catch (e) {
            console.debug('Intent auto-trigger:', e);
          }
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, tier, isMobile, view]);

  // When user returns from UPI app on mobile, ask for UTR confirmation
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && hasLaunchedUpiApp && view === 'options') {
        setTimeout(() => {
          setShowPaymentDonePopup(true);
        }, 800);
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    return () => window.removeEventListener('visibilitychange', handleVisibility);
  }, [hasLaunchedUpiApp, view]);

  // Immediate UTR submission is now available directly on screen (Fix 5: No 65s delay)

  // Timer ticker
  useEffect(() => {
    if (isOpen && view === 'options') {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, view]);

  // Ghost lead auto-capture on keystroke, blur, or browser autofill
  const handleGhostAutoSave = (
    emailOverride?: string,
    nameOverride?: string,
    phoneOverride?: string,
    source: 'browser_autofill' | 'keystroke' | string = 'keystroke'
  ) => {
    if (!tier) return;
    const rawEmail = (emailOverride !== undefined ? emailOverride : email).trim();
    if (!rawEmail || !rawEmail.includes('@') || !rawEmail.includes('.')) return;
    if (rawEmail.includes('pending@') || rawEmail.includes('example.com') || isDisposableEmail(rawEmail)) return;
    const rawPhone = phoneOverride !== undefined ? phoneOverride : phone;
    const rawName = nameOverride !== undefined ? nameOverride : name;

    const cleanPhone = rawPhone.trim() ? rawPhone.replace(/\D/g, '') : '';
    const leadName = rawName.trim() || 'Visitor (Checkout)';
    const cleanEmail = rawEmail.toLowerCase();

    const leadData = {
      email: cleanEmail,
      name: leadName,
      phone: cleanPhone,
      tierId: tier.id,
      tierName: tier.name,
      amountINR: tier.priceINR,
      source,
    };

    // 1. Save in Ghost / Abandoned Orders database & direct Firebase Firestore
    saveGhostKeystrokeLead(leadData);

    // 2. Provision Client Portal member preview in sessionStorage only (Zero localStorage)
    try {
      const memberSession: LeadOrder = {
        id: `USR-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}`,
        orderNumber: `MEM-${Date.now().toString().slice(-4)}`,
        name: leadName,
        email: cleanEmail,
        phone: cleanPhone,
        tierId: 'member',
        tierName: 'Free Trial Member (1 Free Copy)',
        amountINR: 0,
        status: 'free_trial_claimed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
      };
      sessionStorage.setItem('apex3d_portal_active_order', JSON.stringify(memberSession));
    } catch {
      // storage error ignored
    }
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    setContactError(null);

    if (!tier || honeypot) return;
    if (!name.trim() || name.trim().length < 2) {
      setContactError('Please enter your full name.');
      sound.playClick();
      return;
    }
    const emailErr = getEmailValidationError(email);
    if (emailErr) {
      setContactError(emailErr);
      sound.playClick();
      return;
    }
    if (!phone.trim() || !validateIndianPhone(phone)) {
      setContactError('Please enter a valid 10-digit WhatsApp number.');
      sound.playClick();
      return;
    }

    sound.playSuccess();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/\D/g, '');
    handleGhostAutoSave();

    const ghostOrderId = `GHOST-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}-${tier.id}`;
    const updated: LeadOrder = {
      id: currentOrder?.id || ghostOrderId,
      orderNumber: currentOrder?.orderNumber || generateOrderNumber(),
      name: sanitizeInput(name),
      email: cleanEmail,
      phone: cleanPhone,
      tierId: tier.id,
      tierName: tier.name,
      amountINR: tier.priceINR,
      status: 'abandoned_at_qr',
      createdAt: currentOrder?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      utm: getAdAttribution(),
    };
    saveOrder(updated);
    setCurrentOrder(updated);
    setView('options');
    trackAddPaymentInfo(tier.id, tier.priceINR, 'UPI / QR');
  };

  const handleRequestExit = () => {
    sound.playClick();
    if (showPaymentDonePopup) {
      setShowPaymentDonePopup(false);
      return;
    }
    if (view === 'success') {
      handleCloseDirect();
    } else {
      setShowExitConfirm(true);
    }
  };

  const handleConfirmExit = () => {
    sound.playClick();
    setShowExitConfirm(false);
    if (currentOrder && view !== 'success') {
      saveOrder({
        ...currentOrder,
        status: 'abandoned_at_qr',
        updatedAt: new Date().toISOString(),
      });
      trackCheckoutDropoff(tier?.id || 'unknown', 'Closed checkout modal');
    }
    onClose();
  };

  const handleCloseDirect = () => {
    setShowExitConfirm(false);
    setShowPaymentDonePopup(false);
    onClose();
  };

  const handleLaunchUpiApp = (appName: string, customUri?: string) => {
    sound.playClick();
    setHasLaunchedUpiApp(true);
    const amount = tier?.priceINR || 49;
    const encodedNote = encodeURIComponent(sliceTxnNote);
    let targetUri = `upi://pay?tn=${encodedNote}&pa=${merchantUpi}&am=${amount}&cu=INR`;
    if (appName === 'PhonePe') {
      targetUri = `phonepe://pay?tn=${encodedNote}&pa=${merchantUpi}&am=${amount}&cu=INR`;
    } else if (appName === 'Paytm') {
      targetUri = `paytmmp://pay?tn=${encodedNote}&pa=${merchantUpi}&am=${amount}&cu=INR`;
    } else if (appName === 'Google Pay') {
      targetUri = `tez://upi/pay?tn=${encodedNote}&pa=${merchantUpi}&am=${amount}&cu=INR`;
    } else if (appName === 'CRED') {
      targetUri = `cred://upi/pay?tn=${encodedNote}&pa=${merchantUpi}&am=${amount}&cu=INR`;
    } else if (appName === 'Amazon Pay') {
      targetUri = `amazonpay://pay?tn=${encodedNote}&pa=${merchantUpi}&am=${amount}&cu=INR`;
    }

    const start = Date.now();
    window.location.href = customUri || targetUri;
    setTimeout(() => {
      if (document.visibilityState === 'visible' && Date.now() - start < 2500 && targetUri !== upiPayload) {
        window.location.href = upiPayload;
      }
    }, 1200);
  };

  const handleUtrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUtrError(null);

    const cleanUtr = utrNumber.replace(/\D/g, '');
    if (cleanUtr.length < 10) {
      setUtrError('Please enter a valid 12-digit UPI Reference Number / UTR.');
      sound.playClick();
      return;
    }

    setIsSubmittingUtr(true);
    sound.playClick();

    setTimeout(() => {
      setIsSubmittingUtr(false);
      setShowPaymentDonePopup(false);
      const orderToSave: LeadOrder = currentOrder ? {
        ...currentOrder,
        status: 'pending_approval',
        utrNumber: cleanUtr,
        upiId: senderUpiId.trim() || undefined,
        updatedAt: new Date().toISOString(),
      } : {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        orderNumber: `APX-${Math.floor(100000 + Math.random() * 900000)}`,
        name: name.trim() || 'Developer',
        email: email.trim().toLowerCase() || 'buyer@apex3d.local',
        phone: phone.trim().replace(/\D/g, '') || '',
        tierId: tier.id,
        tierName: tier.name,
        amountINR: tier.priceINR,
        status: 'pending_approval',
        utrNumber: cleanUtr,
        upiId: senderUpiId.trim() || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveOrder(orderToSave);
      setCurrentOrder(orderToSave);

      // Persist active order session for instant provisional access in ClientPortal
      try {
        sessionStorage.setItem('apex3d_portal_active_order', JSON.stringify(orderToSave));
        localStorage.setItem('apex3d_pending_utr_order', JSON.stringify(orderToSave));
      } catch (err) {
        console.debug('Session storage order save:', err);
      }
      setView('success');
      sound.playSuccess();
      trackPaymentSuccess(
        currentOrder?.orderNumber || 'PENDING',
        tier?.priceINR || 0,
        tier?.name || 'Vault Access',
        {
          email: currentOrder?.email || email,
          phone: currentOrder?.phone || phone,
          name: currentOrder?.name || name,
        }
      );

      try {
        confetti({
          particleCount: 85,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0b5cff', '#00BA88', '#00E575', '#ffffff'],
        });
      } catch (err) {
        console.debug('Confetti suppressed:', err);
      }
    }, 850);
  };

  if (!isOpen || !tier || !mounted) return null;

  const totalAmount = tier.priceINR;
  const formattedAmount = `₹${totalAmount.toLocaleString('en-IN')}`;

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const formattedTimer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Dynamic Merchant UPI deep link with prefilled tier price
  const encodedNote = encodeURIComponent(sliceTxnNote);
  const upiPayload = `upi://pay?tn=${encodedNote}&pa=${merchantUpi}&am=${totalAmount}&cu=INR`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=4&data=${encodeURIComponent(
    upiPayload
  )}`;

  const modalContent = (
    <div
      data-standard-cursor="true"
      className="standard-cursor fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 font-['Plus_Jakarta_Sans',Inter,-apple-system,BlinkMacSystemFont,sans-serif] antialiased"
    >
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
        onClick={handleRequestExit}
      />

      {/* ========================================================
          1. DESKTOP VIEW: RAZORPAY STANDARD 2.0 (Screenshot 1)
         ======================================================== */}
      <div className="hidden md:flex relative w-full max-w-[920px] md:w-[920px] h-[520px] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 bg-[#121214] text-slate-800 z-10 flex-row">
        {/* Left Dark Obsidian Sidebar */}
        <div className="w-[280px] bg-[#121214] text-white p-5 flex flex-col justify-between shrink-0 relative overflow-hidden">
          <div>
            {/* Top Merchant Brand (Crest Logo + Duti Heritage) */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-sm shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full text-slate-800">
                  <path
                    d="M18 5 C11 5 8 9 8 16 C8 24 18 31 18 31 C18 31 28 24 28 16 C28 9 25 5 18 5 Z"
                    fill="none"
                    stroke="#8a7346"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M18 9 C14 9 11 12 11 17 C11 22 18 27 18 27 C18 27 25 22 25 17 C25 12 22 9 18 9 Z"
                    fill="none"
                    stroke="#5c4d2e"
                    strokeWidth="1"
                  />
                  <circle cx="18" cy="16" r="3" fill="#8a7346" />
                  <text
                    x="18"
                    y="34"
                    fill="#333333"
                    fontSize="3"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                    fontWeight="bold"
                    letterSpacing="0.4"
                  >
                    VINE B DIGITAL
                  </text>
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-xs font-bold text-white tracking-tight leading-snug line-clamp-2">
                  {merchantName}
                </h2>
              </div>
            </div>

            {/* Price Summary Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm text-slate-800 mb-3">
              <div className="text-[12px] text-slate-500 font-normal mb-1">
                Price Summary
              </div>
              <div className="text-[26px] font-bold text-slate-900 tracking-tight leading-none">
                {formattedAmount}
              </div>
            </div>

            {/* User Pill */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setView(view === 'contact_edit' ? 'options' : 'contact_edit');
              }}
              className="w-full bg-white rounded-xl py-3 px-3.5 shadow-sm flex items-center justify-between text-slate-800 mb-3 hover:bg-slate-50 transition-all text-left"
            >
              <div className="flex items-center gap-2.5 truncate">
                <User className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {phone ? `Using as +91 ${phone.replace(/\D/g, '')}` : 'Enter your details'}
                </span>
              </div>
              <span className="text-[11px] text-blue-600 font-semibold shrink-0">
                {view === 'contact_edit' ? 'Step 1' : 'Change'}
              </span>
            </button>

            {/* High-Trust Zero Fee UPI Badge */}
            <div className="w-full bg-[#e7f7ed] border border-emerald-500/20 rounded-xl py-2.5 px-3.5 flex items-center justify-between text-emerald-950 mb-3">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-xs font-semibold text-emerald-950 truncate">
                  Instant Zero-Fee UPI
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0">
                NPCI SECURED
              </span>
            </div>
          </div>

          {/* Bottom Bags Graphic */}
          <div className="mt-auto">
            <div className="w-full pointer-events-none mb-1">
              <RazorpayBagsIllustration className="w-full h-auto" />
            </div>

            <div className="flex items-center gap-1.5 text-xs pt-1">
              <span className="text-[11px] font-normal text-slate-400">Secured by</span>
              <span className="text-xs font-black text-white tracking-tight flex items-center gap-0.5">
                <span>Slice<span className="text-purple-400">.</span></span>
              </span>
            </div>
            <div className="text-[10px] text-white/40 pt-1 truncate">
              Support: <a href={`mailto:${supportEmail}`} className="hover:text-white underline">{supportEmail}</a>
            </div>
          </div>
        </div>

        {/* Right White Panel */}
        <div className="flex-1 bg-white text-slate-800 flex flex-col justify-between overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-7 pt-4 pb-2">
            {view === 'options' ? (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setView('contact_edit');
                }}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Edit Details</span>
              </button>
            ) : (
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                Step 1 of 2
              </span>
            )}

            <h3 className="text-sm font-semibold text-slate-700 tracking-tight">
              {view === 'contact_edit'
                ? 'Your Contact Details'
                : view === 'success'
                ? 'Order Acknowledged'
                : 'Payment Options'}
            </h3>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                title="More options"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleRequestExit}
                className="text-slate-500 hover:text-slate-900 transition-colors p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* STEP 1: CONTACT DETAILS VIEW (Desktop) */}
          {view === 'contact_edit' && (
            <div className="px-8 py-3 flex-1 flex flex-col justify-center max-w-[440px] mx-auto w-full">
              <div className="mb-4">
                <h4 className="text-base font-bold text-slate-900 tracking-tight">
                  Where should we send your vault pass?
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 font-sans">
                  Enter your contact details to receive instant prompt credentials & invoice.
                </p>
              </div>

              {contactError && (
                <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{contactError}</span>
                </div>
              )}

              <form onSubmit={handleSaveContact} className="space-y-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                          handleGhostAutoSave(undefined, e.currentTarget.value, undefined, 'browser_autofill');
                        }
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        setName(val);
                        if (email.includes('@') && email.includes('.')) {
                          handleGhostAutoSave(undefined, val, undefined, 'keystroke');
                        }
                      }}
                      onBlur={() => handleGhostAutoSave(undefined, undefined, undefined, 'keystroke')}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                    />
                  </div>
                </div>

                {/* WhatsApp Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 transition-all">
                    <span className="px-3 py-2.5 bg-slate-50 border-r border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1 shrink-0">
                      🇮🇳 +91
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
                          const cleanVal = e.currentTarget.value.replace(/\D/g, '');
                          setPhone(cleanVal);
                          handleGhostAutoSave(undefined, undefined, cleanVal, 'browser_autofill');
                        }
                      }}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setPhone(val);
                        if (email.includes('@') && email.includes('.')) {
                          handleGhostAutoSave(undefined, undefined, val, 'keystroke');
                        }
                      }}
                      onBlur={() => handleGhostAutoSave(undefined, undefined, undefined, 'keystroke')}
                      placeholder="98765 43210"
                      className="w-full px-3 py-2.5 text-xs font-mono font-medium text-slate-900 focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Your 3D vault license key will be delivered instantly via WhatsApp.
                  </span>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      ref={emailInputRef}
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      value={email}
                      onAnimationStart={(e) => {
                        if (e.animationName === 'onAutoFillStart' && e.currentTarget.value) {
                          const val = e.currentTarget.value.trim().toLowerCase();
                          setEmail(val);
                          handleGhostAutoSave(val, undefined, undefined, 'browser_autofill');
                        }
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEmail(val);
                        if (val.includes('@') && val.includes('.') && val.length > 5) {
                          handleGhostAutoSave(val, undefined, undefined, 'keystroke');
                        }
                      }}
                      onBlur={() => handleGhostAutoSave(undefined, undefined, undefined, 'keystroke')}
                      placeholder="e.g. rahul@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                    />
                  </div>
                </div>

                {/* Anti-bot Honeypot */}
                <input
                  type="text"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-[#0f0f12] hover:bg-black active:scale-[0.99] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Payment ({formattedAmount})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Main Content */}
          {view === 'options' && (
            <div className="px-7 py-3 flex-1 flex flex-row gap-6">
              {/* Payment Methods */}
              <div className="w-[230px] shrink-0 flex flex-col justify-start">
                {/* UPI */}
                <div
                  onClick={() => {
                    sound.playClick();
                    setUnsupportedMethod(null);
                  }}
                  className="flex items-center justify-between py-2.5 px-2 mb-3 cursor-pointer hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <span className="text-sm font-semibold text-slate-900">UPI</span>
                  <div className="flex items-center gap-1.5">
                    <GooglePayIcon className="w-4 h-4" />
                    <PhonePeIcon className="w-4 h-4" />
                    <PaytmIcon className="w-5 h-3" />
                    <CredIcon className="w-3.5 h-4" />
                    <AmazonPayIcon className="w-5 h-3" />
                  </div>
                </div>

                {/* High-Trust UPI Verification Notice & Supported Apps */}
                <div className="bg-[#f7f8f9] rounded-2xl p-4 space-y-3 border border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                      Fast UPI Checkout
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                      Zero Fees
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-xs">Google Pay</span>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-xs">PhonePe</span>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-xs">Paytm</span>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-xs">CRED</span>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-semibold shadow-xs">BHIM UPI</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans pt-1">
                    Scan the QR code on the right with any UPI app. After sending payment, enter your 12-digit UTR below for immediate provisional access to the portal!
                  </p>
                </div>
              </div>

              {/* UPI QR Section */}
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-sm font-bold text-slate-900">UPI QR</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span className="tabular-nums">{formattedTimer}</span>
                  </div>
                </div>

                <div
                  onClick={() => {
                    sound.playClick();
                    setShowPaymentDonePopup(true);
                  }}
                  className="bg-[#f7f8f9] rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center cursor-pointer hover:bg-[#f1f3f5] transition-colors"
                  title="Click to enter 12-digit UTR"
                >
                  <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm mb-3">
                    <img
                      src={qrImageUrl}
                      alt="UPI QR Code"
                      className="w-36 h-36 object-contain mx-auto"
                    />
                  </div>

                  <div className="text-xs text-slate-500 font-medium mb-2.5">
                    Scan the QR using any UPI App
                  </div>

                  <div className="flex items-center justify-center gap-3 mb-3">
                    <GooglePayIcon className="w-5 h-5 hover:scale-110 transition-transform shrink-0" />
                    <PhonePeIcon className="w-5 h-5 hover:scale-110 transition-transform shrink-0" />
                    <PaytmIcon className="w-7 h-4 hover:scale-110 transition-transform shrink-0" />
                    <CredIcon className="w-4 h-5 hover:scale-110 transition-transform shrink-0" />
                    <AmazonPayIcon className="w-7 h-4 hover:scale-110 transition-transform shrink-0" />
                  </div>

                  {/* Immediate 1-Click UTR Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playClick();
                      setShowPaymentDonePopup(true);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs font-mono shadow-md shadow-emerald-500/25 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Paid? Enter 12-Digit UTR →</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS VIEW (Desktop) */}
          {view === 'success' && (
            <div className="px-8 py-6 flex-1 flex flex-col justify-center items-center text-center max-w-[460px] mx-auto w-full animate-role-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
                <Check className="w-7 h-7 stroke-[2.5]" />
              </div>

              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-600 font-bold mb-1">
                UTR RECORDED &bull; PENDING ADMIN RECONCILIATION
              </div>

              <h4 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                Order Confirmed!
              </h4>

              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                Thank you, <strong className="text-slate-800">{name || 'Developer'}</strong>! Your payment of <strong className="text-slate-900">{formattedAmount}</strong> (UTR: <code className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">{utrNumber}</code>) has been submitted for instant verification.
              </p>

              {/* Order Credential Box */}
              <div className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-left mb-4 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-mono text-[11px]">Reference / Order #</span>
                  <span className="font-mono font-bold text-slate-900">{currentOrder?.orderNumber || 'APX-CONFIRMED'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-mono text-[11px]">Selected Tier</span>
                  <span className="font-semibold text-slate-900">{tier?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-mono text-[11px]">Registered Email</span>
                  <span className="font-mono text-slate-800 truncate max-w-[200px]">{email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-mono text-[11px]">WhatsApp Alerts</span>
                  <span className="font-mono text-slate-800">+91 {phone}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900 text-left mb-5 leading-relaxed">
                <strong>Where to log in?</strong> Once verified (usually 5-15 mins), you'll receive your <strong>Commercial License Key</strong>, <strong>Official Invoice</strong>, and <strong>1-Click Instant Login Link</strong> at <strong>{email}</strong>.
              </div>

              <div className="w-full space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playSuccess();
                    handleCloseDirect();
                    window.location.hash = '#portal';
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <User className="w-4 h-4" />
                  <span>Go to Member Login / Client Portal →</span>
                </button>

                <button
                  type="button"
                  onClick={handleCloseDirect}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
                >
                  Dismiss & Return to Website
                </button>
              </div>
            </div>
          )}

          {/* Bottom Security Footer */}
          <div className="px-7 py-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-sans">
            <span>Customer ID: {phone.replace(/\D/g, '') || '8860090791'}</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Secured by Slice.</span>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. MOBILE / iPHONE VIEW: DIRECT 1-TAP UPI APP LAUNCHER
         ======================================================== */}
      <div className="flex md:hidden relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl bg-white text-slate-800 z-10 flex-col max-h-[92vh] overflow-y-auto">
        {/* Mobile Header */}
        <div className="bg-[#121214] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center p-1 text-slate-900 font-bold text-xs shrink-0">
              VB
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-sm text-white truncate">{merchantName}</div>
              <div className="text-[10px] text-slate-400">Secured by Slice.</div>
            </div>
          </div>
          <button
            onClick={handleRequestExit}
            className="p-1 rounded-full text-slate-400 hover:text-white shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Order Summary */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Amount Payable</span>
            <div className="text-xl font-bold text-slate-900">{formattedAmount}</div>
          </div>
          <button
            type="button"
            onClick={() => setView(view === 'contact_edit' ? 'options' : 'contact_edit')}
            className="text-xs text-blue-600 font-semibold"
          >
            {view === 'contact_edit'
              ? 'Step 1 of 2'
              : phone
              ? `+91 ${phone.replace(/\D/g, '')} (Edit)`
              : 'Enter Details →'}
          </button>
        </div>

        {/* Mobile Main Interactive Area */}
        <div className="p-4 space-y-3.5 flex-1">
          {view === 'options' && (
            <>
              {/* PRIMARY 1-TAP INSTANT UPI APP BUTTON */}
              <div>
                <a
                  href={upiPayload}
                  onClick={() => setHasLaunchedUpiApp(true)}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#0b5cff] hover:bg-[#004be5] active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 text-center"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Pay {formattedAmount} via installed UPI App</span>
                </a>
                <span className="text-[10px] text-slate-400 text-center block mt-1">
                  Opens Google Pay, PhonePe, Paytm, or CRED directly
                </span>
              </div>

              {/* Direct UPI Apps Grid */}
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Or select your UPI App directly:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {/* Google Pay */}
                  <button
                    type="button"
                    onClick={() => handleLaunchUpiApp('Google Pay')}
                    className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-white shadow-sm flex items-center gap-2 text-left active:scale-[0.98] transition-all"
                  >
                    <GooglePayIcon className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">Google Pay</div>
                      <div className="text-[9px] text-emerald-600 font-semibold">Fastest</div>
                    </div>
                  </button>

                  {/* PhonePe */}
                  <button
                    type="button"
                    onClick={() => handleLaunchUpiApp('PhonePe')}
                    className="p-3 rounded-xl border border-slate-200 hover:border-purple-400 bg-white shadow-sm flex items-center gap-2 text-left active:scale-[0.98] transition-all"
                  >
                    <PhonePeIcon className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">PhonePe</div>
                      <div className="text-[9px] text-purple-600 font-semibold">Instant</div>
                    </div>
                  </button>

                  {/* Paytm */}
                  <button
                    type="button"
                    onClick={() => handleLaunchUpiApp('Paytm')}
                    className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 bg-white shadow-sm flex items-center gap-2 text-left active:scale-[0.98] transition-all"
                  >
                    <PaytmIcon className="w-7 h-4 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">Paytm UPI</div>
                      <div className="text-[9px] text-blue-600 font-semibold">Instant</div>
                    </div>
                  </button>

                  {/* CRED / Any UPI */}
                  <button
                    type="button"
                    onClick={() => handleLaunchUpiApp('CRED')}
                    className="p-3 rounded-xl border border-slate-200 hover:border-black bg-white shadow-sm flex items-center gap-2 text-left active:scale-[0.98] transition-all"
                  >
                    <CredIcon className="w-4 h-5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">CRED UPI</div>
                      <div className="text-[9px] text-slate-500 font-semibold">Cashback</div>
                    </div>
                  </button>

                  {/* Amazon Pay */}
                  <button
                    type="button"
                    onClick={() => handleLaunchUpiApp('Amazon Pay')}
                    className="p-3 rounded-xl border border-slate-200 hover:border-amber-500 bg-white shadow-sm flex items-center gap-2.5 text-left active:scale-[0.98] transition-all col-span-2"
                  >
                    <AmazonPayIcon className="w-7 h-4 shrink-0" />
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">Amazon Pay</div>
                        <div className="text-[9px] text-amber-600 font-semibold">Instant UPI & Rewards</div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Tap to pay &rarr;</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Toggle to show QR code for secondary device */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowMobileQr(!showMobileQr)}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center justify-center gap-1.5 mx-auto"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{showMobileQr ? 'Hide QR Code' : 'Paying from another phone? Show QR'}</span>
                </button>

                {showMobileQr && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 inline-block animate-role-fade-in">
                    <img src={qrImageUrl} alt="QR Code" className="w-36 h-36 mx-auto mb-2" />
                    <span className="text-[10px] text-slate-500">Scan with any UPI App</span>
                  </div>
                )}
              </div>

              {/* Already Paid Button for mobile - Prominent Emerald CTA */}
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setShowPaymentDonePopup(true);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs font-mono shadow-md shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-98 transition-all ring-1 ring-emerald-400/40 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Paid via UPI? Click to Enter 12-Digit UTR →</span>
                </button>
              </div>
            </>
          )}

          {/* Edit Contact in Mobile (Step 1) */}
          {view === 'contact_edit' && (
            <div className="space-y-3">
              <div className="mb-1">
                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">
                  Step 1 of 2: Contact Info
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Where should we send your vault pass?
                </h4>
              </div>

              {contactError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{contactError}</span>
                </div>
              )}

              <form onSubmit={handleSaveContact} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setName(val);
                      if (email.includes('@') && email.includes('.')) {
                        handleGhostAutoSave(undefined, val);
                      }
                    }}
                    onBlur={() => handleGhostAutoSave()}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:border-slate-900">
                    <span className="px-2.5 py-2.5 bg-slate-50 border-r border-slate-200 text-xs text-slate-700 font-semibold">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setPhone(val);
                        if (email.includes('@') && email.includes('.')) {
                          handleGhostAutoSave(undefined, undefined, val);
                        }
                      }}
                      onBlur={() => handleGhostAutoSave()}
                      placeholder="98765 43210"
                      className="w-full px-3 py-2.5 text-xs font-mono text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEmail(val);
                      if (val.includes('@') && val.includes('.') && val.length > 5) {
                        handleGhostAutoSave(val);
                      }
                    }}
                    onBlur={() => handleGhostAutoSave()}
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                {/* Anti-bot Honeypot */}
                <input
                  type="text"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#0b5cff] hover:bg-[#004be5] active:scale-[0.98] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Proceed to Payment ({formattedAmount})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Mobile Success View */}
          {view === 'success' && (
            <div className="p-4 flex-1 flex flex-col justify-center items-center text-center animate-role-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3 shadow-sm">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>

              <div className="text-[9px] font-mono uppercase tracking-[0.16em] text-emerald-600 font-bold mb-1">
                UTR RECORDED &bull; PENDING RECONCILIATION
              </div>

              <h4 className="text-lg font-bold text-slate-900 tracking-tight mb-1.5">
                Order Confirmed!
              </h4>

              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Thank you, <strong className="text-slate-800">{name || 'Developer'}</strong>! Your payment of <strong className="text-slate-900">{formattedAmount}</strong> (UTR: <code className="font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-bold">{utrNumber}</code>) has been submitted.
              </p>

              {/* Order Credential Box */}
              <div className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left mb-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-mono text-[10px]">Reference #</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">{currentOrder?.orderNumber || 'APX-CONFIRMED'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-mono text-[10px]">Plan</span>
                  <span className="font-semibold text-slate-900 text-xs">{tier?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-mono text-[10px]">Email</span>
                  <span className="font-mono text-slate-800 text-[11px] truncate max-w-[170px]">{email}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-900 text-left mb-4 leading-relaxed">
                <strong>Where to log in?</strong> You will receive your <strong>Commercial License Key</strong>, <strong>Official Invoice</strong>, and a <strong>1-Click Instant Login Link</strong> via email once verified.
              </div>

              <div className="w-full space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playSuccess();
                    handleCloseDirect();
                    window.location.hash = '#portal';
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <User className="w-4 h-4" />
                  <span>Go to Member Login →</span>
                </button>

                <button
                  type="button"
                  onClick={handleCloseDirect}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all cursor-pointer"
                >
                  Return to Website
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>256-bit SSL</span>
          </span>
          <a href={`mailto:${supportEmail}`} className="text-slate-500 hover:text-slate-800 underline truncate max-w-[190px]">
            {supportEmail}
          </a>
        </div>
      </div>

      {/* ========================================================
          POPUP 1: "PAYMENT COMPLETED?" UTR POPUP
         ======================================================== */}
      {showPaymentDonePopup && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 select-none animate-role-fade-in">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
            onClick={() => setShowPaymentDonePopup(false)}
          />

          <div className="relative w-full max-w-[420px] rounded-2xl bg-white p-6 sm:p-7 text-center shadow-2xl z-20 border border-slate-100">
            <button
              type="button"
              onClick={() => setShowPaymentDonePopup(false)}
              className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
              <Check className="w-7 h-7 stroke-[2.5]" />
            </div>

            <h3 className="text-lg sm:text-[19px] font-bold text-slate-900 tracking-tight mb-1 font-sans">
              Payment Completed?
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 mb-2 font-sans">
              Did you complete the payment of <strong>{formattedAmount}</strong> to {merchantName}? Enter your 12-digit UTR number from your UPI app receipt to confirm your order.
            </p>

            <p className="text-[11px] text-slate-400 mb-4">
              Need assistance? Email{' '}
              <a href={`mailto:${supportEmail}`} className="text-blue-600 hover:underline font-medium">
                {supportEmail}
              </a>
            </p>

            {utrError && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{utrError}</span>
              </div>
            )}

            <form onSubmit={handleUtrSubmit} className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  12-Digit UTR / UPI Reference No. *
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 4281 9081 2345"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-center text-sm tracking-widest text-slate-900 focus:outline-none focus:border-slate-900"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>Digits: {utrNumber.length} / 12</span>
                  {utrNumber.length === 12 && (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Valid 12 digits
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your UPI ID <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={senderUpiId}
                  onChange={(e) => setSenderUpiId(e.target.value)}
                  placeholder="e.g. yourname@upi or 9876543210@paytm"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingUtr}
                className="w-full py-3 px-4 rounded-xl bg-[#0f0f12] hover:bg-black text-white font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {isSubmittingUtr ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Verifying with Bank...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Yes, Confirm & Submit UTR</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowPaymentDonePopup(false)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all text-center"
              >
                Not yet, continue payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          POPUP 2: EXIT CONFIRMATION POPUP (Screenshot 2)
         ======================================================== */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 select-none animate-role-fade-in">
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity"
            onClick={() => setShowExitConfirm(false)}
          />

          <div className="relative w-full max-w-[420px] rounded-2xl bg-white p-6 sm:p-7 text-center shadow-2xl z-20 border border-slate-100">
            <button
              type="button"
              onClick={() => setShowExitConfirm(false)}
              className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-[200px] h-[95px] bg-[#f7f8f9] rounded-2xl mx-auto mb-4 flex items-center justify-center p-2">
              <ExitDoorIllustration className="w-full h-full" />
            </div>

            <h3 className="text-lg sm:text-[19px] font-bold text-slate-900 tracking-tight mb-1 font-sans">
              Are you sure you want to exit?
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 mb-2 font-sans">
              You will be taken back to {merchantName} website
            </p>

            <p className="text-[11px] text-slate-400 mb-5 font-sans">
              Questions? Contact{' '}
              <a href={`mailto:${supportEmail}`} className="text-blue-600 hover:underline font-medium">
                {supportEmail}
              </a>
            </p>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowExitConfirm(false);
              }}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm transition-all mb-2.5 shadow-sm active:scale-[0.99]"
            >
              Continue to payment
            </button>

            <button
              type="button"
              onClick={handleConfirmExit}
              className="w-full py-3 px-4 rounded-xl bg-[#0f0f12] hover:bg-black text-white font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-[0.99]"
            >
              Yes, exit
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
};
