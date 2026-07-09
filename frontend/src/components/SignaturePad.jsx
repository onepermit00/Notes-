import React, { useRef, useEffect, useState, useCallback } from 'react';

const INTER = `'Inter','Plus Jakarta Sans',sans-serif`;
const BLUE  = '#FF385C';

export const SignaturePad = ({ onSave, onCancel, signerName = '', colors }) => {
  const canvasRef = useRef(null);
  const drawing   = useRef(false);
  const lastPos   = useRef(null);
  const [hasStrokes, setHasStrokes] = useState(false);

  const TEXT   = colors?.TEXT   || '#111827';
  const MUTED  = colors?.MUTED  || '#717171';
  const BORDER = colors?.BORDER || '#E5E7EB';
  const CARD2  = colors?.CARD2  || '#F9FAFB';

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches?.[0] || e;
    return {
      x: (src.clientX - rect.left) * (canvas.width  / rect.width),
      y: (src.clientY - rect.top)  * (canvas.height / rect.height),
    };
  };

  const startDraw = useCallback((e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawing.current  = true;
    lastPos.current  = getPos(e, canvas);
  }, []);

  const draw = useCallback((e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = TEXT;
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.stroke();
    lastPos.current = pos;
    setHasStrokes(true);
  }, [TEXT]);

  const stopDraw = useCallback(() => {
    drawing.current = false;
    lastPos.current = null;
  }, []);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const signedAt = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    onSave(dataUrl, signedAt);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr  = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {signerName && (
        <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: 0 }}>
          Signing as: <strong style={{ color: TEXT }}>{signerName}</strong>
        </p>
      )}

      {/* Canvas area */}
      <div style={{ position: 'relative', border: `2px dashed ${BORDER}`, borderRadius: 14, overflow: 'hidden', background: CARD2, touchAction: 'none', userSelect: 'none' }}>
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: 150, cursor: 'crosshair' }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        {!hasStrokes && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', gap: 6 }}>
            <span style={{ fontFamily: INTER, fontSize: 13, color: MUTED }}>Sign in this box</span>
            <div style={{ width: 100, height: 1, background: BORDER }} />
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onCancel}
          style={{ flex: 1, padding: '12px 0', background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 10, fontFamily: INTER, fontSize: 14, fontWeight: 700, color: TEXT, cursor: 'pointer' }}>
          Cancel
        </button>
        <button onClick={clear} disabled={!hasStrokes}
          style={{ flex: 1, padding: '12px 0', background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 10, fontFamily: INTER, fontSize: 14, fontWeight: 700, color: MUTED, cursor: hasStrokes ? 'pointer' : 'not-allowed', opacity: hasStrokes ? 1 : 0.4 }}>
          Clear
        </button>
        <button onClick={save} disabled={!hasStrokes}
          style={{ flex: 2, padding: '12px 0', background: hasStrokes ? BLUE : BORDER, border: 'none', borderRadius: 10, fontFamily: INTER, fontSize: 14, fontWeight: 700, color: 'white', cursor: hasStrokes ? 'pointer' : 'not-allowed', opacity: hasStrokes ? 1 : 0.6 }}>
          Confirm & Sign
        </button>
      </div>

      <p style={{ fontFamily: INTER, fontSize: 11, color: MUTED, margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
        By signing you confirm receipt and agree to the building's terms of use.
      </p>
    </div>
  );
};
