"use client"

import { forwardRef, useCallback, useEffect, useRef, useState } from "react"
import clsx from "clsx"
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
} from "framer-motion"

const cn = (...classes) => classes.filter(Boolean).join(" ")

const placeholderImage = (text = "Image") =>
  `https://placehold.co/600x400/1a1a1a/ffffff?text=${encodeURIComponent(text)}`

const TOTAL_STEPS = 4

const steps = [
  {
    id: "1",
    name: "Step 1",
    title: "Full care visibility",
    description:
      "Families see every medication taken, vital recorded, and caregiver note — in real time, from anywhere. No more wondering. No more midnight calls.",
  },
  {
    id: "2",
    name: "Step 2",
    title: "Photo-verified tasks",
    description:
      "Caregivers attach photo evidence to every completed task. Timestamped, geotagged, and stored — so families always have trusted proof.",
  },
  {
    id: "3",
    name: "Step 3",
    title: "Whole-family feed",
    description:
      "One shared view for siblings, parents, and guardians. Everyone sees the same care activity the moment it happens — no more group-chat confusion.",
  },
  {
    id: "4",
    name: "Step 4",
    title: "ADLTrack AI insights",
    description:
      "Our AI flags subtle trends — blood pressure drifting low, sleep patterns changing, medication timing slipping — before they become problems.",
  },
]

const images = {
  alt: "ADLTrack care platform",
  step1img1:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1740&auto=format&fit=crop",
  step1img2:
    "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?q=80&w=1740&auto=format&fit=crop",
  step2img1:
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1740&auto=format&fit=crop",
  step2img2:
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1740&auto=format&fit=crop",
  step3img:
    "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1740&auto=format&fit=crop",
  step4img:
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1740&auto=format&fit=crop",
}

const ANIMATION_PRESETS = {
  fadeInScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { type: "spring", stiffness: 300, damping: 25, mass: 0.5 },
  },
  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { type: "spring", stiffness: 300, damping: 25, mass: 0.5 },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { type: "spring", stiffness: 300, damping: 25, mass: 0.5 },
  },
}

function useNumberCycler(totalSteps = TOTAL_STEPS, interval = 5000) {
  const [currentNumber, setCurrentNumber] = useState(0)

  useEffect(() => {
    const timerId = setTimeout(() => {
      setCurrentNumber((prev) => (prev + 1) % totalSteps)
    }, interval)
    return () => clearTimeout(timerId)
  }, [currentNumber, totalSteps, interval])

  const setStep = useCallback(
    (stepIndex) => {
      setCurrentNumber(stepIndex % totalSteps)
    },
    [totalSteps]
  )

  return { currentNumber, setStep }
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkDevice = () =>
      setIsMobile(window.matchMedia("(max-width: 768px)").matches)
    checkDevice()
    window.addEventListener("resize", checkDevice)
    return () => window.removeEventListener("resize", checkDevice)
  }, [])
  return isMobile
}

function IconCheck({ className, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={cn("h-4 w-4", className)}
      {...props}
    >
      <path d="m229.66 77.66-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32Z" />
    </svg>
  )
}

const stepVariants = {
  inactive: { scale: 0.9, opacity: 0.7 },
  active: { scale: 1, opacity: 1 },
}

const StepImage = forwardRef(({ src, alt, className, style, ...props }, ref) => (
  <img
    ref={ref}
    alt={alt}
    className={className}
    src={src}
    style={{ position: "absolute", userSelect: "none", maxWidth: "unset", ...style }}
    onError={(e) => (e.currentTarget.src = placeholderImage(alt))}
    {...props}
  />
))
StepImage.displayName = "StepImage"

const MotionStepImage = motion(StepImage)

const AnimatedStepImage = ({ preset = "fadeInScale", delay = 0, ...props }) => {
  const presetConfig = ANIMATION_PRESETS[preset]
  return (
    <MotionStepImage
      {...props}
      {...presetConfig}
      transition={{ ...presetConfig.transition, delay }}
    />
  )
}

const defaultClasses = {
  img: "rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl shadow-black/10",
  step1img1: "w-[50%] left-0 top-[15%]",
  step1img2: "w-[60%] left-[40%] top-[35%]",
  step2img1: "w-[50%] left-[5%] top-[20%]",
  step2img2: "w-[40%] left-[55%] top-[45%]",
  step3img: "w-[90%] left-[5%] top-[25%]",
  step4img: "w-[90%] left-[5%] top-[25%]",
}

function FeatureCard({ children, step }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const isMobile = useIsMobile()

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    if (isMobile) return
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <motion.div
      className="group relative w-full rounded-2xl"
      onMouseMove={handleMouseMove}
      style={{
        "--x": useMotionTemplate`${mouseX}px`,
        "--y": useMotionTemplate`${mouseY}px`,
      }}
    >
      <div className="relative w-full overflow-hidden rounded-3xl border border-neutral-200 bg-white transition-colors duration-300">
        <div className="m-10 min-h-[450px] w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              className="flex w-full flex-col gap-4 md:w-3/5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="text-sm font-semibold uppercase tracking-wider"
                style={{ color: "#0095F2" }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {steps[step].name}
              </motion.div>
              <motion.h2
                className="text-2xl font-bold tracking-tight text-neutral-900 md:text-3xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {steps[step].title}
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-base leading-relaxed text-neutral-600">
                  {steps[step].description}
                </p>
              </motion.div>
            </motion.div>
          </AnimatePresence>
          {children}
        </div>
      </div>
    </motion.div>
  )
}

function StepsNav({ current, onChange }) {
  return (
    <nav aria-label="Progress" className="flex justify-center px-4">
      <ol
        className="flex w-full flex-wrap items-center justify-center gap-2"
        role="list"
      >
        {steps.map((step, stepIdx) => {
          const isCompleted = current > stepIdx
          const isCurrent = current === stepIdx
          return (
            <motion.li
              key={step.name}
              initial="inactive"
              animate={isCurrent ? "active" : "inactive"}
              variants={stepVariants}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <button
                type="button"
                className={cn(
                  "group flex items-center gap-2.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-300 focus:outline-none",
                  isCurrent
                    ? "text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                )}
                style={
                  isCurrent
                    ? { background: "#0095F2" }
                    : {}
                }
                onClick={() => onChange(stepIdx)}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                    isCompleted
                      ? "text-white"
                      : isCurrent
                      ? "text-white"
                      : "bg-neutral-200 text-neutral-700 group-hover:bg-neutral-300"
                  )}
                  style={
                    isCompleted || isCurrent
                      ? { background: "rgba(255,255,255,0.25)" }
                      : {}
                  }
                >
                  {isCompleted ? (
                    <IconCheck className="h-3.5 w-3.5" />
                  ) : (
                    <span>{stepIdx + 1}</span>
                  )}
                </span>
                <span className="hidden sm:inline-block">{step.name}</span>
              </button>
            </motion.li>
          )
        })}
      </ol>
    </nav>
  )
}

function renderStepContent(step) {
  switch (step) {
    case 0:
      return (
        <div className="relative w-full h-full">
          <AnimatedStepImage
            alt={images.alt}
            className={cn(defaultClasses.img, defaultClasses.step1img1)}
            src={images.step1img1}
            preset="slideInLeft"
          />
          <AnimatedStepImage
            alt={images.alt}
            className={cn(defaultClasses.img, defaultClasses.step1img2)}
            src={images.step1img2}
            preset="slideInRight"
            delay={0.1}
          />
        </div>
      )
    case 1:
      return (
        <div className="relative w-full h-full">
          <AnimatedStepImage
            alt={images.alt}
            className={cn(defaultClasses.img, defaultClasses.step2img1)}
            src={images.step2img1}
            preset="fadeInScale"
          />
          <AnimatedStepImage
            alt={images.alt}
            className={cn(defaultClasses.img, defaultClasses.step2img2)}
            src={images.step2img2}
            preset="fadeInScale"
            delay={0.1}
          />
        </div>
      )
    case 2:
      return (
        <AnimatedStepImage
          alt={images.alt}
          className={cn(defaultClasses.img, defaultClasses.step3img)}
          src={images.step3img}
          preset="fadeInScale"
        />
      )
    case 3:
      return (
        <AnimatedStepImage
          alt={images.alt}
          className={cn(defaultClasses.img, defaultClasses.step4img)}
          src={images.step4img}
          preset="fadeInScale"
        />
      )
    default:
      return null
  }
}

export function FeatureCarousel() {
  const { currentNumber: step, setStep } = useNumberCycler()

  return (
    <div className="flex flex-col gap-12 w-full max-w-4xl mx-auto p-4">
      <FeatureCard step={step}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            {...ANIMATION_PRESETS.fadeInScale}
            className="w-full h-full absolute"
          >
            {renderStepContent(step)}
          </motion.div>
        </AnimatePresence>
      </FeatureCard>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <StepsNav current={step} onChange={setStep} />
      </motion.div>
    </div>
  )
}

export default FeatureCarousel
