import React, { useState } from 'react';
import { Check, X, Clock, User, Bell } from 'lucide-react';
import { DECLINE_REASONS } from '../services/mockData';
import { useTheme } from '../context/ThemeContext';

export const TaskRequestCard = ({ task, onAccept, onDecline }) => {
  const { colors } = useTheme();
  const { CARD, BORDER, TEXT, MUTED, BLUE, RED, INTER } = colors;

  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [selectedReason, setSelectedReason]   = useState('');

  const handleDecline = () => {
    if (!selectedReason) return;
    onDecline(task.id, selectedReason);
    setShowDeclineForm(false);
  };

  return (
    <article className="stagger-item" style={{ background:CARD,border:`1px solid ${showDeclineForm?'rgba(255,59,48,.26)':BORDER}`,borderRadius:16,overflow:'hidden',boxShadow:showDeclineForm?'0 5px 18px rgba(255,59,48,.08)':'0 2px 10px rgba(0,0,0,.04)',fontFamily:INTER,transition:'all 160ms' }}>
      <div style={{ padding:16 }}>

        {/* Header */}
        <div style={{ display:'grid',gridTemplateColumns:'44px 1fr',alignItems:'start',gap:13,marginBottom:12 }}>
          <div style={{ width:44,height:44,background:'rgba(255,56,92,.09)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center' }}>
            <Bell size={19} color={BLUE} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom:5 }}>
              <span style={{ fontFamily:INTER,fontSize:9,fontWeight:800,color:BLUE,background:'rgba(255,56,92,.09)',borderRadius:999,padding:'4px 8px',textTransform:'uppercase',letterSpacing:'.08em' }}>Management request</span>
            </div>
            <h3 style={{ fontFamily:INTER,fontSize:14,fontWeight:800,color:TEXT,margin:0,lineHeight:1.35 }}>{task.title}</h3>
          </div>
        </div>

        {/* Meta */}
        <div style={{ display:'flex',alignItems:'center',gap:12,margin:'0 0 11px 57px',flexWrap:'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: INTER, fontSize: 12, color: MUTED }}>
            <Clock size={12} color={MUTED} />{task.scheduledTime}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: INTER, fontSize: 12, color: MUTED }}>
            <User size={12} color={MUTED} />{task.proposedBy}
          </span>
        </div>

        {task.description && (
          <p style={{ fontFamily:INTER,fontSize:12,color:MUTED,margin:'0 0 14px',lineHeight:1.55,padding:'11px 12px',background:CARD2,borderRadius:10 }}>{task.description}</p>
        )}

        {/* Actions */}
        {showDeclineForm ? (
          <div style={{ marginTop:4,paddingTop:14,borderTop:`1px solid ${BORDER}` }}>
            <div style={{ marginBottom:11 }}><p style={{ fontFamily:INTER,fontSize:9,fontWeight:800,color:RED,letterSpacing:'.14em',textTransform:'uppercase',margin:'0 0 5px' }}>Decline request</p><p style={{fontFamily:INTER,fontSize:12,fontWeight:750,color:TEXT,margin:0}}>Why can’t the desk accept this?</p></div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:7,marginBottom:12 }}>
              {DECLINE_REASONS.map(reason => (
                <button key={reason} onClick={() => setSelectedReason(reason)}
                  style={{ minHeight:44,width:'100%',padding:'8px 10px',background:selectedReason===reason?'rgba(255,59,48,.07)':CARD2,border:selectedReason===reason?'1.5px solid rgba(255,59,48,.34)':`1px solid ${BORDER}`,borderRadius:10,textAlign:'left',fontFamily:INTER,fontSize:11,fontWeight:650,color:selectedReason===reason?RED:MUTED,cursor:'pointer',transition:'all 150ms' }}>
                  {reason}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowDeclineForm(false)}
                style={{ flex:1,minHeight:44,background:CARD2,border:`1px solid ${BORDER}`,borderRadius:12,fontFamily:INTER,fontSize:12,fontWeight:700,color:TEXT,cursor:'pointer' }}>
                Cancel
              </button>
              <button onClick={handleDecline} disabled={!selectedReason}
                style={{ flex:1,minHeight:44,background:selectedReason?RED:CARD2,border:selectedReason?'none':`1px solid ${BORDER}`,borderRadius:999,fontFamily:INTER,fontSize:12,fontWeight:750,color:selectedReason?'white':MUTED,cursor:selectedReason?'pointer':'not-allowed',boxShadow:selectedReason?'0 5px 16px rgba(255,59,48,.2)':'none' }}>
                Confirm
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display:'flex',gap:8,paddingTop:13,borderTop:`1px solid ${BORDER}` }}>
            <button onClick={() => onAccept(task)} data-testid={`accept-request-${task.id}`}
              style={{ flex:2,minHeight:44,background:BLUE,border:'none',borderRadius:999,fontFamily:INTER,fontSize:12,fontWeight:750,color:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7,boxShadow:'0 5px 16px rgba(255,56,92,.22)' }}>
              <Check size={16} /> Accept
            </button>
            <button onClick={() => setShowDeclineForm(true)} data-testid={`decline-request-${task.id}`}
              style={{ flex:1,minHeight:44,background:CARD2,border:`1px solid ${BORDER}`,borderRadius:14,fontFamily:INTER,fontSize:12,fontWeight:700,color:MUTED,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7 }}>
              <X size={16} /> Decline
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default TaskRequestCard;
