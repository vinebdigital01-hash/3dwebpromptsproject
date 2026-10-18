// Vercel Serverless Function: Real-time Lead Relay, Cross-Device Sync & Admin Alerts
export const memoryLeads: any[] = [];
export const deletedLeadKeys = new Set<string>();
export let globalPurgedAt = 0;

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Filter out any purged or deleted leads
    const activeLeads = memoryLeads.filter((item) => {
      if (!item) return false;
      const itemId = (item.id || '').trim();
      const itemEmail = (item.email || '').trim().toLowerCase();
      const itemPhone = (item.phone || '').trim().replace(/\D/g, '');
      const itemTime = new Date(item.createdAt || item.updatedAt || 0).getTime();

      if (globalPurgedAt > 0 && itemTime <= globalPurgedAt) return false;
      if (itemId && deletedLeadKeys.has(itemId)) return false;
      if (itemEmail && deletedLeadKeys.has(itemEmail)) return false;
      if (itemPhone && deletedLeadKeys.has(itemPhone)) return false;
      return true;
    });

    return res.status(200).json({ leads: activeLeads, purgedAllAt: globalPurgedAt });
  }

  if (req.method === 'DELETE') {
    const { id, all, email, phone } = req.query;
    if (all === 'true' || req.body?.all === true) {
      globalPurgedAt = Date.now();
      memoryLeads.length = 0;
      deletedLeadKeys.clear();
      return res.status(200).json({ success: true, message: 'All leads purged from relay.', purgedAllAt: globalPurgedAt });
    }

    const cleanEmail = (typeof email === 'string' ? email : '').trim().toLowerCase();
    const cleanPhone = (typeof phone === 'string' ? phone : '').trim().replace(/\D/g, '');
    const cleanId = (typeof id === 'string' ? id : '').trim();

    if (cleanId) deletedLeadKeys.add(cleanId);
    if (cleanEmail) deletedLeadKeys.add(cleanEmail);
    if (cleanPhone) deletedLeadKeys.add(cleanPhone);

    for (let i = memoryLeads.length - 1; i >= 0; i--) {
      const item = memoryLeads[i];
      if (
        (cleanId && item.id === cleanId) ||
        (cleanEmail && (item.email || '').toLowerCase() === cleanEmail) ||
        (cleanPhone && (item.phone || '').replace(/\D/g, '') === cleanPhone)
      ) {
        memoryLeads.splice(i, 1);
      }
    }
    return res.status(200).json({ success: true, remaining: memoryLeads.length });
  }

  if (req.method === 'POST') {
    const lead = req.body || {};
    const email = (lead.email || '').trim().toLowerCase();
    const phone = (lead.phone || '').trim().replace(/\D/g, '');
    const name = (lead.name || '').trim();
    const role = lead.role || '';
    const tierName = lead.tierName || 'Free Sample Prompt';
    const source = lead.source || 'portal_free_copy_modal';
    const status = lead.status || 'free_trial_claimed';

    // Discard obvious dummy / guest emails
    if (
      email.includes('free_guest') ||
      email.includes('@apex3d.local') ||
      email.includes('example.com') ||
      email.includes('pending@') ||
      name === 'Free Trial Member' ||
      name === 'Free Trial Visitor'
    ) {
      return res.status(200).json({ status: 'ignored_dummy' });
    }

    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or phone required' });
    }

    // Check if this lead was deleted
    const leadId = lead.id || `LEAD-${Date.now().toString().slice(-6)}`;
    if (deletedLeadKeys.has(leadId) || (email && deletedLeadKeys.has(email)) || (phone && deletedLeadKeys.has(phone))) {
      return res.status(200).json({ status: 'ignored_deleted' });
    }

    const leadRecord = {
      id: leadId,
      orderNumber: lead.orderNumber || `MEM-${Date.now().toString().slice(-4)}`,
      name: name || 'Visitor',
      email,
      phone,
      role,
      tierName,
      amountINR: lead.amountINR || 0,
      status,
      source,
      createdAt: lead.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in-memory cache
    const existingIdx = memoryLeads.findIndex(
      (l) => (l.email && l.email === email) || (l.phone && phone && l.phone === phone)
    );
    if (existingIdx >= 0) {
      memoryLeads[existingIdx] = { ...memoryLeads[existingIdx], ...leadRecord };
    } else {
      memoryLeads.unshift(leadRecord);
      if (memoryLeads.length > 100) memoryLeads.pop();
    }

    return res.status(200).json({ success: true, lead: leadRecord });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
