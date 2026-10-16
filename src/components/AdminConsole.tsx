import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
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
} from 'lucide-react';
import {
  getAllOrders,
  approveOrder,
  rejectOrder,
  LeadOrder,
  calculateTierExpiry,
} from '../lib/leadTracker';
import { sound } from '../lib/audioEngine';
import { VAULT_CATALOG, VaultItem } from '../data/vaultCatalog';
import { InvoiceModal } from './InvoiceModal';
import { LicenseModal } from './LicenseModal';

interface AdminConsoleProps {
  onBackToSite: () => void;
}

type AdminTab = 'approvals' | 'ghosts' | 'orders' | 'cms' | 'settings';

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

  // Prompt CMS State
  const [promptsList, setPromptsList] = useState<VaultItem[]>(VAULT_CATALOG);
  const [isAddPromptOpen, setIsAddPromptOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState('Spatial & WebGL');
  const [newClientValue, setNewClientValue] = useState('$25,000 Client SOW');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newSyntax, setNewSyntax] = useState('');

  // Settings State
  const [merchantName, setMerchantName] = useState('Vine B Digital Marketing Agency');
  const [merchantUpi, setMerchantUpi] = useState('s5305704393562990@slc');
  const [supportEmail, setSupportEmail] = useState('support@vinebdigital.store');
  const [whatsappNumber, setWhatsappNumber] = useState('918860090791');

  const loadData = () => {
    setOrders(getAllOrders());
  };

  useEffect(() => {
    loadData();

    // Listen for real-time order updates
    const handleOrderUpdate = () => {
      loadData();
    };
    window.addEventListener('apex_order_updated', handleOrderUpdate);
    return () => window.removeEventListener('apex_order_updated', handleOrderUpdate);
  }, []);

  const showToast = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 3500);
  };

  // Actions
  const handleApprove = (order: LeadOrder) => {
    sound.playSuccess();
    const approved = approveOrder(order.id);
    if (approved) {
      loadData();
      showToast(`✅ Order ${approved.orderNumber} Approved! License ${approved.licenseKey} & Invoice generated.`);
    }
  };

  const handleOpenReject = (order: LeadOrder) => {
    sound.playClick();
    setRejectionModalOrder(order);
  };

  const handleConfirmReject = () => {
    if (!rejectionModalOrder) return;
    sound.playClick();
    const rejected = rejectOrder(rejectionModalOrder.id, rejectionReason);
    if (rejected) {
      loadData();
      showToast(`❌ Order ${rejected.orderNumber} marked as Rejected.`);
    }
    setRejectionModalOrder(null);
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
      id: `prompt-${Date.now()}`,
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'Production WebGL interactive architecture prompt.',
      category: 'Spatial OS',
      filterGroup: (newCategory as VaultItem['filterGroup']) || 'Spatial & WebGL',
      clientValue: newClientValue.trim() || '$18,000 SOW',
      tokens: 2600,
      highlightStat: '10x Agency ROI',
      description: newSubtitle.trim() || 'Enterprise 3D WebGL prompt blueprint with high-performance production code.',
      tags: ['WebGL', 'Three.js', 'Production-Ready'],
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

    setPromptsList([newPromptItem, ...promptsList]);
    setIsAddPromptOpen(false);
    setNewTitle('');
    setNewSubtitle('');
    setNewSyntax('');
    showToast(`🚀 New Prompt Blueprint "${newPromptItem.title}" Added to Vault!`);
  };

  // Filtered lists
  const pendingApprovals = orders.filter((o) => o.status === 'pending_approval');
  const ghostLeads = orders.filter(
    (o) => o.status === 'unsubmitted_keystroke' || o.status === 'abandoned_at_qr'
  );
  const approvedOrders = orders.filter((o) => o.status === 'approved');

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

                      <a
                        href={`mailto:${lead.email}?subject=Did something go wrong with your 3D Vault pass?&body=Hey ${lead.name}, noticed you checked out ${lead.tierName}. Did you face any UPI issue?`}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium flex items-center gap-1 border border-white/10"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Recovery Email</span>
                      </a>
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
                            `📄 Tax Invoice: ${order.invoiceNumber || 'INV-2026-8941'}\n` +
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
                        onClick={() => {
                          sound.playClick();
                          showToast(`📧 Credentials email re-dispatched via Resend to ${order.email}!`);
                        }}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors"
                        title="Resend email with access credentials"
                      >
                        <Send className="w-3.5 h-3.5 text-blue-400" />
                        <span>Resend Email</span>
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
                      onChange={(e) => setNewCategory(e.target.value)}
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-white/30">{String(idx + 1).padStart(2, '0')}</span>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/60">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 mt-1 line-clamp-1">{item.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono font-bold text-amber-400">{item.clientValue}</span>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setPromptsList(promptsList.filter((p) => p.id !== item.id));
                        showToast(`Deleted ${item.title}`);
                      }}
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
          <div className="max-w-2xl">
            <div className="mb-6">
              <h2 className="text-base font-bold text-white">Payment & Store Configuration</h2>
              <p className="text-xs text-white/50">
                Update your receiving UPI ID and WhatsApp support number without touching code.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#090914] border border-white/10 space-y-4">
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

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Merchant Receiving UPI ID</label>
                <input
                  type="text"
                  value={merchantUpi}
                  onChange={(e) => setMerchantUpi(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-white/40 mt-1 block">
                  This UPI ID generates the QR code and deep links in the Razorpay checkout modal.
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
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    sound.playSuccess();
                    showToast('Settings saved successfully!');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Save Settings
                </button>
              </div>
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

      {/* Official Tax Invoice Modal */}
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
    </div>
  );
};
