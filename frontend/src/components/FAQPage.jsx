import React from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Activity, CircleHelp, Shield, Smartphone, Users, DollarSign, Clock, MessageCircle, ChevronDown } from "lucide-react"
import { Button } from "./ui/button"

const faqData = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "What is ADLTrack?",
        a: "ADLTrack is a comprehensive care tracking platform that connects families, caregivers, and agencies. It provides real-time health updates, task management, photo verification, and secure messaging to ensure transparent and quality care for your loved ones."
      },
      {
        q: "How do I get started?",
        a: "Simply click 'Get Started' on our homepage and select your role - Family Member, Caregiver, or Agency. You'll be guided through a quick setup process to create your account and start using ADLTrack within minutes."
      },
      {
        q: "Do I need special hardware?",
        a: "No. ADLTrack works on any modern smartphone (iOS and Android) or web browser. Caregivers just download the app to get started - no special equipment required."
      }
    ]
  },
  {
    category: "Security & Privacy",
    questions: [
      {
        q: "Is ADLTrack HIPAA Compliant?",
        a: "Yes, absolutely. We use enterprise-grade encryption and strictly adhere to HIPAA standards to protect all patient health information. Your data is encrypted both in transit and at rest."
      },
      {
        q: "Who can see my loved one's health data?",
        a: "Only authorized family members and caregivers you've approved can view health data. You have full control over who has access, and you can revoke access at any time from your dashboard."
      },
      {
        q: "How is photo verification secured?",
        a: "All photos are encrypted, timestamped, and geotagged for verification purposes. They are stored securely and only accessible to authorized users. Photos cannot be edited or manipulated after upload."
      }
    ]
  },
  {
    category: "For Families",
    questions: [
      {
        q: "Can multiple family members join?",
        a: "Absolutely. The primary account holder can invite unlimited family members to view the care feed. Each family member gets their own login and can participate in the Family Chat."
      },
      {
        q: "How do I receive updates about my loved one?",
        a: "You'll receive real-time notifications for completed tasks, vital sign updates, and messages from caregivers. You can customize notification preferences in your settings."
      },
      {
        q: "Can I communicate directly with the caregiver?",
        a: "Yes! The Family Chat feature allows you to message caregivers directly. You can also initiate video calls to check in on your loved one."
      }
    ]
  },
  {
    category: "For Caregivers",
    questions: [
      {
        q: "How does task verification work?",
        a: "After completing a task, you can mark it complete and optionally add a photo for verification. Photos are automatically timestamped and geotagged to ensure compliance and provide families peace of mind."
      },
      {
        q: "What is the AI Copilot?",
        a: "The AI Copilot is your intelligent care assistant. It provides personalized suggestions, reminds you of patient preferences, alerts you to health concerns, and helps you provide better care."
      },
      {
        q: "Can I manage multiple clients?",
        a: "Yes, you can easily switch between clients using the patient selector. Each client has their own care plan, task list, and communication thread."
      }
    ]
  },
  {
    category: "For Agencies",
    questions: [
      {
        q: "What is EVV Compliance?",
        a: "Electronic Visit Verification (EVV) is a government mandate requiring proof of care delivery. ADLTrack automatically generates GPS-verified, timestamped, and photo-backed logs that meet all EVV requirements."
      },
      {
        q: "How does billing work?",
        a: "ADLTrack automatically tracks hours worked and tasks completed. You can generate detailed reports for billing, approve timesheets, and export data to your payroll system."
      },
      {
        q: "Can I track multiple caregivers?",
        a: "Yes, the Agency Dashboard provides real-time visibility into all your caregivers - their locations, active shifts, task completion rates, and compliance scores."
      }
    ]
  },
  {
    category: "Pricing",
    questions: [
      {
        q: "How much does it cost?",
        a: "Families get a 14-day free trial with full access to all features. After that, plans start at $19/month. Agencies have custom tiered pricing based on the number of active clients and caregivers."
      },
      {
        q: "Is there a contract?",
        a: "No long-term contracts required. You can cancel anytime. We offer monthly and annual billing options, with a discount for annual plans."
      },
      {
        q: "Do you offer discounts for nonprofits?",
        a: "Yes! We offer special pricing for nonprofit organizations and community care programs. Contact our sales team for more information."
      }
    ]
  }
]

export const FAQPage = ({ onBack }) => {
  const [openIndex, setOpenIndex] = React.useState(null)

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`
    setOpenIndex(openIndex === key ? null : key)
  }

  const getCategoryIcon = (category) => {
    switch(category) {
      case "Getting Started": return Activity
      case "Security & Privacy": return Shield
      case "For Families": return Users
      case "For Caregivers": return Smartphone
      case "For Agencies": return Clock
      case "Pricing": return DollarSign
      default: return CircleHelp
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack} 
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                data-testid="faq-back-btn"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#25D366] flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight text-[#25D366]">Adltrack</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 rounded-full bg-[#25D366]/10 flex items-center justify-center mx-auto mb-6">
              <CircleHelp className="w-8 h-8 text-[#25D366]" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Find answers to common questions about ADLTrack. Can't find what you're looking for? 
              <a href="#contact" className="text-[#25D366] font-semibold ml-1 hover:underline">Contact our support team</a>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {faqData.map((category, categoryIndex) => {
            const IconComponent = getCategoryIcon(category.category)
            return (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
              >
                {/* Category Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-[#25D366]" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">{category.category}</h2>
                  </div>
                </div>

                {/* Questions */}
                <div className="divide-y divide-slate-100">
                  {category.questions.map((item, questionIndex) => {
                    const isOpen = openIndex === `${categoryIndex}-${questionIndex}`
                    return (
                      <div key={questionIndex} className="px-6">
                        <button
                          onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                          className="w-full py-5 flex items-start justify-between text-left group"
                          data-testid={`faq-question-${categoryIndex}-${questionIndex}`}
                        >
                          <span className="font-semibold text-slate-900 pr-4 group-hover:text-[#25D366] transition-colors">
                            {item.q}
                          </span>
                          <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <motion.div
                          initial={false}
                          animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="pb-5 text-slate-600 leading-relaxed">
                            {item.a}
                          </p>
                        </motion.div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="py-16 px-4 bg-slate-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Still have questions?</h2>
          <p className="text-slate-600 mb-8">Our support team is here to help. Reach out and we'll get back to you within 24 hours.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full px-8 h-12 font-semibold">
              <MessageCircle className="w-5 h-5 mr-2" />
              Chat with Support
            </Button>
            <Button variant="outline" className="rounded-full px-8 h-12 font-semibold">
              support@adltrack.com
            </Button>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 px-4 border-t border-slate-100">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#25D366] flex items-center justify-center">
              <Activity className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-[#25D366]">Adltrack</span>
          </div>
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Adltrack Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default FAQPage
