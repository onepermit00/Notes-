import React, { useState, useEffect } from 'react';
import { X, Plus, Heart, Activity, Thermometer, Frown } from 'lucide-react';

const INTER  = `'Inter','Plus Jakarta Sans',sans-serif`;
const MUTED  = '#8E8E93';
const CARD   = '#FFFFFF';
const BORDER = 'rgba(0,0,0,0.09)';
const SHADOW = '0 2px 10px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)';

const glassCard = {
  background: CARD,
  border: `1px solid ${BORDER}`,
  boxShadow: SHADOW,
  borderRadius: 20,
};

const baseInput = {
  padding: '14px 16px',
  background: '#F2F2F7',
  border: `1.5px solid ${BORDER}`,
  borderRadius: 14,
  color: '#1C1C1E',
  outline: 'none',
  fontSize: 16,
  fontFamily: INTER,
  boxSizing: 'border-box',
};

export const VitalsModal = ({
  isOpen,
  onClose,
  vitalsData,
  onAddVital,
  isCaregiver = false,
  initialTab = 'bp'
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVital, setNewVital] = useState({ systolic: '', diastolic: '', heartRate: '', temperature: '', pain: '' });

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const vitalThemes = {
    bp: {
      label: 'Blood Pressure', icon: Heart,
      primaryColor: '#e91e7a', bgColor: 'rgba(233,30,122,0.08)',
      graphColor: '#e91e7a', secondaryGraphColor: '#f97316',
      yAxisDomain: [60, 160],
    },
    hr: {
      label: 'Heart Rate', icon: Activity,
      primaryColor: '#f97316', bgColor: 'rgba(249,115,22,0.08)',
      graphColor: '#f97316', yAxisDomain: [50, 120],
    },
    temp: {
      label: 'Temperature', icon: Thermometer,
      primaryColor: '#3b82f6', bgColor: 'rgba(59,130,246,0.08)',
      graphColor: '#3b82f6', yAxisDomain: [96, 102],
    },
    pain: {
      label: 'Pain Level', icon: Frown,
      primaryColor: '#8b5cf6', bgColor: 'rgba(139,92,246,0.08)',
      graphColor: '#8b5cf6', yAxisDomain: [0, 10],
    }
  };

  const theme = vitalThemes[activeTab];
  const ActiveIcon = theme.icon;

  const getLatestValue = (type) => {
    if (!vitalsData) return '--';
    switch (type) {
      case 'bp': {
        const bp = vitalsData.bloodPressure?.[vitalsData.bloodPressure.length - 1];
        return bp ? `${bp.systolic}/${bp.diastolic}` : '--';
      }
      case 'hr': {
        const hr = vitalsData.heartRate?.[vitalsData.heartRate.length - 1];
        return hr ? `${hr.value}` : '--';
      }
      case 'temp': {
        const temp = vitalsData.temperature?.[vitalsData.temperature.length - 1];
        return temp ? `${temp.value}°F` : '--';
      }
      case 'pain': {
        const pain = vitalsData.pain?.[vitalsData.pain.length - 1];
        return pain ? `${pain.value}/10` : '--';
      }
      default: return '--';
    }
  };

  const getChartData = () => {
    if (!vitalsData) return [];
    switch (activeTab) {
      case 'bp': return vitalsData.bloodPressure || [];
      case 'hr': return vitalsData.heartRate || [];
      case 'temp': return vitalsData.temperature || [];
      case 'pain': return vitalsData.pain || [];
      default: return [];
    }
  };

  const handleAddVital = () => {
    if (onAddVital) {
      const vitalEntry = {
        date: new Date().toLocaleDateString('en-US', { weekday: 'short' }),
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        ...(activeTab === 'bp' && { systolic: parseInt(newVital.systolic), diastolic: parseInt(newVital.diastolic) }),
        ...(activeTab === 'hr' && { value: parseInt(newVital.heartRate) }),
        ...(activeTab === 'temp' && { value: parseFloat(newVital.temperature) }),
        ...(activeTab === 'pain' && { value: parseInt(newVital.pain) })
      };
      onAddVital(activeTab, vitalEntry);
      setNewVital({ systolic: '', diastolic: '', heartRate: '', temperature: '', pain: '' });
      setShowAddForm(false);
    }
  };

  const chartData = getChartData();
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const CW = 280;
  const CH = 110;

  const renderDotChart = () => {
    const yLabels = [10, 7.5, 5, 2.5, 0];
    return (
      <div style={{ position: 'relative', height: 144, width: '100%' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 32 }}>
          {yLabels.map((v, i) => <span key={i} style={{ fontSize: 11, color: MUTED }}>{v}</span>)}
        </div>
        <div style={{ marginLeft: 40, height: '100%', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, paddingBottom: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {[0,1,2,3,4].map((_, i) => (
              <div key={i} style={{ borderBottom: `1px dashed ${BORDER}`, width: '100%' }} />
            ))}
          </div>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: 'calc(100% - 24px)' }} viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none">
            {chartData.length > 1 && (
              <polyline fill="none" stroke={theme.primaryColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                points={chartData.map((d, i) => {
                  const x = (i / (chartData.length - 1)) * CW;
                  const y = CH - ((d.value / 10) * CH);
                  return `${x},${y}`;
                }).join(' ')}
              />
            )}
            {chartData.map((d, i) => {
              const x = chartData.length > 1 ? (i / (chartData.length - 1)) * CW : CW / 2;
              const y = CH - ((d.value / 10) * CH);
              return <circle key={i} cx={x} cy={y} r="5" fill={theme.primaryColor} />;
            })}
          </svg>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between' }}>
            {days.map((day) => <span key={day} style={{ fontSize: 10, color: MUTED }}>{day}</span>)}
          </div>
        </div>
      </div>
    );
  };

  const renderLineChart = () => {
    const [minVal, maxVal] = theme.yAxisDomain;
    const range = maxVal - minVal;
    const yLabels = [maxVal, maxVal - range * 0.25, maxVal - range * 0.5, maxVal - range * 0.75, minVal];
    return (
      <div style={{ position: 'relative', height: 144, width: '100%' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 32 }}>
          {yLabels.map((v, i) => <span key={i} style={{ fontSize: 11, color: MUTED }}>{Math.round(v)}</span>)}
        </div>
        <div style={{ marginLeft: 40, height: '100%', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, paddingBottom: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {[0,1,2,3,4].map((_, i) => (
              <div key={i} style={{ borderBottom: `1px dashed ${BORDER}`, width: '100%' }} />
            ))}
          </div>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: 'calc(100% - 24px)' }} viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none">
            {activeTab === 'bp' ? (
              <>
                {chartData.length > 1 && (
                  <>
                    <polyline fill="none" stroke={theme.graphColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      points={chartData.map((d, i) => {
                        const x = (i / (chartData.length - 1)) * CW;
                        const y = CH - (((d.systolic - minVal) / range) * CH);
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                    <polyline fill="none" stroke={theme.secondaryGraphColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      points={chartData.map((d, i) => {
                        const x = (i / (chartData.length - 1)) * CW;
                        const y = CH - (((d.diastolic - minVal) / range) * CH);
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                  </>
                )}
                {chartData.map((d, i) => {
                  const x = chartData.length > 1 ? (i / (chartData.length - 1)) * CW : CW / 2;
                  return (
                    <React.Fragment key={i}>
                      <circle cx={x} cy={CH - (((d.systolic - minVal) / range) * CH)} r="5" fill={theme.graphColor} />
                      <circle cx={x} cy={CH - (((d.diastolic - minVal) / range) * CH)} r="5" fill={theme.secondaryGraphColor} />
                    </React.Fragment>
                  );
                })}
              </>
            ) : (
              <>
                {chartData.length > 1 && (
                  <polyline fill="none" stroke={theme.graphColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    points={chartData.map((d, i) => {
                      const x = (i / (chartData.length - 1)) * CW;
                      const y = CH - (((d.value - minVal) / range) * CH);
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                )}
                {chartData.map((d, i) => {
                  const x = chartData.length > 1 ? (i / (chartData.length - 1)) * CW : CW / 2;
                  const y = CH - (((d.value - minVal) / range) * CH);
                  return <circle key={i} cx={x} cy={y} r="5" fill={theme.graphColor} />;
                })}
              </>
            )}
          </svg>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between' }}>
            {days.map((day) => <span key={day} style={{ fontSize: 10, color: MUTED }}>{day}</span>)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontFamily: INTER }}
      onClick={onClose}
    >
      <div
        style={{ background: CARD, width: '100%', maxWidth: 512, maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '28px 28px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ flexShrink: 0, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${BORDER}` }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1C1C1E' }}>{theme.label}</h2>
          <button
            onClick={onClose}
            style={{ width: 36, height: 36, background: '#F2F2F7', border: `1px solid ${BORDER}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            data-testid="vitals-close-btn"
          >
            <X size={18} color={MUTED} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 32px' }}>
          {/* Current Value Card */}
          <div style={{ borderRadius: 24, padding: 24, textAlign: 'center', marginBottom: 16, background: theme.bgColor, border: `1px solid ${BORDER}` }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', background: `${theme.primaryColor}20` }}>
              <ActiveIcon size={32} style={{ color: theme.primaryColor }} />
            </div>
            <p style={{ fontSize: 48, fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.03em', lineHeight: 1 }}>{getLatestValue(activeTab)}</p>
            <p style={{ fontSize: 14, color: MUTED, fontWeight: 600, marginTop: 8 }}>Current Reading</p>
          </div>

          {/* Chart */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ ...glassCard, padding: 20, marginBottom: 8 }}>
              {activeTab === 'pain' ? renderDotChart() : renderLineChart()}
            </div>
            <p style={{ fontSize: 13, color: MUTED, textAlign: 'center', fontWeight: 600 }}>Weekly trend</p>
          </div>

          {/* Add Vital Form (Caregiver Only) */}
          {isCaregiver && (
            <div style={{ marginBottom: 16 }}>
              {showAddForm ? (
                <div style={{ ...glassCard, padding: 20 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#1C1C1E', marginBottom: 16 }}>Log New Reading</p>
                  {activeTab === 'bp' && (
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                      <input type="number" placeholder="Systolic" value={newVital.systolic}
                        onChange={(e) => setNewVital({...newVital, systolic: e.target.value})}
                        style={{ ...baseInput, flex: 1 }} data-testid="vital-systolic" />
                      <input type="number" placeholder="Diastolic" value={newVital.diastolic}
                        onChange={(e) => setNewVital({...newVital, diastolic: e.target.value})}
                        style={{ ...baseInput, flex: 1 }} data-testid="vital-diastolic" />
                    </div>
                  )}
                  {activeTab === 'hr' && (
                    <div style={{ marginBottom: 12 }}>
                      <input type="number" placeholder="Heart Rate (BPM)" value={newVital.heartRate}
                        onChange={(e) => setNewVital({...newVital, heartRate: e.target.value})}
                        style={{ ...baseInput, width: '100%' }} data-testid="vital-heartrate" />
                    </div>
                  )}
                  {activeTab === 'temp' && (
                    <div style={{ marginBottom: 12 }}>
                      <input type="number" step="0.1" placeholder="Temperature (°F)" value={newVital.temperature}
                        onChange={(e) => setNewVital({...newVital, temperature: e.target.value})}
                        style={{ ...baseInput, width: '100%' }} data-testid="vital-temperature" />
                    </div>
                  )}
                  {activeTab === 'pain' && (
                    <div style={{ marginBottom: 12 }}>
                      <input type="number" min="0" max="10" placeholder="Pain Level (0-10)" value={newVital.pain}
                        onChange={(e) => setNewVital({...newVital, pain: e.target.value})}
                        style={{ ...baseInput, width: '100%' }} data-testid="vital-pain" />
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
                    <button onClick={() => setShowAddForm(false)}
                      style={{ flex: 1, padding: '14px 0', border: `1.5px solid ${BORDER}`, borderRadius: 14, background: '#F2F2F7', color: MUTED, fontFamily: INTER, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button onClick={handleAddVital}
                      style={{ flex: 1, padding: '14px 0', background: '#2E9E5B', border: 'none', borderRadius: 14, color: 'white', fontFamily: INTER, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(46,158,91,0.3)' }}
                      data-testid="vital-save-btn">
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAddForm(true)}
                  style={{ width: '100%', padding: '16px 0', border: `2px dashed ${BORDER}`, borderRadius: 20, background: '#F2F2F7', color: MUTED, fontFamily: INTER, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                  data-testid="log-new-reading-btn">
                  <Plus size={22} color={MUTED} />
                  Log New Reading
                </button>
              )}
            </div>
          )}

          {/* History */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Recent History</p>
            <div style={{ ...glassCard, overflow: 'hidden' }}>
              {chartData.slice(-5).reverse().map((entry, idx, arr) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: idx < arr.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                  <span style={{ fontSize: 14, color: '#1C1C1E', fontWeight: 600 }}>{entry.date} at {entry.time}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: theme.primaryColor }}>
                    {activeTab === 'bp' ? `${entry.systolic}/${entry.diastolic}` : entry.value}
                    {activeTab === 'temp' && '°F'}
                    {activeTab === 'pain' && '/10'}
                  </span>
                </div>
              ))}
              {chartData.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center' }}>
                  <p style={{ fontSize: 14, color: MUTED }}>No history available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VitalsModal;
