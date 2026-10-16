import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Copy,
  Check,
  ExternalLink,
  Download,
  FolderGit2,
  FileCode,
  Award,
  FileText,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  LogOut,
  ChevronLeft,
  Lock,
  Zap,
  Terminal,
  AlertCircle,
  HelpCircle,
  Code2,
} from 'lucide-react';
import {
  LeadOrder,
  getAllOrders,
  findApprovedOrder,
  getMaxDailyCopies,
  getDailyCopyUsage,
  incrementDailyCopyUsage,
  getExpiryDetails,
} from '../lib/leadTracker';
import { VAULT_CATALOG, VaultItem } from '../data/vaultCatalog';
import { sound } from '../lib/audioEngine';
import { InvoiceModal } from './InvoiceModal';
import { LicenseModal } from './LicenseModal';

interface ClientPortalProps {
  onBackToSite: () => void;
  onUpgradeClick?: () => void;
}

type PortalTab = 'vault' | 'boilerplates' | 'license';

export const ClientPortal: React.FC<ClientPortalProps> = ({ onBackToSite, onUpgradeClick }) => {
  // Authentication State
  const [activeOrder, setActiveOrder] = useState<LeadOrder | null>(() => {
    try {
      const stored = sessionStorage.getItem('apex3d_portal_active_order');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // ignore
    }
    return null;
  });

  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Portal Navigation & Filtering State
  const [activeTab, setActiveTab] = useState<PortalTab>('vault');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedModel, setSelectedModel] = useState<string>('All');
  const [expandedPromptId, setExpandedPromptId] = useState<string | null>(null);

  // Copy State & Toast
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [portalToast, setPortalToast] = useState<string | null>(null);
  const [isQuotaExceededModalOpen, setIsQuotaExceededModalOpen] = useState(false);

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
    setTimeout(() => setPortalToast(null), 3000);
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);

    const order = findApprovedOrder(loginInput);
    if (!order) {
      sound.playError?.();
      setLoginError(
        'No active verified order found with this License Key, Order Number, or Email. If you just paid via UPI, verification takes 2-10 minutes.'
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
    // Default VIP customer Priya Nambiar
    const orders = getAllOrders();
    const vip = orders.find((o) => o.status === 'approved' && o.tierId === 'lifetime') || orders.find((o) => o.status === 'approved');
    if (vip) {
      setActiveOrder(vip);
      sessionStorage.setItem('apex3d_portal_active_order', JSON.stringify(vip));
      setDailyUsage(getDailyCopyUsage(vip.licenseKey || ''));
      showToast('Logged in as VIP Lifetime Member');
    }
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
      setIsQuotaExceededModalOpen(true);
      return;
    }

    sound.playClick();
    navigator.clipboard.writeText(prompt.promptArchitecture);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 2500);

    const newCount = incrementDailyCopyUsage(activeOrder.licenseKey || '');
    setDailyUsage(newCount);
    showToast(`Copied "${prompt.title}" syntax!`);
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

  // -------------------------------------------------------------
  // VIEW 1: LOGIN GATE (If not logged in)
  // -------------------------------------------------------------
  if (!activeOrder) {
    return (
      <div className="min-h-screen bg-[#05050a] text-white flex flex-col justify-between selection:bg-blue-600/30">
        {/* Top Navbar */}
        <header className="border-b border-white/10 bg-[#090914] px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={() => {
                sound.playClick();
                onBackToSite();
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Main Site</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/30">
                3D
              </div>
              <span className="text-sm font-bold tracking-tight text-white font-mono">
                APEX3D // CLIENT PORTAL
              </span>
            </div>
          </div>
        </header>

        {/* Login Form Container */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-[#090914] border border-white/10 shadow-2xl relative">
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3 text-blue-400">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">Client Member Portal</h1>
              <p className="text-xs text-white/50 mt-1">
                Enter your License Key, Order Number, or Registered Email to access your 500+ master prompts vault.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Access Credential
                </label>
                <input
                  type="text"
                  required
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="e.g. LIC-VIP-84K2-91Q7 or APX-310492"
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <span className="text-[10px] text-white/40 mt-1 block">
                  Found in your approval email or WhatsApp order notification.
                </span>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 active:scale-95"
              >
                Access My Vault
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 text-center space-y-3">
              <button
                onClick={handleDemoVipLogin}
                className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Demo: VIP Lifetime Member Access</span>
              </button>

              <p className="text-[11px] text-white/40">
                Facing an issue with your credentials? WhatsApp our team at{' '}
                <a
                  href="https://wa.me/918860090791?text=Hello%20APEX3D%20Support,%20I%20need%20help%20accessing%20my%20client%20portal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  +91 88600 90791
                </a>
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-4 text-center text-xs text-white/30 font-mono">
          APEX3D Architectural Systems · Secured by Vine B Digital
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: AUTHENTICATED MEMBER DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#05050a] text-white selection:bg-blue-600/30 flex flex-col font-sans">
      {/* Toast Notification */}
      {portalToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-xl shadow-blue-600/40 animate-role-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>{portalToast}</span>
        </div>
      )}

      {/* Top Header / Account Ribbon */}
      <header className="border-b border-white/10 bg-[#090914] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onBackToSite();
              }}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-xs font-mono flex items-center gap-1"
              title="Return to main page"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Main Site</span>
            </button>

            <div className="h-4 w-[1px] bg-white/15 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/30">
                3D
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                    {activeOrder.name}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${
                      activeOrder.tierId === 'lifetime'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : activeOrder.tierId === 'month_6'
                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                        : activeOrder.tierId === 'month_1'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                    }`}
                  >
                    {activeOrder.tierName}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-white/50 flex items-center gap-2">
                  <span>{activeOrder.email}</span>
                  <span>·</span>
                  <span className="text-white/40">{activeOrder.licenseKey}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions (Invoices, License, Logout) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                sound.playClick();
                setIsInvoiceOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-mono flex items-center gap-1.5 border border-white/10 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Tax Invoice</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setIsLicenseOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-mono flex items-center gap-1.5 border border-white/10 transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Commercial License</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Expiry & Quota Alert Strip */}
      <div className="bg-[#0b0f1d] border-b border-white/5 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-white/70">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              Pass Status:{' '}
              <strong
                className={expiry.isExpired ? 'text-red-400' : 'text-emerald-400'}
              >
                {expiry.humanText}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-white/70">
              <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>
                Today's Quota:{' '}
                <strong className="text-white">
                  {remainingCopies === 'Unlimited' ? 'Unlimited' : `${remainingCopies} Remaining`}
                </strong>
                {maxDaily !== -1 && (
                  <span className="text-white/40 text-[10px] ml-1">
                    ({dailyUsage}/{maxDaily} used)
                  </span>
                )}
              </span>
            </div>

            {activeOrder.tierId !== 'lifetime' && onUpgradeClick && (
              <button
                onClick={() => {
                  sound.playClick();
                  onUpgradeClick();
                }}
                className="text-[10px] uppercase font-bold text-amber-400 hover:text-amber-300 underline"
              >
                Upgrade to Lifetime VIP
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="border-b border-white/10 bg-[#07070e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 sm:gap-6">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('vault');
            }}
            className={`py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'vault'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>500+ Master Prompts Vault</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('boilerplates');
            }}
            className={`py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'boilerplates'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Three.js Boilerplates & Cloud Repos</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('license');
            }}
            className={`py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'license'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Invoices & Official License</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        
        {/* -------------------------------------------------------------
            TAB 1: 500+ MASTER PROMPTS VAULT
           ------------------------------------------------------------- */}
        {activeTab === 'vault' && (
          <div className="space-y-6">
            
            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#090914] border border-white/10">
              
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search prompts by keyword, shader, model, or tech stack..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Model Filter */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono text-white/40 uppercase">Tested Model:</span>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="All">All Calibrated Models</option>
                  <option value="Claude 3.7">Claude 3.7 Sonnet</option>
                  <option value="Cursor">Cursor Agent</option>
                  <option value="ChatGPT">ChatGPT o3 / GPT-4o</option>
                </select>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Prompt Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filteredPrompts.map((prompt) => {
                const isExpanded = expandedPromptId === prompt.id;
                const isCopied = copiedId === prompt.id;

                return (
                  <div
                    key={prompt.id}
                    className="p-5 sm:p-6 rounded-2xl bg-[#090914] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Meta Header */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          {prompt.category}
                        </span>

                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-amber-400">
                            {prompt.clientValue} SOW
                          </span>
                          <span className="text-[10px] text-white/40 block font-mono">
                            ~{prompt.tokens} tokens
                          </span>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white tracking-tight">{prompt.title}</h3>
                      <p className="text-xs text-white/60 mt-1 line-clamp-2">{prompt.subtitle}</p>

                      {/* Description & Features */}
                      <p className="text-xs text-white/50 mt-3 leading-relaxed">
                        {prompt.description}
                      </p>

                      {/* Key Features Bullet Points */}
                      <div className="mt-3 space-y-1">
                        {prompt.keyFeatures.slice(0, 3).map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[11px] text-white/70">
                            <span className="text-blue-400 mt-0.5">•</span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>

                      {/* Calibrated Model Badges */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {prompt.testedModels.map((model) => (
                          <span
                            key={model}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/60 border border-white/5"
                          >
                            {model}
                          </span>
                        ))}
                      </div>

                      {/* Expandable Architecture Syntax */}
                      {isExpanded && (
                        <div className="mt-4 p-4 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-blue-200/90 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto animate-role-fade-in">
                          {prompt.promptArchitecture}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                      <button
                        onClick={() => {
                          sound.playClick();
                          setExpandedPromptId(isExpanded ? null : prompt.id);
                        }}
                        className="text-xs text-white/60 hover:text-white flex items-center gap-1 font-mono transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <span>Hide Architecture</span>
                            <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            <span>View Full Syntax</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopyPrompt(prompt)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all active:scale-95 ${
                          isCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>1-Click Copy Syntax</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 2: THREE.JS BOILERPLATES & STARTER KITS
           ------------------------------------------------------------- */}
        {activeTab === 'boilerplates' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#090914] border border-white/10">
              <h2 className="text-base font-bold text-white">Production Three.js Code Boilerplates</h2>
              <p className="text-xs text-white/50 mt-1">
                Drop these pre-configured starter repositories into Next.js 15, Vite, or Cursor to begin rendering 60 FPS WebGL scenes instantly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Boilerplate 1 */}
              <div className="p-6 rounded-2xl bg-[#090914] border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-white/40 mb-2">
                    <span className="text-emerald-400 font-semibold">NEXT.JS 15 + R3F</span>
                    <span>v2.4.0</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Full-Stack Three.js Canvas Engine</h3>
                  <p className="text-xs text-white/60 mt-2 leading-relaxed">
                    Pre-bundled with React Three Fiber, Drei helpers, selective Bloom post-processing, and smooth inertial camera dampening.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-mono text-white/50">
                    <span className="px-2 py-0.5 rounded bg-white/5">TypeScript</span>
                    <span className="px-2 py-0.5 rounded bg-white/5">React 19</span>
                    <span className="px-2 py-0.5 rounded bg-white/5">PostProcessing</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      sound.playClick();
                      showToast('Downloading Next.js 15 Three.js Starter (.zip)...');
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Starter ZIP</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      navigator.clipboard.writeText('npx degit vinebdigital/apex3d-starter my-spatial-app');
                      showToast('Copied npx degit command!');
                    }}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-mono border border-white/10 flex items-center gap-1"
                  >
                    <Terminal className="w-3 h-3 text-blue-400" />
                    <span>Copy NPX Command</span>
                  </button>
                </div>
              </div>

              {/* Boilerplate 2 */}
              <div className="p-6 rounded-2xl bg-[#090914] border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-white/40 mb-2">
                    <span className="text-blue-400 font-semibold">3D PRODUCT CONFIGURATOR</span>
                    <span>v1.8.0</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Spatial Product Showcase Engine</h3>
                  <p className="text-xs text-white/60 mt-2 leading-relaxed">
                    Photorealistic PBR metalness/roughness switches, multi-angle camera hot-spots, and dynamic glTF model loader with progressive DRACO compression.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-mono text-white/50">
                    <span className="px-2 py-0.5 rounded bg-white/5">GLTF / DRACO</span>
                    <span className="px-2 py-0.5 rounded bg-white/5">OrbitControls</span>
                    <span className="px-2 py-0.5 rounded bg-white/5">HDRI Studio Light</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      sound.playClick();
                      showToast('Downloading Product Configurator Template (.zip)...');
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Configurator ZIP</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      navigator.clipboard.writeText('npx degit vinebdigital/apex3d-configurator my-configurator');
                      showToast('Copied npx degit command!');
                    }}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-mono border border-white/10 flex items-center gap-1"
                  >
                    <Terminal className="w-3 h-3 text-blue-400" />
                    <span>Copy NPX Command</span>
                  </button>
                </div>
              </div>

              {/* Boilerplate 3 */}
              <div className="p-6 rounded-2xl bg-[#090914] border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-white/40 mb-2">
                    <span className="text-purple-400 font-semibold">GLSL SHADER PACK</span>
                    <span>v3.1.0</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Awwwards Liquid Shaders Collection</h3>
                  <p className="text-xs text-white/60 mt-2 leading-relaxed">
                    12 custom vertex and fragment shaders including Simplex Noise liquid distortion, kinetic chromatic aberration, and audio-reactive vertex pulsing.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-mono text-white/50">
                    <span className="px-2 py-0.5 rounded bg-white/5">GLSL 3.0</span>
                    <span className="px-2 py-0.5 rounded bg-white/5">Noise Algorithms</span>
                    <span className="px-2 py-0.5 rounded bg-white/5">Raw ShaderMaterial</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      sound.playClick();
                      showToast('Downloading GLSL Shaders (.zip)...');
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Shader Pack</span>
                  </button>
                </div>
              </div>

              {/* Boilerplate 4: Cursor Rules */}
              <div className="p-6 rounded-2xl bg-[#090914] border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-white/40 mb-2">
                    <span className="text-amber-400 font-semibold">AI PROMPT SYSTEM</span>
                    <span>.cursorrules</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Cursor AI & Claude 3.7 System Instructions</h3>
                  <p className="text-xs text-white/60 mt-2 leading-relaxed">
                    Paste this file into the root of your project as <code className="text-amber-300">.cursorrules</code> to force Cursor Agent to write ultra-clean Three.js code without typical hallucinated syntax.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
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
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy .cursorrules</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Cloud Drive Repository Access */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-blue-400" />
                  <span>Master Google Drive & GitHub Cloud Vault</span>
                </h3>
                <p className="text-xs text-white/60 mt-1 max-w-xl">
                  Instant cloud access to uncompressed 4K HDRIs, Blender 3D source files (.blend), and private GitHub repository with weekly prompt updates.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <a
                  href="https://drive.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
                >
                  <span>Open Google Drive</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 3: INVOICES & OFFICIAL LICENSE
           ------------------------------------------------------------- */}
        {activeTab === 'license' && (
          <div className="space-y-6 max-w-3xl">
            <div className="p-6 rounded-2xl bg-[#090914] border border-white/10">
              <h2 className="text-base font-bold text-white">Commercial Documents & Invoices</h2>
              <p className="text-xs text-white/50 mt-1">
                Download official documentation for corporate bookkeeping, GST filing, and client pitch authorization.
              </p>
            </div>

            {/* Tax Invoice Card */}
            <div className="p-6 rounded-2xl bg-[#090914] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-white/40 mb-1">
                  <span>INVOICE REFERENCE</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-bold">PAID</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  {activeOrder.invoiceNumber || 'INV-2026-8941'}
                </h3>
                <p className="text-xs text-white/50 mt-1">
                  Billed to {activeOrder.name} for {activeOrder.tierName} (₹{activeOrder.amountINR})
                </p>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsInvoiceOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>View & Print Tax Invoice</span>
              </button>
            </div>

            {/* Commercial License Card */}
            <div className="p-6 rounded-2xl bg-[#090914] border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400/80 mb-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>COMMERCIAL LICENSE CERTIFICATE</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  {activeOrder.licenseKey || 'LIC-VIP-84K2-91Q7'}
                </h3>
                <p className="text-xs text-white/50 mt-1">
                  Issued to {activeOrder.name} · {expiry.humanText}
                </p>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsLicenseOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <Award className="w-4 h-4" />
                <span>View & Print License</span>
              </button>
            </div>
          </div>
        )}

      </main>

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

      {/* Daily Quota Exceeded Modal */}
      {isQuotaExceededModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-role-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0e0e1a] border border-amber-500/30 text-white shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Daily Prompt Copy Quota Reached</h3>
            <p className="text-xs text-white/60 mt-1 leading-relaxed">
              Your <strong className="text-white">{activeOrder.tierName}</strong> includes{' '}
              <strong className="text-amber-300">{maxDaily} prompt {maxDaily === 1 ? 'copy' : 'copies'} per calendar day</strong>. Your quota resets at midnight.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-white/70">
              💡 <strong>Want unlimited copies every single day?</strong> Upgrade to the Lifetime VIP All-Access Pass for unrestricted access to all 500+ prompts forever.
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsQuotaExceededModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs"
              >
                Dismiss
              </button>
              {onUpgradeClick && (
                <button
                  onClick={() => {
                    setIsQuotaExceededModalOpen(false);
                    onUpgradeClick();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold"
                >
                  Upgrade to Lifetime VIP
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
