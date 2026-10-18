import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronDown,
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
  Lock,
  LogOut,
  Users,
  UserPlus,
  Ban,
  ShieldAlert,
  Shield,
  Pencil,
} from 'lucide-react';
import {
  SUPER_ADMIN_EMAIL,
  MASTER_EMERGENCY_PIN,
  AdminUser,
  AdminSession,
  getAllAdmins,
  getCurrentAdminSession,
  logoutAdminSession,
  inviteAdminUser,
  resendAdminInvitation,
  revokeAdminAccess,
  deleteAdminPermanently,
  sendAdminLoginOtp,
  verifyAdminOtpCode,
  verifyAdminInviteToken,
  isSuperAdminEmail,
  purgeDummyAdmins,
} from '../lib/adminAuthStore';
import {
  getAllOrders,
  approveOrder,
  rejectOrder,
  saveOrder,
  LeadOrder,
  calculateTierExpiry,
  triggerDripFollowupHeartbeat,
  purgeAllDummyData,
  clearAllOrders,
  syncAllLeadsFromCloud,
  deleteLeadPermanently,
  deleteLeadGroupPermanently,
  purgeAllLeadsPermanently,
  deleteApprovedOrderPermanently,
  isDummyOrder,
  syncChannel,
} from '../lib/leadTracker';
import { resetOrderIpLock } from '../lib/deviceSecurity';
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
  updateVaultPrompt,
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
import { BroadcastCenter } from './BroadcastCenter';
import { isMediaImage } from '../lib/mediaUtils';

interface AdminConsoleProps {
  onBackToSite: () => void;
}

type AdminTab = 'approvals' | 'retargeting' | 'ghosts' | 'orders' | 'cms' | 'broadcast' | 'team' | 'settings';

export const AdminConsole: React.FC<AdminConsoleProps> = ({ onBackToSite }) => {
  const [tab, setTab] = useState<AdminTab>('approvals');

  // RBAC & Authentication State
  const [session, setSession] = useState<AdminSession | null>(() => getCurrentAdminSession());
  const [teamList, setTeamList] = useState<AdminUser[]>(() => getAllAdmins());
  const isSuperAdmin = session?.role === 'super_admin' || isSuperAdminEmail(session?.email);

  // Team Invite Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [resendingAdminId, setResendingAdminId] = useState<string | null>(null);

  // Admin Login Shield State
  const [loginEmail, setLoginEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showEmergencyPin, setShowEmergencyPin] = useState(false);
  const [emergencyPin, setEmergencyPin] = useState('');

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
  const [newAllowFreeTrialCopy, setNewAllowFreeTrialCopy] = useState(false);

  // Edit Existing Prompt State
  const [editingPrompt, setEditingPrompt] = useState<VaultItem | null>(null);
  const [isEditPromptModalOpen, setIsEditPromptModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editCategory, setEditCategory] = useState<VaultItem['filterGroup']>('Spatial & WebGL');
  const [editClientValue, setEditClientValue] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editPosterUrl, setEditPosterUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSyntax, setEditSyntax] = useState('');
  const [editAllowFreeTrialCopy, setEditAllowFreeTrialCopy] = useState(false);
  const [editTestedModels, setEditTestedModels] = useState('');
  const [editTags, setEditTags] = useState('');

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

  // Ghost Leads Grouping & Timeline State
  const [ghostViewMode, setGhostViewMode] = useState<'grouped' | 'raw'>('grouped');
  const [ghostFilter, setGhostFilter] = useState<'all' | 'free_trial' | 'abandoned_qr' | 'keystroke'>('all');
  const [expandedGhostKeys, setExpandedGhostKeys] = useState<Set<string>>(new Set());

  const toggleExpandGhost = (key: string) => {
    sound.playClick();
    setExpandedGhostKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const loadData = () => {
    setOrders(getAllOrders());
    setMarketingHistory(getAllMarketingDispatches());
    setPromptsList(getAllVaultPrompts());
    setTeamList(getAllAdmins());
  };

  useEffect(() => {
    // Purge any legacy dummy records from localStorage immediately on mount
    purgeAllDummyData();
    purgeDummyAdmins();
    loadData();

    // Actively pull from Cloud Database in the background and update state
    syncAllLeadsFromCloud().then((synced) => {
      if (synced && synced.length > 0) {
        setOrders(synced);
      }
    });

    // Background self-healing check: check if any Day 1 / Day 2 follow-ups are due
    triggerDripFollowupHeartbeat(false).catch(() => {});

    // Check for inviteToken & email in URL hash or search
    try {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      const hashQuery = hash.includes('?') ? hash.split('?')[1] : '';
      const urlParams = new URLSearchParams(hashQuery || search);
      const inviteToken = urlParams.get('inviteToken');
      const inviteEmail = urlParams.get('email');

      if (inviteToken && inviteEmail) {
        const res = verifyAdminInviteToken(inviteToken, inviteEmail);
        if (res.success && res.session) {
          setSession(res.session);
          setTeamList(getAllAdmins());
          showToast(res.message);
          window.history.replaceState(null, '', window.location.pathname + '#admin');
        } else {
          setAuthError(res.message);
        }
      }
    } catch (err) {
      console.error('Error verifying invite token:', err);
    }

    // Listen for real-time updates
    const handleOrderUpdate = () => loadData();
    const handleMarketingUpdate = () => setMarketingHistory(getAllMarketingDispatches());
    const handlePromptsUpdate = () => setPromptsList(getAllVaultPrompts());
    const handleAuthChange = (e: any) => setSession(e.detail || null);
    const handleTeamChange = (e: any) => setTeamList(e.detail || getAllAdmins());

    window.addEventListener('apex_order_updated', handleOrderUpdate);
    window.addEventListener('storage', handleOrderUpdate);
    syncChannel?.addEventListener('message', handleOrderUpdate);
    window.addEventListener('apex_marketing_dispatched', handleMarketingUpdate);
    window.addEventListener('apex_prompts_updated', handlePromptsUpdate);
    window.addEventListener('apex_admin_auth_changed', handleAuthChange);
    window.addEventListener('apex_admins_updated', handleTeamChange);

    return () => {
      window.removeEventListener('apex_order_updated', handleOrderUpdate);
      window.removeEventListener('storage', handleOrderUpdate);
      syncChannel?.removeEventListener('message', handleOrderUpdate);
      window.removeEventListener('apex_marketing_dispatched', handleMarketingUpdate);
      window.removeEventListener('apex_prompts_updated', handlePromptsUpdate);
      window.removeEventListener('apex_admin_auth_changed', handleAuthChange);
      window.removeEventListener('apex_admins_updated', handleTeamChange);
    };
  }, []);

  const showToast = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 3500);
  };

  // Auth Handlers
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      setAuthError('Please enter a valid administrator work email address.');
      return;
    }
    setAuthError(null);
    setIsSendingOtp(true);
    try {
      const res = await sendAdminLoginOtp(loginEmail);
      if (res.success) {
        setIsOtpSent(true);
        showToast(res.message);
      } else {
        setAuthError(res.message);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error generating access code');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otpInput.trim()) {
      setAuthError('Please enter the 6-digit access code.');
      return;
    }
    setAuthError(null);
    setIsVerifyingOtp(true);
    try {
      const res = verifyAdminOtpCode(loginEmail, otpInput);
      if (res.success && res.session) {
        setSession(res.session);
        showToast(`Welcome, ${res.session.name}!`);
      } else {
        setAuthError(res.message);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Verification error');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleEmergencyPinLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loginEmail.trim() || loginEmail.trim().toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      setAuthError(`Emergency Master PIN is only valid for Master Super Admin (${SUPER_ADMIN_EMAIL}).`);
      return;
    }
    if (emergencyPin.trim() !== MASTER_EMERGENCY_PIN) {
      setAuthError('Invalid Emergency Master PIN.');
      return;
    }
    const res = verifyAdminOtpCode(SUPER_ADMIN_EMAIL, MASTER_EMERGENCY_PIN);
    if (res.success && res.session) {
      setSession(res.session);
      showToast('Master Super Admin Emergency Access granted!');
    }
  };

  // Team RBAC Handlers
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      showToast('Please provide both full name and email.');
      return;
    }
    setIsInviting(true);
    try {
      const res = await inviteAdminUser({
        name: inviteName.trim(),
        email: inviteEmail.trim(),
      });
      if (res.success) {
        setTeamList(getAllAdmins());
        setIsInviteModalOpen(false);
        setInviteName('');
        setInviteEmail('');
        showToast(res.message);
      } else {
        showToast(`Error: ${res.message}`);
      }
    } catch (err: any) {
      showToast(`Failed: ${err.message || 'Error sending invite'}`);
    } finally {
      setIsInviting(false);
    }
  };

  const handleResendInvite = async (admin: AdminUser) => {
    sound.playClick();
    setResendingAdminId(admin.id);
    showToast(`⏳ Dispatching duty briefing & invite email to ${admin.email}...`);
    try {
      const res = await resendAdminInvitation(admin.id);
      showToast(res.message);
      setTeamList(getAllAdmins());
    } catch (err: any) {
      showToast(`Failed: ${err.message || 'Error resending invite'}`);
    } finally {
      setResendingAdminId(null);
    }
  };

  const handleRevoke = (admin: AdminUser) => {
    sound.playClick();
    if (window.confirm(`Are you sure you want to revoke access for ${admin.name} (${admin.email})?`)) {
      const res = revokeAdminAccess(admin.id);
      showToast(res.message);
      setTeamList(getAllAdmins());
    }
  };

  const handleDeleteAdmin = (admin: AdminUser) => {
    sound.playClick();
    if (window.confirm(`Permanently remove ${admin.name} (${admin.email}) from admin roster?`)) {
      const res = deleteAdminPermanently(admin.id);
      showToast(res.message);
      setTeamList(getAllAdmins());
    }
  };

  const handlePurgeAllDummyData = () => {
    sound.playClick();
    if (window.confirm('Purge all dummy, test, and ghost records? This will ensure the console is completely clean and zeroed out.')) {
      const res = purgeAllDummyData();
      purgeDummyAdmins();
      loadData();
      showToast(`Purged ${res.removedOrdersCount} dummy/test record(s). Admin console is completely clean!`);
    }
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

  const [isPurgingLeads, setIsPurgingLeads] = useState(false);
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);

  const handleDeleteSingleLead = async (leadId: string, email?: string, phone?: string) => {
    sound.playClick();
    if (!window.confirm('Are you sure you want to permanently delete this lead?')) return;
    setDeletingLeadId(leadId);
    try {
      await deleteLeadPermanently(leadId, email, phone);
      showToast('Lead deleted permanently.');
      loadData();
    } catch {
      showToast('Failed to delete lead.');
    } finally {
      setDeletingLeadId(null);
    }
  };

  const handleDeleteLeadGroup = async (group: any) => {
    sound.playClick();
    const leadsToDelete: LeadOrder[] = (group.attempts && group.attempts.length > 0)
      ? group.attempts
      : (group.primaryLead ? [group.primaryLead] : []);
    const count = leadsToDelete.length;
    if (!window.confirm(`Permanently delete all ${count} interaction touchpoint(s) for "${group.name || group.email || 'this lead'}"?`)) return;
    setDeletingLeadId(group.key);
    try {
      await deleteLeadGroupPermanently(leadsToDelete);
      showToast(`Deleted ${count} lead record(s).`);
      loadData();
    } catch {
      showToast('Failed to delete lead group.');
    } finally {
      setDeletingLeadId(null);
    }
  };

  const handlePurgeAllTestLeads = async () => {
    sound.playClick();
    if (!window.confirm('⚠️ WARNING: This will permanently delete ALL leads and ghost entries across your local cache, Cloud Database, and Relay API.\n\nAre you sure you want to wipe all leads?')) return;
    setIsPurgingLeads(true);
    try {
      await purgeAllLeadsPermanently();
      showToast('All leads have been wiped clean.');
      loadData();
    } catch {
      showToast('Failed to purge leads.');
    } finally {
      setIsPurgingLeads(false);
    }
  };

  const handleDeleteApprovedOrder = async (orderId: string, email?: string) => {
    sound.playClick();
    if (!window.confirm('Permanently delete this approved order record? This cannot be undone.')) return;
    try {
      await deleteApprovedOrderPermanently(orderId, email);
      showToast('Order record deleted.');
      loadData();
    } catch {
      showToast('Failed to delete order.');
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
      allowFreeTrialCopy: newAllowFreeTrialCopy,
      promptArchitecture: newSyntax.trim(),
    };

    const updated = addVaultPrompt(newPromptItem);
    setPromptsList(updated);
    setIsAddPromptOpen(false);
    setNewTitle('');
    setNewSubtitle('');
    setNewSyntax('');
    setNewAllowFreeTrialCopy(false);
    showToast(`New Prompt Blueprint "${newPromptItem.title}" Added to Vault & Live for Clients!`);
  };

  const handleToggleFreeTrialCopy = (id: string, currentValue: boolean) => {
    sound.playClick();
    const updated = updateVaultPrompt(id, { allowFreeTrialCopy: !currentValue });
    setPromptsList(updated);
    showToast(!currentValue ? '✨ Enabled free trial copy sample for this prompt!' : '🔒 Prompt locked to Paid Vault only.');
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

  const handleOpenEditPrompt = (item: VaultItem) => {
    sound.playClick();
    setEditingPrompt(item);
    setEditTitle(item.title || '');
    setEditSubtitle(item.subtitle || '');
    setEditCategory(item.filterGroup || 'Spatial & WebGL');
    setEditClientValue(item.clientValue || '');
    setEditVideoUrl(item.videoUrl || '');
    setEditPosterUrl(item.poster || '');
    setEditDescription(item.description || '');
    setEditSyntax(item.promptArchitecture || '');
    setEditAllowFreeTrialCopy(!!item.allowFreeTrialCopy);
    setEditTestedModels((item.testedModels || []).join(', '));
    setEditTags((item.tags || []).join(', '));
    setIsEditPromptModalOpen(true);
  };

  const handleSaveEditPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrompt || !editTitle.trim() || !editSyntax.trim()) return;
    sound.playSuccess();

    const parsedTestedModels = editTestedModels
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedTags = editTags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updated = updateVaultPrompt(editingPrompt.id, {
      title: editTitle.trim(),
      subtitle: editSubtitle.trim(),
      filterGroup: editCategory,
      clientValue: editClientValue.trim() || '$18,000 SOW',
      videoUrl: editVideoUrl.trim(),
      poster: editPosterUrl.trim(),
      description: editDescription.trim() || editSubtitle.trim(),
      promptArchitecture: editSyntax.trim(),
      allowFreeTrialCopy: editAllowFreeTrialCopy,
      testedModels: parsedTestedModels.length > 0 ? parsedTestedModels : editingPrompt.testedModels,
      tags: parsedTags.length > 0 ? parsedTags : editingPrompt.tags,
    });

    setPromptsList(updated);
    setIsEditPromptModalOpen(false);
    setEditingPrompt(null);
    showToast(`Blueprint "${editTitle.trim()}" successfully updated!`);
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
  const pendingApprovals = orders.filter((o) => !isDummyOrder(o) && o.status === 'pending_approval');

  // Check if an order is a free trial copy / lead magnet lead
  const isFreeTrialLead = (o: LeadOrder) =>
    !isDummyOrder(o) &&
    (o.status === ('free_trial_claimed' as any) ||
      o.source === 'portal_free_copy_modal' ||
      o.tierId === 'prompt_copy');

  const isGhostOrAbandoned = (o: LeadOrder) =>
    !isDummyOrder(o) &&
    (o.status === 'unsubmitted_keystroke' ||
      o.status === 'abandoned_at_qr' ||
      (o.status as string) === 'abandoned_checkout' ||
      isFreeTrialLead(o));

  const ghostLeads = orders.filter((o) => !isDummyOrder(o) && isGhostOrAbandoned(o));

  // Grouped Ghost Leads by Customer (Email / Phone) with Multiplier Counters (x2, x3, etc.)
  const groupedGhostLeads = useMemo(() => {
    interface GroupedLead {
      key: string;
      name: string;
      email: string;
      phone: string;
      role?: string;
      latestStatus: 'unsubmitted_keystroke' | 'abandoned_at_qr' | 'free_trial_claimed' | string;
      highestTierName: string;
      highestAmountINR: number;
      attemptCount: number;
      latestCreatedAt: string;
      latestUpdatedAt: string;
      followupStage: number;
      lastFollowupAt?: string;
      attempts: LeadOrder[];
      primaryLead: LeadOrder;
    }

    const map = new Map<string, GroupedLead>();

    // Sort ghost leads by newest interaction first
    const sorted = [...ghostLeads].sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0).getTime() -
        new Date(a.updatedAt || a.createdAt || 0).getTime()
    );

    for (const lead of sorted) {
      const cleanEmail = (lead.email || '').trim().toLowerCase();
      const cleanPhone = (lead.phone || '').trim().replace(/\D/g, '');
      const key = cleanEmail || (cleanPhone ? `phone_${cleanPhone}` : lead.id);

      const isLeadFreeTrial = isFreeTrialLead(lead);
      const computedStatus = isLeadFreeTrial ? 'free_trial_claimed' : lead.status;
      const cleanName =
        lead.name &&
        lead.name !== 'Visitor (Unsubmitted)' &&
        lead.name !== 'Anonymous Visitor' &&
        lead.name !== 'Visitor (Checkout)' &&
        lead.name !== 'Visitor (Lead Magnet)' &&
        lead.name !== 'Visitor (Prompt Copy Lead)'
          ? lead.name
          : lead.name || 'Anonymous Visitor';

      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          key,
          name: cleanName,
          email: lead.email || '',
          phone: lead.phone || '',
          role: lead.role,
          latestStatus: computedStatus,
          highestTierName: lead.tierName || (isLeadFreeTrial ? 'Free Sample Prompt' : 'Custom Plan'),
          highestAmountINR: lead.amountINR || 0,
          attemptCount: 1,
          latestCreatedAt: lead.createdAt || new Date().toISOString(),
          latestUpdatedAt: lead.updatedAt || lead.createdAt || new Date().toISOString(),
          followupStage: lead.followupStage || 0,
          lastFollowupAt: lead.lastFollowupAt,
          attempts: [lead],
          primaryLead: lead,
        });
      } else {
        existing.attemptCount += 1;
        existing.attempts.push(lead);

        // Keep real name over placeholder
        if (
          (!existing.name ||
            existing.name === 'Visitor (Unsubmitted)' ||
            existing.name === 'Anonymous Visitor' ||
            existing.name === 'Visitor (Checkout)' ||
            existing.name === 'Visitor (Lead Magnet)' ||
            existing.name === 'Visitor (Prompt Copy Lead)') &&
          cleanName &&
          cleanName !== 'Anonymous Visitor'
        ) {
          existing.name = cleanName;
        }

        // Keep phone if missing
        if (!existing.phone && lead.phone) {
          existing.phone = lead.phone;
        }

        // Keep role if missing
        if (!existing.role && lead.role) {
          existing.role = lead.role;
        }

        // Higher intent stage takes priority
        if (computedStatus === 'free_trial_claimed') {
          existing.latestStatus = 'free_trial_claimed';
          existing.primaryLead = lead;
        } else if (computedStatus === 'abandoned_at_qr' && existing.latestStatus !== 'free_trial_claimed') {
          existing.latestStatus = 'abandoned_at_qr';
        }

        // Highest plan value takes priority
        if (isLeadFreeTrial && lead.tierName) {
          existing.highestTierName = lead.tierName;
        } else if ((lead.amountINR || 0) > (existing.highestAmountINR || 0)) {
          existing.highestAmountINR = lead.amountINR || 0;
          existing.highestTierName = lead.tierName || existing.highestTierName;
        }

        // Followup stage
        if ((lead.followupStage || 0) > (existing.followupStage || 0)) {
          existing.followupStage = lead.followupStage || 0;
          existing.lastFollowupAt = lead.lastFollowupAt || existing.lastFollowupAt;
        }

        // Primary lead selection for recovery actions
        if (computedStatus === 'free_trial_claimed') {
          existing.primaryLead = lead;
        } else if (
          lead.status === 'abandoned_at_qr' &&
          existing.primaryLead.status !== 'abandoned_at_qr' &&
          existing.primaryLead.status !== 'free_trial_claimed'
        ) {
          existing.primaryLead = lead;
        }
      }
    }

    return Array.from(map.values());
  }, [ghostLeads]);

  // Counts for sub-filters
  const freeTrialCount = useMemo(() => {
    return groupedGhostLeads.filter(
      (g) =>
        g.latestStatus === 'free_trial_claimed' ||
        isFreeTrialLead(g.primaryLead) ||
        g.attempts.some(isFreeTrialLead)
    ).length;
  }, [groupedGhostLeads]);

  const abandonedQrCount = useMemo(() => {
    return groupedGhostLeads.filter((g) => g.latestStatus === 'abandoned_at_qr').length;
  }, [groupedGhostLeads]);

  const keystrokeCount = useMemo(() => {
    return groupedGhostLeads.filter(
      (g) =>
        g.latestStatus === 'unsubmitted_keystroke' &&
        !isFreeTrialLead(g.primaryLead) &&
        !g.attempts.some(isFreeTrialLead)
    ).length;
  }, [groupedGhostLeads]);

  const filteredGroupedGhosts = useMemo(() => {
    if (ghostFilter === 'all') return groupedGhostLeads;
    if (ghostFilter === 'free_trial') {
      return groupedGhostLeads.filter(
        (g) =>
          g.latestStatus === 'free_trial_claimed' ||
          isFreeTrialLead(g.primaryLead) ||
          g.attempts.some(isFreeTrialLead)
      );
    }
    if (ghostFilter === 'abandoned_qr') {
      return groupedGhostLeads.filter((g) => g.latestStatus === 'abandoned_at_qr');
    }
    if (ghostFilter === 'keystroke') {
      return groupedGhostLeads.filter(
        (g) =>
          g.latestStatus === 'unsubmitted_keystroke' &&
          !isFreeTrialLead(g.primaryLead) &&
          !g.attempts.some(isFreeTrialLead)
      );
    }
    return groupedGhostLeads;
  }, [groupedGhostLeads, ghostFilter]);

  const filteredRawGhostLeads = useMemo(() => {
    if (ghostFilter === 'all') return ghostLeads;
    if (ghostFilter === 'free_trial') {
      return ghostLeads.filter(isFreeTrialLead);
    }
    if (ghostFilter === 'abandoned_qr') {
      return ghostLeads.filter((l) => l.status === 'abandoned_at_qr');
    }
    if (ghostFilter === 'keystroke') {
      return ghostLeads.filter(
        (l) => l.status === 'unsubmitted_keystroke' && !isFreeTrialLead(l)
      );
    }
    return ghostLeads;
  }, [ghostLeads, ghostFilter]);

  const approvedOrders = orders.filter((o) => o.status === 'approved' && (o.amountINR || 0) > 0);
  const upgradeIntentOrders = orders.filter(
    (o) => (o.upgradeTelemetry?.viewsCount || 0) > 0 || (o.upgradeTelemetry?.clicksCount || 0) > 0
  );

  // Stats
  const totalRevenue = approvedOrders.reduce((sum, o) => sum + (o.amountINR || 0), 0);

  // -------------------------------------------------------------
  // AUTHENTICATION SHIELD GATE (If user is not logged in as Admin)
  // -------------------------------------------------------------
  if (!session) {
    return (
      <div className="min-h-screen bg-[#05050a] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans select-none">
        {/* Ambient background blur */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Status Notification Toast */}
        {statusNotification && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-xl shadow-blue-600/40 animate-role-fade-in flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>{statusNotification}</span>
          </div>
        )}

        {/* Top return link */}
        <div className="w-full max-w-md flex items-center justify-between mb-4 z-10">
          <button
            onClick={() => {
              sound.playClick();
              onBackToSite();
            }}
            className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Store</span>
          </button>

          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>RBAC Protected</span>
          </div>
        </div>

        {/* Shield Card */}
        <div className="w-full max-w-md bg-[#0a0a14] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <img
              src="/vineb-logo.png"
              alt="Vine B Digital"
              className="w-14 h-14 object-contain rounded-xl border border-white/10 p-1 bg-white mx-auto mb-3 shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/vineb-logo.webp';
              }}
            />
            <div className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-bold">
              VINE B DIGITAL // APEX3D VAULT
            </div>
            <h1 className="text-xl font-black text-white tracking-tight mt-1">
              Administrator Verification Gate
            </h1>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Restricted console. Authenticate using your authorized administrator work email.
            </p>
          </div>

          {/* Auth Error Banner */}
          {authError && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-role-fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="leading-relaxed">{authError}</div>
            </div>
          )}

          {/* Step 1: Request Access Code via Email */}
          {!isOtpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Authorized Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="kumarrneeraj791@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                    autoFocus
                  />
                </div>
                <div className="text-[10px] text-zinc-500 mt-1.5 flex items-center justify-between font-mono">
                  <span>Super Admin: {SUPER_ADMIN_EMAIL}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30 disabled:opacity-50"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching Access Code...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send 6-Digit Login Code &rarr;</span>
                  </>
                )}
              </button>

              {/* Super Admin Emergency Bypass Option */}
              <div className="pt-3 border-t border-white/10 text-center">
                <button
                  type="button"
                  onClick={() => setShowEmergencyPin(!showEmergencyPin)}
                  className="text-[11px] font-mono text-zinc-400 hover:text-amber-400 transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <Key className="w-3 h-3 text-amber-400" />
                  <span>Super Admin Emergency Master PIN</span>
                </button>

                {showEmergencyPin && (
                  <div className="mt-3 p-3 rounded-xl bg-black/40 border border-amber-500/30 text-left animate-role-fade-in space-y-2">
                    <label className="block text-[10px] font-mono text-amber-300 uppercase tracking-wider font-bold">
                      Enter Emergency Master Key
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="PIN (6 digits)"
                        value={emergencyPin}
                        onChange={(e) => setEmergencyPin(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-black border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={handleEmergencyPinLogin}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shrink-0 cursor-pointer"
                      >
                        Enter &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          ) : (
            /* Step 2: Enter 6-digit Code */
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-role-fade-in">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                A 6-digit access code has been dispatched to <strong className="text-white font-mono">{loginEmail}</strong>.
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 text-center">
                  Enter 6-Digit Access Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full py-3 text-center text-2xl font-mono font-black tracking-[0.4em] rounded-xl bg-black/60 border border-blue-500/40 text-white placeholder-zinc-700 focus:outline-none focus:border-blue-400"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isVerifyingOtp}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 disabled:opacity-50"
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating Session...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify &amp; Enter Console &rarr;</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-2">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp}
                  className="hover:text-white transition-colors cursor-pointer underline"
                >
                  Resend Code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOtpSent(false);
                    setOtpInput('');
                    setAuthError(null);
                  }}
                  className="hover:text-white transition-colors cursor-pointer underline"
                >
                  Use Different Email
                </button>
              </div>
            </form>
          )}

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center text-[10px] text-zinc-500 font-mono">
            Protected by Vine B Digital Multi-Role Security &bull; MSME UDYAM-UP-29-0208780
          </div>
        </div>
      </div>
    );
  }

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
      <header className="border-b border-white/10 bg-[#090914] px-4 sm:px-6 py-3.5 sm:py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => {
                sound.playClick();
                onBackToSite();
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span><span className="hidden xs:inline">Back to </span>Site</span>
            </button>

            <div className="hidden sm:block h-4 w-[1px] bg-white/15" />

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/30 shrink-0">
                3D
              </div>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-sm font-bold tracking-tight flex items-center gap-1.5 text-white truncate">
                  <span className="truncate">APEX3D // SUPER-CONSOLE</span>
                  <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                    LIVE
                  </span>
                </h1>
                <p className="hidden xs:block text-[10px] text-white/40 font-mono truncate">
                  Payment Approvals · Ghost Recovery · Prompt CMS · Broadcast Studio
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
            {/* Identity Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center font-bold text-[10px] text-white">
                {session?.name ? session.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="text-left font-mono">
                <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <span className="truncate max-w-[120px]">{session?.name || session?.email}</span>
                  {isSuperAdmin ? (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold">
                      👑 SUPER ADMIN
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-bold">
                      🛡️ MODERATOR
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                loadData();
                showToast('Database refreshed.');
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs font-mono flex items-center gap-1.5 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {isSuperAdmin && (
              <button
                onClick={handlePurgeAllDummyData}
                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition-all text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                title="Purge Test/Dummy Records"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Purge Test</span>
              </button>
            )}

            <button
              onClick={() => {
                sound.playClick();
                logoutAdminSession();
                setSession(null);
                showToast('Signed out of Admin Console.');
              }}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-all text-xs font-mono flex items-center gap-1.5 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
        {/* Top At-A-Glance KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
          <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0c1527] to-[#080d19] border border-blue-500/20">
            <div className="flex items-center justify-between text-white/50 text-[11px] sm:text-xs font-mono mb-1">
              <span>TOTAL REVENUE</span>
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-[9px] sm:text-[10px] text-emerald-400 mt-1 font-mono">
              From {approvedOrders.length} verified purchases
            </div>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl bg-[#0a0f1d] border border-white/10">
            <div className="flex items-center justify-between text-white/50 text-[11px] sm:text-xs font-mono mb-1">
              <span>PENDING APPROVALS</span>
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-amber-300">
              {pendingApprovals.length}
            </div>
            <div className="text-[9px] sm:text-[10px] text-amber-300/80 mt-1 font-mono">
              Requires UTR verification
            </div>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl bg-[#0a0f1d] border border-white/10">
            <div className="flex items-center justify-between text-white/50 text-[11px] sm:text-xs font-mono mb-1">
              <span>GHOST &amp; FREE LEADS</span>
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-purple-300 flex items-baseline gap-1.5 flex-wrap">
              <span>{groupedGhostLeads.length}</span>
              {freeTrialCount > 0 ? (
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  ({freeTrialCount} free)
                </span>
              ) : ghostLeads.length > groupedGhostLeads.length ? (
                <span className="text-[11px] font-mono text-amber-300 font-bold">
                  ({ghostLeads.length} ev)
                </span>
              ) : null}
            </div>
            <div className="text-[9px] sm:text-[10px] text-purple-300/80 mt-1 font-mono">
              {freeTrialCount > 0
                ? `${freeTrialCount} claimed sample · ${groupedGhostLeads.length - freeTrialCount} dropped`
                : 'Unique high-intent leads'}
            </div>
          </div>

          <div className="p-3.5 sm:p-5 rounded-2xl bg-[#0a0f1d] border border-white/10">
            <div className="flex items-center justify-between text-white/50 text-[11px] sm:text-xs font-mono mb-1">
              <span>PROMPT BLUEPRINTS</span>
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-blue-300">
              {promptsList.length}+
            </div>
            <div className="text-[9px] sm:text-[10px] text-blue-300/80 mt-1 font-mono">
              Live in customer vault
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 mb-6 overflow-x-auto no-scrollbar whitespace-nowrap pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
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
            <span>
              Ghost &amp; Free Leads ({groupedGhostLeads.length})
              {freeTrialCount > 0 && (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  {freeTrialCount} free
                </span>
              )}
            </span>
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
              setTab('broadcast');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              tab === 'broadcast'
                ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Send className="w-4 h-4 text-cyan-400" />
            <span>Broadcast &amp; Email Studio</span>
          </button>

          {/* Team Management Tab (Super Admin Only) */}
          {isSuperAdmin && (
            <button
              onClick={() => {
                sound.playClick();
                setTab('team');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
                tab === 'team'
                  ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Team &amp; Admins ({teamList.length})</span>
            </button>
          )}

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
            {isSuperAdmin ? (
              <span>⚙️ Settings</span>
            ) : (
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Lock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Settings (Locked)</span>
              </span>
            )}
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
                    <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 pt-2 lg:pt-0 flex-wrap">
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
                <h2 className="text-base font-bold text-white flex items-center gap-2 flex-wrap">
                  <span>Ghost &amp; Free Leads (Marketing &amp; ROI)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                    {groupedGhostLeads.length} Unique Leads · {ghostLeads.length} Total Events
                  </span>
                  {freeTrialCount > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      🎁 {freeTrialCount} Free Trial Claimed
                    </span>
                  )}
                </h2>
                <p className="text-xs text-white/50">
                  Visitors who copied free sample prompts or dropped off during checkout. Repeat interactions are unified with intent multipliers (x2, x3).
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {/* View Mode Switcher: Grouped vs Raw Stream */}
                <div className="flex items-center p-1 rounded-xl bg-black/60 border border-white/10 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setGhostViewMode('grouped');
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      ghostViewMode === 'grouped'
                        ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Grouped Users ({filteredGroupedGhosts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setGhostViewMode('raw');
                    }}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      ghostViewMode === 'raw'
                        ? 'bg-white/15 text-white font-bold shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Raw Stream ({filteredRawGhostLeads.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    sound.playClick();
                    const synced = await syncAllLeadsFromCloud();
                    setOrders(synced);
                    showToast(`Pulled ${synced.length} real records from Cloud Database.`);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Force pull latest leads from Cloud Database"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sync Cloud Leads</span>
                </button>

                {ghostLeads.length > 0 && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      const csvContent =
                        ghostViewMode === 'grouped'
                          ? 'data:text/csv;charset=utf-8,Name,Email,Phone,Role,Plan,HighestIntentStage,Attempts,LastSeen\n' +
                            groupedGhostLeads
                              .map(
                                (g) =>
                                  `"${g.name}","${g.email}","${g.phone}","${g.role || 'Unspecified'}","${g.highestTierName}","${
                                    g.latestStatus === 'free_trial_claimed'
                                      ? 'Free Trial Claimed'
                                      : g.latestStatus === 'abandoned_at_qr'
                                      ? 'Abandoned at QR'
                                      : 'Typed (Unsubmitted)'
                                  }","${g.attemptCount}","${g.latestCreatedAt}"`
                              )
                              .join('\n')
                          : 'data:text/csv;charset=utf-8,Name,Email,Phone,Role,Plan,CapturedAt\n' +
                            ghostLeads
                              .map(
                                (l) =>
                                  `"${l.name}","${l.email}","${l.phone}","${l.role || 'Unspecified'}","${l.tierName}","${l.createdAt}"`
                              )
                              .join('\n');

                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement('a');
                      link.setAttribute('href', encodedUri);
                      link.setAttribute('download', ghostViewMode === 'grouped' ? 'apex3d_grouped_leads.csv' : 'apex3d_raw_ghost_leads.csv');
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      showToast('📥 Ghost leads exported for Meta Custom Audience.');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export to Meta CSV</span>
                  </button>
                )}

                {ghostLeads.length > 0 && (
                  <button
                    type="button"
                    onClick={handlePurgeAllTestLeads}
                    disabled={isPurgingLeads}
                    className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    title="Permanently wipe all test leads and ghost records"
                  >
                    {isPurgingLeads ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                        <span>Purging Leads...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span>Purge All Test Leads</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Sub-Filter Pill Bar: All Leads / Free Prompts / QR Drop-offs / Keystrokes */}
            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setGhostFilter('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  ghostFilter === 'all'
                    ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                    : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                <span>All Leads</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
                  {groupedGhostLeads.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setGhostFilter('free_trial');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  ghostFilter === 'free_trial'
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                    : 'bg-emerald-950/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30'
                }`}
              >
                <span>🎁 Free Prompts</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-bold">
                  {freeTrialCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setGhostFilter('abandoned_qr');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  ghostFilter === 'abandoned_qr'
                    ? 'bg-purple-700 text-white font-bold shadow-md shadow-purple-700/30'
                    : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                <span>⚡ QR Drop-offs</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
                  {abandonedQrCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setGhostFilter('keystroke');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  ghostFilter === 'keystroke'
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                    : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                <span>⌨️ Keystrokes</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
                  {keystrokeCount}
                </span>
              </button>
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
            ) : filteredGroupedGhosts.length === 0 && ghostViewMode === 'grouped' ? (
              <div className="py-16 text-center rounded-2xl bg-[#090914] border border-white/5 text-white/40">
                <Sparkles className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                <p className="text-xs text-zinc-400 font-mono">No leads match the selected filter ({ghostFilter}).</p>
                <button
                  type="button"
                  onClick={() => setGhostFilter('all')}
                  className="mt-3 text-xs text-blue-400 hover:underline font-mono"
                >
                  View All Leads ({groupedGhostLeads.length}) &rarr;
                </button>
              </div>
            ) : ghostViewMode === 'grouped' ? (
              /* ==============================================================
                  MODE 1: GROUPED BY UNIQUE CUSTOMER (WITH x2, x3 BADGES)
                 ============================================================== */
              <div className="divide-y divide-white/5 rounded-2xl bg-[#090914] border border-white/10 overflow-hidden">
                {filteredGroupedGhosts.map((group) => {
                  const isExpanded = expandedGhostKeys.has(group.key);
                  const isFreeLead =
                    group.latestStatus === 'free_trial_claimed' ||
                    isFreeTrialLead(group.primaryLead) ||
                    group.attempts.some(isFreeTrialLead);

                  return (
                    <div
                      key={group.key}
                      className="p-4 sm:p-5 flex flex-col justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white">
                              {group.name || 'Anonymous Visitor'}
                            </span>

                            {/* 🔥 Multiplier Badge: x2, x3, etc. */}
                            {group.attemptCount > 1 ? (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/25 to-orange-500/25 text-amber-300 border border-amber-500/40 font-extrabold flex items-center gap-1 shadow-sm shadow-amber-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                <span>x{group.attemptCount} Attempts</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                                x1 Attempt
                              </span>
                            )}

                            {/* Highest Funnel Status */}
                            {isFreeLead ? (
                              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1 shadow-sm shadow-emerald-500/20">
                                <span>🎁 Free Prompt Copied (1/1 Claimed)</span>
                              </span>
                            ) : (
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                  group.latestStatus === 'abandoned_at_qr'
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold'
                                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                                }`}
                              >
                                {group.latestStatus === 'abandoned_at_qr'
                                  ? 'Abandoned at QR'
                                  : 'Typed (Unsubmitted)'}
                              </span>
                            )}

                            {/* Discipline / Role Badge */}
                            {group.role && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 font-semibold flex items-center gap-1">
                                {group.role === 'Student'
                                  ? '🎓 Student'
                                  : group.role === 'Freelancer'
                                  ? '💼 Freelancer'
                                  : '🏢 Agency Owner'}
                              </span>
                            )}

                            {/* Drip Status */}
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                group.followupStage === 2
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                  : group.followupStage === 1
                                  ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                              }`}
                            >
                              {group.followupStage === 2
                                ? 'Drip: Day 2 Sent'
                                : group.followupStage === 1
                                ? 'Drip: Day 1 Sent'
                                : 'Drip: Pending'}
                            </span>

                            <span className="text-xs font-bold text-blue-400 font-mono">
                              {group.highestTierName} (₹{group.highestAmountINR})
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-white/60 mt-1 font-mono flex-wrap">
                            <span>{group.email}</span>
                            {group.phone && <span>· +91 {group.phone}</span>}
                            <span>· {new Date(group.latestCreatedAt).toLocaleDateString()}</span>
                            {group.attemptCount > 1 && (
                              <span className="text-amber-400/90 font-medium">
                                · High Intent: Re-engaged {group.attemptCount} times
                              </span>
                            )}
                          </div>

                          {/* Expand/Collapse Timeline for multiple attempts */}
                          {group.attemptCount > 1 && (
                            <button
                              type="button"
                              onClick={() => toggleExpandGhost(group.key)}
                              className="mt-2 text-[11px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                              <span>
                                {isExpanded
                                  ? 'Hide attempt history'
                                  : `View all ${group.attemptCount} interaction touchpoints`}
                              </span>
                            </button>
                          )}
                        </div>

                        {/* Action buttons: single follow-up per user */}
                        <div className="flex items-center gap-2 shrink-0">
                          {group.phone && (
                            <a
                              href={`https://wa.me/91${group.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                isFreeLead
                                  ? `Hey ${group.name || 'there'}! 🚀 Saw you tested the "${group.highestTierName || '3D Architecture'}" prompt on APEX3D Vault.\n\nHow did your render go? If you want instant access to all 500+ commercial 3D blueprints and Three.js starters, we have an exclusive ₹49 Sprint Pass or ₹299 Lifetime VIP today: https://3dwebprompts-vineb.vercel.app/#pricing\n\nNeed any help setting it up?`
                                  : `Hey ${group.name || 'there'}! Saw you were checking out the ${group.highestTierName} on APEX3D Vault. Did you face any UPI issue? Here to help!`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1 shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer"
                            >
                              <span>WhatsApp Follow-up</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => handleSendRecoveryEmail(group.primaryLead)}
                            disabled={sendingLeadEmailId === group.primaryLead.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                              sendingLeadEmailId === group.primaryLead.id
                                ? 'bg-blue-600/50 text-blue-200 cursor-wait border border-blue-500/30'
                                : group.lastFollowupAt
                                ? 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                                : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                            }`}
                            title={
                              group.lastFollowupAt
                                ? `Last dispatched on ${new Date(group.lastFollowupAt).toLocaleString()}`
                                : 'Dispatch recovery email'
                            }
                          >
                            {sendingLeadEmailId === group.primaryLead.id ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                                <span>Sending Email...</span>
                              </>
                            ) : group.lastFollowupAt ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Recovery Sent</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-3 h-3 text-zinc-400" />
                                <span>Send Recovery Email</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteLeadGroup(group)}
                            disabled={deletingLeadId === group.key}
                            className="p-1.5 sm:p-2 rounded-lg bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 border border-red-500/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                            title="Permanently delete this lead & all touchpoints"
                          >
                            {deletingLeadId === group.key ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Attempt Timeline Accordion */}
                      {isExpanded && (
                        <div className="mt-2 p-3.5 rounded-xl bg-black/50 border border-white/[0.08] space-y-2 text-xs font-mono animate-role-fade-in">
                          <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                            Customer Journey & Attempt Log ({group.attempts.length} Touchpoints):
                          </div>
                          {group.attempts.map((att, attIdx) => {
                            const isAttFree = isFreeTrialLead(att) || att.status === ('free_trial_claimed' as any);
                            return (
                              <div
                                key={att.id || attIdx}
                                className="flex items-center justify-between text-[11px] py-1 border-b border-white/5 last:border-0 flex-wrap gap-2"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-zinc-500">#{attIdx + 1}</span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                                      isAttFree
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                                        : att.status === 'abandoned_at_qr'
                                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                    }`}
                                  >
                                    {isAttFree
                                      ? '🎁 Free Sample Copied'
                                      : att.status === 'abandoned_at_qr'
                                      ? 'Abandoned at QR'
                                      : 'Typed (Unsubmitted)'}
                                  </span>
                                  {att.role && (
                                    <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                      {att.role}
                                    </span>
                                  )}
                                  <span className="text-white/80">{att.tierName}</span>
                                  <span className="text-blue-400 font-bold">₹{att.amountINR}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-zinc-500 text-[10px]">
                                    {new Date(att.updatedAt || att.createdAt || 0).toLocaleString()}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSingleLead(att.id, att.email, att.phone)}
                                    disabled={deletingLeadId === att.id}
                                    className="p-1 rounded text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                    title="Delete this touchpoint"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ==============================================================
                  MODE 2: RAW EVENT STREAM (INDIVIDUAL ATTEMPTS)
                 ============================================================== */
              <div className="divide-y divide-white/5 rounded-2xl bg-[#090914] border border-white/10 overflow-hidden">
                {filteredRawGhostLeads.map((lead) => {
                  const isLeadFree = isFreeTrialLead(lead) || lead.status === ('free_trial_claimed' as any);
                  return (
                    <div
                      key={lead.id}
                      className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02]"
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-white">{lead.name || 'Anonymous Visitor'}</span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                              isLeadFree
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                                : lead.status === 'unsubmitted_keystroke'
                                ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            {isLeadFree
                              ? '🎁 Free Sample Copied'
                              : lead.status === 'unsubmitted_keystroke'
                              ? 'Typed (Unsubmitted)'
                              : 'Abandoned at QR'}
                          </span>
                          {lead.role && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 font-semibold">
                              {lead.role === 'Student' ? '🎓 Student' : lead.role === 'Freelancer' ? '💼 Freelancer' : '🏢 Agency Owner'}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                              lead.followupStage === 2
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : lead.followupStage === 1
                                ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            }`}
                          >
                            {lead.followupStage === 2
                              ? 'Drip: Day 2 Sent'
                              : lead.followupStage === 1
                              ? 'Drip: Day 1 Sent'
                              : 'Drip: Pending'}
                          </span>
                          <span className="text-xs font-bold text-blue-400 font-mono">
                            {lead.tierName} (₹{lead.amountINR})
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-white/60 mt-1 font-mono">
                          <span>{lead.email}</span>
                          {lead.phone && <span>· +91 {lead.phone}</span>}
                          <span>· {new Date(lead.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {lead.phone && (
                          <a
                            href={`https://wa.me/91${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                              isLeadFree
                                ? `Hey ${lead.name || 'there'}! 🚀 Saw you tested the "${lead.tierName || '3D Architecture'}" prompt on APEX3D Vault.\n\nHow did your render go? If you want instant access to all 500+ commercial 3D blueprints and Three.js starters, we have an exclusive ₹49 Sprint Pass or ₹299 Lifetime VIP today: https://3dwebprompts-vineb.vercel.app/#pricing\n\nNeed any help setting it up?`
                                : `Hey ${lead.name || 'there'}! Saw you were checking out the ${lead.tierName} on APEX3D Vault. Did you face any UPI issue? Here to help!`
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
                          title={
                            lead.lastFollowupAt
                              ? `Last dispatched on ${new Date(lead.lastFollowupAt).toLocaleString()}`
                              : 'Dispatch recovery email'
                          }
                        >
                          {sendingLeadEmailId === lead.id ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                              <span>Sending Email...</span>
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

                        <button
                          type="button"
                          onClick={() => handleDeleteSingleLead(lead.id, lead.email, lead.phone)}
                          disabled={deletingLeadId === lead.id}
                          className="p-1.5 sm:p-2 rounded-lg bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 border border-red-500/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                          title="Permanently delete this lead"
                        >
                          {deletingLeadId === lead.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
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
                          {order.invoiceNumber || 'INV-PENDING'}
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

                      <div className="mt-2 text-[11px] font-mono text-white/40 flex flex-wrap items-center gap-3">
                        <span>License Hash: <strong className="text-slate-300">{order.licenseKey || 'N/A'}</strong></span>
                        {order.boundIp ? (
                          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-[10px]">
                            <Lock className="w-3 h-3 text-emerald-400" />
                            <span>1-IP Locked: {order.boundIp} ({order.boundLocation || 'Location Bound'})</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700 text-zinc-400 text-[10px]">
                            <span>🔓 IP Lock: Unbound (Awaiting 1st Login)</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {order.boundIp && (
                        <button
                          onClick={() => {
                            sound.playClick();
                            const res = resetOrderIpLock(order.id);
                            if (res.success) {
                              showToast(res.message);
                              loadData();
                            }
                          }}
                          className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Reset IP lock if customer changed Wi-Fi or device"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Reset IP Lock</span>
                        </button>
                      )}

                      {order.phone && (
                        <a
                          href={`https://wa.me/91${order.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Hello ${order.name}! 🚀 Your APEX3D Vault access (${order.tierName}) is APPROVED!\n\n` +
                            `🔑 License Key: ${order.licenseKey || 'N/A'}\n` +
                            `📄 Commercial Invoice: ${order.invoiceNumber || 'N/A'}\n` +
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

                      <button
                        onClick={() => handleDeleteApprovedOrder(order.id, order.email)}
                        className="p-2 rounded-xl bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Delete order record permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-white/70">Video / WebP Showcase URL</label>
                      {newVideoUrl.trim() && (
                        <span className={`text-[10px] font-mono px-2 py-0.2 rounded font-bold ${
                          isMediaImage(newVideoUrl)
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {isMediaImage(newVideoUrl) ? '✨ Detected: Animated WebP / GIF' : '🎬 Detected: MP4/WebM Video'}
                        </span>
                      )}
                    </div>
                    <input
                      type="url"
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      placeholder="e.g. https://image.mux.com/.../animated.webp or .mp4"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500 font-mono"
                    />

                    {/* Live Media Preview Box */}
                    {newVideoUrl.trim() && (
                      <div className="mt-2 p-2.5 rounded-xl bg-black/70 border border-white/15">
                        <div className="text-[10px] font-mono text-zinc-400 mb-1.5 flex items-center justify-between">
                          <span>LIVE SHOWCASE PREVIEW:</span>
                          <span className="text-zinc-500">Auto-detected &amp; rendered</span>
                        </div>
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-white/10 max-h-40 flex items-center justify-center">
                          {isMediaImage(newVideoUrl) ? (
                            <img
                              src={newVideoUrl}
                              alt="Live showcase preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              src={newVideoUrl}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </div>
                    )}
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

                <div className="pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-xl bg-black/30 border border-white/10 hover:border-emerald-500/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={newAllowFreeTrialCopy}
                      onChange={(e) => setNewAllowFreeTrialCopy(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-black/60 text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Allow Free Trial Users to copy this prompt as their 1 lifetime sample</span>
                      </span>
                      <p className="text-[10px] text-white/50 mt-0.5">
                        Free users can only copy at most 1 free sample prompt total. If unchecked, this prompt is strictly locked behind a paid pass.
                      </p>
                    </div>
                  </label>
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
                <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                    {/* Media Thumbnail */}
                    <div className="w-14 sm:w-16 h-11 sm:h-12 rounded-lg bg-black/70 border border-white/10 overflow-hidden shrink-0 relative flex items-center justify-center">
                      {isMediaImage(item.videoUrl) ? (
                        <img
                          src={item.videoUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <video
                          src={item.videoUrl}
                          poster={item.poster}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      )}
                      <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono px-1 py-0.2 rounded bg-black/80 text-zinc-300">
                        {isMediaImage(item.videoUrl) ? 'WEBP' : 'MP4'}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span className="text-xs font-mono text-white/30">{String(idx + 1).padStart(2, '0')}</span>
                        <h4 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-sm">{item.title}</h4>
                        {item.id.startsWith('custom-prompt') && (
                          <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            CMS CUSTOM
                          </span>
                        )}
                        <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/60">
                          {item.category}
                        </span>
                        {item.allowFreeTrialCopy ? (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>FREE SAMPLE</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10">
                            PAID ONLY
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/50 mt-1 line-clamp-1">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleToggleFreeTrialCopy(item.id, !!item.allowFreeTrialCopy)}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        item.allowFreeTrialCopy
                          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                          : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10'
                      }`}
                      title={item.allowFreeTrialCopy ? 'Click to make Paid Vault Only' : 'Click to enable as a Free Sample for free users'}
                    >
                      {item.allowFreeTrialCopy ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Free Sample Active</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 text-zinc-400" />
                          <span>Make Free Sample</span>
                        </>
                      )}
                    </button>

                    <span className="text-xs font-mono font-bold text-amber-400">{item.clientValue}</span>

                    <button
                      type="button"
                      onClick={() => handleOpenEditPrompt(item)}
                      className="p-1.5 rounded-lg hover:bg-blue-500/20 text-white/70 hover:text-blue-400 transition-colors cursor-pointer"
                      title="Edit this prompt"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeletePrompt(item.id, item.title)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
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
            TAB: EMAIL BROADCAST & CAMPAIGN STUDIO
           ------------------------------------------ */}
        {tab === 'broadcast' && (
          <BroadcastCenter
            adminEmail={session?.email || SUPER_ADMIN_EMAIL}
            showToast={showToast}
          />
        )}

        {/* ------------------------------------------
            TAB 6: TEAM & ROLE PERMISSIONS (Super Admin Only)
           ------------------------------------------ */}
        {tab === 'team' && isSuperAdmin && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold mb-1">
                  SECURITY &bull; ROLE-BASED ACCESS CONTROL (RBAC)
                </div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>Administrative Staff &amp; Operations Roster</span>
                </h2>
                <p className="text-xs text-white/50">
                  Appoint operations moderators to verify UPI payments and fulfill customer passes. Invited admins cannot modify store settings, pricing, or UPI VPAs.
                </p>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsInviteModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20 shrink-0 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Appoint Operations Admin</span>
              </button>
            </div>

            {/* Team Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#090914] border border-amber-500/20">
                <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1">MASTER ROOT ADMIN</div>
                <div className="text-xl font-bold text-white font-mono">1</div>
                <div className="text-[10px] text-amber-400 mt-1 font-mono">{SUPER_ADMIN_EMAIL}</div>
              </div>

              <div className="p-4 rounded-xl bg-[#090914] border border-white/10">
                <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1">ACTIVE MODERATORS</div>
                <div className="text-xl font-bold text-emerald-400 font-mono">
                  {teamList.filter((a) => a.role === 'moderator' && a.status === 'active').length}
                </div>
                <div className="text-[10px] text-emerald-400/80 mt-1 font-mono">Authorized for approvals</div>
              </div>

              <div className="p-4 rounded-xl bg-[#090914] border border-white/10">
                <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1">PENDING INVITATIONS</div>
                <div className="text-xl font-bold text-blue-400 font-mono">
                  {teamList.filter((a) => a.status === 'invited').length}
                </div>
                <div className="text-[10px] text-blue-400/80 mt-1 font-mono">Awaiting first login pass</div>
              </div>
            </div>

            {/* Master Super Admin Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#121008] to-[#0a0905] border-2 border-amber-500/40 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-xl text-amber-400 shrink-0">
                    👑
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-white">Neeraj Kumar</h3>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-mono font-black uppercase tracking-wider">
                        Master Super Admin
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                        ROOT PROTECTED
                      </span>
                    </div>
                    <div className="font-mono text-xs text-amber-200/90 mt-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>{SUPER_ADMIN_EMAIL}</span>
                    </div>
                    <div className="text-[11px] text-white/50 mt-2 leading-relaxed">
                      Holds absolute administrative ownership. Exclusively authorized to modify Merchant UPI VPAs (<strong className="text-white">s5305704393562990@slc</strong>), adjust plan pricing, manage API keys, and appoint or revoke operations staff.
                    </div>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <div className="text-[10px] font-mono text-white/40 uppercase">AUTHORITY STATUS</div>
                  <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">PERMANENT / UNREVOCABLE</div>
                </div>
              </div>
            </div>

            {/* Staff Moderator Roster */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-white/70 font-bold">
                  Operations Moderators &amp; Staff ({teamList.filter((a) => a.role === 'moderator').length})
                </h3>
              </div>

              {teamList.filter((a) => a.role === 'moderator').length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#090914] border border-white/5 text-center text-white/40">
                  <Users className="w-8 h-8 mx-auto mb-2 text-white/20" />
                  <p className="text-xs font-medium">No additional operations administrators appointed yet.</p>
                  <p className="text-[11px] text-white/30 mt-1">
                    Click &ldquo;+ Appoint Operations Admin&rdquo; to send a duty briefing email and access pass to your staff.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamList
                    .filter((a) => a.role === 'moderator')
                    .map((admin) => (
                      <div
                        key={admin.id}
                        className="p-5 rounded-xl bg-[#090914] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-sm text-blue-400 shrink-0">
                            {admin.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white text-sm">{admin.name}</span>
                              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-mono">
                                Operations Moderator
                              </span>
                              {admin.status === 'active' && (
                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                                  ACTIVE
                                </span>
                              )}
                              {admin.status === 'invited' && (
                                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono font-bold">
                                  INVITED (PENDING LOGIN)
                                </span>
                              )}
                              {admin.status === 'revoked' && (
                                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono font-bold">
                                  REVOKED
                                </span>
                              )}
                            </div>

                            <div className="font-mono text-xs text-white/70 mt-1">{admin.email}</div>

                            <div className="text-[10px] text-white/40 font-mono mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                              <span>Appointed: {new Date(admin.invitedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              <span>Last Active: {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Never'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            onClick={() => handleResendInvite(admin)}
                            disabled={resendingAdminId === admin.id}
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-mono flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
                            title="Resend duty briefing & magic link email"
                          >
                            {resendingAdminId === admin.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                            ) : (
                              <Send className="w-3.5 h-3.5 text-blue-400" />
                            )}
                            <span>Resend Invite</span>
                          </button>

                          {admin.status !== 'revoked' ? (
                            <button
                              onClick={() => handleRevoke(admin)}
                              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-mono flex items-center gap-1.5 border border-rose-500/20 transition-colors cursor-pointer"
                              title="Revoke admin access immediately"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Revoke</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                sound.playClick();
                                admin.status = 'active';
                                setTeamList([...teamList]);
                                showToast(`Restored access for ${admin.name}.`);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-mono flex items-center gap-1.5 border border-emerald-500/20 transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Restore</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteAdmin(admin)}
                            className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete administrator record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------
            TAB 7: SETTINGS
           ------------------------------------------ */}
        {tab === 'settings' && (
          !isSuperAdmin ? (
            <div className="max-w-2xl mx-auto py-16 px-6 rounded-2xl bg-[#090914] border border-amber-500/30 text-center animate-role-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold tracking-wider uppercase mb-3">
                Restricted Section &bull; Super Admin Only
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Store Configuration Locked</h2>
              <p className="text-xs text-white/60 max-w-lg mx-auto mb-6 leading-relaxed">
                Platform financial settings, Merchant UPI VPAs, Plan Pricing, Resend API Keys, and Supabase credentials are restricted to Master Super Admin (<span className="text-amber-400 font-mono font-semibold">{SUPER_ADMIN_EMAIL}</span>).
              </p>

              <div className="p-4 rounded-xl bg-black/50 border border-white/10 text-left font-mono text-xs space-y-2.5 mb-6 max-w-md mx-auto">
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Your Authorized Scope:</div>
                <div className="text-emerald-400 flex items-center gap-2">
                  <span>✓</span>
                  <span>Order Approvals &amp; Bank UTR Verification</span>
                </div>
                <div className="text-emerald-400 flex items-center gap-2">
                  <span>✓</span>
                  <span>Ghost Leads &amp; Checkout Abandonment Monitoring</span>
                </div>
                <div className="text-emerald-400 flex items-center gap-2">
                  <span>✓</span>
                  <span>Commercial Invoice &amp; License Dispatching</span>
                </div>
                <div className="text-rose-400 flex items-center gap-2">
                  <span>✕</span>
                  <span>Modifying Store Settings &amp; Financial Credentials (Locked)</span>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick();
                  setTab('approvals');
                }}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Go to Pending Approvals &rarr;
              </button>
            </div>
          ) : (
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
                  <span>04. Automated Transactional Emails (Mail Engine API)</span>
                </h3>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                  <span>1-Click Auto Fulfillment</span>
                </span>
              </div>

              <p className="text-xs text-white/60">
                Whenever you click "Approve" on a pending order, the system automatically delivers the branded access email with their License Key, Portal Login link, and Invoice to the customer.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Mail Engine API Key</label>
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
                    Recommended: <code className="text-blue-300">Vine B Digital // 3D Vault &lt;vault@vinebdigital.store&gt;</code>. (Note: Ensure domain DNS records are verified for vinebdigital.store).
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
        )
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

      {/* Edit Prompt Blueprint Modal */}
      {isEditPromptModalOpen && editingPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md animate-role-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-[#090a14] border border-blue-500/40 text-white shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 flex items-center justify-between bg-[#06070e] gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
                  <Pencil className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-bold">
                      PROMPT CMS ARCHITECTURE
                    </span>
                    <span className="hidden xs:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                      ID: {editingPrompt.id}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-0.5 truncate max-w-[200px] sm:max-w-md">
                    Edit: {editingPrompt.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditPromptModalOpen(false);
                  setEditingPrompt(null);
                }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveEditPrompt} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Blueprint Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="e.g. Hazmat Cybersecurity Master 3D"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Filter Category *
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as VaultItem['filterGroup'])}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-blue-400"
                  >
                    <option value="Luxury Brands">Luxury Brands</option>
                    <option value="Spatial & WebGL">Spatial & WebGL</option>
                    <option value="High-Ticket Agency">High-Ticket Agency</option>
                    <option value="AI Agents & Systems">AI Agents & Systems</option>
                    <option value="E-Commerce 3D">E-Commerce 3D</option>
                    <option value="Design Systems">Design Systems</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Client Valuation SOW
                  </label>
                  <input
                    type="text"
                    value={editClientValue}
                    onChange={(e) => setEditClientValue(e.target.value)}
                    placeholder="e.g. $18,000 SOW"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-white/80">
                      Video / WebP Showcase URL
                    </label>
                    {editVideoUrl.trim() && (
                      <span className={`text-[10px] font-mono px-2 py-0.2 rounded font-bold ${
                        isMediaImage(editVideoUrl)
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {isMediaImage(editVideoUrl) ? '✨ Detected: Animated WebP / GIF' : '🎬 Detected: MP4/WebM Video'}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={editVideoUrl}
                    onChange={(e) => setEditVideoUrl(e.target.value)}
                    placeholder="e.g. https://image.mux.com/.../animated.webp or .mp4"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-400 font-mono"
                  />

                  {/* Live Media Preview Box */}
                  {editVideoUrl.trim() && (
                    <div className="mt-2 p-2.5 rounded-xl bg-black/70 border border-white/15">
                      <div className="text-[10px] font-mono text-zinc-400 mb-1.5 flex items-center justify-between">
                        <span>LIVE SHOWCASE PREVIEW:</span>
                        <span className="text-zinc-500">Auto-detected &amp; rendered</span>
                      </div>
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-white/10 max-h-40 flex items-center justify-center">
                        {isMediaImage(editVideoUrl) ? (
                          <img
                            src={editVideoUrl}
                            alt="Live showcase preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={editVideoUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Subtitle / Deliverable Story
                </label>
                <input
                  type="text"
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
                  placeholder="Short explanation of deliverables and Three.js tech stack..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Exact Production Prompt Syntax (Claude 3.7 / Cursor AI) *
                </label>
                <textarea
                  required
                  rows={8}
                  value={editSyntax}
                  onChange={(e) => setEditSyntax(e.target.value)}
                  placeholder="// Production prompt architecture..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/15 text-xs font-mono text-cyan-300 leading-relaxed placeholder-white/30 focus:outline-none focus:border-blue-400 scrollbar-thin"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Tested AI Models (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editTestedModels}
                    onChange={(e) => setEditTestedModels(e.target.value)}
                    placeholder="Claude 3.7 Sonnet, Cursor Agent, ChatGPT o3"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="WebGL 60FPS, GLSL Shaders, Three.js"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Free Trial Copy Permission Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-3.5 rounded-xl bg-black/40 border border-white/15 hover:border-emerald-500/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={editAllowFreeTrialCopy}
                    onChange={(e) => setEditAllowFreeTrialCopy(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-black/60 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Allow Free Users to copy this prompt as their 1 lifetime sample</span>
                    </span>
                    <p className="text-[10px] text-white/50 mt-0.5">
                      Free users can only copy 1 free sample prompt total. If unchecked, this prompt remains exclusively locked behind a paid pass.
                    </p>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditPromptModalOpen(false);
                    setEditingPrompt(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Blueprint Updates</span>
                </button>
              </div>
            </form>
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

      {/* Appoint Operations Admin Modal (Super Admin Only) */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-role-fade-in">
          <div className="relative w-full max-w-lg bg-[#0c0c16] border border-white/15 rounded-2xl p-6 sm:p-7 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                    Appoint Operations Administrator
                  </h3>
                  <p className="text-[10px] text-white/50 font-mono">
                    Dispatches official duty briefing &amp; 1-click login pass
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  setIsInviteModalOpen(false);
                }}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Administrator Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400 font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Work Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. rahul@vinebdigital.store or personal@gmail.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              {/* Duty Briefing & Security Restriction Box */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2.5 text-xs font-mono">
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Automated Duty Briefing &amp; Permissions:</span>
                </div>
                <div className="text-white/70 text-[11px] leading-relaxed">
                  Upon dispatch, the appointee will receive an executive email outlining their operational duties:
                </div>
                <ul className="text-[11px] text-emerald-400 space-y-1 pl-4 list-disc">
                  <li>Bank UTR reference verification against Slice Merchant UPI</li>
                  <li>1-click approval &amp; customer license provisioning</li>
                  <li>Commercial invoice issuance (MSME: UDYAM-UP-29-0208780)</li>
                  <li>Ghost lead drop-off and retargeting observation</li>
                </ul>
                <div className="pt-2 border-t border-white/10 text-[10px] text-rose-300 font-semibold flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-rose-400 shrink-0" />
                  <span>Restricted: Sub-admins CANNOT modify store settings, pricing, UPI VPAs, or API keys.</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Dispatching Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Appointment Email &rarr;</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
