import { useEffect, useState } from 'react';
import { authApi } from '../services/authApi';

// SOP and training files are fetched with the signed-in user's token and kept
// as object URLs for the session, so a video downloads once, not on every open.
const cache = new Map();

function load(item) {
  const key = `${item.id}:${item.fileId}`;
  if (!cache.has(key)) {
    const job = authApi.getKnowledgeFile(item.id).then(blob => URL.createObjectURL(blob));
    job.catch(() => cache.delete(key));
    cache.set(key, job);
  }
  return cache.get(key);
}

/** The URL to show an item's file from: its inline data URL, or the stored file once fetched. */
export function useKnowledgeFileURL(item, enabled = true) {
  const inline = item?.dataURL || '';
  const stored = !inline && item?.hasFile && item?.fileId;
  const [state, setState] = useState({ url: inline, loading: !!stored && enabled, error: false });
  useEffect(() => {
    if (!stored || !enabled) { setState({ url: inline, loading: false, error: false }); return undefined; }
    let live = true;
    setState({ url: '', loading: true, error: false });
    load(item).then(url => { if (live) setState({ url, loading: false, error: false }); })
      .catch(() => { if (live) setState({ url: '', loading: false, error: true }); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id, item?.fileId, inline, stored, enabled]);
  return state;
}

export const hasKnowledgeFile = item => !!(item && (item.dataURL || item.hasFile));

export function knowledgeTypeLabel(item) {
  if (!hasKnowledgeFile(item)) return 'Written steps';
  if (item.fileType === 'video') return 'Video';
  if (item.fileType === 'image') return 'Photo';
  if (item.fileType === 'pdf') return 'PDF';
  return 'Document';
}

export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

export function fileTypeOf(file) {
  const type = (file?.type || '').toLowerCase();
  const name = (file?.name || '').toLowerCase();
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  return 'doc';
}
