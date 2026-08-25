import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  ArrowUpRight,
  Twitter,
  Linkedin,
  Github,
  Mail,
} from "lucide-react"

const highlights = [
  {
    title: "Trusted by",
    description:
      "2,400+ families and 150+ home care agencies across the US rely on ADLTrack every single day to coordinate care with confidence.",
  },
  {
    title: "Latest features",
    description:
      "Photo verification, AI health insights, and EVV compliance now live — timestamped, geotagged task evidence built for modern care teams.",
  },
  {
    title: "Early access",
    description:
      "Onboarding families and agencies now · Free to start, no credit card required. Join the waitlist for priority access.",
  },
]

const socialLinks = [
  {
    label: "Twitter",
    handle: "@adltrackapp",
    href: "#",
    icon: Twitter,
  },
  {
    label: "LinkedIn",
    handle: "ADLTrack Corp",
    href: "#",
    icon: Linkedin,
  },
  {
    label: "GitHub",
    handle: "adltrack-dev",
    href: "#",
    icon: Github,
  },
  {
    label: "Email",
    handle: "support@adltrack.com",
    href: "mailto:support@adltrack.com",
    icon: Mail,
  },
]

const listVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export function GlassmorphismPortfolioBlock({ onGetStarted }) {
  return (
    <section className="relative min-h-screen overflow-hidden px-6 py-24 lg:py-32">
      {/* Section background — needed so backdrop-blur has something to blur against */}
      <div className="absolute inset-0 -z-10" style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)",
      }} />
      {/* Radial glow blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #0095F2 0%, transparent 70%)" }} />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #0095F2 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, #3b82f6 0%, transparent 70%)" }} />
      </div>

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border p-8 backdrop-blur-2xl md:p-12"
          style={{
            borderColor: "rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
          }}
        >
          {/* Glass gradient overlay */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 60%)" }} />

          <div className="relative grid gap-12 lg:grid-cols-2">
            {/* Left column */}
            <div className="space-y-8">
              <Badge
                variant="outline"
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.3em] backdrop-blur transition-colors"
                style={{
                  borderColor: "rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                ADLTrack · Care OS
              </Badge>

              <div className="space-y-4">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-2xl font-semibold tracking-tight text-white md:text-3xl"
                >
                  Real care coordination for modern families and agencies
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="max-w-xl text-base leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.65)" }}
                >
                  ADLTrack replaces caregiver anxiety with calm, clear visibility.
                  Every task, vital, and note — verified, timestamped, and shared
                  in real time with every person in the care circle.
                </motion.p>
              </div>

              {/* Highlights */}
              <div className="grid gap-4">
                {highlights.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    whileHover={{ y: -4 }}
                    className="group relative overflow-hidden rounded-2xl p-5 backdrop-blur transition-all"
                    style={{
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.05)",
                    }}
                  >
                    <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 -z-10"
                      style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)" }} />
                    <div className="relative space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em]"
                        style={{ color: "rgba(255,255,255,0.35)" }}>
                        {item.title}
                      </p>
                      <p className="text-sm leading-relaxed"
                        style={{ color: "rgba(255,255,255,0.65)" }}>
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <button
                  onClick={onGetStarted}
                  className="inline-flex h-12 items-center gap-2 rounded-full px-8 text-sm font-semibold uppercase tracking-[0.25em] text-white transition-all hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                  style={{ background: "#0095F2" }}
                >
                  Get started free
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </motion.div>
            </div>

            {/* Right column — profile card */}
            <div className="relative">
              <div className="absolute inset-0 rounded-[32px] blur-3xl opacity-30"
                style={{ background: "radial-gradient(circle at 50% 20%, #0095F2 0%, transparent 60%)" }} />
              <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] p-8 backdrop-blur-xl"
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative mb-6"
                  >
                    <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl opacity-60"
                      style={{ background: "#0095F2" }} />
                    <img
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=640&q=80"
                      alt="ADLTrack Care Platform"
                      className="relative h-32 w-32 rounded-full object-cover"
                      style={{
                        border: "1px solid rgba(255,255,255,0.2)",
                        boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
                      }}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="space-y-1"
                  >
                    <h3 className="text-2xl font-semibold tracking-tight text-white">
                      ADLTrack Care OS
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em]"
                      style={{ color: "rgba(255,255,255,0.4)" }}>
                      Real-time care coordination
                    </p>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-4 max-w-sm text-sm leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    Giving every family the calm clarity of knowing exactly
                    what's happening with the people they love.
                  </motion.p>
                </div>

                {/* Social links */}
                <motion.div
                  variants={listVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-80px" }}
                  className="mt-8 flex flex-col gap-3"
                >
                  {socialLinks.map((social) => {
                    const Icon = social.icon
                    return (
                      <motion.a
                        key={social.label}
                        variants={itemVariants}
                        href={social.href}
                        target={social.href.startsWith("mailto") ? "_self" : "_blank"}
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between rounded-2xl px-4 py-3 text-left transition-all hover:-translate-y-0.5"
                        style={{
                          border: "1px solid rgba(255,255,255,0.1)",
                          background: "rgba(255,255,255,0.06)",
                        }}
                        whileHover={{ scale: 1.01, borderColor: "rgba(255,255,255,0.2)" }}
                        whileTap={{ scale: 0.985 }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full transition-all"
                            style={{
                              border: "1px solid rgba(255,255,255,0.15)",
                              background: "rgba(255,255,255,0.08)",
                              color: "rgba(255,255,255,0.8)",
                              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                            }}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {social.label}
                            </p>
                            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                              {social.handle}
                            </p>
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          style={{ color: "rgba(255,255,255,0.35)" }} />
                      </motion.a>
                    )
                  })}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default GlassmorphismPortfolioBlock
