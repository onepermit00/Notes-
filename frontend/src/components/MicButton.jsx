import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

// Inject pulse keyframe once
if (typeof document !== 'undefined' && !document.getElementById('mic-pulse-kf')) {
  const s = document.createElement('style');
  s.id = 'mic-pulse-kf';
  s.textContent = `@keyframes micPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,59,48,0.45)}60%{box-shadow:0 0 0 7px rgba(255,59,48,0)}}`;
  document.head.appendChild(s);
}

export default function MicButton({ onTranscript, disabled = false, style = {} }) {
  const [listening, setListening] = useState(false);
  const recogRef = useRef(null);

  const toggle = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('Voice input requires Chrome or Safari.');
      return;
    }
    if (listening) {
      recogRef.current?.stop();
      setListening(false);
      return;
    }
    const r = new SR();
    r.continuous = true;
    r.interimResults = false;
    r.lang = 'en-US';
    r.onresult = (e) => {
      const text = Array.from(e.results)
        .slice(e.resultIndex)
        .filter(res => res.isFinal)
        .map(res => res[0].transcript)
        .join(' ')
        .trim();
      if (text) onTranscript(text);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recogRef.current = r;
    r.start();
    setListening(true);
  }, [listening, onTranscript]);

  // Clean up on unmount
  useEffect(() => () => recogRef.current?.stop(), []);

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      title={listening ? 'Tap to stop' : 'Tap to speak'}
      style={{
        position: 'absolute',
        top: 9,
        right: 9,
        width: 28,
        height: 28,
        borderRadius: '50%',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: listening ? 'rgba(255,59,48,0.13)' : 'rgba(128,128,128,0.10)',
        color: listening ? '#FF3B30' : '#8E8E93',
        flexShrink: 0,
        transition: 'background 0.15s, color 0.15s',
        animation: listening ? 'micPulse 1.2s ease-in-out infinite' : 'none',
        opacity: disabled ? 0.35 : 1,
        zIndex: 2,
        ...style,
      }}
    >
      {listening ? <MicOff size={13} /> : <Mic size={13} />}
    </button>
  );
}
