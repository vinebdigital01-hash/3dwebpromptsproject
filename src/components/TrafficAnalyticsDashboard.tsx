// ==========================================
// APEX3D VAULT // Traffic & Ad Journey Analytics Dashboard
// Real-time Meta Ads, Google Ads & Organic Visitor Journeys & Conversion Funnel
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Users,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Clock,
  ArrowUpRight,
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MousePointerClick,
  Copy,
  ShoppingBag,
  Zap,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Compass,
  Radio,
  BarChart3,
  Layers,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import {
  VisitorSession,
  TrafficChannel,
  isAdminDevice,
  setAdminDeviceExclusion,
} from '../lib/visitorTracker';
import {
  subscribeToVisitorSessions,
  purgeAllVisitorAnalyticsFromFirestore,
} from '../lib/firebase';
import { sound } from '../lib/audioEngine';

interface TrafficAnalyticsDashboardProps {
  onShowToast: (msg: string) => void;
}

export const TrafficAnalyticsDashboard: React.FC<TrafficAnalyticsDashboardProps> = ({ onShowToast }) => {
  const [sessions, setSessions] = useState<VisitorSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'all' | TrafficChannel>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'leads' | 'buyers'>('all');
  const [expandedSessionIds, setExpandedSessionIds] = useState<Set<string>>(new Set());
  const [isPurging, setIsPurging] = useState(false);
  const [isDeviceExcluded, setIsDeviceExcluded] = useState<boolean>(() => isAdminDevice());

  const handleToggleDeviceExclusion = () => {
    sound.playClick();
    const next = !isDeviceExcluded;
    setAdminDeviceExclusion(next);
    setIsDeviceExcluded(next);
    if (next) {
      onShowToast('🛡️ Admin Device Shield: This device is now INVISIBLE to analytics.');
    } else {
      onShowToast('🧪 Test Tracking Active: This device will now appear on the live dashboard! Open homepage in another tab to test.');
    }
  };

  // Subscribe to real-time visitor sessions from Cloud Firestore
  useEffect(() => {
    setIsLoading(true);
    const unsub = subscribeToVisitorSessions((cloudSessions) => {
      setSessions(cloudSessions || []);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  // Toggle timeline expansion for a specific visitor
  const toggleTimeline = (sessionId: string) => {
    sound.playClick();
    setExpandedSessionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return next;
    });
  };

  // Expand / Collapse all
  const toggleAllTimelines = () => {
    sound.playClick();
    if (expandedSessionIds.size > 0) {
      setExpandedSessionIds(new Set());
    } else {
      setExpandedSessionIds(new Set(filteredSessions.slice(0, 30).map((s) => s.sessionId)));
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const now = Date.now();
    const todayStr = new Date().toISOString().slice(0, 10);

    let onlineCount = 0;
    let todayCount = 0;
    let metaAdsCount = 0;
    let googleAdsCount = 0;
    let organicSearchCount = 0;
    let organicSocialCount = 0;
    let directCount = 0;
    let freeCopiesCount = 0;
    let leadsCount = 0;
    let checkoutsCount = 0;
    let paidCount = 0;
    let totalDwellSec = 0;

    sessions.forEach((s) => {
      const lastActiveMs = new Date(s.lastActiveAt || s.firstSeenAt || 0).getTime();
      const isOnline = now - lastActiveMs < 60000; // active within last 60s
      if (isOnline) onlineCount++;

      const firstSeenDate = (s.firstSeenAt || '').slice(0, 10);
      if (firstSeenDate === todayStr) todayCount++;

      if (s.channel === 'meta_ads') metaAdsCount++;
      else if (s.channel === 'google_ads') googleAdsCount++;
      else if (s.channel === 'organic_search') organicSearchCount++;
      else if (s.channel === 'organic_social') organicSocialCount++;
      else directCount++;

      if (s.hasClickedFreeCopy) freeCopiesCount++;
      if (s.hasSubmittedLead || s.leadEmail) leadsCount++;
      if (s.hasInitiatedCheckout) checkoutsCount++;
      if (s.hasConvertedPaid) paidCount++;

      totalDwellSec += s.durationSeconds || 0;
    });

    const totalVisitors = sessions.length || 1;
    const paidAdsTotal = metaAdsCount + googleAdsCount;
    const organicTotal = organicSearchCount + organicSocialCount + directCount;
    const avgDuration = Math.round(totalDwellSec / totalVisitors);

    const conversionRate = totalVisitors > 0 ? ((leadsCount / totalVisitors) * 100).toFixed(1) : '0.0';
    const checkoutRate = totalVisitors > 0 ? ((checkoutsCount / totalVisitors) * 100).toFixed(1) : '0.0';

    return {
      onlineCount,
      todayCount,
      totalVisitors: sessions.length,
      paidAdsTotal,
      paidAdsPct: totalVisitors > 0 ? Math.round((paidAdsTotal / totalVisitors) * 100) : 0,
      organicTotal,
      organicPct: totalVisitors > 0 ? Math.round((organicTotal / totalVisitors) * 100) : 0,
      metaAdsCount,
      googleAdsCount,
      organicSearchCount,
      organicSocialCount,
      directCount,
      freeCopiesCount,
      leadsCount,
      checkoutsCount,
      paidCount,
      conversionRate,
      checkoutRate,
      avgDurationFormatted: formatDuration(avgDuration),
    };
  }, [sessions]);

  // Source / Campaign Breakdown Aggregation
  const sourceBreakdown = useMemo(() => {
    const map = new Map<string, {
      name: string;
      channel: TrafficChannel;
      campaign: string;
      visitors: number;
      freeCopies: number;
      leads: number;
      checkouts: number;
      paid: number;
      totalDuration: number;
    }>();

    sessions.forEach((s) => {
      const channelLabel =
        s.channel === 'meta_ads'
          ? 'Meta Ads'
          : s.channel === 'google_ads'
          ? 'Google Ads'
          : s.channel === 'organic_search'
          ? 'Organic Search'
          : s.channel === 'organic_social'
          ? 'Organic Social'
          : 'Direct';

      const campaignName = s.utm?.campaign || s.utm?.source || (s.channel === 'direct' ? 'Direct Visit' : 'Organic');
      const key = `${s.channel}:${campaignName}`;

      const existing = map.get(key) || {
        name: channelLabel,
        channel: s.channel,
        campaign: campaignName,
        visitors: 0,
        freeCopies: 0,
        leads: 0,
        checkouts: 0,
        paid: 0,
        totalDuration: 0,
      };

      existing.visitors += 1;
      if (s.hasClickedFreeCopy) existing.freeCopies += 1;
      if (s.hasSubmittedLead || s.leadEmail) existing.leads += 1;
      if (s.hasInitiatedCheckout) existing.checkouts += 1;
      if (s.hasConvertedPaid) existing.paid += 1;
      existing.totalDuration += s.durationSeconds || 0;

      map.set(key, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.visitors - a.visitors);
  }, [sessions]);

  // Filtered Sessions for the Real-Time Activity Feed
  const filteredSessions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const now = Date.now();

    return sessions.filter((s) => {
      // Channel filter
      if (selectedChannel !== 'all' && s.channel !== selectedChannel) return false;

      // Status filter
      if (statusFilter === 'online') {
        const lastActiveMs = new Date(s.lastActiveAt || s.firstSeenAt || 0).getTime();
        if (now - lastActiveMs >= 60000) return false;
      } else if (statusFilter === 'leads') {
        if (!s.hasSubmittedLead && !s.leadEmail) return false;
      } else if (statusFilter === 'buyers') {
        if (!s.hasConvertedPaid) return false;
      }

      // Search query
      if (query) {
        const matchId = s.sessionId.toLowerCase().includes(query);
        const matchCampaign = (s.utm?.campaign || '').toLowerCase().includes(query);
        const matchSource = (s.utm?.source || '').toLowerCase().includes(query);
        const matchEmail = (s.leadEmail || '').toLowerCase().includes(query);
        const matchName = (s.leadName || '').toLowerCase().includes(query);
        const matchCity = (s.location?.city || '').toLowerCase().includes(query);
        const matchCountry = (s.location?.country || '').toLowerCase().includes(query);
        if (!matchId && !matchCampaign && !matchSource && !matchEmail && !matchName && !matchCity && !matchCountry) {
          return false;
        }
      }

      return true;
    });
  }, [sessions, selectedChannel, statusFilter, searchQuery]);

  // Handle Purge All Analytics
  const handlePurgeAnalytics = async () => {
    sound.playClick();
    if (
      !window.confirm(
        '⚠️ ARE YOU SURE?\n\nThis will permanently delete ALL recorded visitor sessions and activity events from Cloud Firestore.\n\nUseful for resetting after testing.'
      )
    ) {
      return;
    }

    setIsPurging(true);
    try {
      await purgeAllVisitorAnalyticsFromFirestore();
      setSessions([]);
      onShowToast('Visitor analytics database has been reset.');
    } catch {
      onShowToast('Failed to reset visitor analytics.');
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="space-y-6 animate-role-fade-in text-white pb-12">
      {/* ========================================================================= */}
      {/* 0. ADMIN SELF-TRAFFIC PROTECTION BANNER */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#0c1424] to-[#070b14] border border-blue-500/25 shadow-lg shadow-black/40">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl border shrink-0 ${
              isDeviceExcluded
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}
          >
            {isDeviceExcluded ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                Admin Device Shield:
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                  isDeviceExcluded
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                }`}
              >
                {isDeviceExcluded ? 'ACTIVE · INVISIBLE' : 'TEST MODE · VISIBLE'}
              </span>
            </div>
            <p className="text-[11px] text-white/60 mt-0.5 font-mono">
              {isDeviceExcluded
                ? 'Your device visits are filtered out from Firestore and Meta Pixel. To test from this device, switch to Test Mode below or open an Incognito tab.'
                : 'This device is currently being tracked like a real visitor for live testing. You will see your actions in the stream below.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={handleToggleDeviceExclusion}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDeviceExcluded
                ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
            }`}
            title="Toggle tracking on this specific device"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isDeviceExcluded ? 'Allow Tracking This Device (Test Mode)' : 'Shield This Device (Excluded)'}</span>
          </button>

          <button
            onClick={handlePurgeAnalytics}
            disabled={isPurging}
            className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Reset test visitor analytics to 0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isPurging ? 'Purging...' : 'Purge Test Visits'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP EXECUTIVE KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        {/* Card 1: Live Visitors */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1e19] to-[#06110e] border border-emerald-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-white/60 text-[11px] font-mono mb-1.5">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              LIVE ONLINE NOW
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono">
            {stats.onlineCount}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-1 font-mono">
            Active within last 60 seconds
          </div>
        </div>

        {/* Card 2: Today's Total Visitors */}
        <div className="p-4 rounded-2xl bg-[#090d19] border border-blue-500/20">
          <div className="flex items-center justify-between text-white/50 text-[11px] font-mono mb-1.5">
            <span>TODAY&apos;S VISITORS</span>
            <Users className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {stats.todayCount}
          </div>
          <div className="text-[10px] text-blue-300/80 mt-1 font-mono">
            Total all-time: {stats.totalVisitors}
          </div>
        </div>

        {/* Card 3: Paid Ads (Meta + Google) */}
        <div className="p-4 rounded-2xl bg-[#140e1d] border border-purple-500/25">
          <div className="flex items-center justify-between text-white/50 text-[11px] font-mono mb-1.5">
            <span className="text-purple-300 font-semibold">PAID ADS TRAFFIC</span>
            <Zap className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-300 font-mono">
            {stats.paidAdsTotal} <span className="text-xs text-purple-400/80 font-normal">({stats.paidAdsPct}%)</span>
          </div>
          <div className="text-[10px] text-purple-300/70 mt-1 font-mono">
            Meta: {stats.metaAdsCount} · Google: {stats.googleAdsCount}
          </div>
        </div>

        {/* Card 4: Organic & Social */}
        <div className="p-4 rounded-2xl bg-[#0d1618] border border-teal-500/20">
          <div className="flex items-center justify-between text-white/50 text-[11px] font-mono mb-1.5">
            <span className="text-teal-300 font-semibold">ORGANIC &amp; DIRECT</span>
            <Globe className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-300 font-mono">
            {stats.organicTotal} <span className="text-xs text-teal-400/80 font-normal">({stats.organicPct}%)</span>
          </div>
          <div className="text-[10px] text-teal-300/70 mt-1 font-mono">
            Search: {stats.organicSearchCount} · Direct: {stats.directCount}
          </div>
        </div>

        {/* Card 5: Lead Conversion Rate */}
        <div className="p-4 rounded-2xl bg-[#181308] border border-amber-500/25 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-white/50 text-[11px] font-mono mb-1.5">
            <span className="text-amber-300 font-semibold">LEAD CONVERSION</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
            {stats.conversionRate}%
          </div>
          <div className="text-[10px] text-amber-300/70 mt-1 font-mono">
            {stats.leadsCount} leads · {stats.checkoutsCount} checkouts
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CONVERSION FUNNEL DROP-OFF PIPELINE */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#080c16] border border-white/10">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>Visitor Journey &amp; Conversion Funnel Drop-off</span>
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Tracks the step-by-step conversion pipeline from initial page landing to paid pass.
            </p>
          </div>
          <div className="text-xs font-mono text-white/60 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
            Avg Dwell Time: <strong className="text-blue-300">{stats.avgDurationFormatted}</strong>
          </div>
        </div>

        {/* Visual Multi-Stage Progress Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3">
          {/* Stage 1: Landed */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="text-[10px] font-mono uppercase text-white/40 mb-1">1. Landed</div>
            <div className="text-lg font-bold text-white font-mono">{stats.totalVisitors}</div>
            <div className="text-[11px] font-semibold text-blue-400 font-mono">100%</div>
          </div>

          {/* Stage 2: Scrolled > 50% */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="text-[10px] font-mono uppercase text-white/40 mb-1">2. Scrolled Prompts</div>
            <div className="text-lg font-bold text-white font-mono">
              {sessions.filter((s) => (s.maxScrollPercentage || 0) >= 50).length}
            </div>
            <div className="text-[11px] font-semibold text-blue-400 font-mono">
              {stats.totalVisitors > 0
                ? Math.round(
                    (sessions.filter((s) => (s.maxScrollPercentage || 0) >= 50).length / stats.totalVisitors) * 100
                  )
                : 0}
              %
            </div>
          </div>

          {/* Stage 3: Clicked Copy */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="text-[10px] font-mono uppercase text-white/40 mb-1">3. Clicked Copy</div>
            <div className="text-lg font-bold text-white font-mono">{stats.freeCopiesCount}</div>
            <div className="text-[11px] font-semibold text-purple-400 font-mono">
              {stats.totalVisitors > 0 ? Math.round((stats.freeCopiesCount / stats.totalVisitors) * 100) : 0}%
            </div>
          </div>

          {/* Stage 4: Submitted Lead */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-emerald-500/20 bg-emerald-950/10">
            <div className="text-[10px] font-mono uppercase text-emerald-400/80 mb-1">4. Lead Form</div>
            <div className="text-lg font-bold text-emerald-300 font-mono">{stats.leadsCount}</div>
            <div className="text-[11px] font-semibold text-emerald-400 font-mono">{stats.conversionRate}%</div>
          </div>

          {/* Stage 5: Initiated Checkout */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-amber-500/20 bg-amber-950/10">
            <div className="text-[10px] font-mono uppercase text-amber-400/80 mb-1">5. Checkout</div>
            <div className="text-lg font-bold text-amber-300 font-mono">{stats.checkoutsCount}</div>
            <div className="text-[11px] font-semibold text-amber-400 font-mono">{stats.checkoutRate}%</div>
          </div>

          {/* Stage 6: Paid Customers */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-green-500/30 bg-green-950/20">
            <div className="text-[10px] font-mono uppercase text-green-300 mb-1">6. Paid Buyers</div>
            <div className="text-lg font-bold text-green-400 font-mono">{stats.paidCount}</div>
            <div className="text-[11px] font-semibold text-green-400 font-mono">
              {stats.totalVisitors > 0 ? ((stats.paidCount / stats.totalVisitors) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TRAFFIC SOURCE & AD CAMPAIGN PERFORMANCE BREAKDOWN */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#080c16] border border-white/10">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Ad Campaign &amp; Traffic Source Attribution</span>
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Performance breakdown by Meta Ads, Google Ads, Organic Search, and Social Campaigns.
            </p>
          </div>
        </div>

        {sourceBreakdown.length === 0 ? (
          <div className="text-center py-8 text-white/40 text-xs font-mono">
            No visitor campaigns recorded yet. Traffic will appear automatically as visitors land.
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-mono uppercase text-white/50 tracking-wider">
                  <th className="py-2.5 px-3">Channel / Source</th>
                  <th className="py-2.5 px-3">Campaign / Keyword</th>
                  <th className="py-2.5 px-3 text-right">Visitors</th>
                  <th className="py-2.5 px-3 text-right">Free Copies</th>
                  <th className="py-2.5 px-3 text-right">Leads</th>
                  <th className="py-2.5 px-3 text-right">Checkouts</th>
                  <th className="py-2.5 px-3 text-right">Conversion</th>
                  <th className="py-2.5 px-3 text-right">Avg Dwell</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-mono">
                {sourceBreakdown.map((row, idx) => {
                  const convPct = row.visitors > 0 ? ((row.leads / row.visitors) * 100).toFixed(1) : '0.0';
                  const avgTime = row.visitors > 0 ? formatDuration(Math.round(row.totalDuration / row.visitors)) : '0s';

                  return (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            row.channel === 'meta_ads'
                              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                              : row.channel === 'google_ads'
                              ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                              : row.channel === 'organic_search'
                              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                              : row.channel === 'organic_social'
                              ? 'bg-pink-600/20 text-pink-400 border border-pink-500/30'
                              : 'bg-zinc-700/30 text-zinc-300 border border-zinc-600/30'
                          }`}
                        >
                          {row.name}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-white font-medium max-w-[220px] truncate" title={row.campaign}>
                        {row.campaign}
                      </td>
                      <td className="py-3 px-3 text-right text-white font-bold">{row.visitors}</td>
                      <td className="py-3 px-3 text-right text-purple-300">{row.freeCopies}</td>
                      <td className="py-3 px-3 text-right text-emerald-300 font-bold">{row.leads}</td>
                      <td className="py-3 px-3 text-right text-amber-300">{row.checkouts}</td>
                      <td className="py-3 px-3 text-right text-emerald-400 font-bold">{convPct}%</td>
                      <td className="py-3 px-3 text-right text-white/60">{avgTime}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. REAL-TIME LIVE VISITOR JOURNEY ACTIVITY STREAM */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#080c16] border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Live Visitor Journeys &amp; Behavior Stream</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {filteredSessions.length} visible
              </span>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              Inspect step-by-step user clickstreams, scroll depths, and drop-off points in real time.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={toggleAllTimelines}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-white/80 transition-colors cursor-pointer"
            >
              {expandedSessionIds.size > 0 ? 'Collapse All' : 'Expand All Steps'}
            </button>

            <button
              onClick={handlePurgeAnalytics}
              disabled={isPurging}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Reset test visitor analytics"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Test Analytics</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search session ID, campaign, email, city..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Channel Selector */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
            {(['all', 'meta_ads', 'google_ads', 'organic_search', 'direct'] as const).map((ch) => (
              <button
                key={ch}
                onClick={() => {
                  sound.playClick();
                  setSelectedChannel(ch);
                }}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  selectedChannel === ch ? 'bg-blue-600 text-white font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                {ch === 'all' ? 'All Channels' : ch.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Status Selector */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
            {(['all', 'online', 'leads', 'buyers'] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  sound.playClick();
                  setStatusFilter(st);
                }}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === st ? 'bg-emerald-600 text-white font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                {st === 'all' ? 'All Status' : st === 'online' ? '🟢 Online' : st === 'leads' ? '📥 Leads' : '💎 Buyers'}
              </button>
            ))}
          </div>
        </div>

        {/* Visitor Cards List */}
        {isLoading ? (
          <div className="text-center py-12 text-white/40 font-mono text-xs">
            Syncing live visitor stream from Firebase Firestore...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-12 text-white/40 font-mono text-xs">
            No visitor journeys match your current search or channel filter.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session) => {
              const isExpanded = expandedSessionIds.has(session.sessionId);
              const now = Date.now();
              const lastActiveMs = new Date(session.lastActiveAt || session.firstSeenAt || 0).getTime();
              const isOnline = now - lastActiveMs < 60000;
              const formattedTime = new Date(session.firstSeenAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div
                  key={session.sessionId}
                  className="rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden"
                >
                  {/* Visitor Summary Header */}
                  <div
                    onClick={() => toggleTimeline(session.sessionId)}
                    className="p-3.5 sm:p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      {/* Device Icon */}
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white/70">
                        {session.device === 'mobile' ? (
                          <Smartphone className="w-4 h-4" />
                        ) : session.device === 'tablet' ? (
                          <Tablet className="w-4 h-4" />
                        ) : (
                          <Monitor className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Online Indicator */}
                          {isOnline ? (
                            <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              ONLINE
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-white/40">
                              Left {formatTimeAgo(session.lastActiveAt)}
                            </span>
                          )}

                          {/* Channel Badge */}
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${
                              session.channel === 'meta_ads'
                                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                : session.channel === 'google_ads'
                                ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                                : session.channel === 'organic_search'
                                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                                : session.channel === 'organic_social'
                                ? 'bg-pink-600/20 text-pink-400 border border-pink-500/30'
                                : 'bg-zinc-700/30 text-zinc-300 border border-zinc-600/30'
                            }`}
                          >
                            {session.channel.replace('_', ' ')}
                          </span>

                          {/* Session ID */}
                          <span className="text-xs font-mono font-bold text-white">
                            {session.sessionId}
                          </span>

                          {/* Campaign / Ad Tag */}
                          {session.utm?.campaign && (
                            <span className="text-[10px] font-mono text-purple-300 bg-purple-500/15 px-1.5 py-0.5 rounded border border-purple-500/30 truncate max-w-[150px]">
                              🏷️ {session.utm.campaign}
                            </span>
                          )}

                          {/* Meta fbclid tag if present */}
                          {session.utm?.fbclid && (
                            <span className="text-[10px] font-mono text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                              Meta Click ID
                            </span>
                          )}
                        </div>

                        {/* Location & Client Specs */}
                        <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-white/50 flex-wrap">
                          {session.location?.city ? (
                            <span className="flex items-center gap-1 text-white/80">
                              <MapPin className="w-3 h-3 text-red-400" />
                              {session.location.city}, {session.location.country || session.location.countryCode}
                            </span>
                          ) : (
                            <span>Unknown Location</span>
                          )}
                          <span>·</span>
                          <span>{session.browser} ({session.os})</span>
                          <span>·</span>
                          <span>Landed at {formattedTime}</span>
                          <span>·</span>
                          <span>Dwell: {formatDuration(session.durationSeconds || 0)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Funnel Status & Expand Toggle */}
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      {/* Conversion Highlights */}
                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        {session.hasConvertedPaid ? (
                          <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/40 text-[10px] font-bold">
                            💎 Paid Buyer
                          </span>
                        ) : session.hasInitiatedCheckout ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                            💳 Checkout Initiated
                          </span>
                        ) : session.hasSubmittedLead || session.leadEmail ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            📥 Lead Captured
                          </span>
                        ) : session.hasClickedFreeCopy ? (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px]">
                            📋 Copy Intent
                          </span>
                        ) : null}

                        {session.maxScrollPercentage > 0 && (
                          <span className="text-[10px] text-white/40">
                            {session.maxScrollPercentage}% scroll
                          </span>
                        )}
                      </div>

                      <div className="p-1 rounded-lg bg-white/5 text-white/60 hover:text-white">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Timeline Drawer */}
                  {isExpanded && (
                    <div className="p-4 bg-black/40 border-t border-white/10 space-y-3 animate-role-fade-in">
                      {/* Converted Lead Identity Card if exists */}
                      {(session.leadEmail || session.leadName || session.leadPhone) && (
                        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <div>
                              <span className="text-white font-bold">{session.leadName || 'Visitor'}</span>
                              <span className="text-emerald-300 ml-2">({session.leadEmail})</span>
                              {session.leadPhone && (
                                <span className="text-white/60 ml-2">+91 {session.leadPhone}</span>
                              )}
                              {session.leadRole && (
                                <span className="ml-2 px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                                  {session.leadRole}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold uppercase">
                            Authenticated Visitor
                          </span>
                        </div>
                      )}

                      {/* Chronological Event Steps */}
                      <div>
                        <div className="text-[11px] font-mono uppercase tracking-wider text-white/50 mb-2 flex items-center justify-between">
                          <span>Chronological Activity Log</span>
                          <span className="text-[10px] lowercase text-white/40">
                            {session.recentEvents?.length || 0} event(s) recorded
                          </span>
                        </div>

                        {(!session.recentEvents || session.recentEvents.length === 0) ? (
                          <div className="text-xs font-mono text-white/40 py-2">
                            No specific milestone events logged yet.
                          </div>
                        ) : (
                          <div className="space-y-1.5 relative pl-4 border-l border-white/10">
                            {session.recentEvents.map((evt, eIdx) => {
                              const evtTime = new Date(evt.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              });

                              return (
                                <div key={evt.id || eIdx} className="relative text-xs font-mono flex items-start gap-2">
                                  {/* Dot */}
                                  <span
                                    className={`absolute -left-[21px] top-1.5 w-2 h-2 rounded-full border border-black ${
                                      evt.eventType === 'payment_success'
                                        ? 'bg-green-400'
                                        : evt.eventType === 'checkout_initiate'
                                        ? 'bg-amber-400'
                                        : evt.eventType === 'lead_submitted'
                                        ? 'bg-emerald-400'
                                        : evt.eventType === 'copy_prompt_click'
                                        ? 'bg-purple-400'
                                        : evt.eventType === 'scroll'
                                        ? 'bg-blue-400'
                                        : 'bg-white/40'
                                    }`}
                                  />
                                  <span className="text-white/40 shrink-0 text-[11px]">{evtTime}</span>
                                  <span
                                    className={`${
                                      evt.eventType === 'payment_success'
                                        ? 'text-green-300 font-bold'
                                        : evt.eventType === 'checkout_initiate'
                                        ? 'text-amber-300 font-semibold'
                                        : evt.eventType === 'lead_submitted'
                                        ? 'text-emerald-300 font-semibold'
                                        : evt.eventType === 'copy_prompt_click'
                                        ? 'text-purple-300'
                                        : evt.eventType === 'checkout_dropoff'
                                        ? 'text-rose-400'
                                        : 'text-zinc-300'
                                    }`}
                                  >
                                    {evt.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

function formatDuration(sec: number): string {
  if (!sec || sec < 0) return '0s';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

function formatTimeAgo(isoString?: string): string {
  if (!isoString) return 'recently';
  const ms = Date.now() - new Date(isoString).getTime();
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  return `${hrs}h ago`;
}
