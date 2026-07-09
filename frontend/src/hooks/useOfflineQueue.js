import { useState, useEffect, useCallback, useRef } from 'react';

const QUEUE_KEY = 'op_offline_queue';

function loadQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; }
}

function saveQueue(q) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch {}
}

export function useOfflineQueue() {
  const [isOnline, setIsOnline]     = useState(navigator.onLine);
  const [queueLen, setQueueLen]     = useState(() => loadQueue().length);
  const [isSyncing, setIsSyncing]   = useState(false);
  const draining = useRef(false);

  useEffect(() => {
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Drain queue when we come back online
  useEffect(() => {
    if (!isOnline || draining.current) return;
    const q = loadQueue();
    if (q.length === 0) return;
    draining.current = true;
    setIsSyncing(true);

    (async () => {
      const remaining = [];
      for (const item of q) {
        try {
          const resp = await fetch(item.url, {
            method:  item.method,
            headers: item.headers,
            body:    item.body,
          });
          if (!resp.ok) remaining.push(item);
        } catch {
          remaining.push(item);
        }
      }
      saveQueue(remaining);
      setQueueLen(remaining.length);
      setIsSyncing(false);
      draining.current = false;
    })();
  }, [isOnline]);

  const enqueue = useCallback((url, method, headers, body) => {
    const q = loadQueue();
    q.push({ url, method, headers, body, queuedAt: Date.now() });
    saveQueue(q);
    setQueueLen(q.length);
  }, []);

  return { isOnline, queueLen, isSyncing, enqueue };
}
