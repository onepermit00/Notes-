import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Phone, Mail, FileText, ChevronRight, ChevronDown, ExternalLink } from 'lucide-react';

const INTER  = `'Inter','Plus Jakarta Sans',sans-serif`;
const BG     = '#F2F2F7';
const CARD   = '#FFFFFF';
const MUTED  = '#8E8E93';
const GREEN  = '#2E9E5B';
const BORDER = 'rgba(0,0,0,0.09)';
const SHADOW = '0 2px 10px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)';

const glassCard = {
  background: CARD,
  border: `1px solid ${BORDER}`,
  boxShadow: SHADOW,
  borderRadius: 16,
  overflow: 'hidden',
};

const glassIcon = {
  width: 44, height: 44, borderRadius: 12,
  background: '#F2F2F7',
  border: `1px solid ${BORDER}`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

export const SupportPage = ({ onBack, role = 'caregiver' }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const contactOptions = [
    { icon: MessageCircle, label: 'Live Chat',     desc: 'Chat with our support team', action: 'Start Chat'  },
    { icon: Phone,         label: 'Call Support',  desc: '1-888-555-0123',             action: 'Call Now'    },
    { icon: Mail,          label: 'Email Support', desc: 'support@clockit.io',       action: 'Send Email'  },
  ];

  const caregiverFaqs = [
    { question: 'How do I complete a task?',         answer: "Navigate to the Home tab on your Caregiver Dashboard where you'll see \"Today's Tasks\" listed. Tap on any task to view its details. Once you've performed the activity, tap the \"Mark Complete\" button. You can add a completion note and attach a photo as documentation." },
    { question: 'How do I report an incident?',      answer: "Go to the Incidents tab from the bottom navigation bar. Tap \"New Incident Report\" to start a 5-step guided report. You'll select the incident type, choose a severity level, describe what happened and actions taken, add witness information, optionally attach photos, and review before submitting." },
    { question: 'How do I update patient vitals?',   answer: "From the Home tab, tap on any vital card to open the Vitals Modal where you can view the history and trends. To log a new reading, use the input fields provided in the modal." },
    { question: 'How do I contact family members?',  answer: "Use the Messages tab from the bottom navigation bar to access the chat feature. You can send direct messages to family members assigned to the patient." },
    { question: 'How do I end my shift?',            answer: "Go to the Shifts tab from the bottom navigation bar. Tap the \"Clock Out\" button to end your shift. Your shift duration and all activities performed are automatically logged." },
    { question: 'What is the AI Care Assistant?',    answer: "The AI Care Assistant is your intelligent helper available via the floating button on the Home tab. It can answer questions about care protocols, medication schedules, help with documentation, and provide guidance on emergency procedures." },
    { question: 'How do I administer medications?',  answer: "From the Home tab, navigate to the Medications section. When it's time to give a medication, tap the \"Give Medication\" button next to it. Confirm the details and mark as administered." },
    { question: 'What should I do in an emergency?', answer: "In a medical emergency, always call 911 first. Then use the Incidents tab to file an urgent incident report — select \"Critical\" severity so family members and the agency are immediately notified." },
  ];

  const familyFaqs = [
    { question: "How do I monitor my loved one's care?",  answer: "Your Home tab provides a real-time overview of completed tasks with photos and notes, current vital signs, and recent alerts. Check the Weekly Report from the Menu tab for broader weekly insights." },
    { question: 'How do I view incident reports?',        answer: "When a caregiver files an incident report, you'll receive a notification in your Alerts tab. Tap on any alert to see the full incident details including type, severity, description, and photos." },
    { question: 'How do I message the caregiver?',        answer: "Use the Messages tab from the bottom navigation bar to chat directly with the assigned caregiver. You can ask questions, request updates, or discuss care needs." },
    { question: 'How do I read the Weekly Report?',       answer: "Go to the Menu tab and tap \"Weekly Report\". It shows overall care compliance, tasks completed, medication adherence rate, number of incidents, missed tasks, caregiver notes, and a performance trend chart." },
    { question: "How do I view the Care Plan?",           answer: "From the Menu tab, tap \"Care Plan\" to see your loved one's complete care schedule including daily ADL tasks, medication timings, therapy sessions, and special instructions." },
    { question: "How do I check my loved one's vitals?",  answer: "On the Home tab, tap any vital card (Blood Pressure, Heart Rate, Temperature, Pain Level) to open the detailed view with historical trends and charts." },
    { question: 'How do I view caregiver information?',   answer: "From the Menu tab, tap \"Current Caregiver\" to see the caregiver's full profile including qualifications, certifications, experience, and contact details." },
    { question: 'What is the AI Care Assistant?',         answer: "The AI Care Assistant is available via the floating button on the Home tab. You can ask it questions about care routines, medications, vitals meaning, or get summaries of recent care activity." },
  ];

  const faqItems  = role === 'family' ? familyFaqs : caregiverFaqs;
  const resources = [{ label: 'User Guide' }, { label: 'Privacy Policy' }, { label: 'Terms of Service' }];

  return (
    <div data-testid="support-page" style={{ minHeight: '100vh', background: BG, fontFamily: INTER }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 20px 16px', borderBottom: `1px solid ${BORDER}`, background: CARD }}>
        <button onClick={onBack} data-testid="support-back-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, display: 'flex' }}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ fontFamily: INTER, fontSize: '1.4rem', color: '#222222', letterSpacing: '-0.02em' }}>Help & Support</h1>
      </div>

      <div style={{ padding: '20px 20px 80px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Contact us */}
        <div>
          <p data-testid="contact-us-heading" style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.16em', marginBottom: 10 }}>Contact Us</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {contactOptions.map((opt, i) => (
              <button
                key={i}
                data-testid={`contact-${opt.label.toLowerCase().replace(/\s/g, '-')}`}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', ...glassCard, borderRadius: 14, cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={glassIcon}><opt.icon size={20} color={MUTED} /></div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#222222', marginBottom: 2 }}>{opt.label}</p>
                    <p style={{ fontSize: 12, color: MUTED }}>{opt.desc}</p>
                  </div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: GREEN }}>{opt.action}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <p data-testid="faq-heading" style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.16em', marginBottom: 10 }}>Frequently Asked Questions</p>
          <div style={glassCard}>
            {faqItems.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  data-testid={`faq-item-${i}`}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#222222', textAlign: 'left', flex: 1, paddingRight: 12, lineHeight: 1.4 }}>{faq.question}</span>
                  {expandedFaq === i
                    ? <ChevronDown size={18} color={GREEN} style={{ flexShrink: 0 }} />
                    : <ChevronRight size={18} color={MUTED} style={{ flexShrink: 0 }} />
                  }
                </button>
                {expandedFaq === i && (
                  <div style={{ padding: '0 16px 16px' }}>
                    <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7 }}>{faq.answer}</p>
                  </div>
                )}
                {i < faqItems.length - 1 && <div style={{ height: 1, background: BORDER, margin: '0 16px' }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div>
          <p data-testid="resources-heading" style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: '0.16em', marginBottom: 10 }}>Resources</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {resources.map((r, i) => (
              <button
                key={i}
                data-testid={`resource-${r.label.toLowerCase().replace(/\s/g, '-')}`}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', ...glassCard, borderRadius: 14, cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={glassIcon}><FileText size={20} color={MUTED} /></div>
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#222222' }}>{r.label}</span>
                </div>
                <ExternalLink size={18} color={MUTED} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;

