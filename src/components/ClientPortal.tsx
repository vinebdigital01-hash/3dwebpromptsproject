import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Search,
  Copy,
  Check,
  ExternalLink,
  Download,
  FolderGit2,
  Award,
  FileText,
  Clock,
  LogOut,
  ChevronLeft,
  Lock,
  Zap,
  Terminal,
  AlertCircle,
  Code2,
  Play,
  Pause,
  Maximize2,
  X,
  Volume2,
  VolumeX,
  Eye,
  Film,
  Layers,
  Cpu,
  LayoutGrid,
  List,
  Sparkles,
  ArrowUpRight,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';
import {
  LeadOrder,
  getAllOrders,
  findApprovedOrder,
  saveOrder,
  getMaxDailyCopies,
  getDailyCopyUsage,
  incrementDailyCopyUsage,
  getExpiryDetails,
} from '../lib/leadTracker';
import { VAULT_CATALOG, VaultItem } from '../data/vaultCatalog';
import { sound } from '../lib/audioEngine';
import { InvoiceModal } from './InvoiceModal';
import { LicenseModal } from './LicenseModal';
import { UpgradeShowcaseModal } from './UpgradeShowcaseModal';

interface ClientPortalProps {
  onBackToSite: () => void;
  onUpgradeClick?: () => void;
}

type PortalTab = 'vault' | 'boilerplates' | 'license';
type ViewMode = 'grid' | 'ledger';

export const ClientPortal: React.FC<ClientPortalProps> = ({ onBackToSite, onUpgradeClick }) => {
  // Authentication State
  const [activeOrder, setActiveOrder] = useState<LeadOrder | null>(() => {
    try {
      const stored = sessionStorage.getItem('apex3d_portal_active_order');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Portal Navigation & Filtering State
  const [activeTab, setActiveTab] = useState<PortalTab>('vault');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedModel, setSelectedModel] = useState<string>('All');

  // Active Featured / Selected Blueprint (for Master Theater Spotlight)
  const [spotlightPrompt, setSpotlightPrompt] = useState<VaultItem>(VAULT_CATALOG[1] || VAULT_CATALOG[0]);
  const [isSpotlightPlaying, setIsSpotlightPlaying] = useState(true);
  const spotlightVideoRef = useRef<HTMLVideoElement>(null);

  // Inspection Lightbox Modal State
  const [inspectingPrompt, setInspectingPrompt] = useState<VaultItem | null>(null);

  // Copy State & Toast
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [portalToast, setPortalToast] = useState<string | null>(null);
  const [isUpgradeShowcaseOpen, setIsUpgradeShowcaseOpen] = useState(false);
  const [upgradeTriggerReason, setUpgradeTriggerReason] = useState<'quota_exceeded' | 'manual'>('quota_exceeded');

  // Invoices & License Modals
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isLicenseOpen, setIsLicenseOpen] = useState(false);

  // Daily Usage State
  const [dailyUsage, setDailyUsage] = useState<number>(0);

  // Real-time ticking timer for countdown
  const [, setClockTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setClockTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activeOrder?.licenseKey) {
      setDailyUsage(getDailyCopyUsage(activeOrder.licenseKey));
    }
  }, [activeOrder]);

  const showToast = (msg: string) => {
    setPortalToast(msg);
    setTimeout(() => setPortalToast(null), 3200);
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);

    const order = findApprovedOrder(loginInput);
    if (!order) {
      sound.playError();
      setLoginError(
        'Credentials unverified. Ensure you have entered your exact License Key (e.g. LIC-VIP-84K2-91Q7) or registered phone/email.'
      );
      return;
    }

    sound.playSuccess();
    setActiveOrder(order);
    sessionStorage.setItem('apex3d_portal_active_order', JSON.stringify(order));
    setDailyUsage(getDailyCopyUsage(order.licenseKey || ''));
  };

  const handleDemoVipLogin = () => {
    sound.playSuccess();
    const orders = getAllOrders();
    const vip = orders.find((o) => o.status === 'approved' && o.tierId === 'lifetime') || orders.find((o) => o.status === 'approved');
    if (vip) {
      setActiveOrder(vip);
      sessionStorage.setItem('apex3d_portal_active_order', JSON.stringify(vip));
      setDailyUsage(getDailyCopyUsage(vip.licenseKey || ''));
      showToast('Enclave Session Loaded // VIP Lifetime License');
    }
  };

  const handleDemo1DayLogin = () => {
    sound.playSuccess();
    const orders = getAllOrders();
    let sprintOrder =
      orders.find((o) => o.tierId === 'day_pass' && o.status === 'approved') ||
      orders.find((o) => o.id === 'ORD-1DAY-4901');

    if (!sprintOrder) {
      sprintOrder = {
        id: 'ORD-1DAY-4901',
        orderNumber: 'APX-104921',
        name: 'Kabir Verma (Sprint Pass)',
        email: 'kabir.sprint@gmail.com',
        phone: '9876500049',
        tierId: 'day_pass',
        tierName: '1-Day Sprint Pass',
        amountINR: 49,
        status: 'approved',
        utrNumber: '429108471920',
        upiId: 'kabir@oksbi',
        invoiceNumber: 'INV-2026-4901',
        licenseKey: 'LIC-PRO-1DAY-99X2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
        utm: { source: 'instagram_reels', campaign: 'shader_vault_49' },
      };
      saveOrder(sprintOrder);
    } else {
      const expTime = sprintOrder.expiresAt ? new Date(sprintOrder.expiresAt).getTime() : 0;
      if (expTime < Date.now()) {
        sprintOrder = {
          ...sprintOrder,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
        };
        saveOrder(sprintOrder);
      }
    }

    setActiveOrder(sprintOrder);
    sessionStorage.setItem('apex3d_portal_active_order', JSON.stringify(sprintOrder));
    setDailyUsage(getDailyCopyUsage(sprintOrder.licenseKey || ''));
    showToast('1-Day Sprint Pass Loaded // 1 Copy/Day Quota Active');
  };

  const handleLogout = () => {
    sound.playClick();
    setActiveOrder(null);
    sessionStorage.removeItem('apex3d_portal_active_order');
  };

  const handleCopyPrompt = (prompt: VaultItem) => {
    if (!activeOrder) return;

    const maxCopies = getMaxDailyCopies(activeOrder.tierId);
    if (maxCopies !== -1 && dailyUsage >= maxCopies) {
      sound.playClick();
      setUpgradeTriggerReason('quota_exceeded');
      setIsUpgradeShowcaseOpen(true);
      return;
    }

    sound.playSuccess();
    navigator.clipboard.writeText(prompt.promptArchitecture);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 2500);

    const newCount = incrementDailyCopyUsage(activeOrder.licenseKey || '');
    setDailyUsage(newCount);
    showToast(`Arch-Syntax [${prompt.title.slice(0, 24)}...] copied to clipboard`);
  };

  const toggleSpotlightPlay = () => {
    sound.playClick();
    if (spotlightVideoRef.current) {
      if (isSpotlightPlaying) {
        spotlightVideoRef.current.pause();
        setIsSpotlightPlaying(false);
      } else {
        spotlightVideoRef.current.play();
        setIsSpotlightPlaying(true);
      }
    }
  };

  // Expiry Details
  const expiry = getExpiryDetails(activeOrder?.expiresAt);
  const maxDaily = activeOrder ? getMaxDailyCopies(activeOrder.tierId) : -1;
  const remainingCopies = maxDaily === -1 ? 'Unlimited' : Math.max(0, maxDaily - dailyUsage);

  // Filter Prompts
  const filteredPrompts = VAULT_CATALOG.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' || item.filterGroup === selectedCategory || item.category === selectedCategory;

    const matchesModel =
      selectedModel === 'All' || item.testedModels.some((m) => m.toLowerCase().includes(selectedModel.toLowerCase()));

    return matchesSearch && matchesCategory && matchesModel;
  });

  // -------------------------------------------------------------------------
  // VIEW 1: CRYPTOGRAPHIC ENCLAVE ACCESS GATE (ANTI-GENERIC REDESIGN)
  // -------------------------------------------------------------------------
  if (!activeOrder) {
    return (
      <div className="min-h-screen bg-[#040407] text-[#eaeaf0] flex flex-col justify-between selection:bg-blue-600/30 font-sans relative overflow-hidden">
        {/* Subtle Ambient Grain & Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.12),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(4,4,7,0.8)_100%)] pointer-events-none" />

        {/* Minimal Monolithic Top Nav */}
        <header className="border-b border-white/[0.08] px-6 py-4 relative z-10">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={() => {
                sound.playClick();
                onBackToSite();
              }}
              className="text-xs font-mono text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 uppercase tracking-widest"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Index</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono tracking-[0.2em] text-zinc-400 uppercase">
                APEX3D // ENCLAVE ACCESS
              </span>
            </div>
          </div>
        </header>

        {/* Access Terminal Form */}
        <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
          <div className="w-full max-w-md p-8 rounded-2xl bg-[#09090e] border border-white/[0.09] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] relative">
            
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">
                <span>IDENTITY VALIDATION</span>
                <span>SEC-256</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Member Vault Console
              </h1>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Provide your commercial license key, order reference, or registered identity.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.16em] text-zinc-400 mb-1.5">
                  Access Key / Order Token
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="LIC-VIP-XXXX-XXXX"
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/[0.12] text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-300 transition-colors tracking-wider"
                  />
                </div>
                <span className="text-[10px] text-zinc-500 font-mono mt-1.5 block">
                  Reference dispatched via WhatsApp & Tax Invoice upon approval.
                </span>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs font-mono flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-bold tracking-wider uppercase transition-all active:scale-[0.98] shadow-lg shadow-white/10"
              >
                Unlock Architecture Vault
              </button>
            </form>

            {/* Quick Demo Options */}
            <div className="mt-6 pt-6 border-t border-white/[0.08] space-y-2.5">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest text-center mb-1">
                INSTANT SIMULATION ENCLAVES
              </div>

              {/* 1-Day Sprint Test Button */}
              <button
                type="button"
                onClick={handleDemo1DayLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-mono flex items-center justify-between transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span className="font-bold">Test 1-Day Sprint Pass (₹49)</span>
                </div>
                <span className="text-[10px] text-purple-400/80">1 Copy / 24h</span>
              </button>

              {/* VIP Lifetime Test Button */}
              <button
                type="button"
                onClick={handleDemoVipLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-between transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold">Test VIP Lifetime Pass (₹2,999)</span>
                </div>
                <span className="text-[10px] text-amber-400/80">Unlimited</span>
              </button>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[10px] font-mono text-zinc-500 space-y-1">
                <div>🔑 1-Day Key: <strong className="text-zinc-300">LIC-PRO-1DAY-99X2</strong> (Order: APX-104921)</div>
                <div>👑 VIP Key: <strong className="text-zinc-300">LIC-VIP-84K2-91Q7</strong> (Order: APX-310492)</div>
              </div>

              <div className="text-center pt-1">
                <a
                  href="https://wa.me/918860090791?text=Hello%20APEX3D%20Support,%20I%20need%20help%20accessing%20my%20client%20portal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Need customer support? WhatsApp Team →
                </a>
              </div>
            </div>

          </div>
        </main>

        <footer className="border-t border-white/[0.06] py-4 text-center text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
          Vine B Digital Marketing Agency · Architectural Systems Enclave
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // VIEW 2: EXECUTIVE STUDIO WORKSTATION (AUTHENTICATED)
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#050508] text-[#f0f0f5] selection:bg-blue-600/30 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {portalToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#11111a] border border-white/20 text-white text-xs font-mono tracking-wide shadow-2xl animate-role-fade-in flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
          <span>{portalToast}</span>
        </div>
      )}

      {/* 1. ARCHITECTURAL TOP STUDIO BAR */}
      <header className="border-b border-white/[0.08] bg-[#07070b]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          
          {/* Left Entity Identity */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                sound.playClick();
                onBackToSite();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors text-[11px] font-mono uppercase tracking-wider flex items-center gap-1 border border-white/[0.06]"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <div className="h-4 w-[1px] bg-white/[0.08]" />

            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-mono font-bold text-xs shadow-md shadow-blue-500/20">
                3D
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white tracking-tight uppercase">
                    {activeOrder.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase tracking-widest font-bold">
                    {activeOrder.tierName}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-2">
                  <span>{activeOrder.licenseKey || 'LIC-VIP-84K2-91Q7'}</span>
                  <span>·</span>
                  <span className="text-emerald-400">Verified Commercial Licensee</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Matrix */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                sound.playClick();
                setIsInvoiceOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 border border-white/[0.08] transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Tax Invoice</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setIsLicenseOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 border border-white/[0.08] transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Commercial License</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-zinc-500 hover:text-red-400 border border-white/[0.06] transition-colors"
              title="Terminate Session"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. REAL-TIME HARDWARE & QUOTA TELEMETRY RIBBON */}
      <div className="border-b border-white/[0.06] bg-[#07070a] px-4 sm:px-8 py-2">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
          
          <div className="flex items-center gap-4 text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-500">SYSTEM:</span>
              <span className="text-zinc-200">ONLINE // 60 FPS WEBGL</span>
            </div>

            <div className="h-3 w-[1px] bg-white/[0.08]" />

            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">VALIDITY:</span>
              <span className={expiry.isExpired ? 'text-red-400' : 'text-amber-300'}>
                {expiry.humanText}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-zinc-300">
              <span className="text-zinc-500">SYNTAX QUOTA:</span>
              <span className="font-bold text-white tracking-wide">
                {remainingCopies === 'Unlimited' ? 'UNRESTRICTED' : `${remainingCopies} REMAINING`}
              </span>
              {maxDaily !== -1 && (
                <span className="text-zinc-500 text-[10px]">
                  ({dailyUsage}/{maxDaily} copies used today)
                </span>
              )}
            </div>

            {activeOrder.tierId !== 'lifetime' && onUpgradeClick && (
              <button
                onClick={() => {
                  sound.playClick();
                  setUpgradeTriggerReason('manual');
                  setIsUpgradeShowcaseOpen(true);
                }}
                className="text-[10px] uppercase font-bold text-amber-400 hover:text-amber-300 border-b border-amber-400/40 cursor-pointer"
              >
                Upgrade to Lifetime VIP
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 3. WORKSTATION MODULE NAVIGATION */}
      <div className="border-b border-white/[0.08] bg-[#060609]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('vault');
              }}
              className={`py-3 text-[11px] font-mono uppercase tracking-[0.16em] border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'vault'
                  ? 'border-white text-white font-bold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-blue-400" />
              <span>500+ Architecture Vault</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('boilerplates');
              }}
              className={`py-3 text-[11px] font-mono uppercase tracking-[0.16em] border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'boilerplates'
                  ? 'border-white text-white font-bold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Three.js Starter Racks</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('license');
              }}
              className={`py-3 text-[11px] font-mono uppercase tracking-[0.16em] border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'license'
                  ? 'border-white text-white font-bold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Legal & Credentials</span>
            </button>

            {activeOrder.tierId !== 'lifetime' && (
              <button
                onClick={() => {
                  sound.playClick();
                  setUpgradeTriggerReason('manual');
                  setIsUpgradeShowcaseOpen(true);
                }}
                className="py-3 text-[11px] font-mono uppercase tracking-[0.16em] flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-all font-bold cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Unlock VIP All-Access</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  ₹2,999
                </span>
              </button>
            )}
          </div>

          {activeTab === 'vault' && (
            <div className="hidden sm:flex items-center gap-1.5 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === 'grid' ? 'bg-white/[0.1] text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Cinema Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('ledger')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === 'ledger' ? 'bg-white/[0.1] text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Ledger Table"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* 4. MAIN WORKSPACE CONTENT */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-8 py-8">
        
        {/* =========================================================================
            TAB 1: 500+ MASTER ARCHITECTURAL VAULT (STUDIO THEATER + LEDGER)
           ========================================================================= */}
        {activeTab === 'vault' && (
          <div className="space-y-8">
            
            {/* MASTER THEATER SPOTLIGHT (FEATURED / ACTIVE BLUEPRINT INSPECTOR) */}
            <section className="rounded-2xl bg-[#09090e] border border-white/[0.09] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
                
                {/* Left 7 Cols: Cinematic Video Monitor */}
                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-black/50 relative">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">
                      <span>STUDIO MONITOR // 1080P PRORES SHADER</span>
                      <span className="text-emerald-400 font-bold">{spotlightPrompt.fpsBadge || '60 FPS WEBGL'}</span>
                    </div>

                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/[0.1] shadow-2xl bg-black group">
                      <video
                        ref={spotlightVideoRef}
                        src={spotlightPrompt.videoUrl}
                        poster={spotlightPrompt.poster}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />

                      {/* Video Player Floating Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
                        <button
                          onClick={toggleSpotlightPlay}
                          className="px-3 py-1.5 rounded-lg bg-black/75 hover:bg-black text-white text-[11px] font-mono border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5"
                        >
                          {isSpotlightPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          <span>{isSpotlightPlaying ? 'Pause Canvas' : 'Play Canvas'}</span>
                        </button>

                        <button
                          onClick={() => {
                            sound.playClick();
                            setInspectingPrompt(spotlightPrompt);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5"
                        >
                          <Maximize2 className="w-3 h-3" />
                          <span>Fullscreen Inspector</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Footer */}
                  <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-zinc-500">
                    <span>FRAME TIME: &lt;11.4MS</span>
                    <span>DRAW CALLS: 14 BATCHED</span>
                    <span>INSTANCED VERTICES: 12,000</span>
                  </div>
                </div>

                {/* Right 5 Cols: Blueprint Telemetry & Code Action */}
                <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-[#08080c]">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-blue-400 font-bold">
                        {spotlightPrompt.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {spotlightPrompt.clientValue} SOW
                      </span>
                    </div>

                    <h2 className="text-xl font-bold tracking-tight text-white">
                      {spotlightPrompt.title}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {spotlightPrompt.subtitle}
                    </p>

                    {/* Capabilities */}
                    <div className="mt-5 space-y-2">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                        ARCHITECTURAL SPECIFICATIONS:
                      </div>
                      {spotlightPrompt.keyFeatures.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                          <span className="text-blue-400 font-mono">0{idx + 1}.</span>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tested Models */}
                    <div className="mt-5 pt-4 border-t border-white/[0.06]">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">
                        CALIBRATED AI ENGINES:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {spotlightPrompt.testedModels.map((m) => (
                          <span
                            key={m}
                            className="text-[10px] font-mono px-2.5 py-1 rounded bg-white/[0.04] text-zinc-300 border border-white/[0.08]"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center gap-3">
                    <button
                      onClick={() => handleCopyPrompt(spotlightPrompt)}
                      className={`flex-1 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
                        copiedId === spotlightPrompt.id
                          ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                          : 'bg-white hover:bg-zinc-200 text-black shadow-lg shadow-white/10'
                      }`}
                    >
                      {copiedId === spotlightPrompt.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied to Clipboard</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Master Prompt</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        sound.playClick();
                        setInspectingPrompt(spotlightPrompt);
                      }}
                      className="px-4 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs font-mono transition-colors"
                      title="Inspect Raw Architecture"
                    >
                      <Code2 className="w-4 h-4 text-zinc-300" />
                    </button>
                  </div>
                </div>

              </div>
            </section>

            {/* CATALOG WORKBENCH FILTER CONTROLS */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl bg-[#09090e] border border-white/[0.08]">
              
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter 500+ Blueprints by shader, model, framework, or client tag..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-black/40 border border-white/[0.08] text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  'All',
                  'Spatial & WebGL',
                  'Luxury Brands',
                  'High-Ticket Agency',
                  'E-Commerce 3D',
                  'AI Agents & Systems',
                  'Design Systems',
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      sound.playClick();
                      setSelectedCategory(cat);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-white text-black font-bold shadow-sm'
                        : 'bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

            </div>

            {/* VIP UPGRADE REVEAL BANNER FOR NON-LIFETIME MEMBERS */}
            {activeOrder.tierId !== 'lifetime' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#0d0d15] to-[#07070b] border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.1)]">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white uppercase tracking-tight">
                        Permanent Studio Workstation Access
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold">
                        ₹49 SPRINT CREDITED
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500">
                        (Daily copies remaining: {remainingCopies})
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-snug max-w-2xl">
                      Remove the 1-copy daily threshold. Unlock unmetered 24/7 prompt copies, Next.js 15 hardware repositories, 12+ GLSL shaders, and lifetime commercial rights.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    setUpgradeTriggerReason('manual');
                    setIsUpgradeShowcaseOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 self-start sm:self-center shadow-lg shadow-amber-500/20 active:scale-[0.98] cursor-pointer"
                >
                  <span>Explore VIP Perks</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* -------------------------------------------------------------
                MODE A: CINEMA GRID (ASIDE FROM GENERIC CARDS - LUXURY FRAMES)
               ------------------------------------------------------------- */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrompts.map((item, idx) => {
                  const isCurrentSpotlight = spotlightPrompt.id === item.id;
                  const isCopied = copiedId === item.id;

                  return (
                    <article
                      key={item.id}
                      onClick={() => {
                        sound.playClick();
                        setSpotlightPrompt(item);
                      }}
                      className={`group rounded-xl bg-[#09090e] border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${
                        isCurrentSpotlight
                          ? 'border-blue-500/60 shadow-[0_12px_32px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/40'
                          : 'border-white/[0.08] hover:border-white/[0.2] hover:bg-[#0c0c13]'
                      }`}
                    >
                      {/* Top Media Frame */}
                      <div className="relative aspect-video w-full bg-black/60 overflow-hidden">
                        <video
                          src={item.videoUrl}
                          poster={item.poster}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#09090e] via-transparent to-black/60 pointer-events-none" />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono z-10">
                          <span className="px-2 py-0.5 rounded bg-black/70 text-zinc-300 border border-white/10 backdrop-blur-md">
                            0{idx + 1} // {item.category}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md font-bold">
                            {item.clientValue}
                          </span>
                        </div>

                        {/* Bottom Tag */}
                        <div className="absolute bottom-2.5 left-2.5 z-10">
                          <span className="text-[10px] font-mono text-emerald-400 bg-black/70 px-2 py-0.5 rounded border border-emerald-500/30 backdrop-blur-md flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>{item.fpsBadge || '60 FPS'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-blue-300 transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                            {item.subtitle}
                          </p>
                        </div>

                        {/* Bottom Meta & Actions */}
                        <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              sound.playClick();
                              setInspectingPrompt(item);
                            }}
                            className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                          >
                            <span>Inspect</span>
                            <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyPrompt(item);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all active:scale-[0.98] ${
                              isCopied
                                ? 'bg-emerald-500 text-black'
                                : 'bg-white/[0.08] hover:bg-white text-zinc-200 hover:text-black border border-white/[0.1]'
                            }`}
                          >
                            {isCopied ? 'Copied' : 'Copy Syntax'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* -------------------------------------------------------------
                MODE B: VAULT LEDGER (STRIPE / LINEAR STYLE TABLE)
               ------------------------------------------------------------- */}
            {viewMode === 'ledger' && (
              <div className="rounded-xl border border-white/[0.08] bg-[#09090e] overflow-hidden">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[10px] text-zinc-500 uppercase tracking-widest">
                      <th className="py-3 px-4">Ref</th>
                      <th className="py-3 px-4">Blueprint Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Client SOW</th>
                      <th className="py-3 px-4">Performance</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05] text-zinc-300">
                    {filteredPrompts.map((item, idx) => (
                      <tr
                        key={item.id}
                        onClick={() => {
                          sound.playClick();
                          setSpotlightPrompt(item);
                        }}
                        className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-4 text-zinc-500">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="py-3 px-4 font-sans font-bold text-white group-hover:text-blue-300 transition-colors">
                          {item.title}
                        </td>
                        <td className="py-3 px-4 text-[11px] text-zinc-400">{item.category}</td>
                        <td className="py-3 px-4 text-amber-300 font-bold">{item.clientValue}</td>
                        <td className="py-3 px-4 text-emerald-400 text-[11px]">{item.fpsBadge || '60 FPS'}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyPrompt(item);
                            }}
                            className="px-2.5 py-1 rounded bg-white/[0.06] hover:bg-white text-zinc-200 hover:text-black text-[10px] uppercase font-bold transition-all"
                          >
                            {copiedId === item.id ? 'Copied' : 'Copy'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

        {/* =========================================================================
            TAB 2: PRODUCTION THREE.JS STARTER RACKS
           ========================================================================= */}
        {activeTab === 'boilerplates' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#09090e] border border-white/[0.08]">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
                DEVELOPER TOOLCHAIN
              </div>
              <h2 className="text-lg font-bold text-white">Production Three.js Hardware Racks</h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                Pre-configured repository modules calibrated for Next.js 15 App Router, React 19, and Claude 3.7.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Rack 1 */}
              <div className="p-6 rounded-xl bg-[#09090e] border border-white/[0.08] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-2">
                    <span className="text-emerald-400 font-bold">[ R3F // NEXT.JS 15 ]</span>
                    <span>TAG: v2.4.0</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Full-Stack Three.js Canvas Engine</h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Pre-bundled with React Three Fiber, Drei helpers, selective Bloom post-processing, and smooth inertial camera dampening.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      sound.playClick();
                      showToast('Dispatching Next.js 15 Starter Archive (.zip)...');
                    }}
                    className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download ZIP</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      navigator.clipboard.writeText('npx degit vinebdigital/apex3d-starter my-spatial-app');
                      showToast('Copied npx degit command!');
                    }}
                    className="px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-mono border border-white/[0.08] flex items-center gap-1.5"
                  >
                    <Terminal className="w-3.5 h-3.5 text-blue-400" />
                    <span>Copy NPX Command</span>
                  </button>
                </div>
              </div>

              {/* Rack 2 */}
              <div className="p-6 rounded-xl bg-[#09090e] border border-white/[0.08] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-2">
                    <span className="text-blue-400 font-bold">[ SPATIAL PBR ENGINE ]</span>
                    <span>TAG: v1.8.0</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Photorealistic 3D Product Configurator</h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    PBR metalness/roughness switches, multi-angle camera hot-spots, and glTF model loader with progressive DRACO compression.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      sound.playClick();
                      showToast('Dispatching Configurator Template (.zip)...');
                    }}
                    className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download ZIP</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      navigator.clipboard.writeText('npx degit vinebdigital/apex3d-configurator my-configurator');
                      showToast('Copied npx degit command!');
                    }}
                    className="px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-mono border border-white/[0.08] flex items-center gap-1.5"
                  >
                    <Terminal className="w-3.5 h-3.5 text-blue-400" />
                    <span>Copy NPX Command</span>
                  </button>
                </div>
              </div>

              {/* Rack 3: Shaders */}
              <div className="p-6 rounded-xl bg-[#09090e] border border-white/[0.08] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-2">
                    <span className="text-purple-400 font-bold">[ GLSL SHADERS ]</span>
                    <span>TAG: v3.1.0</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Awwwards Liquid Shaders Collection</h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    12 custom vertex and fragment shaders including Simplex Noise liquid distortion and kinetic chromatic aberration.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      sound.playClick();
                      showToast('Dispatching GLSL Shader Library (.zip)...');
                    }}
                    className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download ZIP</span>
                  </button>
                </div>
              </div>

              {/* Rack 4: Cursor Rules */}
              <div className="p-6 rounded-xl bg-[#09090e] border border-white/[0.08] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-2">
                    <span className="text-amber-400 font-bold">[ AI SYSTEM PROMPT ]</span>
                    <span>.cursorrules</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Cursor AI & Claude 3.7 Custom Rules</h3>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Drop into project root to force Cursor Agent to write ultra-clean Three.js code without typical hallucinated syntax.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      sound.playClick();
                      const rules = `# APEX3D Cursor System Instructions
You are an expert Creative Technologist building Awwwards-tier 3D web experiences in React + Three.js + Tailwind CSS.
Rules:
1. Always clamp devicePixelRatio to Math.min(window.devicePixelRatio, 2).
2. Clean up geometries and materials in useEffect return handlers to prevent WebGL memory leaks.
3. Use InstancedMesh whenever rendering more than 100 identical geometries.
4. Implement smooth lerp damping on mouse velocity rather than raw event coordinates.`;
                      navigator.clipboard.writeText(rules);
                      showToast('Copied .cursorrules to clipboard!');
                    }}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy .cursorrules</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Cloud Drive Repository */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-blue-950/20 via-[#0a0f1d] to-[#09090e] border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-mono text-blue-400 uppercase tracking-widest mb-1">
                  CLOUD REPOSITORY SYNC
                </div>
                <h3 className="text-base font-bold text-white">Master Google Drive & GitHub Cloud Vault</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
                  Cloud access to raw 4K HDRIs, Blender 3D project files (.blend), and private GitHub code repository.
                </p>
              </div>

              <a
                href="https://drive.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span>Open Google Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: LEGAL, INVOICES & COMMERCIAL CREDENTIALS
           ========================================================================= */}
        {activeTab === 'license' && (
          <div className="space-y-6 max-w-3xl">
            <div className="p-6 rounded-2xl bg-[#09090e] border border-white/[0.08]">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
                CORPORATE COMPLIANCE
              </div>
              <h2 className="text-lg font-bold text-white">Commercial Documents & Invoices</h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Tax invoice for corporate bookkeeping and commercial certificate granting worldwide client deployment rights.
              </p>
            </div>

            {/* Tax Invoice */}
            <div className="p-6 rounded-xl bg-[#09090e] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
                  TAX INVOICE RECORD
                </div>
                <h3 className="text-base font-mono font-bold text-white">
                  {activeOrder.invoiceNumber || 'INV-2026-8941'}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Billed to {activeOrder.name} · {activeOrder.tierName} (₹{activeOrder.amountINR})
                </p>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsInvoiceOpen(true);
                }}
                className="px-4 py-2.5 rounded-lg bg-white/[0.06] hover:bg-white text-zinc-200 hover:text-black text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1.5 shrink-0 border border-white/[0.08]"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View & Print Tax Invoice</span>
              </button>
            </div>

            {/* Commercial License */}
            <div className="p-6 rounded-xl bg-[#09090e] border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-mono text-amber-400/80 uppercase tracking-widest mb-1">
                  CERTIFICATE OF COMMERCIAL LICENSE
                </div>
                <h3 className="text-base font-mono font-bold text-white">
                  {activeOrder.licenseKey || 'LIC-VIP-84K2-91Q7'}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Issued to {activeOrder.name} · {expiry.humanText}
                </p>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsLicenseOpen(true);
                }}
                className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold uppercase transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Award className="w-3.5 h-3.5" />
                <span>View Certificate</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* 5. LIGHTBOX / FULLSCREEN INSPECTOR (STUDIO SPLIT-SCREEN) */}
      {inspectingPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-role-fade-in overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-[#09090e] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden text-white my-auto flex flex-col max-h-[92vh]">
            
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0c0c12]">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-zinc-300 border border-white/[0.08] uppercase">
                  {inspectingPrompt.category}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate max-w-md">
                  {inspectingPrompt.title}
                </h2>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setInspectingPrompt(null);
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                aria-label="Close Inspector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split Screen Modal Body */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
              
              {/* Left Column: High-Res 3D Video Player */}
              <div className="p-6 flex flex-col justify-between bg-black/60">
                <div>
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl bg-black">
                    <video
                      src={inspectingPrompt.videoUrl}
                      poster={inspectingPrompt.poster}
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/75 text-emerald-400 font-mono text-[10px] border border-emerald-500/30 backdrop-blur-md">
                      {inspectingPrompt.fpsBadge || '60 FPS WEBGL'}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500">Client SOW Valuation:</span>
                    <span className="text-amber-300 font-bold">{inspectingPrompt.clientValue}</span>
                  </div>

                  <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
                    {inspectingPrompt.description}
                  </p>

                  <div className="mt-4 space-y-1.5">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                      Specifications:
                    </div>
                    {inspectingPrompt.keyFeatures.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <span className="text-blue-400 font-mono">0{idx + 1}.</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-wrap gap-1.5">
                  {inspectingPrompt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.06]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Column: Code & Production Architecture Syntax */}
              <div className="p-6 flex flex-col justify-between bg-[#08080c]">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono uppercase text-zinc-300 font-semibold flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-blue-400" />
                      <span>Calibrated Prompt Architecture</span>
                    </span>

                    <span className="text-[10px] font-mono text-zinc-500">
                      ~{inspectingPrompt.tokens} tokens
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {inspectingPrompt.testedModels.map((m) => (
                      <span
                        key={m}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/[0.08]"
                      >
                        {m}
                      </span>
                    ))}
                  </div>

                  {/* Preformatted Code Box */}
                  <div className="p-4 rounded-xl bg-black/80 border border-white/[0.08] font-mono text-xs text-blue-200/90 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto select-text scrollbar-thin">
                    {inspectingPrompt.promptArchitecture}
                  </div>

                  <p className="text-[10px] font-mono text-zinc-500 mt-3">
                    Copy and execute in Claude 3.7 Sonnet or Cursor Agent for full production React + Three.js components.
                  </p>
                </div>

                {/* Bottom Modal Actions */}
                <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
                  <button
                    onClick={() => setInspectingPrompt(null)}
                    className="px-4 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-mono uppercase tracking-wider"
                  >
                    Close
                  </button>

                  <button
                    onClick={() => handleCopyPrompt(inspectingPrompt)}
                    className={`px-5 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all active:scale-[0.98] ${
                      copiedId === inspectingPrompt.id
                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                        : 'bg-white hover:bg-zinc-200 text-black shadow-lg shadow-white/10'
                    }`}
                  >
                    {copiedId === inspectingPrompt.id ? 'Copied' : 'Copy Full Architecture'}
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Tax Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        order={activeOrder}
        onClose={() => setIsInvoiceOpen(false)}
      />

      {/* Commercial License Modal */}
      <LicenseModal
        isOpen={isLicenseOpen}
        order={activeOrder}
        onClose={() => setIsLicenseOpen(false)}
      />

      {/* Dynamic VIP Upgrade Showcase Modal with Motion Carousel */}
      <UpgradeShowcaseModal
        isOpen={isUpgradeShowcaseOpen}
        onClose={() => setIsUpgradeShowcaseOpen(false)}
        currentTierName={activeOrder.tierName}
        triggerReason={upgradeTriggerReason}
        onUpgrade={() => {
          setIsUpgradeShowcaseOpen(false);
          if (onUpgradeClick) {
            onUpgradeClick();
          }
        }}
      />

    </div>
  );
};
