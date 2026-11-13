import React, { useEffect, useRef, useState } from 'react';
import { Camera, Check, Eye, FileText, HelpCircle, Image, Monitor, RefreshCw, Trash2, Upload, Video, X } from 'lucide-react';
import { VideoRecorder, canRecordCamera, canRecordScreen } from './VideoRecorder';
import { KnowledgeViewer } from './KnowledgeMedia';
import { MAX_UPLOAD_BYTES, fileTypeOf, hasKnowledgeFile } from '../../lib/knowledgeFile';

const ACCEPT = 'application/pdf,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,image/*,video/*';
const sizeText = bytes => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * One screen to add or change an SOP or a training item. The manager gives it a
 * title and a category, then any mix of: written steps, an uploaded file (PDF,
 * Word, photo, video), or a video recorded right here with the camera or of the screen.
 *
 * onSave({ title, category, body }, { file, fileName, removeFile, onProgress }) and
 * onDelete() return promises; errors are shown on the screen.
 */
export function KnowledgeEditor({ kind, item, categories, onSave, onDelete, onCancel, colors, isPhone, font }) {
  const noun = kind === 'sop' ? 'SOP' : 'training';
  const known = categories.map(c => c.id);
  const startsCustom = item?.category && !known.includes(item.category);
  const [title, setTitle] = useState(item?.title || '');
  const [category, setCategory] = useState(startsCustom ? 'Other' : (item?.category || ''));
  const [customCategory, setCustomCategory] = useState(startsCustom ? item.category : '');
  const [body, setBody] = useState(item?.body || '');
  const [file, setFile] = useState(null);            // { blob, name, type, size, url }
  const [removeFile, setRemoveFile] = useState(false);
  const [recording, setRecording] = useState(null);  // 'camera' | 'screen'
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInput = useRef(null);

  useEffect(() => () => { if (file?.url) URL.revokeObjectURL(file.url); }, [file]);

  const keepsOldFile = !!item && hasKnowledgeFile(item) && !removeFile && !file;
  const finalCategory = category === 'Other' ? (customCategory.trim() || 'Other') : category;
  const hasContent = !!body.trim() || !!file || keepsOldFile;
  const canSave = !!title.trim() && !!category && hasContent && !busy;
  const missing = !title.trim() ? 'Give it a title.' : !category ? 'Choose a category.' : !hasContent ? 'Write the steps, upload a file, or record a video.' : '';

  const takeFile = (blob, name) => {
    if (blob.size > MAX_UPLOAD_BYTES) { setError(`That file is ${sizeText(blob.size)}. Files up to 100 MB can be saved; for a longer video, record a shorter clip.`); return; }
    setError('');
    setFile({ blob, name, type: fileTypeOf({ type: blob.type, name }), size: blob.size, url: URL.createObjectURL(blob) });
    setRemoveFile(false);
  };

  const save = async () => {
    if (!canSave) return;
    setBusy(true); setError(''); setProgress(file ? 0 : null);
    try {
      await onSave({ title: title.trim(), category: finalCategory, body: body.trim() }, {
        file: file?.blob || null, fileName: file?.name, removeFile: removeFile && !file, onProgress: setProgress,
      });
    } catch (e) {
      const status = e?.response?.status;
      setError(status === 413 ? 'That file is too large. Files up to 100 MB can be saved.'
        : typeof e?.response?.data?.detail === 'string' ? e.response.data.detail
        : 'This could not be saved. Check your connection and try again.');
      setBusy(false); setProgress(null);
    }
  };

  const remove = async () => {
    setBusy(true); setError('');
    try { await onDelete(); } catch { setError('This could not be deleted. Check your connection and try again.'); setBusy(false); setConfirmDelete(false); }
  };

  const label = { fontSize: 11, fontWeight: 800, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 10 };
  const input = filled => ({ width: '100%', padding: '14px 16px', background: colors.surface, borderRadius: 12, border: `1.5px solid ${filled ? colors.accent : colors.border}`, color: colors.text, outline: 'none', fontSize: 16, fontFamily: 'inherit', boxSizing: 'border-box' });
  const tile = { flex: '1 1 160px', minHeight: 104, padding: 16, borderRadius: 16, border: `1.5px solid ${colors.border}`, background: colors.card, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 6, textAlign: 'left' };
  const smallBtn = { minHeight: 38, padding: '0 12px', borderRadius: 10, border: `1px solid ${colors.border}`, background: colors.surface, color: colors.text, fontSize: 13, fontWeight: 650, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 };

  // What is attached right now: a new file, or the one already saved.
  const attached = file
    ? { name: file.name, type: file.type, detail: `${sizeText(file.size)} · new`, view: { title, category: finalCategory, fileType: file.type, fileName: file.name, dataURL: file.url } }
    : keepsOldFile ? { name: item.fileName || 'Attached file', type: item.fileType, detail: item.fileSize ? sizeText(item.fileSize) : 'Saved', view: item } : null;
  const AttachedIcon = attached?.type === 'video' ? Video : attached?.type === 'image' ? Image : FileText;

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: font }}>
      <div style={{ flexShrink: 0, padding: '16px 0 14px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: colors.text, letterSpacing: '-0.01em', margin: 0 }}>{item ? `Edit ${noun}` : kind === 'sop' ? 'Add an SOP' : 'Add training'}</h2>
          <p style={{ fontSize: 13, color: colors.muted, margin: '3px 0 0' }}>Only managers can change this. The desk sees it as soon as you save.</p>
        </div>
        <button onClick={onCancel} disabled={busy} style={{ ...smallBtn, minHeight: 44, padding: '0 18px', fontSize: 14 }}>Cancel</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 0', display: 'flex', flexDirection: 'column', gap: 26 }}>
        <div>
          <label htmlFor="knowledge-title" style={label}>Title</label>
          <input id="knowledge-title" value={title} maxLength={160} onChange={e => setTitle(e.target.value)}
            placeholder={kind === 'sop' ? 'e.g. How to reserve the elevator' : 'e.g. Elevator reservation walkthrough'} style={input(!!title)} />
        </div>

        <div>
          <span style={label}>Category</span>
          <div role="radiogroup" aria-label="Category" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categories.map(({ id, Icon = HelpCircle }) => {
              const on = category === id;
              return (
                <button key={id} type="button" role="radio" aria-checked={on} onClick={() => setCategory(id)}
                  style={{ minHeight: 42, padding: '0 14px', borderRadius: 999, border: `1.5px solid ${on ? colors.accent : colors.border}`, background: on ? `${colors.accent}10` : colors.card, color: colors.text, fontSize: 13, fontWeight: 650, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  {on ? <Check size={14} color={colors.accent} /> : <Icon size={14} color={colors.muted} />}{id}
                </button>
              );
            })}
          </div>
          {category === 'Other' && (
            <input aria-label="Category name" value={customCategory} maxLength={80} onChange={e => setCustomCategory(e.target.value)} placeholder="Name the category, e.g. Lease Renewals" style={{ ...input(!!customCategory), marginTop: 10 }} />
          )}
        </div>

        <div>
          <span style={label}>Video or file</span>
          {attached ? (
            <div style={{ border: `1.5px solid ${colors.accent}`, borderRadius: 16, padding: 16, background: `${colors.accent}06`, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${colors.accent}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><AttachedIcon size={24} color={colors.accent} /></div>
              <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attached.name}</p>
                <p style={{ fontSize: 12, color: colors.muted, margin: '3px 0 0' }}>{attached.detail}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setPreview(attached.view)} style={smallBtn}><Eye size={14} />Preview</button>
                <button type="button" onClick={() => fileInput.current?.click()} style={smallBtn}><RefreshCw size={14} />Replace</button>
                <button type="button" onClick={() => { setFile(null); if (item && hasKnowledgeFile(item)) setRemoveFile(true); }} style={{ ...smallBtn, color: colors.danger }}><X size={14} />Remove</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {canRecordCamera() && (
                <button type="button" onClick={() => setRecording('camera')} style={tile}>
                  <Camera size={24} color={colors.danger} />
                  <span style={{ fontSize: 15, fontWeight: 800, color: colors.text }}>Record a video</span>
                  <span style={{ fontSize: 12, color: colors.muted, lineHeight: 1.4 }}>Use the camera to show it, step by step</span>
                </button>
              )}
              {canRecordScreen() && !isPhone && (
                <button type="button" onClick={() => setRecording('screen')} style={tile}>
                  <Monitor size={24} color={colors.accent} />
                  <span style={{ fontSize: 15, fontWeight: 800, color: colors.text }}>Record your screen</span>
                  <span style={{ fontSize: 12, color: colors.muted, lineHeight: 1.4 }}>Show how it is done in a website or app, with your voice</span>
                </button>
              )}
              <button type="button" onClick={() => fileInput.current?.click()} style={tile}>
                <Upload size={24} color={colors.success || colors.accent} />
                <span style={{ fontSize: 15, fontWeight: 800, color: colors.text }}>Upload a file</span>
                <span style={{ fontSize: 12, color: colors.muted, lineHeight: 1.4 }}>PDF, Word, photo, or a video you already have</span>
              </button>
            </div>
          )}
          <input ref={fileInput} type="file" accept={ACCEPT} style={{ display: 'none' }} aria-label="Choose a file"
            onChange={e => { const f = e.target.files?.[0]; if (f) takeFile(f, f.name); e.target.value = ''; }} />
          <p style={{ fontSize: 12, color: colors.muted, margin: '10px 0 0' }}>Up to 100 MB, which is about 10 minutes of recorded video.</p>
        </div>

        <div>
          <label htmlFor="knowledge-body" style={label}>Written steps {attached ? <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 600 }}>(optional)</span> : null}</label>
          <textarea id="knowledge-body" value={body} maxLength={20000} onChange={e => setBody(e.target.value)} rows={isPhone ? 7 : 9}
            placeholder={kind === 'sop' ? '1. Check the move calendar for the date.\n2. Book the service elevator for a 2-hour slot.\n3. Put the elevator pads up before the movers arrive.' : 'What the desk should take away from this training, or the steps to follow.'}
            style={{ ...input(!!body), resize: 'vertical', lineHeight: 1.6, minHeight: 150 }} />
          <p style={{ fontSize: 12, color: colors.muted, margin: '8px 0 0' }}>{kind === 'sop' ? 'The quickest way to add an SOP: type or paste the steps. The desk can search them.' : 'Shown under the video or file. The desk can search them.'}</p>
        </div>

        {confirmDelete && (
          <div role="alert" style={{ border: `1.5px solid ${colors.danger}`, borderRadius: 16, padding: 16, background: `${colors.danger}08`, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <p style={{ flex: '1 1 220px', fontSize: 14, color: colors.text, margin: 0 }}>Delete <b>{item?.title}</b>? The desk will no longer see it, and its file is removed. This cannot be undone.</p>
            <button type="button" disabled={busy} onClick={() => setConfirmDelete(false)} style={smallBtn}>Keep it</button>
            <button type="button" disabled={busy} onClick={remove} style={{ ...smallBtn, background: colors.danger, color: 'white', border: 'none' }}>{busy ? 'Deleting…' : 'Delete'}</button>
          </div>
        )}
      </div>

      <div style={{ flexShrink: 0, padding: '12px 0 4px', borderTop: `1px solid ${colors.border}` }}>
        {error && <p role="alert" style={{ fontSize: 13, fontWeight: 650, color: colors.danger, margin: '0 0 10px' }}>{error}</p>}
        {!error && missing && !busy && <p style={{ fontSize: 12, color: colors.muted, margin: '0 0 10px' }}>{missing}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          {item && onDelete && (
            <button type="button" disabled={busy} onClick={() => setConfirmDelete(true)} aria-label={`Delete ${item.title}`}
              style={{ padding: '0 18px', minHeight: 54, borderRadius: 14, border: `1px solid ${colors.border}`, background: colors.card, color: colors.danger, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Trash2 size={17} />{isPhone ? '' : 'Delete'}
            </button>
          )}
          <button type="button" onClick={save} disabled={!canSave}
            style={{ flex: 1, minHeight: 54, borderRadius: 14, border: 'none', background: canSave ? colors.danger : `${colors.danger}40`, color: 'white', fontSize: 16, fontWeight: 700, cursor: canSave ? 'pointer' : 'default' }}>
            {busy ? (progress != null && progress < 100 ? `Uploading ${progress}%…` : 'Saving…') : item ? 'Save changes' : `Save ${noun}`}
          </button>
        </div>
      </div>

      {recording && (
        <VideoRecorder mode={recording} title={title} colors={colors}
          onCancel={() => setRecording(null)}
          onDone={(blob, name) => { setRecording(null); takeFile(blob, name); }} />
      )}
      {preview && <KnowledgeViewer item={preview} onClose={() => setPreview(null)} font={font} />}
    </div>
  );
}
