import React from 'react';
import { Download, FileText, Image, Loader2, Play, Video, X } from 'lucide-react';
import { hasKnowledgeFile, knowledgeTypeLabel, useKnowledgeFileURL } from '../../lib/knowledgeFile';

export const KnowledgeTypeIcon = ({ item, size = 12, color }) => {
  const Icon = !hasKnowledgeFile(item) ? FileText : item.fileType === 'video' ? Video : item.fileType === 'image' ? Image : FileText;
  return <Icon size={size} color={color} />;
};

/** Small picture for a list card: the photo itself, or the given icon. */
export function KnowledgeThumb({ item, Icon = FileText, color = '#717171', accent }) {
  const isImage = item.fileType === 'image' && hasKnowledgeFile(item);
  const { url } = useKnowledgeFileURL(item, isImage);
  return (
    <>
      {isImage && url ? <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon size={24} color={color} />}
      {item.fileType === 'video' && hasKnowledgeFile(item) && (
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.06)' }}><Play size={18} color={accent || color} /></span>
      )}
    </>
  );
}

/** The file part of an item, at full size. */
export function KnowledgeFile({ item, autoPlay = false, dark = true }) {
  const { url, loading, error } = useKnowledgeFileURL(item);
  const note = { fontSize: 14, color: dark ? 'rgba(255,255,255,.7)' : '#555', textAlign: 'center', padding: 24 };
  if (loading) return <div style={{ ...note, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Loader2 size={18} className="animate-spin" />Loading {knowledgeTypeLabel(item).toLowerCase()}…</div>;
  if (error || !url) return <div role="alert" style={note}>This file could not be loaded. Check your connection and try again.</div>;
  if (item.fileType === 'image') return <img src={url} alt={item.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8, display: 'block', margin: '0 auto' }} />;
  if (item.fileType === 'video') return <video src={url} controls playsInline autoPlay={autoPlay} style={{ maxWidth: '100%', maxHeight: '100%', width: '100%', borderRadius: 8, display: 'block', outline: 'none', background: '#000' }} />;
  if (item.fileType === 'pdf' || (item.dataURL || '').startsWith('data:application/pdf')) {
    return <iframe src={url} title={item.title} style={{ width: '100%', height: '100%', minHeight: 420, border: 'none', borderRadius: 8, display: 'block', background: 'white' }} />;
  }
  // Word, PowerPoint and other documents cannot be shown inside a browser page.
  return (
    <div style={{ ...note, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <FileText size={40} color={dark ? 'white' : '#555'} />
      <span>{item.fileName || 'Document'}</span>
      <a href={url} download={item.fileName || 'document'} style={{ minHeight: 44, padding: '0 18px', borderRadius: 12, background: 'white', color: '#111', fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <Download size={16} />Open document
      </a>
    </div>
  );
}

/** Full-screen view of one SOP or training item: its file, then its written steps. */
export function KnowledgeViewer({ item, onClose, footer = null, font }) {
  const withFile = hasKnowledgeFile(item);
  const withBody = !!(item.body || '').trim();
  return (
    <div role="dialog" aria-modal="true" aria-label={item.title} onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0b0b0c', display: 'flex', flexDirection: 'column', fontFamily: font }}>
      <div onClick={e => e.stopPropagation()} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', background: 'rgba(0,0,0,0.7)' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>{item.category}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'white', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
        </div>
        <button onClick={onClose} aria-label="Close" style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.12)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <X size={20} color="white" />
        </button>
      </div>
      <div onClick={e => e.stopPropagation()} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'stretch', justifyContent: withBody ? 'flex-start' : 'center' }}>
        {withFile && (
          <div style={{ flex: withBody ? '0 0 auto' : 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', maxHeight: withBody ? '62vh' : 'none' }}>
            <KnowledgeFile item={item} autoPlay={!withBody} />
          </div>
        )}
        {withBody && (
          <div style={{ width: '100%', maxWidth: 760, margin: '0 auto', boxSizing: 'border-box', background: 'white', color: '#111', borderRadius: 14, padding: '20px 22px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#717171', marginBottom: 10 }}>Steps</div>
            <p style={{ fontSize: 15, lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{item.body}</p>
          </div>
        )}
      </div>
      <div onClick={e => e.stopPropagation()} style={{ flexShrink: 0, padding: '12px 20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
        {item.fileName && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>{item.fileName}</span>}
        {footer || <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Tap outside to close</span>}
      </div>
    </div>
  );
}
