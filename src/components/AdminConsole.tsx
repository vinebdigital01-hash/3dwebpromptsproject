import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  X,
  Clock,
  User,
  Mail,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Sparkles,
  Download,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Trash2,
  DollarSign,
  ArrowUpRight,
  Send,
  AlertTriangle,
  ChevronLeft,
  Award,
  MessageSquare,
  Zap,
  Eye,
  MousePointerClick,
  Database,
  Cloud,
  CloudOff,
  Key,
  Code,
  Layers,
  RotateCcw,
  Settings2,
  MailCheck,
  Loader2,
} from 'lucide-react';
import {
  getAllOrders,
  approveOrder,
  rejectOrder,
  saveOrder,
  LeadOrder,
  calculateTierExpiry,
  triggerDripFollowupHeartbeat,
} from '../lib/leadTracker';
import {
  generateRetargetingEmail,
  generateRetargetingWhatsAppUrl,
  logMarketingDispatch,
  getAllMarketingDispatches,
  MarketingCampaign,
} from '../lib/marketingAutomation';
import {
  getAdminSettings,
  saveAdminSettings,
  AdminSettings,
} from '../lib/adminSettings';
import {
  getAllVaultPrompts,
  addVaultPrompt,
  deleteVaultPrompt,
  resetToDefaultPrompts,
} from '../lib/promptCatalogStore';
import {
  testCloudConnection,
  performFullCloudSync,
  generateSupabaseSqlSchema,
  CloudSyncResult,
} from '../lib/cloudSync';
import {
  sendOrderApprovalEmail,
  sendOrderRejectionEmail,
  sendTestEmail,
  sendCartRecoveryEmail,
  sendInstantLeadMagnetOrAbandonedEmail,
  EmailDispatchResult,
} from '../lib/resendEmail';
import { sound } from '../lib/audioEngine';
import { VaultItem } from '../data/vaultCatalog';
import { InvoiceModal } from './InvoiceModal';
import { LicenseModal } from './LicenseModal';

interface AdminConsoleProps {
  onBackToSite: () => void;
}

type AdminTab = 'approvals' | 'retargeting' | 'ghosts' | 'orders' | 'cms' | 'settings';

export const AdminConsole: React.FC<AdminConsoleProps> = ({ onBackToSite }) => {
  const [tab, setTab] = useState<AdminTab>('approvals');
  const [orders, setOrders] = useState<LeadOrder[]>([]);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectionModalOrder, setRejectionModalOrder] = useState<LeadOrder | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Payment not credited in bank account');
  const [statusNotification, setStatusNotification] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<LeadOrder | null>(null);
  const [selectedLicenseOrder, setSelectedLicenseOrder] = useState<LeadOrder | null>(null);
  const [emailPreviewOrder, setEmailPreviewOrder] = useState<LeadOrder | null>(null);
  const [marketingHistory, setMarketingHistory] = useState<MarketingCampaign[]>([]);
  const [sendingLeadEmailId, setSendingLeadEmailId] = useState<string | null>(null);

  // Prompt CMS State (Persistent via promptCatalogStore)
  const [promptsList, setPromptsList] = useState<VaultItem[]>(() => getAllVaultPrompts());
  const [isAddPromptOpen, setIsAddPromptOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState<VaultItem['filterGroup']>('Spatial & WebGL');
  const [newClientValue, setNewClientValue] = useState('$25,000 Client SOW');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newSyntax, setNewSyntax] = useState('');

  // Settings State (Persistent via adminSettings)
  const [settings, setSettings] = useState<AdminSettings>(() => getAdminSettings());
  const [merchantName, setMerchantName] = useState(settings.merchantName);
  const [merchantUpi, setMerchantUpi] = useState(settings.merchantUpi);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [priceDay1, setPriceDay1] = useState(settings.pricing.day_1);
  const [priceMonth1, setPriceMonth1] = useState(settings.pricing.month_1);
  const [priceMonth6, setPriceMonth6] = useState(settings.pricing.month_6);
  const [priceLifetime, setPriceLifetime] = useState(settings.pricing.lifetime);

  // Supabase Cloud State
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings.supabaseAnonKey);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(settings.cloudSyncEnabled);
  const [isTestingCloud, setIsTestingCloud] = useState(false);
  const [cloudTestResult, setCloudTestResult] = useState<CloudSyncResult | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Resend Email State
  const [resendApiKey, setResendApiKey] = useState(settings.resendApiKey);
  const [resendFromEmail, setResendFromEmail] = useState(settings.resendFromEmail);
  const [testEmailRecipient, setTestEmailRecipient] = useState(settings.supportEmail || 'support@vinebdigital.store');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<EmailDispatchResult | null>(null);

  // Automated Resend Drip Follow-ups State
  const [isDripRunning, setIsDripRunning] = useState(false);
  const [dripResult, setDripResult] = useState<{ day1: number; day2: number; timestamp: string } | null>(null);

  const loadData = () => {
    setOrders(getAllOrders());
    setMarketingHistory(getAllMarketingDispatches());
    setPromptsList(getAllVaultPrompts());
  };

  useEffect(() => {
    loadData();
    // Background self-healing check: check if any Day 1 / Day 2 follow-ups are due
    triggerDripFollowupHeartbeat(false).catch(() => {});

    // Listen for real-time order and marketing updates
    const handleOrderUpdate = () => {
      loadData();
    };
    const handleMarketingUpdate = () => {
      setMarketingHistory(getAllMarketingDispatches());
    };
    const handlePromptsUpdate = () => {
      setPromptsList(getAllVaultPrompts());
    };
    window.addEventListener('apex_order_updated', handleOrderUpdate);
    window.addEventListener('apex_marketing_dispatched', handleMarketingUpdate);
    window.addEventListener('apex_prompts_updated', handlePromptsUpdate);
    return () => {
      window.removeEventListener('apex_order_updated', handleOrderUpdate);
      window.removeEventListener('apex_marketing_dispatched', handleMarketingUpdate);
      window.removeEventListener('apex_prompts_updated', handlePromptsUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 3500);
  };

  // Actions
  const handleApprove = async (order: LeadOrder) => {
    sound.playSuccess();
    const approved = approveOrder(order.id);
    if (approved) {
      loadData();
      showToast(`Order ${approved.orderNumber} Approved! License ${approved.licenseKey} & Invoice generated.`);

      // Automated Resend transactional fulfillment email
      if (approved.email) {
        try {
          const emailRes = await sendOrderApprovalEmail(approved);
          if (emailRes.success) {
            showToast(`Fulfillment email dispatched to ${approved.email}!`);
          } else {
            console.warn('Resend email notice:', emailRes.message);
          }
        } catch (err) {
          console.error('Error dispatching fulfillment email:', err);
        }
      }
    }
  };

  const handleOpenReject = (order: LeadOrder) => {
    sound.playClick();
    setRejectionModalOrder(order);
  };

  const handleConfirmReject = async () => {
    if (!rejectionModalOrder) return;
    sound.playClick();
    const rejected = rejectOrder(rejectionModalOrder.id, rejectionReason);
    if (rejected) {
      loadData();
      showToast(`Order ${rejected.orderNumber} marked as Rejected.`);

      // Automated Resend rejection notice
      if (rejected.email) {
        try {
          await sendOrderRejectionEmail(rejected, rejectionReason);
        } catch (err) {
          console.error('Error dispatching rejection notice:', err);
        }
      }
    }
    setRejectionModalOrder(null);
  };

  const handleSendRecoveryEmail = async (lead: LeadOrder) => {
    if (!lead.email || !lead.email.includes('@')) {
      showToast('This lead does not have a valid email address.');
      return;
    }
    setSendingLeadEmailId(lead.id);
    sound.playClick();
    try {
      const result = await sendCartRecoveryEmail({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        tierName: lead.tierName,
        amountINR: lead.amountINR,
        orderNumber: lead.orderNumber,
      });

      if (result.success) {
        sound.playSuccess();
        const updatedLead: LeadOrder = {
          ...lead,
          followupStage: (lead.followupStage || 0) + 1,
          lastFollowupAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        saveOrder(updatedLead);
        loadData();
        showToast(`⚡ Recovery email dispatched via Resend to ${lead.email}!`);
      } else {
        showToast(`Email Notice: ${result.message}`);
      }
    } catch (err: any) {
      showToast(`Error sending email: ${err.message || 'Unknown error'}`);
    } finally {
      setSendingLeadEmailId(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    sound.playClick();
    navigator.clipboard.writeText(text);
    setCopiedUtr(id);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  const handleAddPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSyntax.trim()) return;

    sound.playSuccess();
    const newPromptItem: VaultItem = {
      id: `custom-prompt-${Date.now()}`,
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'Production WebGL interactive architecture prompt.',
      category: 'Spatial OS',
      filterGroup: newCategory || 'Spatial & WebGL',
      clientValue: newClientValue.trim() || '$18,000 SOW',
      tokens: 2600,
      highlightStat: '10x Agency ROI',
      description: newSubtitle.trim() || 'Enterprise 3D WebGL prompt blueprint with high-performance production code.',
      tags: ['WebGL', 'Custom CMS', 'Production-Ready'],
      testedModels: ['Claude 3.7 Sonnet', 'Cursor Agent', 'GPT-4o'],
      keyFeatures: [
        'Dynamic GLSL Shader Topology',
        'Camera focal shifting with kinetic inertia',
        'High-converting interactive client deliverable',
      ],
      videoUrl: newVideoUrl.trim() || 'https://images.refero.design/styles/refero.design/video/a3ee62c8-c674-48a3-84a9-e8269eefd621.mp4',
      poster: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&auto=format&fit=crop&q=80',
      fpsBadge: '60 FPS WEBGL',
      promptArchitecture: newSyntax.trim(),
    };

    const updated = addVaultPrompt(newPromptItem);
    setPromptsList(updated);
    setIsAddPromptOpen(false);
    setNewTitle('');
    setNewSubtitle('');
    setNewSyntax('');
    showToast(`New Prompt Blueprint "${newPromptItem.title}" Added to Vault & Live for Clients!`);
  };

  const handleDeletePrompt = (id: string, title: string) => {
    sound.playClick();
    const updated = deleteVaultPrompt(id);
    setPromptsList(updated);
    showToast(`Deleted "${title}" from Vault.`);
  };

  const handleResetPrompts = () => {
    sound.playClick();
    const defaults = resetToDefaultPrompts();
    setPromptsList(defaults);
    showToast('Vault prompts reset to pristine master catalog.');
  };

  const handleSaveSettings = () => {
    sound.playSuccess();
    const updated = saveAdminSettings({
      merchantName: merchantName.trim(),
      merchantUpi: merchantUpi.trim(),
      supportEmail: supportEmail.trim(),
      whatsappNumber: whatsappNumber.trim(),
      pricing: {
        day_1: Number(priceDay1) || 49,
        month_1: Number(priceMonth1) || 299,
        month_6: Number(priceMonth6) || 699,
        lifetime: Number(priceLifetime) || 2999,
      },
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim(),
      cloudSyncEnabled,
      resendApiKey: resendApiKey.trim(),
      resendFromEmail: resendFromEmail.trim(),
    });
    setSettings(updated);
    showToast('Store settings & payment configuration saved live!');
  };

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient.includes('@')) {
      showToast('Please enter a valid recipient email address.');
      return;
    }
    sound.playClick();
    setIsSendingTestEmail(true);
    setTestEmailResult(null);
    try {
      const res = await sendTestEmail(testEmailRecipient);
      setTestEmailResult(res);
      if (res.success) {
        sound.playSuccess();
        showToast('Test email dispatched! Check your inbox.');
      } else {
        showToast(`Email Notice: ${res.message}`);
      }
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleTestCloud = async () => {
    sound.playClick();
    setIsTestingCloud(true);
    setCloudTestResult(null);
    try {
      const res = await testCloudConnection(supabaseUrl, supabaseAnonKey);
      setCloudTestResult(res);
      if (res.success) {
        sound.playSuccess();
      }
    } finally {
      setIsTestingCloud(false);
    }
  };

  const handleSyncCloud = async () => {
    sound.playClick();
    setIsSyncingCloud(true);
    try {
      const res = await performFullCloudSync();
      if (res.success) {
        sound.playSuccess();
        loadData();
        const updated = getAdminSettings();
        setSettings(updated);
        showToast(`Cloud Sync Complete: ${res.message}`);
      } else {
        showToast(`Cloud Sync: ${res.message}`);
      }
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Filtered lists
  const pendingApprovals = orders.filter((o) => o.status === 'pending_approval');
  const ghostLeads = orders.filter(
    (o) => o.status === 'unsubmitted_keystroke' || o.status === 'abandoned_at_qr'
  );
  const approvedOrders = orders.filter((o) => o.status === 'approved');
  const upgradeIntentOrders = orders.filter(
    (o) => (o.upgradeTelemetry?.viewsCount || 0) > 0 || (o.upgradeTelemetry?.clicksCount || 0) > 0
  );

  // Stats
  const totalRevenue = approvedOrders.reduce((sum, o) => sum + (o.amountINR || 0), 0);

  return (
    <div className="min-h-screen bg-[#05050a] text-white font-sans select-none">
      {/* Top Banner Toast Notification */}
      {statusNotification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-xl shadow-blue-600/40 animate-role-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* Admin Top Navigation Bar */}
      <header className="border-b border-white/10 bg-[#090914] px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                sound.playClick();
                onBackToSite();
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Site</span>
            </button>

            <div className="h-4 w-[1px] bg-white/15" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/30">
                3D
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight flex items-center gap-1.5 text-white">
                  <span>APEX3D VAULT // ADMIN SUPER-CONSOLE</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    LIVE
                  </span>
                </h1>
                <p className="text-[10px] text-white/40 font-mono">
                  Payment Approvals · Ghost Lead Recovery · Prompt CMS · Expiry Control
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                loadData();
                showToast('Database refreshed.');
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs font-mono flex items-center gap-1.5"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Top At-A-Glance KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0c1527] to-[#080d19] border border-blue-500/20">
            <div className="flex items-center justify-between text-white/50 text-xs font-mono mb-1">
              <span>TOTAL REVENUE</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 font-mono">
              From {approvedOrders.length} verified purchases
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0f1d] border border-white/10">
            <div className="flex items-center justify-between text-white/50 text-xs font-mono mb-1">
              <span>PENDING APPROVALS</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">
              {pendingApprovals.length}
            </div>
            <div className="text-[10px] text-amber-300/80 mt-1 font-mono">
              Requires bank UTR verification
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0f1d] border border-white/10">
            <div className="flex items-center justify-between text-white/50 text-xs font-mono mb-1">
              <span>GHOST & ABANDONED</span>
              <User className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-300">
              {ghostLeads.length}
            </div>
            <div className="text-[10px] text-purple-300/80 mt-1 font-mono">
              High-intent leads to recover
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0f1d] border border-white/10">
            <div className="flex items-center justify-between text-white/50 text-xs font-mono mb-1">
              <span>PROMPT BLUEPRINTS</span>
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-300">
              {promptsList.length}+
            </div>
            <div className="text-[10px] text-blue-300/80 mt-1 font-mono">
              Live in customer vault
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => {
              sound.playClick();
              setTab('approvals');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              tab === 'approvals'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Pending Approvals ({pendingApprovals.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setTab('retargeting');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              tab === 'retargeting'
                ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Upgrade Retargeting ({upgradeIntentOrders.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setTab('ghosts');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              tab === 'ghosts'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Ghost & Abandoned Leads ({ghostLeads.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setTab('orders');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              tab === 'orders'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Approved Orders & Invoices ({approvedOrders.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setTab('cms');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              tab === 'cms'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Prompt CMS ({promptsList.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setTab('settings');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              tab === 'settings'
                ? 'bg-slate-700 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>⚙️ Settings</span>
          </button>
        </div>

        {/* ------------------------------------------
            TAB 1: PENDING APPROVALS
           ------------------------------------------ */}
        {tab === 'approvals' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Pending UPI Payment Verifications</h2>
                <p className="text-xs text-white/50">
                  Match the submitted 12-digit UTR against your bank or UPI notification. Click Accept to provision credentials instantly.
                </p>
              </div>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="py-20 text-center rounded-2xl bg-[#090914] border border-white/5 text-white/40">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-white/70">All clear! No pending payments.</p>
                <p className="text-xs text-white/40 mt-1">
                  When a customer scans the QR and enters their UTR, it will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl bg-[#0c101c] border border-amber-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-lg shadow-black/40"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs font-semibold text-white">{order.tierName}</span>
                        <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          ₹{order.amountINR}
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 mt-2">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-blue-400" />
                          <strong className="text-white">{order.name}</strong>
                        </span>
                        <span className="flex items-center gap-1 font-mono text-white/60">
                          <Mail className="w-3.5 h-3.5 text-blue-400" />
                          {order.email}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-white/60">
                          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                          {order.phone}
                        </span>
                      </div>

                      {/* UTR Highlight Box */}
                      <div className="mt-3 inline-flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono">
                        <span className="text-amber-300 font-semibold">12-Digit UTR:</span>
                        <strong className="text-white tracking-widest text-sm font-bold">
                          {order.utrNumber || 'N/A'}
                        </strong>
                        <button
                          onClick={() => handleCopy(order.utrNumber || '', order.id)}
                          className="p-1 hover:bg-white/10 rounded text-blue-400"
                          title="Copy UTR"
                        >
                          {copiedUtr === order.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
                      <a
                        href={`https://wa.me/91${order.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hi ${order.name}, thank you for your order ${order.orderNumber} for APEX3D Vault. We are verifying UTR ${order.utrNumber}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <span>WhatsApp</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        onClick={() => handleOpenReject(order)}
                        className="px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 text-xs font-semibold transition-colors"
                      >
                        Reject
                      </button>

                      <button
                        onClick={() => handleApprove(order)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5 active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept & Approve</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------
            TAB: UPGRADE RETARGETING & AUTOMATION
           ------------------------------------------ */}
        {tab === 'retargeting' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold uppercase tracking-wider">
                    UPGRADE INTENT & RETARGETING ENGINE
                  </span>
                  <span className="text-xs text-white/50 font-mono">
                    {upgradeIntentOrders.length} Tracked Customers
                  </span>
                </div>
                <h2 className="text-base font-bold text-white">Upgrade Telemetry & Automated Recovery</h2>
                <p className="text-xs text-white/50">
                  Track how many times customers opened the upgrade modal, which tier they selected (₹299, ₹699, ₹2,999), and dispatch personalized retargeting emails & WhatsApp messages.
                </p>
              </div>

              {upgradeIntentOrders.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sound.playClick();
                      const firstLead = upgradeIntentOrders[0];
                      if (firstLead) {
                        setEmailPreviewOrder(firstLead);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Quick Email Automation</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#090914] border border-white/10">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Total Modal Views</span>
                <span className="text-2xl font-bold font-mono text-white mt-1 block">
                  {upgradeIntentOrders.reduce((sum, o) => sum + (o.upgradeTelemetry?.viewsCount || 0), 0)}
                </span>
                <span className="text-[10px] text-amber-400/80 mt-1 block font-mono">Quota & Manual clicks</span>
              </div>

              <div className="p-4 rounded-xl bg-[#090914] border border-white/10">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Upgrade CTA Clicks</span>
                <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
                  {upgradeIntentOrders.reduce((sum, o) => sum + (o.upgradeTelemetry?.clicksCount || 0), 0)}
                </span>
                <span className="text-[10px] text-zinc-400 mt-1 block font-mono">Initiated checkout</span>
              </div>

              <div className="p-4 rounded-xl bg-[#090914] border border-white/10">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Hot Recoverable Leads</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                  {upgradeIntentOrders.filter((o) => o.upgradeTelemetry?.isAbandoned).length}
                </span>
                <span className="text-[10px] text-emerald-400/80 mt-1 block font-mono">Ready for retargeting</span>
              </div>

              <div className="p-4 rounded-xl bg-[#090914] border border-white/10">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Sprint Fee Credit</span>
                <span className="text-2xl font-bold font-mono text-blue-400 mt-1 block">
                  ₹49 Applied
                </span>
                <span className="text-[10px] text-zinc-400 mt-1 block font-mono">Auto-deducted hook</span>
              </div>
            </div>

            {/* Customer List */}
            {upgradeIntentOrders.length === 0 ? (
              <div className="py-20 text-center rounded-2xl bg-[#090914] border border-white/5 text-white/40">
                <Zap className="w-10 h-10 text-amber-400 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-white/70">No upgrade modal views recorded yet.</p>
                <p className="text-xs text-white/40 mt-1">
                  When 1-Day Pass users trigger their daily limit or explore higher tiers in /#portal, their telemetry will stream here live.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upgradeIntentOrders.map((order) => {
                  const telemetry = order.upgradeTelemetry;
                  const selectedTier = telemetry?.lastSelectedTierId || 'month_1';
                  const tierName =
                    selectedTier === 'lifetime'
                      ? 'Lifetime VIP All-Access (₹2,999)'
                      : selectedTier === 'month_6'
                      ? '6-Month Studio (₹699)'
                      : '1-Month Pro Access (₹299)';

                  const waUrl = generateRetargetingWhatsAppUrl(order);

                  return (
                    <div
                      key={order.id}
                      className="p-5 rounded-2xl bg-[#0b0e18] border border-amber-500/25 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-lg shadow-black/40"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/15">
                            {order.orderNumber}
                          </span>
                          <span className="text-xs font-semibold text-zinc-200">
                            Current: <strong className="text-amber-300">{order.tierName}</strong>
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                            ₹49 Sprint Customer
                          </span>
                          {telemetry?.isAbandoned && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                              HOT ABANDONED LEAD
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300 pt-1">
                          <span className="flex items-center gap-1.5 font-bold text-white">
                            <User className="w-3.5 h-3.5 text-blue-400" />
                            {order.name}
                          </span>
                          <span className="flex items-center gap-1.5 font-mono text-zinc-400">
                            <Mail className="w-3.5 h-3.5 text-blue-400" />
                            {order.email}
                          </span>
                          <span className="flex items-center gap-1.5 font-mono text-zinc-400">
                            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                            {order.phone}
                          </span>
                        </div>

                        {/* Telemetry Readout Matrix */}
                        <div className="p-3 rounded-xl bg-black/60 border border-white/[0.06] text-xs font-mono flex flex-wrap items-center gap-4 text-zinc-300 mt-2">
                          <div className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>Modal Views: <strong className="text-white">{telemetry?.viewsCount || 0}x</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MousePointerClick className="w-3.5 h-3.5 text-blue-400" />
                            <span>Upgrade Clicks: <strong className="text-white">{telemetry?.clicksCount || 0}x</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-purple-400" />
                            <span>Target Tier: <strong className="text-amber-300">{tierName}</strong></span>
                          </div>
                          {telemetry?.triggerReason && (
                            <div className="text-[10px] text-zinc-500">
                              Trigger: {telemetry.triggerReason === 'quota_exceeded' ? 'Quota Limit Reached' : 'Manual Portal Click'}
                            </div>
                          )}
                        </div>

                        {/* Timeline snippet */}
                        {telemetry?.history && telemetry.history.length > 0 && (
                          <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-2 flex-wrap pt-1">
                            <span>Activity timeline:</span>
                            {telemetry.history.slice(-3).map((h, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">
                                {h.action.replace('_', ' ')} ({new Date(h.timestamp).toLocaleTimeString()})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 1-Click Retargeting Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 justify-center">
                        <button
                          onClick={() => {
                            sound.playClick();
                            setEmailPreviewOrder(order);
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-[0.98] cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Send Retargeting Email</span>
                        </button>

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            sound.playClick();
                            logMarketingDispatch({
                              type: 'whatsapp',
                              recipientEmail: order.email,
                              recipientPhone: order.phone,
                              recipientName: order.name,
                              orderNumber: order.orderNumber,
                              triggerEvent: telemetry?.clicksCount ? 'cta_clicked_abandon' : 'quota_reached_abandon',
                              selectedTierName: tierName,
                              originalPrice: 299,
                              discountedPrice: 250,
                              subject: 'WhatsApp Retargeting Dispatch',
                              body: 'Dispatched via WhatsApp deep-link',
                              checkoutUrl: 'https://vinebdigital.store/#portal',
                              status: 'dispatched',
                            });
                            showToast(`💬 WhatsApp Retargeting opened for ${order.name}`);
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp Retargeting</span>
                        </a>

                        <button
                          onClick={() => {
                            sound.playSuccess();
                            logMarketingDispatch({
                              type: 'webhook',
                              recipientEmail: order.email,
                              recipientPhone: order.phone,
                              recipientName: order.name,
                              orderNumber: order.orderNumber,
                              triggerEvent: telemetry?.clicksCount ? 'cta_clicked_abandon' : 'quota_reached_abandon',
                              selectedTierName: tierName,
                              originalPrice: 299,
                              discountedPrice: 250,
                              subject: 'Webhook Auto-Retargeting Triggered',
                              body: JSON.stringify(telemetry),
                              checkoutUrl: 'https://vinebdigital.store/#portal',
                              status: 'dispatched',
                            });
                            showToast(`⚡ Automated webhook payload dispatched for ${order.email}!`);
                          }}
                          className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 text-xs font-mono border border-white/[0.08] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Simulate Auto-Dispatch</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Campaign History Log */}
            {marketingHistory.length > 0 && (
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-3 text-xs font-mono text-zinc-400">
                  <span>DISPATCHED AUTOMATION LOGS ({marketingHistory.length})</span>
                  <span className="text-emerald-400">Active Retargeting Queue</span>
                </div>
                <div className="divide-y divide-white/5 rounded-2xl bg-[#090914] border border-white/10 overflow-hidden text-xs">
                  {marketingHistory.slice(0, 5).map((m) => (
                    <div key={m.id} className="p-3.5 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                          m.type === 'email' ? 'bg-blue-500/20 text-blue-300' : m.type === 'whatsapp' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {m.type}
                        </span>
                        <strong className="text-white font-sans text-xs">{m.recipientName}</strong>
                        <span className="text-zinc-500">({m.recipientEmail})</span>
                      </div>
                      <div className="flex items-center gap-3 text-zinc-400">
                        <span>{m.subject.slice(0, 35)}...</span>
                        <span className="text-zinc-500">{new Date(m.dispatchedAt || '').toLocaleTimeString()}</span>
                        <span className="text-emerald-400 font-bold">SENT</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ------------------------------------------
            TAB 2: GHOST & ABANDONED LEADS (UNSUBMITTED)
           ------------------------------------------ */}
        {tab === 'ghosts' && (
          <div>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">Ghost & Abandoned Leads (Meta Ads ROI)</h2>
                <p className="text-xs text-white/50">
                  Users who typed their details in Step 1 (or blurred the input) but didn't complete payment. Recover these high-intent leads!
                </p>
              </div>

              {ghostLeads.length > 0 && (
                <button
                  onClick={() => {
                    sound.playClick();
                    const csvContent =
                      'data:text/csv;charset=utf-8,Name,Email,Phone,Plan,CapturedAt\n' +
                      ghostLeads
                        .map((l) => `"${l.name}","${l.email}","${l.phone}","${l.tierName}","${l.createdAt}"`)
                        .join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', 'apex3d_ghost_leads.csv');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    showToast('📥 Ghost leads exported for Meta Custom Audience.');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export to Meta CSV</span>
                </button>
              )}
            </div>

            {/* 100% Free Automated Resend Drip Follow-up Engine Banner */}
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/20 to-black/60 border border-blue-500/25 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400 font-bold">
                      100% AUTOMATED RESEND DRIP ENGINE · ACTIVE
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    Automatic 24h & 48h Follow-up Sequences
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                    Unsubmitted & abandoned leads automatically receive high-converting emails via Resend API.
                    Runs daily via Vercel Cron (<code className="text-blue-300 font-mono">0 9 * * *</code>) and on background visits.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={async () => {
                      setIsDripRunning(true);
                      sound.playClick();
                      try {
                        const res = await triggerDripFollowupHeartbeat(true);
                        setDripResult({
                          day1: res.day1Count,
                          day2: res.day2Count,
                          timestamp: new Date().toLocaleTimeString(),
                        });
                        loadData();
                        if (res.day1Count > 0 || res.day2Count > 0) {
                          sound.playSuccess();
                          showToast(`⚡ Dispatched: ${res.day1Count} Day-1 & ${res.day2Count} Day-2 emails!`);
                        } else {
                          showToast('✓ All ghost leads are up-to-date. No follow-ups due right now.');
                        }
                      } catch {
                        showToast('Error executing drip sequence.');
                      } finally {
                        setIsDripRunning(false);
                      }
                    }}
                    disabled={isDripRunning}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Zap className={`w-3.5 h-3.5 text-amber-300 ${isDripRunning ? 'animate-spin' : ''}`} />
                    <span>{isDripRunning ? 'Evaluating Drip Queue...' : 'Run Drip Engine Now'}</span>
                  </button>
                </div>
              </div>

              {/* Drip Sequence Specs */}
              <div className="mt-4 pt-3 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-start gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold shrink-0 text-[10px]">
                    DAY 1 (24h)
                  </span>
                  <div>
                    <div className="text-white font-sans font-semibold text-xs">Proof & Case Study Email</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Subject: <span className="text-zinc-300">"💰 How agencies charge ₹45,000+ for 3D websites"</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-start gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold shrink-0 text-[10px]">
                    DAY 2 (48h)
                  </span>
                  <div>
                    <div className="text-white font-sans font-semibold text-xs">Urgency & Price Increase Warning</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Subject: <span className="text-zinc-300">"⚠️ Final Notice: Your ₹49 Sprint Pass reservation expires tonight"</span>
                    </div>
                  </div>
                </div>
              </div>

              {dripResult && (
                <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Last Execution ({dripResult.timestamp}): Sent {dripResult.day1} Day-1 and {dripResult.day2} Day-2 emails via Resend.
                  </span>
                </div>
              )}
            </div>

            {ghostLeads.length === 0 ? (
              <div className="py-20 text-center rounded-2xl bg-[#090914] border border-white/5 text-white/40">
                <User className="w-10 h-10 text-purple-400 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-white/70">No dropped leads captured yet.</p>
                <p className="text-xs text-white/40 mt-1">
                  As soon as visitors enter their email or phone in the checkout modal, they will be tracked here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5 rounded-2xl bg-[#090914] border border-white/10 overflow-hidden">
                {ghostLeads.map((lead) => (
                  <div key={lead.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">{lead.name || 'Anonymous Visitor'}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {lead.status === 'unsubmitted_keystroke' ? 'Typed (Unsubmitted)' : 'Abandoned at QR'}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          lead.followupStage === 2
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : lead.followupStage === 1
                            ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}>
                          {lead.followupStage === 2 ? 'Drip: Day 2 Sent' : lead.followupStage === 1 ? 'Drip: Day 1 Sent' : 'Drip: Pending'}
                        </span>
                        <span className="text-xs font-bold text-blue-400 font-mono">
                          {lead.tierName} (₹{lead.amountINR})
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-white/60 mt-1 font-mono">
                        <span>{lead.email}</span>
                        {lead.phone && <span>· {lead.phone}</span>}
                        <span>· {new Date(lead.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {lead.phone && (
                        <a
                          href={`https://wa.me/91${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Hey ${lead.name || 'there'}! Saw you were checking out the ${lead.tierName} on APEX3D Vault. Did you face any UPI issue? Here to help!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1"
                        >
                          <span>WhatsApp Follow-up</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSendRecoveryEmail(lead)}
                        disabled={sendingLeadEmailId === lead.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                          sendingLeadEmailId === lead.id
                            ? 'bg-blue-600/50 text-blue-200 cursor-wait border border-blue-500/30'
                            : lead.lastFollowupAt
                            ? 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                            : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                        }`}
                        title={lead.lastFollowupAt ? `Last dispatched on ${new Date(lead.lastFollowupAt).toLocaleString()}` : 'Dispatch recovery email via Resend'}
                      >
                        {sendingLeadEmailId === lead.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                            <span>Sending via Resend...</span>
                          </>
                        ) : lead.lastFollowupAt ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Re-send Recovery Email</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>Send Recovery Email</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------
            TAB 3: APPROVED ORDERS & INVOICES
           ------------------------------------------ */}
        {tab === 'orders' && (
          <div>
            <div className="mb-4">
              <h2 className="text-base font-bold text-white">Approved Customers & Invoices</h2>
              <p className="text-xs text-white/50">
                Official invoices, license keys, and account expiry dates generated automatically upon approval.
              </p>
            </div>

            {approvedOrders.length === 0 ? (
              <div className="py-20 text-center rounded-2xl bg-[#090914] border border-white/5 text-white/40">
                <FileText className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-white/70">No approved orders yet.</p>
                <p className="text-xs text-white/40 mt-1">
                  Approve an incoming UTR from the "Pending Approvals" tab to generate the first invoice.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {approvedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl bg-[#090914] border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {order.invoiceNumber || 'INV-2026-001'}
                        </span>
                        <span className="text-xs font-semibold text-white">{order.name}</span>
                        <span className="text-xs font-mono text-white/50">({order.email})</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-white/70 mt-2 font-mono">
                        <span>Plan: <strong className="text-blue-400">{order.tierName}</strong></span>
                        <span>Amount: <strong>₹{order.amountINR}</strong></span>
                        <span>UTR: <strong>{order.utrNumber}</strong></span>
                        <span className="text-amber-300 font-bold">
                          {order.expiresAt ? `Expires: ${new Date(order.expiresAt).toLocaleDateString()}` : 'Lifetime VIP'}
                        </span>
                      </div>

                      <div className="mt-2 text-[11px] font-mono text-white/40 flex items-center gap-2">
                        <span>License Hash: <strong className="text-slate-300">{order.licenseKey || 'LIC-APX-PRO'}</strong></span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {order.phone && (
                        <a
                          href={`https://wa.me/91${order.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Hello ${order.name}! 🚀 Your APEX3D Vault access (${order.tierName}) is APPROVED!\n\n` +
                            `🔑 License Key: ${order.licenseKey || 'LIC-VIP-84K2-91Q7'}\n` +
                            `📄 Commercial Invoice: ${order.invoiceNumber || 'INV-2026-8941'}\n` +
                            `📦 Order ID: ${order.orderNumber}\n\n` +
                            `Access your 500+ Prompts, Three.js Starter Kits, and Invoices at:\n` +
                            `👉 https://vinebdigital.store/#portal\n\n` +
                            `Support: support@vinebdigital.store`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp Credentials</span>
                        </a>
                      )}

                      <button
                        onClick={() => {
                          sound.playClick();
                          setSelectedInvoiceOrder(order);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Invoice</span>
                      </button>

                      <button
                        onClick={() => {
                          sound.playClick();
                          setSelectedLicenseOrder(order);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Commercial License</span>
                      </button>

                      <button
                        onClick={async () => {
                          sound.playClick();
                          showToast(`⏳ Dispatching credentials & Commercial Invoice email to ${order.email}...`);
                          try {
                            const res = await sendOrderApprovalEmail(order);
                            if (res.success) {
                              showToast(`📧 Credentials & Commercial Invoice dispatched to ${order.email}!`);
                            } else {
                              showToast(`Email error: ${res.message}`);
                            }
                          } catch (err: any) {
                            showToast(`Failed: ${err.message || 'Error sending email'}`);
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors"
                        title="Resend email with access credentials and commercial invoice"
                      >
                        <Send className="w-3.5 h-3.5 text-blue-400" />
                        <span>Resend Invoice &amp; Pass</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------
            TAB 4: PROMPT CMS (ADD & EDIT PROMPTS)
           ------------------------------------------ */}
        {tab === 'cms' && (
          <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white">Prompt Vault CMS (Live Content Editor)</h2>
                <p className="text-xs text-white/50">
                  Add, edit, or delete production prompts without touching code or redeploying!
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetPrompts}
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors border border-white/10"
                  title="Reset vault prompts back to pristine defaults"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset Defaults</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setIsAddPromptOpen(!isAddPromptOpen);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Prompt Blueprint</span>
                </button>
              </div>
            </div>

            {/* Add New Prompt Blueprint Form */}
            {isAddPromptOpen && (
              <form
                onSubmit={handleAddPrompt}
                className="mb-8 p-6 rounded-2xl bg-[#0c101c] border border-blue-500/30 space-y-4 animate-role-fade-in shadow-2xl"
              >
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Create New Master Prompt Blueprint</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">Blueprint Title *</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Porsche 911 Spatial Configurator"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">Category *</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as VaultItem['filterGroup'])}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Luxury Brands">Luxury Brands</option>
                      <option value="Spatial & WebGL">Spatial & WebGL</option>
                      <option value="High-Ticket Agency">High-Ticket Agency</option>
                      <option value="AI Agents & Systems">AI Agents & Systems</option>
                      <option value="E-Commerce 3D">E-Commerce 3D</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">Client Valuation SOW</label>
                    <input
                      type="text"
                      value={newClientValue}
                      onChange={(e) => setNewClientValue(e.target.value)}
                      placeholder="e.g. $36,000 Client SOW"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">Video / WebP Showcase URL</label>
                    <input
                      type="url"
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      placeholder="https://.../video.mp4"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Subtitle / Deliverable Story</label>
                  <input
                    type="text"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    placeholder="Short explanation of deliverables and Three.js tech stack..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    Exact Production Prompt Syntax (for Claude 3.7 & Cursor) *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newSyntax}
                    onChange={(e) => setNewSyntax(e.target.value)}
                    placeholder="// Claude 3.7 Architecture Prompt: Write shader logic and component structure..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-blue-200 placeholder-white/30 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddPromptOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                  >
                    Publish to Vault Live
                  </button>
                </div>
              </form>
            )}

            {/* List of prompts */}
            <div className="divide-y divide-white/10 rounded-2xl bg-[#090914] border border-white/10">
              {promptsList.map((item, idx) => (
                <div key={item.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-white/30">{String(idx + 1).padStart(2, '0')}</span>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      {item.id.startsWith('custom-prompt') && (
                        <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          CMS CUSTOM
                        </span>
                      )}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/60">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 mt-1 line-clamp-1">{item.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono font-bold text-amber-400">{item.clientValue}</span>
                    <button
                      onClick={() => handleDeletePrompt(item.id, item.title)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                      title="Delete prompt"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------
            TAB 5: SETTINGS
           ------------------------------------------ */}
        {tab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-blue-400" />
                <span>Store, Pricing & Cloud Sync Configuration</span>
              </h2>
              <p className="text-xs text-white/50">
                Manage receiving UPI, plan prices, and connect Supabase for cross-device cloud persistence.
              </p>
            </div>

            {/* Section 1: Merchant & Payment Identity */}
            <div className="p-6 rounded-2xl bg-[#090914] border border-white/10 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold flex items-center gap-2">
                <span>01. Merchant Identity & Payment Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Merchant Business Name</label>
                  <input
                    type="text"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-sans text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Support Email Address</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Merchant Receiving UPI ID</label>
                <input
                  type="text"
                  value={merchantUpi}
                  onChange={(e) => setMerchantUpi(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-white/40 mt-1 block">
                  Generating dynamic Slice QR and mobile UPI intent links for {merchantUpi}.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">WhatsApp Fast-Track Phone Number</label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-white/40 mt-1 block">
                  Format: 91XXXXXXXXXX (e.g. 918860090791) for direct recovery chat links.
                </span>
              </div>
            </div>

            {/* Section 2: Vault Plan Pricing Matrix */}
            <div className="p-6 rounded-2xl bg-[#090914] border border-white/10 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-2">
                <span>02. Vault Plan Pricing Matrix (INR)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">1-Day Sprint Pass Price (₹)</label>
                  <input
                    type="number"
                    value={priceDay1}
                    onChange={(e) => setPriceDay1(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">1-Month Pro Access Price (₹)</label>
                  <input
                    type="number"
                    value={priceMonth1}
                    onChange={(e) => setPriceMonth1(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">6-Month Studio Growth Price (₹)</label>
                  <input
                    type="number"
                    value={priceMonth6}
                    onChange={(e) => setPriceMonth6(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Lifetime VIP Pass Price (₹)</label>
                  <input
                    type="number"
                    value={priceLifetime}
                    onChange={(e) => setPriceLifetime(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Supabase Cloud Database & Multi-Device Live Sync */}
            <div className="p-6 rounded-2xl bg-[#090914] border border-white/10 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span>03. Supabase Cloud Database (Phase 6 Live Sync)</span>
                </h3>

                {settings.supabaseUrl && settings.cloudSyncEnabled ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Cloud className="w-3 h-3" />
                    <span>Cloud Active</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <CloudOff className="w-3 h-3" />
                    <span>Local Storage Only</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-white/60">
                Connect your free Supabase Postgres project to approve orders, view ghost leads, and access telemetry from your mobile phone or any other device in real-time.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Supabase Project URL</label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzabcdefg.supabase.co"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-purple-300 placeholder-white/20 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Supabase Anon Public API Key</label>
                  <input
                    type="password"
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-purple-300 placeholder-white/20 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="enableCloudSync"
                    checked={cloudSyncEnabled}
                    onChange={(e) => setCloudSyncEnabled(e.target.checked)}
                    className="rounded bg-black/40 border-white/20 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="enableCloudSync" className="text-xs text-white/80 cursor-pointer select-none">
                    Enable automatic background cloud sync for orders and UTR submissions
                  </label>
                </div>
              </div>

              {/* Cloud Test & Action Buttons */}
              <div className="pt-2 flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  disabled={isTestingCloud}
                  onClick={handleTestCloud}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-mono flex items-center gap-1.5 transition-all border border-white/10 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingCloud ? 'animate-spin' : ''}`} />
                  <span>{isTestingCloud ? 'Testing...' : 'Test Connection'}</span>
                </button>

                <button
                  type="button"
                  disabled={isSyncingCloud}
                  onClick={handleSyncCloud}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/30 disabled:opacity-50"
                >
                  <Cloud className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
                  <span>{isSyncingCloud ? 'Syncing...' : 'Sync Cloud Now'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsSqlModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 text-xs font-mono flex items-center gap-1.5 transition-all border border-purple-500/20"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>1-Click SQL Schema</span>
                </button>
              </div>

              {cloudTestResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                    cloudTestResult.success
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                      : 'bg-red-500/10 border border-red-500/30 text-red-300'
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>{cloudTestResult.message}</span>
                </div>
              )}

              {settings.lastCloudSyncAt && (
                <div className="text-[10px] text-white/40 font-mono pt-1">
                  Last Cloud Reconcile: {new Date(settings.lastCloudSyncAt).toLocaleString()}
                </div>
              )}
            </div>

            {/* Section 4: Resend Transactional Email Engine */}
            <div className="p-6 rounded-2xl bg-[#090914] border border-white/10 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold flex items-center gap-2">
                  <MailCheck className="w-4 h-4" />
                  <span>04. Automated Transactional Emails (Resend API)</span>
                </h3>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                  <span>1-Click Auto Fulfillment</span>
                </span>
              </div>

              <p className="text-xs text-white/60">
                Whenever you click "Approve" on a pending order, Resend automatically delivers the branded access email with their License Key, Portal Login link, and Invoice to the customer.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Resend API Key</label>
                  <input
                    type="password"
                    value={resendApiKey}
                    onChange={(e) => setResendApiKey(e.target.value)}
                    placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-blue-300 placeholder-white/20 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">From Sender Address (Display Name & Email)</label>
                  <input
                    type="text"
                    value={resendFromEmail}
                    onChange={(e) => setResendFromEmail(e.target.value)}
                    placeholder="Vine B Digital // 3D Vault <vault@vinebdigital.store>"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white placeholder-white/20 focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-white/40 mt-1 block">
                    Recommended: <code className="text-blue-300">Vine B Digital // 3D Vault &lt;vault@vinebdigital.store&gt;</code>. (Note: Ensure DNS records are added in Resend dashboard for vinebdigital.store).
                  </span>
                </div>

                {/* Test Email Dispatcher */}
                <div className="pt-2 p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
                  <div className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-blue-400" />
                    <span>Send a Live Test Email to Your Inbox</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <input
                      type="email"
                      value={testEmailRecipient}
                      onChange={(e) => setTestEmailRecipient(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="flex-1 px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      disabled={isSendingTestEmail}
                      onClick={handleSendTestEmail}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono shrink-0 flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30 disabled:opacity-50"
                    >
                      <Send className={`w-3.5 h-3.5 ${isSendingTestEmail ? 'animate-pulse' : ''}`} />
                      <span>{isSendingTestEmail ? 'Sending...' : 'Send Test'}</span>
                    </button>
                  </div>

                  {testEmailResult && (
                    <div
                      className={`p-2.5 rounded-lg text-xs font-mono flex items-center gap-2 ${
                        testEmailResult.success
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                          : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{testEmailResult.message}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Master Save Button */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-white/40 font-mono">
                Changes apply instantly across landing page, checkout, and client vault.
              </span>
              <button
                onClick={handleSaveSettings}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Save All Store & Cloud Settings</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Reject Order Modal */}
      {rejectionModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-role-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0c101c] border border-red-500/30 text-white shadow-2xl">
            <h3 className="text-base font-bold text-red-400 mb-2">Reject Order {rejectionModalOrder.orderNumber}</h3>
            <p className="text-xs text-white/60 mb-4">
              Select the reason for rejecting UTR <strong>{rejectionModalOrder.utrNumber}</strong>. An email notification will be dispatched to the user.
            </p>

            <div className="space-y-2 mb-5">
              {[
                'Payment not credited in bank account',
                'Invalid or fake 12-digit UTR number',
                'Partial amount received',
                'Duplicate UTR already claimed',
              ].map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer ${
                    rejectionReason === reason
                      ? 'bg-red-950/40 border-red-500 text-white'
                      : 'bg-black/30 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="reject_reason"
                    checked={rejectionReason === reason}
                    onChange={() => setRejectionReason(reason)}
                    className="accent-red-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setRejectionModalOrder(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Commercial Invoice Modal */}
      <InvoiceModal
        isOpen={!!selectedInvoiceOrder}
        order={selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
      />

      {/* Commercial License Certificate Modal */}
      <LicenseModal
        isOpen={!!selectedLicenseOrder}
        order={selectedLicenseOrder}
        onClose={() => setSelectedLicenseOrder(null)}
      />

      {/* Retargeting Email Preview & Automation Modal */}
      {emailPreviewOrder && (() => {
        const emailData = generateRetargetingEmail(emailPreviewOrder);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-2xl rounded-2xl bg-[#090912] border border-amber-500/30 text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#07070c]">
                <div>
                  <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">
                    AUTOMATED RETARGETING EMAIL DISPATCHER
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Email Preview for {emailPreviewOrder.name}
                  </h3>
                </div>
                <button
                  onClick={() => setEmailPreviewOrder(null)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs font-mono scrollbar-thin">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                  <div><span className="text-zinc-500">To:</span> <strong className="text-white font-sans">{emailPreviewOrder.name}</strong> &lt;{emailPreviewOrder.email}&gt;</div>
                  <div><span className="text-zinc-500">Subject:</span> <strong className="text-amber-300 font-sans">{emailData.subject}</strong></div>
                  <div><span className="text-zinc-500">Credit Hook:</span> <span className="text-emerald-400 font-bold">₹49 Sprint pass fee automatically deducted</span></div>
                </div>

                <div className="p-4 rounded-xl bg-black/80 border border-white/10 text-zinc-300 font-mono text-xs whitespace-pre-wrap leading-relaxed select-text">
                  {emailData.bodyText}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-6 py-4 border-t border-white/10 bg-[#06060a] flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => {
                    sound.playClick();
                    navigator.clipboard.writeText(emailData.bodyHtml);
                    showToast('📋 Email HTML template copied to clipboard!');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-xs font-mono cursor-pointer"
                >
                  Copy HTML Template
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEmailPreviewOrder(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 text-xs font-mono cursor-pointer"
                  >
                    Cancel
                  </button>

                  <a
                    href={emailData.mailtoUrl}
                    onClick={() => {
                      sound.playSuccess();
                      logMarketingDispatch({
                        type: 'email',
                        recipientEmail: emailPreviewOrder.email,
                        recipientPhone: emailPreviewOrder.phone,
                        recipientName: emailPreviewOrder.name,
                        orderNumber: emailPreviewOrder.orderNumber,
                        triggerEvent: emailPreviewOrder.upgradeTelemetry?.clicksCount ? 'cta_clicked_abandon' : 'quota_reached_abandon',
                        selectedTierName: emailPreviewOrder.upgradeTelemetry?.lastSelectedTierId || 'month_1',
                        originalPrice: 299,
                        discountedPrice: 250,
                        subject: emailData.subject,
                        body: emailData.bodyText,
                        checkoutUrl: 'https://vinebdigital.store/#portal',
                        status: 'dispatched',
                      });
                      setEmailPreviewOrder(null);
                      showToast(`✉️ Mail client launched for ${emailPreviewOrder.email}!`);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Launch in Mail Client</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Supabase 1-Click SQL Schema Modal */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-role-fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#090914] border border-purple-500/30 text-white shadow-2xl p-6 sm:p-7 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Supabase Cloud Database Setup (1-Click SQL)
                  </h3>
                  <p className="text-[11px] text-white/50 font-mono">
                    Creates "apex_orders" table with RLS and public anon read/write permissions
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 overflow-y-auto flex-1 no-scrollbar">
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>30-Second Setup Instructions:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-white/70 text-[11px] pl-1 font-mono">
                  <li>Log in to your free account on <strong className="text-white">supabase.com</strong> and create a project.</li>
                  <li>Click <strong className="text-white">SQL Editor</strong> on the left navigation bar.</li>
                  <li>Click <strong className="text-white">New Query</strong>, paste the script below, and click <strong className="text-emerald-400">Run</strong>.</li>
                  <li>Copy your Project URL & Anon Key from Settings &rarr; API and paste them into the Admin Settings tab!</li>
                </ol>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono text-purple-200 overflow-x-auto max-h-64 leading-relaxed select-text">
                  {generateSupabaseSqlSchema()}
                </pre>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-white/40 font-mono">
                PostgreSQL · Row Level Security (RLS) · Instant Cloud Sync
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSqlModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-mono"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playSuccess();
                    navigator.clipboard.writeText(generateSupabaseSqlSchema());
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2000);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
