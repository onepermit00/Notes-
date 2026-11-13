import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Circle, Monitor, RefreshCw, RotateCcw, Square, X } from 'lucide-react';

// Record a training or SOP video right in the app: with the camera (walk to the
// elevator and show it) or of the screen (show how a booking is made in software).
// The clip comes back as a file, ready to save with the item.

const MAX_SECONDS = 10 * 60;
const MIME_CHOICES = [
  'video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4',
  'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm',
];

export const canRecordCamera = () => typeof window !== 'undefined' && !!window.MediaRecorder && !!navigator.mediaDevices?.getUserMedia;
export const canRecordScreen = () => canRecordCamera() && !!navigator.mediaDevices?.getDisplayMedia;

const pickMime = () => MIME_CHOICES.find(type => window.MediaRecorder.isTypeSupported?.(type)) || '';
const clock = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const stopAll = stream => stream?.getTracks().forEach(t => t.stop());

export function VideoRecorder({ mode, title, onDone, onCancel, colors }) {
  const liveRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const [phase, setPhase] = useState('starting');   // starting | ready | recording | review | error
  const [error, setError] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [facing, setFacing] = useState('environment');
  const [clip, setClip] = useState(null);           // { blob, url, mime }

  const openStream = useCallback(async () => {
    stopAll(streamRef.current);
    streamRef.current = null;
    setError('');
    setPhase('starting');
    try {
      let stream;
      if (mode === 'screen') {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 24 }, audio: false });
        stream = new MediaStream(screen.getVideoTracks());
        try {
          const mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
          mic.getAudioTracks().forEach(t => stream.addTrack(t));
        } catch { /* recording without narration is still useful */ }
        // The browser's own "Stop sharing" button ends the recording.
        screen.getVideoTracks()[0].addEventListener('ended', () => {
          if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
        });
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: { echoCancellation: true, noiseSuppression: true },
        });
      }
      streamRef.current = stream;
      if (liveRef.current) { liveRef.current.srcObject = stream; liveRef.current.play?.().catch(() => {}); }
      setPhase('ready');
    } catch (e) {
      setPhase('error');
      setError(e?.name === 'NotAllowedError'
        ? (mode === 'screen' ? 'Screen sharing was not allowed. Choose a screen or window to record.' : 'Noted needs your camera and microphone to record. Allow them in your browser and try again.')
        : (mode === 'screen' ? 'This browser cannot record the screen.' : 'No camera was found on this device.'));
    }
  }, [mode, facing]);

  useEffect(() => {
    openStream();
    return () => { clearInterval(timerRef.current); stopAll(streamRef.current); };
  }, [openStream]);

  useEffect(() => () => { if (clip?.url) URL.revokeObjectURL(clip.url); }, [clip]);

  const start = () => {
    const stream = streamRef.current;
    if (!stream) return;
    const mimeType = pickMime();
    let recorder;
    try {
      recorder = new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), videoBitsPerSecond: mode === 'screen' ? 1_200_000 : 1_000_000, audioBitsPerSecond: 64_000 });
    } catch {
      recorder = new MediaRecorder(stream);
    }
    chunksRef.current = [];
    recorder.ondataavailable = e => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      clearInterval(timerRef.current);
      const type = (recorder.mimeType || mimeType || 'video/webm').split(';')[0];
      const blob = new Blob(chunksRef.current, { type });
      stopAll(streamRef.current);
      streamRef.current = null;
      if (!blob.size) { setPhase('error'); setError('Nothing was recorded. Try again.'); return; }
      setClip({ blob, url: URL.createObjectURL(blob), mime: type });
      setPhase('review');
    };
    recorder.start(1000);
    recorderRef.current = recorder;
    setSeconds(0);
    setPhase('recording');
    const began = Date.now();
    timerRef.current = setInterval(() => {
      const s = Math.floor((Date.now() - began) / 1000);
      setSeconds(s);
      if (s >= MAX_SECONDS && recorder.state === 'recording') recorder.stop();
    }, 500);
  };

  const stop = () => { if (recorderRef.current?.state === 'recording') recorderRef.current.stop(); };

  const retake = () => { setClip(null); setSeconds(0); openStream(); };

  const use = () => {
    if (!clip) return;
    const ext = clip.mime.includes('mp4') ? 'mp4' : 'webm';
    const safe = (title || 'recording').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 60) || 'recording';
    onDone(clip.blob, `${safe}.${ext}`);
  };

  const close = () => { clearInterval(timerRef.current); if (recorderRef.current?.state === 'recording') { recorderRef.current.onstop = null; recorderRef.current.stop(); } stopAll(streamRef.current); onCancel(); };

  const btn = (bg, fg = 'white') => ({ minHeight: 52, padding: '0 22px', borderRadius: 999, border: 'none', background: bg, color: fg, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 });
  const Icon = mode === 'screen' ? Monitor : Camera;

  return (
    <div role="dialog" aria-modal="true" aria-label={mode === 'screen' ? 'Record your screen' : 'Record a video'}
      style={{ position: 'fixed', inset: 0, zIndex: 10000, background: '#0b0b0c', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', color: 'white' }}>
        <Icon size={18} />
        <div style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 700 }}>{mode === 'screen' ? 'Record your screen' : 'Record a video'}</div>
        {phase === 'recording' && (
          <span aria-live="polite" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: 'rgba(255,59,48,.18)', color: '#ff6b61', fontWeight: 800, fontSize: 13 }}>
            <Circle size={10} fill="#ff3b30" color="#ff3b30" />{clock(seconds)} / {clock(MAX_SECONDS)}
          </span>
        )}
        <button onClick={close} aria-label="Close recorder" style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.12)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={20} color="white" /></button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
        {phase === 'review' && clip ? (
          <video key={clip.url} src={clip.url} controls playsInline style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12, background: '#000' }} />
        ) : phase === 'error' ? (
          <p role="alert" style={{ maxWidth: 420, color: 'rgba(255,255,255,.8)', fontSize: 15, lineHeight: 1.6, textAlign: 'center' }}>{error}</p>
        ) : (
          <video ref={liveRef} muted playsInline autoPlay
            style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 12, background: '#000', transform: mode === 'camera' && facing === 'user' ? 'scaleX(-1)' : 'none' }} />
        )}
      </div>

      <div style={{ flexShrink: 0, padding: '14px 18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
        {phase === 'starting' && <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 14 }}>{mode === 'screen' ? 'Choose the screen or window to record…' : 'Starting the camera…'}</span>}
        {phase === 'ready' && (
          <>
            {mode === 'camera' && <button onClick={() => setFacing(f => (f === 'user' ? 'environment' : 'user'))} aria-label="Switch camera" style={btn('rgba(255,255,255,.14)')}><RefreshCw size={17} />Flip</button>}
            <button onClick={start} style={btn(colors.danger)}><Circle size={16} fill="white" />Start recording</button>
          </>
        )}
        {phase === 'recording' && <button onClick={stop} style={btn('white', '#111')}><Square size={15} fill="#111" />Stop</button>}
        {phase === 'review' && (
          <>
            <button onClick={retake} style={btn('rgba(255,255,255,.14)')}><RotateCcw size={17} />Record again</button>
            <button onClick={use} style={btn(colors.accent)}>Use this video</button>
          </>
        )}
        {phase === 'error' && <button onClick={retake} style={btn('rgba(255,255,255,.14)')}><RotateCcw size={17} />Try again</button>}
      </div>
      {mode === 'screen' && phase === 'ready' && (
        <p style={{ margin: '-14px 0 22px', textAlign: 'center', color: 'rgba(255,255,255,.5)', fontSize: 12 }}>Your microphone is recorded too, so you can talk through the steps.</p>
      )}
    </div>
  );
}
