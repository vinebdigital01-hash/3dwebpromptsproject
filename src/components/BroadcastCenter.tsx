import React, { useState, useEffect, useMemo } from 'react';
import {
  Send,
  Sparkles,
  Eye,
  Code,
  Smartphone,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  Play,
  Image as ImageIcon,
  Link,
  Plus,
  Trash2,
  RefreshCw,
  Users,
  Copy,
  Check,
  Search,
  ChevronDown,
  Info,
  Clock,
  MailCheck,
  Video,
  FileCode,
  Flame,
  Layers,
  Palette,
  ExternalLink,
} from 'lucide-react';
import {
  BroadcastThemeId,
  AudienceFilter,
  BroadcastContact,
  BroadcastCampaignRecord,
  getBroadcastAudience,
  buildBroadcastHtml,
  BROADCAST_STARTER_TEMPLATES,
  sendBroadcastTestEmail,
  dispatchBatchBroadcast,
  getAllBroadcastCampaigns,
  fetchCloudBroadcastCampaigns,
  deleteBroadcastCampaign,
  interpolateMergeTags,
} from '../lib/broadcastService';
import { sound } from '../lib/audioEngine';
import { SUPER_ADMIN_EMAIL } from '../lib/adminAuthStore';

interface BroadcastCenterProps {
  adminEmail: string;
  showToast: (msg: string) => void;
}

export const BroadcastCenter: React.FC<BroadcastCenterProps> = ({ adminEmail, showToast }) => {
  // Audience selection
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>('all');
  const [customEmailsInput, setCustomEmailsInput] = useState('');
  const [showRecipientDrawer, setShowRecipientDrawer] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');

  // Composer fields
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('vault_drop');
  const [theme, setTheme] = useState<BroadcastThemeId>('cyber_dark');
  const [subject, setSubject] = useState(BROADCAST_STARTER_TEMPLATES[0].subject);
  const [preheader, setPreheader] = useState(BROADCAST_STARTER_TEMPLATES[0].preheader);
  const [fromName, setFromName] = useState('Vine B Digital // 3D Vault <vault@vinebdigital.store>');
  const [contentHtml, setContentHtml] = useState(BROADCAST_STARTER_TEMPLATES[0].content);

  // Editor mode: visual or raw code
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual');
  // Preview mode: desktop or mobile
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Test send state
  const [testEmailRecipient, setTestEmailRecipient] = useState(adminEmail || SUPER_ADMIN_EMAIL);
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Live broadcast dispatch state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState({
    sent: 0,
    total: 0,
    failed: 0,
    currentEmail: '',
  });

  // History state
  const [campaignHistory, setCampaignHistory] = useState<BroadcastCampaignRecord[]>(() =>
    getAllBroadcastCampaigns()
  );

  // Modals for quick insert
  const [activeInsertModal, setActiveInsertModal] = useState<
    'video' | 'image' | 'button' | 'prompt' | 'badge' | null
  >(null);

  // Insert form fields
  const [insertVideoUrl, setInsertVideoUrl] = useState('https://vinebdigital.store/#theater');
  const [insertVideoThumb, setInsertVideoThumb] = useState(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80'
  );
  const [insertVideoTitle, setInsertVideoTitle] = useState(
    'Zero to Production: Building Award-Winning 3D Experiences'
  );
  const [insertVideoDuration, setInsertVideoDuration] = useState('12:45 MINS');

  const [insertImageUrl, setInsertImageUrl] = useState(
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&q=80'
  );
  const [insertImageAlt, setInsertImageAlt] = useState('3D WebGL Showcase');
  const [insertImageLink, setInsertImageLink] = useState('https://vinebdigital.store/#catalog');

  const [insertButtonText, setInsertButtonText] = useState('Explore 3D Prompts Vault →');
  const [insertButtonUrl, setInsertButtonUrl] = useState('https://vinebdigital.store/#portal');
  const [insertButtonColor, setInsertButtonColor] = useState('blue');

  const [insertPromptCode, setInsertPromptCode] = useState(
    `<Canvas camera={{ position: [0, 0, 5], fov: 45 }}>\n  <ambientLight intensity={0.5} />\n  <LiquidMercurySphere speed={1.2} roughness={0.1} />\n</Canvas>`
  );

  const [insertBadgeText, setInsertBadgeText] = useState('🔥 LIMITED TIME 50% OFF');

  // Load cloud history on mount
  useEffect(() => {
    fetchCloudBroadcastCampaigns().then((list) => {
      if (list && list.length > 0) {
        setCampaignHistory(list);
      }
    });

    const handleUpdate = () => {
      setCampaignHistory(getAllBroadcastCampaigns());
    };
    window.addEventListener('apex_broadcast_updated', handleUpdate);
    return () => window.removeEventListener('apex_broadcast_updated', handleUpdate);
  }, []);

  // Compute audience lists
  const audienceAll = useMemo(() => getBroadcastAudience('all'), []);
  const audiencePaid = useMemo(() => getBroadcastAudience('paid_only'), []);
  const audienceLeads = useMemo(() => getBroadcastAudience('leads_only'), []);

  const currentAudience = useMemo(() => {
    return getBroadcastAudience(audienceFilter, customEmailsInput);
  }, [audienceFilter, customEmailsInput]);

  // Filtered recipients in drawer
  const filteredDrawerRecipients = useMemo(() => {
    if (!recipientSearch.trim()) return currentAudience;
    const q = recipientSearch.toLowerCase();
    return currentAudience.filter(
      (c) => c.email.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [currentAudience, recipientSearch]);

  // Mock sample contact for live preview
  const sampleContact: BroadcastContact = useMemo(() => {
    return {
      name: 'Neeraj Kumar',
      email: testEmailRecipient || 'creator@vinebdigital.store',
      isPaid: true,
      tierName: 'Lifetime VIP All-Access',
      licenseKey: 'LIC-VIP-8860-9971',
      orderNumber: 'APX-LIVE-8860',
      source: 'preview_sample',
    };
  }, [testEmailRecipient]);

  // Live rendered HTML for preview
  const renderedPreviewHtml = useMemo(() => {
    return buildBroadcastHtml({
      subject,
      preheader,
      contentHtml,
      theme,
      contact: sampleContact,
    });
  }, [subject, preheader, contentHtml, theme, sampleContact]);

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    sound.playClick();
    const t = BROADCAST_STARTER_TEMPLATES.find((x) => x.id === templateId);
    if (!t) return;
    setSelectedTemplateId(t.id);
    setTheme(t.theme);
    setSubject(t.subject);
    setPreheader(t.preheader);
    setContentHtml(t.content);
    showToast(`Loaded "${t.name}" template`);
  };

  // Insert code into contentHtml at cursor or appended
  const insertSnippet = (snippetHtml: string) => {
    sound.playSuccess();
    setContentHtml((prev) => prev + '\n\n' + snippetHtml);
    setActiveInsertModal(null);
    showToast('Element inserted into email body');
  };

  // Send test email
  const handleSendTest = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      showToast('Please enter a valid test recipient email address.');
      return;
    }
    sound.playClick();
    setIsSendingTest(true);
    try {
      const res = await sendBroadcastTestEmail({
        testRecipient: testEmailRecipient,
        subject,
        preheader,
        contentHtml,
        theme,
        fromName,
      });

      if (res.success) {
        sound.playSuccess();
        showToast(`Test email successfully delivered to ${testEmailRecipient}!`);
      } else {
        showToast(`Test send error: ${res.message}`);
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Failed to dispatch test email.'}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  // Execute full broadcast
  const handleStartBroadcast = async () => {
    setIsConfirmModalOpen(false);
    if (currentAudience.length === 0) {
      showToast('No recipients found in selected audience.');
      return;
    }

    sound.playSuccess();
    setIsBroadcasting(true);
    setBroadcastProgress({
      sent: 0,
      total: currentAudience.length,
      failed: 0,
      currentEmail: 'Initializing dispatch pipeline...',
    });

    try {
      const record = await dispatchBatchBroadcast({
        campaign: {
          subject,
          preheader,
          theme,
          contentHtml,
          fromName,
          targetAudience: audienceFilter,
          customEmailList: audienceFilter === 'custom' ? customEmailsInput : undefined,
          totalRecipients: currentAudience.length,
          senderEmail: adminEmail,
        },
        onProgress: (sent, total, failed, currentEmail) => {
          setBroadcastProgress({
            sent,
            total,
            failed,
            currentEmail,
          });
        },
      });

      setCampaignHistory(getAllBroadcastCampaigns());
      sound.playSuccess();
      showToast(
        `Broadcast completed! Delivered to ${record.successCount} of ${record.totalRecipients} subscribers.`
      );
    } catch (err: any) {
      showToast(`Broadcast terminated: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Re-use a previous campaign
  const handleReuseCampaign = (camp: BroadcastCampaignRecord) => {
    sound.playClick();
    setSubject(camp.subject);
    setPreheader(camp.preheader || '');
    setTheme(camp.theme);
    setContentHtml(camp.contentHtml);
    setAudienceFilter(camp.targetAudience);
    if (camp.customEmailList) {
      setCustomEmailsInput(camp.customEmailList);
    }
    showToast(`Loaded broadcast "${camp.subject}" into editor`);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Delete history
  const handleDeleteCampaign = async (id: string) => {
    sound.playClick();
    await deleteBroadcastCampaign(id);
    setCampaignHistory(getAllBroadcastCampaigns());
    showToast('Broadcast record removed.');
  };

  return (
    <div className="space-y-8 animate-role-fade-in">
      {/* 1. Header Banner & Audience Overview */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-indigo-950/40 border border-cyan-500/30 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>SUPER ADMIN BROADCAST &amp; CAMPAIGN STUDIO</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Email Broadcast to All Subscribers
            </h2>
            <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Design high-converting broadcast emails with complete freedom: embed videos, images, custom HTML, dynamic tags, and deliver with guaranteed inbox deliverability.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-center min-w-[100px]">
              <div className="text-xs font-mono text-zinc-400">Total Contacts</div>
              <div className="text-2xl font-bold font-mono text-white">{audienceAll.length}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-center min-w-[100px]">
              <div className="text-xs font-mono text-emerald-400">Paid VIPs</div>
              <div className="text-2xl font-bold font-mono text-emerald-300">
                {audiencePaid.length}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-center min-w-[100px]">
              <div className="text-xs font-mono text-cyan-400">Free Leads</div>
              <div className="text-2xl font-bold font-mono text-cyan-300">
                {audienceLeads.length}
              </div>
            </div>
          </div>
        </div>

        {/* Audience Filter Pills */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-zinc-400 mr-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-zinc-400" /> Target Audience:
            </span>

            <button
              onClick={() => {
                sound.playClick();
                setAudienceFilter('all');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                audienceFilter === 'all'
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30 font-bold'
                  : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              All Subscribers ({audienceAll.length})
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setAudienceFilter('paid_only');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                audienceFilter === 'paid_only'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 font-bold'
                  : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              Paid Customers Only ({audiencePaid.length})
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setAudienceFilter('leads_only');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                audienceFilter === 'leads_only'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 font-bold'
                  : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              Free Leads &amp; Magnet Signups ({audienceLeads.length})
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setAudienceFilter('custom');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                audienceFilter === 'custom'
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30 font-bold'
                  : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              Custom Email List
            </button>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setShowRecipientDrawer(!showRecipientDrawer);
            }}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 py-1 px-3 rounded-lg bg-cyan-950/50 border border-cyan-500/30 transition-all hover:bg-cyan-900/50"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>
              {showRecipientDrawer ? 'Hide Recipient List' : `Inspect Recipients (${currentAudience.length})`}
            </span>
          </button>
        </div>

        {/* Custom Email List Input (if custom selected) */}
        {audienceFilter === 'custom' && (
          <div className="mt-4 p-4 rounded-xl bg-purple-950/20 border border-purple-500/30">
            <label className="block text-xs font-mono text-purple-300 mb-2">
              Paste recipient email addresses (separated by commas or new lines):
            </label>
            <textarea
              value={customEmailsInput}
              onChange={(e) => setCustomEmailsInput(e.target.value)}
              placeholder="client1@agency.com&#10;developer@studio.io&#10;founder@tech.xyz"
              rows={3}
              className="w-full bg-black/60 border border-purple-500/30 rounded-lg p-3 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
            />
            <div className="text-[11px] text-zinc-400 mt-1 font-mono">
              Recognized: <strong className="text-purple-300">{currentAudience.length}</strong> unique valid email addresses
            </div>
          </div>
        )}

        {/* Inspect Recipients Drawer */}
        {showRecipientDrawer && (
          <div className="mt-4 p-4 rounded-xl bg-black/70 border border-white/15 max-h-72 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-mono font-semibold text-zinc-300">
                Active Audience ({currentAudience.length} recipients)
              </span>
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  value={recipientSearch}
                  onChange={(e) => setRecipientSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-white font-mono placeholder-zinc-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="divide-y divide-zinc-800">
              {filteredDrawerRecipients.slice(0, 100).map((c, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{c.name}</span>
                    <span className="text-zinc-400 font-mono">&lt;{c.email}&gt;</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.isPaid ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {c.tierName || 'Paid Customer'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        Lead Magnet / Free
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {filteredDrawerRecipients.length === 0 && (
                <div className="py-4 text-center text-xs text-zinc-500">No matching contacts found.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Starter Template Picker & Themes */}
      <div className="bg-[#0b0c16] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>1-Click High-Converting Starter Templates</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Select a pre-designed layout or customize everything to your vision.
            </p>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">Theme:</span>
            <select
              value={theme}
              onChange={(e) => {
                sound.playClick();
                setTheme(e.target.value as BroadcastThemeId);
              }}
              className="bg-black/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono rounded-lg px-3 py-1.5 focus:outline-none"
            >
              <option value="cyber_dark">Cyber Dark Obsidian (Tech / 3D)</option>
              <option value="royal_indigo">Royal Indigo Luxury (Agency / VIP)</option>
              <option value="clean_light">Clean Modern Light (Newsletter)</option>
              <option value="video_showcase">Video &amp; Masterclass Drop (YouTube/Loom)</option>
              <option value="raw_custom">🎨 Blank Canvas (100% Raw Custom HTML)</option>
            </select>
          </div>
        </div>

        {/* Template Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {BROADCAST_STARTER_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handleSelectTemplate(tmpl.id)}
              className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                selectedTemplateId === tmpl.id
                  ? 'bg-cyan-950/40 border-cyan-400/60 shadow-md shadow-cyan-500/20'
                  : 'bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-white mb-1">{tmpl.name}</div>
                <div className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {tmpl.description}
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-cyan-400">
                <span>Theme: {tmpl.theme}</span>
                <span className="underline">Load Draft</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Composer Studio & Live Preview Side-by-Side */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Editor & Controls (7 Cols) */}
        <div className="xl:col-span-7 bg-[#0b0c16] border border-white/10 rounded-2xl p-6 space-y-6">
          {/* Header & Meta Inputs */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono font-semibold text-zinc-300">
                  Email Subject Line
                </label>
                <span className="text-[10px] font-mono text-zinc-500">
                  {subject.length} chars (Best: 40-60)
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="⚡ Special Announcement for 3D Creators..."
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
              {/* Quick Emojis / Tags */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] font-mono text-zinc-400">Insert tag:</span>
                {['{{name}}', '{{first_name}}', '{{license_key}}'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      sound.playClick();
                      setSubject((prev) => prev + ` ${tag}`);
                    }}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-cyan-300 font-mono text-[10px] border border-zinc-700 transition-colors"
                  >
                    +{tag}
                  </button>
                ))}
                <span className="text-[10px] font-mono text-zinc-500 ml-2">Quick emoji:</span>
                {['⚡', '🚀', '🔥', '🎬', '💎', '🎁'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSubject((prev) => `${emoji} ` + prev)}
                    className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Preheader Preview Text */}
            <div>
              <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1.5">
                Preheader Snippet (Preview text shown in Gmail / Outlook before opening)
              </label>
              <input
                type="text"
                value={preheader}
                onChange={(e) => setPreheader(e.target.value)}
                placeholder="Explore the newly released fluid liquid simulation and WebGL prompts."
                className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* From Address */}
            <div>
              <label className="block text-xs font-mono font-semibold text-zinc-300 mb-1.5">
                From Name &amp; Sender Signature
              </label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-zinc-300 font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Quick Insert Elements Toolbar */}
          <div className="p-3 rounded-xl bg-black/50 border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Freedom Toolbar (1-Click Embeds)</span>
              </span>
              <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-700">
                <button
                  onClick={() => setEditorMode('visual')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                    editorMode === 'visual'
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Visual Blocks
                </button>
                <button
                  onClick={() => setEditorMode('code')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                    editorMode === 'code'
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Raw HTML Code
                </button>
              </div>
            </div>

            {/* Insertion Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => setActiveInsertModal('video')}
                className="px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/30 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Video className="w-3.5 h-3.5 text-red-400" />
                <span>+ Embed Video Card</span>
              </button>

              <button
                onClick={() => setActiveInsertModal('image')}
                className="px-2.5 py-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 text-blue-300 border border-blue-500/30 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm"
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>+ Embed Image</span>
              </button>

              <button
                onClick={() => setActiveInsertModal('button')}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-500/30 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Link className="w-3.5 h-3.5 text-indigo-400" />
                <span>+ Add CTA Button</span>
              </button>

              <button
                onClick={() => setActiveInsertModal('prompt')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Code className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ 3D Prompt Box</span>
              </button>

              <button
                onClick={() => setActiveInsertModal('badge')}
                className="px-2.5 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-500/30 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Promo Badge</span>
              </button>

              <button
                onClick={() => {
                  insertSnippet(
                    '<hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.12); margin: 28px 0;" />'
                  );
                }}
                className="px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors"
                title="Insert horizontal divider line"
              >
                — Divider
              </button>
            </div>
          </div>

          {/* HTML Editor Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-semibold text-zinc-300">
                Email Body Content (Full HTML &amp; Inline CSS Freedom)
              </label>
              <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400">
                <span>Variables:</span>
                <span className="text-zinc-400">
                  <code className="text-cyan-300">{'{{name}}'}</code>,{' '}
                  <code className="text-cyan-300">{'{{portal_url}}'}</code>,{' '}
                  <code className="text-cyan-300">{'{{license_key}}'}</code>
                </span>
              </div>
            </div>

            <textarea
              value={contentHtml}
              onChange={(e) => setContentHtml(e.target.value)}
              rows={16}
              className="w-full bg-black/80 border border-white/15 rounded-xl p-4 text-xs font-mono text-zinc-200 leading-relaxed focus:outline-none focus:border-cyan-400 transition-colors"
              placeholder="Write your email body in HTML or plain text with inline styling..."
            />
          </div>

          {/* Test Dispatch Bar */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-900 to-black border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-auto flex-1">
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                Deliver Test Email to Your Inbox First:
              </label>
              <input
                type="email"
                value={testEmailRecipient}
                onChange={(e) => setTestEmailRecipient(e.target.value)}
                placeholder="you@vinebdigital.store"
                className="w-full bg-black border border-white/15 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <button
              onClick={handleSendTest}
              disabled={isSendingTest}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95 disabled:opacity-50"
            >
              {isSendingTest ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : (
                <MailCheck className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>{isSendingTest ? 'Delivering Test...' : 'Send Test Email'}</span>
            </button>
          </div>

          {/* Final Broadcast Action Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                sound.playClick();
                setIsConfirmModalOpen(true);
              }}
              disabled={isBroadcasting || currentAudience.length === 0}
              className="w-full py-4 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:brightness-110 shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>
                Broadcast to {currentAudience.length} Subscribers Now ({audienceFilter.toUpperCase()})
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Dual-View Real-Time Preview (5 Cols) */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-[#0b0c16] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Live Inbox Preview
                </span>
              </div>

              {/* Device Selector */}
              <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-700">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded transition-colors ${
                    previewDevice === 'desktop'
                      ? 'bg-cyan-500 text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Desktop Preview (600px)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded transition-colors ${
                    previewDevice === 'mobile'
                      ? 'bg-cyan-500 text-black'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Mobile Phone Preview (375px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Email Header Preview Simulation */}
            <div className="p-3 rounded-lg bg-black/60 border border-white/10 text-xs space-y-1 font-mono">
              <div className="text-zinc-400 truncate">
                <span className="text-zinc-500">From:</span> {fromName}
              </div>
              <div className="text-zinc-400 truncate">
                <span className="text-zinc-500">To:</span> {sampleContact.name} &lt;{sampleContact.email}&gt;
              </div>
              <div className="text-white font-semibold truncate pt-1 border-t border-zinc-800">
                <span className="text-zinc-500">Subject:</span>{' '}
                {interpolateMergeTags(subject, sampleContact)}
              </div>
              {preheader && (
                <div className="text-zinc-400 text-[11px] truncate">
                  <span className="text-zinc-500">Preheader:</span>{' '}
                  {interpolateMergeTags(preheader, sampleContact)}
                </div>
              )}
            </div>

            {/* Actual Live Rendered Email HTML in Sandbox */}
            <div className="flex justify-center bg-zinc-950/80 p-3 rounded-xl border border-white/10 min-h-[500px]">
              <div
                className={`w-full transition-all duration-300 ${
                  previewDevice === 'mobile'
                    ? 'max-w-[375px] rounded-3xl border-4 border-zinc-700 shadow-2xl overflow-hidden'
                    : 'max-w-full'
                }`}
              >
                <iframe
                  title="Email Preview"
                  srcDoc={renderedPreviewHtml}
                  className="w-full h-[620px] rounded-xl bg-white border-0"
                />
              </div>
            </div>

            <div className="text-center text-[11px] font-mono text-zinc-500">
              ⚡ Renders live with sample recipient: <strong className="text-zinc-300">{sampleContact.name}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Broadcast History & Delivery Logs */}
      <div className="bg-[#0b0c16] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Broadcast Campaign History ({campaignHistory.length})</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Persistent cloud record of all dispatches sent to subscribers.
            </p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              fetchCloudBroadcastCampaigns().then((l) => setCampaignHistory(l));
              showToast('History refreshed.');
            }}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Refresh history"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {campaignHistory.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 font-mono text-xs">
            No broadcast campaigns sent yet. Ready for your first transmission!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-zinc-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-3">Dispatched Date</th>
                  <th className="p-3">Subject Line</th>
                  <th className="p-3">Audience</th>
                  <th className="p-3">Theme</th>
                  <th className="p-3">Delivery Rate</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {campaignHistory.map((camp) => (
                  <tr key={camp.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 text-zinc-400 font-mono">
                      {new Date(camp.createdAt).toLocaleDateString()}{' '}
                      <span className="text-zinc-500">
                        {new Date(camp.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-white max-w-xs truncate">
                      {camp.subject}
                    </td>
                    <td className="p-3 font-mono text-zinc-300">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px]">
                        {camp.targetAudience.toUpperCase()} ({camp.totalRecipients})
                      </span>
                    </td>
                    <td className="p-3 font-mono text-zinc-400">{camp.theme}</td>
                    <td className="p-3 font-mono">
                      <span className="text-emerald-400 font-bold">{camp.successCount} sent</span>
                      {camp.failureCount > 0 && (
                        <span className="text-red-400 ml-1.5">({camp.failureCount} failed)</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                          camp.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : camp.status === 'failed'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {camp.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleReuseCampaign(camp)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono"
                          title="Re-open in composer"
                        >
                          Re-use
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(camp.id)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal Before Launching Full Broadcast */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e0f1a] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
                <Send className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Confirm Broadcast Transmission</h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Super Admin Dispatch Pipeline
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Recipients:</span>
                <span className="font-mono font-bold text-cyan-300">
                  {currentAudience.length} Subscribers
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Target Segment:</span>
                <span className="font-mono text-white capitalize">{audienceFilter.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Subject:</span>
                <span className="font-semibold text-white truncate max-w-xs">{subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Theme:</span>
                <span className="font-mono text-zinc-300">{theme}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                Emails will be sent in throttled batches to ensure 100% verified deliverability.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartBroadcast}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-500/30 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit Broadcast Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcasting Live Progress Overlay */}
      {isBroadcasting && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a14] border border-cyan-500/50 rounded-2xl p-6 shadow-2xl text-center space-y-5 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border-2 border-cyan-400 mx-auto flex items-center justify-center animate-pulse">
              <Send className="w-7 h-7 text-cyan-400 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Transmitting Live Broadcast</h3>
              <p className="text-xs text-zinc-400 font-mono">
                Delivering via High-Speed Pipeline &bull; Rate-Limited Throttling Active
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300 shadow-sm shadow-cyan-400"
                  style={{
                    width: `${
                      broadcastProgress.total > 0
                        ? Math.round((broadcastProgress.sent / broadcastProgress.total) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-xs font-mono text-zinc-400">
                <span>
                  {broadcastProgress.sent} of {broadcastProgress.total} processed
                </span>
                <span className="text-cyan-400 font-bold">
                  {broadcastProgress.total > 0
                    ? Math.round((broadcastProgress.sent / broadcastProgress.total) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-black/60 border border-white/10 text-xs font-mono text-zinc-400 truncate">
              Currently delivering: <span className="text-white">{broadcastProgress.currentEmail}</span>
            </div>
          </div>
        </div>
      )}

      {/* Insert Video Card Modal */}
      {activeInsertModal === 'video' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e0f1a] border border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-red-400" />
                <span>Embed High-Deliverability Video Card</span>
              </h3>
              <button
                onClick={() => setActiveInsertModal(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-mono mb-1">
                  Video URL (YouTube, Vimeo, Loom or Website Link)
                </label>
                <input
                  type="text"
                  value={insertVideoUrl}
                  onChange={(e) => setInsertVideoUrl(e.target.value)}
                  className="w-full bg-black/70 border border-zinc-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-mono mb-1">
                  Video Thumbnail Image URL (HD JPG/PNG/WebP)
                </label>
                <input
                  type="text"
                  value={insertVideoThumb}
                  onChange={(e) => setInsertVideoThumb(e.target.value)}
                  className="w-full bg-black/70 border border-zinc-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-mono mb-1">Video Title / Topic</label>
                  <input
                    type="text"
                    value={insertVideoTitle}
                    onChange={(e) => setInsertVideoTitle(e.target.value)}
                    className="w-full bg-black/70 border border-zinc-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-mono mb-1">Duration Tag</label>
                  <input
                    type="text"
                    value={insertVideoDuration}
                    onChange={(e) => setInsertVideoDuration(e.target.value)}
                    className="w-full bg-black/70 border border-zinc-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveInsertModal(null)}
                className="px-4 py-2 rounded-lg text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const snippet = `<!-- Video Card Embed -->
<div style="margin: 24px 0; text-align: center;">
  <a href="${insertVideoUrl}" style="text-decoration: none; display: block; position: relative; border-radius: 14px; overflow: hidden; border: 1px solid rgba(239, 68, 68, 0.4); background: #000000;">
    <img src="${insertVideoThumb}" alt="${insertVideoTitle}" style="width: 100%; max-height: 280px; object-fit: cover; display: block; opacity: 0.85;" />
    <div style="background: rgba(15, 15, 20, 0.9); padding: 14px 20px; text-align: left; border-top: 1px solid rgba(255,255,255,0.1);">
      <div style="font-size: 11px; font-family: monospace; color: #ef4444; font-weight: bold; text-transform: uppercase;">
        ▶ PLAY VIDEO &bull; ${insertVideoDuration}
      </div>
      <div style="font-size: 15px; font-weight: 700; color: #ffffff; margin-top: 4px;">
        ${insertVideoTitle}
      </div>
    </div>
  </a>
</div>`;
                  insertSnippet(snippet);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white"
              >
                Insert Video Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Image Modal */}
      {activeInsertModal === 'image' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e0f1a] border border-blue-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span>Embed Responsive Image</span>
              </h3>
              <button
                onClick={() => setActiveInsertModal(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-mono mb-1">Image URL</label>
                <input
                  type="text"
                  value={insertImageUrl}
                  onChange={(e) => setInsertImageUrl(e.target.value)}
                  className="w-full bg-black/70 border border-zinc-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-mono mb-1">Alt Text</label>
                <input
                  type="text"
                  value={insertImageAlt}
                  onChange={(e) => setInsertImageAlt(e.target.value)}
                  className="w-full bg-black/70 border border-zinc-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-mono mb-1">Link URL (Optional)</label>
                <input
                  type="text"
                  value={insertImageLink}
                  onChange={(e) => setInsertImageLink(e.target.value)}
                  className="w-full bg-black/70 border border-zinc-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveInsertModal(null)}
                className="px-4 py-2 rounded-lg text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const imgTag = `<img src="${insertImageUrl}" alt="${insertImageAlt}" style="width: 100%; max-width: 536px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); margin: 20px 0; display: block;" />`;
                  const snippet = insertImageLink
                    ? `<a href="${insertImageLink}" style="display: block; text-decoration: none;">${imgTag}</a>`
                    : imgTag;
                  insertSnippet(snippet);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Button Modal */}
      {activeInsertModal === 'button' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e0f1a] border border-indigo-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Link className="w-4 h-4 text-indigo-400" />
                <span>Add High-Impact CTA Button</span>
              </h3>
              <button
                onClick={() => setActiveInsertModal(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-mono mb-1">Button Text</label>
                <input
                  type="text"
                  value={insertButtonText}
                  onChange={(e) => setInsertButtonText(e.target.value)}
                  className="w-full bg-black/70 border border-zinc-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-mono mb-1">Button Destination URL</label>
                <input
                  type="text"
                  value={insertButtonUrl}
                  onChange={(e) => setInsertButtonUrl(e.target.value)}
                  className="w-full bg-black/70 border border-zinc-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-mono mb-1">Color Gradient</label>
                <select
                  value={insertButtonColor}
                  onChange={(e) => setInsertButtonColor(e.target.value)}
                  className="w-full bg-black/70 border border-zinc-700 rounded-lg p-2.5 text-white font-mono"
                >
                  <option value="blue">Electric Sky Blue (0284c7 → 6366f1)</option>
                  <option value="indigo">Royal Purple (4f46e5 → 9333ea)</option>
                  <option value="amber">Flash Gold / Amber (d97706 → f59e0b)</option>
                  <option value="red">High-Alert Crimson (dc2626 → b91c1c)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveInsertModal(null)}
                className="px-4 py-2 rounded-lg text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  let bgGradient = 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)';
                  let shadow = 'rgba(2, 132, 199, 0.4)';
                  if (insertButtonColor === 'indigo') {
                    bgGradient = 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)';
                    shadow = 'rgba(79, 70, 229, 0.4)';
                  } else if (insertButtonColor === 'amber') {
                    bgGradient = 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)';
                    shadow = 'rgba(245, 158, 11, 0.4)';
                  } else if (insertButtonColor === 'red') {
                    bgGradient = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
                    shadow = 'rgba(220, 38, 38, 0.4)';
                  }

                  const snippet = `<div style="text-align: center; margin: 32px 0 24px 0;">
  <a href="${insertButtonUrl}" style="display: inline-block; background: ${bgGradient}; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 34px; border-radius: 999px; box-shadow: 0 10px 25px ${shadow}; text-transform: uppercase; letter-spacing: 0.5px;">
    ${insertButtonText}
  </a>
</div>`;
                  insertSnippet(snippet);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Insert Button
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Prompt Box Modal */}
      {activeInsertModal === 'prompt' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e0f1a] border border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <span>Insert 3D Prompt / Code Terminal Box</span>
              </h3>
              <button
                onClick={() => setActiveInsertModal(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block text-zinc-300 font-mono mb-1">
                Prompt / WebGL Code Snippet:
              </label>
              <textarea
                value={insertPromptCode}
                onChange={(e) => setInsertPromptCode(e.target.value)}
                rows={5}
                className="w-full bg-black/70 border border-zinc-700 rounded-lg p-2.5 text-emerald-400 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveInsertModal(null)}
                className="px-4 py-2 rounded-lg text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const encoded = insertPromptCode
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\n/g, '<br />');
                  const snippet = `<div style="background: #000000; border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 16px; margin: 24px 0; font-family: monospace; font-size: 12px; color: #38bdf8; overflow-x: auto;">
  <span style="color: #64748b;">// 3D WebGL Prompt Snippet:</span><br />
  ${encoded}
</div>`;
                  insertSnippet(snippet);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Insert Code Terminal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Promo Badge Modal */}
      {activeInsertModal === 'badge' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e0f1a] border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Insert Promotional Badge Banner</span>
              </h3>
              <button
                onClick={() => setActiveInsertModal(null)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block text-zinc-300 font-mono mb-1">Banner Tag Text:</label>
              <input
                type="text"
                value={insertBadgeText}
                onChange={(e) => setInsertBadgeText(e.target.value)}
                className="w-full bg-black/70 border border-zinc-700 rounded-lg p-2.5 text-white font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveInsertModal(null)}
                className="px-4 py-2 rounded-lg text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const snippet = `<div style="text-align: center; margin: 24px 0 16px 0;">
  <span style="display: inline-block; background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4); font-size: 11px; font-family: monospace; font-weight: bold; text-transform: uppercase; padding: 6px 16px; border-radius: 999px; letter-spacing: 1px;">
    ${insertBadgeText}
  </span>
</div>`;
                  insertSnippet(snippet);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white"
              >
                Insert Badge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
