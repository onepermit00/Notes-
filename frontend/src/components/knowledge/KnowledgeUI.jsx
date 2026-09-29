import React from 'react';
import { BookOpen, CheckCircle, ChevronRight, FileText, Image, Play, Search, Video, X } from 'lucide-react';

export const KnowledgeStatusBadge = ({ status = 'published', colors, label }) => {
  const palette = {
    published: [colors.success, `${colors.success}14`],
    reviewed: [colors.success, `${colors.success}14`],
    review: [colors.warning, `${colors.warning}18`],
    draft: [colors.muted, colors.surface],
    assigned: [colors.accent, `${colors.accent}12`],
  };
  const [color, background] = palette[status] || palette.draft;
  return <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 8px', borderRadius:999, color, background, fontSize:9, fontWeight:800, letterSpacing:'.08em', textTransform:'uppercase', whiteSpace:'nowrap' }}><span style={{ width:5, height:5, borderRadius:99, background:color }}/>{label || status}</span>;
};

export const KnowledgeProgress = ({ value, detail, colors }) => (
  <div style={{ border:`1px solid ${colors.border}`, borderRadius:16, background:colors.card, padding:18, boxShadow:colors.shadow }}>
    <div style={{ display:'flex', justifyContent:'space-between', gap:12, marginBottom:9 }}><span style={{ fontSize:9, fontWeight:800, color:colors.accent, letterSpacing:'.16em', textTransform:'uppercase' }}>Team readiness</span><span style={{ fontSize:12, fontWeight:800, color:colors.text }}>{value}%</span></div>
    <div style={{ height:5, borderRadius:99, background:colors.surface, overflow:'hidden' }}><div style={{ width:`${value}%`, height:'100%', borderRadius:99, background:colors.accent, transition:'width 220ms ease' }}/></div>
    <p style={{ fontSize:11, color:colors.muted, margin:'8px 0 0' }}>{detail}</p>
  </div>
);

export const KnowledgeFilters = ({ search, onSearch, placeholder, categories, selected, onSelect, colors }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
    <div style={{ position:'relative' }}>
      <Search size={18} color={colors.muted} style={{ position:'absolute', left:15, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
      <input value={search} onChange={e=>onSearch(e.target.value)} placeholder={placeholder} aria-label={placeholder} style={{ width:'100%', minHeight:52, boxSizing:'border-box', border:`1.5px solid ${search?colors.accent:colors.border}`, borderRadius:12, background:search?`${colors.accent}08`:colors.surface, color:colors.text, padding:'13px 46px', fontSize:16, outline:'none' }}/>
      {search && <button onClick={()=>onSearch('')} aria-label="Clear search" style={{ position:'absolute', right:8, top:8, width:36, height:36, borderRadius:9, border:0, background:colors.card, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><X size={15} color={colors.muted}/></button>}
    </div>
    <div role="tablist" style={{ display:'flex', gap:4, padding:4, overflowX:'auto', background:colors.surface, border:`1px solid ${colors.border}`, borderRadius:14, scrollbarWidth:'none' }}>
      {categories.map(category=>{ const active=selected===category; return <button key={category} role="tab" aria-selected={active} onClick={()=>onSelect(category)} style={{ minHeight:40, padding:'0 13px', border:active?`1px solid ${colors.border}`:'1px solid transparent', borderRadius:11, background:active?colors.card:'transparent', boxShadow:active?'0 2px 8px rgba(0,0,0,.07)':'none', color:active?colors.text:colors.muted, fontSize:11, fontWeight:750, cursor:'pointer', whiteSpace:'nowrap' }}>{category}</button>})}
    </div>
  </div>
);

export const KnowledgeCard = ({ item, kind='sop', onOpen, actions, status, colors, icon: Icon=BookOpen }) => {
  const TypeIcon = item.fileType === 'video' ? Video : item.fileType === 'image' ? Image : FileText;
  const typeLabel = item.fileType === 'video' ? 'Video' : item.fileType === 'image' ? 'Visual guide' : 'Document';
  return <div style={{ minHeight:128, padding:14, borderRadius:14, display:'grid', gridTemplateColumns:'58px minmax(0,1fr) auto', alignItems:'center', gap:13, background:colors.card, border:`1px solid ${colors.border}`, boxShadow:colors.shadow }}>
    <button onClick={()=>onOpen(item)} aria-label={`Open ${item.title}`} style={{ width:58, height:78, padding:0, border:0, borderRadius:11, background:colors.surface, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', position:'relative' }}>
      {item.fileType==='image' ? <img src={item.dataURL} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <Icon size={24} color={colors.muted}/>} {item.fileType==='video'&&<Play size={18} color={colors.accent} style={{ position:'absolute' }}/>} 
    </button>
    <button onClick={()=>onOpen(item)} style={{ minWidth:0, padding:0, border:0, background:'transparent', textAlign:'left', cursor:'pointer' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:6 }}><span style={{ fontSize:9, fontWeight:800, color:colors.accent, textTransform:'uppercase', letterSpacing:'.14em' }}>{item.category}</span>{status&&<KnowledgeStatusBadge status={status} colors={colors}/>}</div>
      <p style={{ fontWeight:800, color:colors.text, fontSize:14, lineHeight:1.3, margin:'0 0 9px' }}>{item.title}</p>
      <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:10, fontWeight:650, color:status==='reviewed'?colors.success:colors.muted }}><TypeIcon size={12}/>{status==='reviewed'?'Reviewed':typeLabel}{kind==='training'&&item.assignmentCount!=null?` · ${item.assignmentCount} assigned`:''}</span>
    </button>
    <div style={{ display:'flex', alignItems:'center', gap:5 }}>{actions}<button onClick={()=>onOpen(item)} aria-label={`View ${item.title}`} style={{ width:34, height:34, border:0, background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><ChevronRight size={18} color={colors.muted}/></button></div>
  </div>;
};

export const KnowledgeEmpty = ({ icon: Icon=BookOpen, title, description, action, colors }) => <div style={{ minHeight:220, border:`1px solid ${colors.border}`, borderRadius:16, background:colors.card, padding:'34px 24px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', boxShadow:colors.shadow }}><div style={{ width:50, height:50, borderRadius:14, background:`${colors.accent}10`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}><Icon size={22} color={colors.accent}/></div><h3 style={{ fontSize:18, fontWeight:800, color:colors.text, margin:'0 0 7px' }}>{title}</h3><p style={{ maxWidth:430, fontSize:13, color:colors.muted, lineHeight:1.6, margin:action?'0 0 15px':0 }}>{description}</p>{action}</div>;
