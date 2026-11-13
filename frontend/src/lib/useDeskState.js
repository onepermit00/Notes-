import { useCallback, useEffect, useState } from 'react';
import { authApi } from '../services/authApi';

// What is at the desk right now (packages on hand, guests in the lobby, vendors
// on site, loaner items out) is shared by everyone who works the desk, so it
// lives on the server. Each section keeps a small object of named lists.
let owner = null;          // session token the cache belongs to
let cache = {};            // { section: { key: value } }
let loaded = false;
let loading = null;
const listeners = new Set();
const timers = {};

const notify = () => listeners.forEach(listener => listener());

// Photos and signatures stay on the device; they are far too large to keep here.
const lighten = (value) => {
  if (Array.isArray(value)) return value.map(lighten);
  if (value && typeof value === 'object') {
    if (typeof File !== 'undefined' && value instanceof File) return null;
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, lighten(v)]));
  }
  return typeof value === 'string' && value.length > 2000 && /^(data|blob):/.test(value) ? null : value;
};

export function loadDeskState(force = false) {
  const token = localStorage.getItem('op_token');
  if (token !== owner) { owner = token; cache = {}; loaded = false; loading = null; }
  if (!token) return Promise.resolve();
  if (loading && !force) return loading;
  loading = authApi.getDeskState()
    .then(sections => {
      // Keep anything still waiting to be saved from this device.
      const pending = Object.keys(timers).filter(section => timers[section]);
      cache = { ...sections, ...Object.fromEntries(pending.map(section => [section, cache[section]])) };
      loaded = true;
      notify();
    })
    .catch(() => {});
  return loading;
}

const save = (section) => {
  clearTimeout(timers[section]);
  timers[section] = setTimeout(() => {
    timers[section] = null;
    authApi.saveDeskState(section, lighten(cache[section] || {})).catch(() => {});
  }, 400);
};

export function useDeskState(section, key, initial) {
  const read = () => (cache[section] && key in cache[section] ? cache[section][key] : initial);
  const [value, setValue] = useState(read);

  useEffect(() => {
    const listener = () => setValue(read());
    listeners.add(listener);
    loadDeskState(true);
    return () => { listeners.delete(listener); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, key]);

  const update = useCallback((next) => {
    const current = cache[section] && key in cache[section] ? cache[section][key] : initial;
    let resolved = typeof next === 'function' ? next(current) : next;
    // Lists are records of recent desk activity; keep the newest so they never grow without end.
    if (Array.isArray(resolved) && resolved.length > 150) resolved = [...resolved].sort((a, b) => (Number(b?.id) || 0) - (Number(a?.id) || 0)).slice(0, 150);
    cache = { ...cache, [section]: { ...(cache[section] || {}), [key]: resolved } };
    notify();
    save(section);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, key]);

  return [value, update, loaded];
}
