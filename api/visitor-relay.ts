// Vercel Serverless Function: Real-Time Cross-Device Visitor Telemetry Relay
export const memoryVisitorSessions: any[] = [];
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

  // 1. GET: Return active visitor sessions
  if (req.method === 'GET') {
    const active = memoryVisitorSessions.filter((s) => {
      if (!s || !s.sessionId) return false;
      const t = new Date(s.lastActiveAt || s.firstSeenAt || 0).getTime();
      if (globalPurgedAt > 0 && t <= globalPurgedAt) return false;
      return true;
    });

    return res.status(200).json({
      sessions: active,
      purgedAt: globalPurgedAt,
      serverTime: new Date().toISOString(),
    });
  }

  // 2. DELETE: Purge all visitor sessions
  if (req.method === 'DELETE') {
    globalPurgedAt = Date.now();
    memoryVisitorSessions.length = 0;
    return res.status(200).json({
      success: true,
      message: 'Visitor telemetry relay purged.',
      purgedAt: globalPurgedAt,
    });
  }

  // 3. POST: Ingest or update visitor session
  if (req.method === 'POST') {
    const session = req.body || {};
    if (!session || !session.sessionId) {
      return res.status(400).json({ message: 'sessionId required' });
    }

    const nowIso = new Date().toISOString();
    const cleanSession = {
      ...session,
      updatedAt: nowIso,
      lastActiveAt: session.lastActiveAt || nowIso,
    };

    const existingIdx = memoryVisitorSessions.findIndex(
      (s) => s.sessionId === session.sessionId
    );

    if (existingIdx >= 0) {
      memoryVisitorSessions[existingIdx] = {
        ...memoryVisitorSessions[existingIdx],
        ...cleanSession,
      };
    } else {
      memoryVisitorSessions.unshift(cleanSession);
      // Keep latest 100 sessions to avoid memory exhaustion
      if (memoryVisitorSessions.length > 100) {
        memoryVisitorSessions.pop();
      }
    }

    return res.status(200).json({
      success: true,
      sessionId: session.sessionId,
      totalActive: memoryVisitorSessions.length,
    });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
