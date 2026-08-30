const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const VISITOR_KEY = 'dom_visitor_id';

function getStoredVisitorId() {
  try {
    return localStorage.getItem(VISITOR_KEY);
  } catch {
    return null;
  }
}

function storeVisitorId(id) {
  try {
    localStorage.setItem(VISITOR_KEY, id);
  } catch {
    /* storage unavailable, ignore */
  }
}

function detectDeviceType() {
  if (typeof navigator === 'undefined') return 'unknown';
  return /mobile|android|iphone/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
}

/**
 * Starts (or resumes) an anonymous session. Returns a session_id used for
 * all subsequent event logging, or null if the backend isn't reachable
 * (the site should still work perfectly well without analytics).
 */
export async function startSession() {
  try {
    const res = await fetch(`${API_BASE}/api/session/start/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_id: getStoredVisitorId() || undefined,
        device_type: detectDeviceType(),
      }),
    });
    if (!res.ok) throw new Error(`session start failed: ${res.status}`);
    const data = await res.json();
    storeVisitorId(data.visitor_id);
    return data.session_id;
  } catch (err) {
    console.warn('[analytics] offline, continuing without tracking:', err.message);
    return null;
  }
}

/**
 * Logs one anonymous event. Never throws - a failed analytics call
 * should never break the actual prank experience.
 */
export async function logEvent(sessionId, eventType, extra = {}) {
  if (!sessionId) return;
  try {
    await fetch(`${API_BASE}/api/events/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, event_type: eventType, ...extra }),
    });
  } catch (err) {
    console.warn('[analytics] event log failed:', err.message);
  }
}
