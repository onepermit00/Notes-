import React, { useCallback, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import "../styles/hero.css";
import conciergeCharacter from "../assets/hero-characters/concierge-clean.png";
import doormanCharacter from "../assets/hero-characters/doorman-friendly.png";
import securityCharacter from "../assets/hero-characters/security-friendly.png";
import attendantCharacter from "../assets/hero-characters/concierge-friendly.png";

export const HERO_IMAGES = [
  {
    src: conciergeCharacter,
    bg: "#FFFFFF",
    wordColor: "#F2F1EE",
    centerScale: 1.2,
  },
  {
    src: doormanCharacter,
    bg: "#FFFFFF",
    wordColor: "#F2F1EE",
    centerScale: 1.2,
  },
  {
    src: securityCharacter,
    bg: "#FFFFFF",
    wordColor: "#F2F1EE",
    centerScale: 1.2,
  },
  {
    src: attendantCharacter,
    bg: "#FFFFFF",
    wordColor: "#F2F1EE",
    centerScale: 1.2,
  },
];

const EASE = "cubic-bezier(0.22,1,0.36,1)";
const DURATION_MS = 650;
const TRANSITION = `transform 650ms ${EASE}, filter 650ms ${EASE}, opacity 650ms ${EASE}, left 650ms ${EASE}`;

export default function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 640);

  useEffect(() => {
    HERO_IMAGES.forEach(({ src }) => {
      const image = new Image();
      image.src = src;
    });
  }, []);

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", updateViewport, { passive: true });
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const navigate = useCallback((direction) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((current) => direction === "next"
      ? (current + 1) % HERO_IMAGES.length
      : (current - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
    window.setTimeout(() => setIsAnimating(false), DURATION_MS);
  }, [isAnimating]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "ArrowLeft") navigate("prev");
      if (event.key === "ArrowRight") navigate("next");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate]);

  const center = activeIndex;
  const left = (activeIndex - 1 + HERO_IMAGES.length) % HERO_IMAGES.length;
  const right = (activeIndex + 1) % HERO_IMAGES.length;

  const getFigureStyle = (index) => {
    if (index === center) {
      return {
        left: "50%",
        height: isMobile ? "52%" : "46%",
        bottom: 0,
        transform: `translateX(-50%) scale(${isMobile ? (index === 2 ? 1.15 : 1) : (HERO_IMAGES[index].centerScale ?? 1)})`,
        transformOrigin: "bottom center",
        filter: "none",
        opacity: 1,
        zIndex: 20,
      };
    }
    if (index === left) {
      return {
        left: isMobile ? "25%" : "28%",
        height: isMobile ? "42%" : "46%",
        bottom: 0,
        transform: "translateX(-50%) scale(1)",
        transformOrigin: "bottom center",
        filter: "none",
        opacity: 1,
        zIndex: 10,
      };
    }
    if (index === right) {
      return {
        left: isMobile ? "75%" : "72%",
        height: isMobile ? "42%" : "46%",
        bottom: 0,
        transform: "translateX(-50%) scale(1)",
        transformOrigin: "bottom center",
        filter: "none",
        opacity: 1,
        zIndex: 10,
      };
    }
    return {
      left: "50%",
      height: isMobile ? "18%" : "14%",
      bottom: 0,
      transform: "translateX(-50%) scale(1)",
      transformOrigin: "bottom center",
      filter: "none",
      opacity: 0,
      zIndex: 5,
    };
  };

  return (
    <section className="onepermit-hero" aria-label="Noted introduction">
      <div
        className="onepermit-hero__field"
        style={{ backgroundColor: HERO_IMAGES[activeIndex].bg }}
        aria-hidden="true"
      />

      <div className="onepermit-hero__message" aria-live="polite" aria-atomic="true">
        <h1
          className="onepermit-hero__headline"
          key={activeIndex}
          aria-label="Clockit"
          style={{ color: HERO_IMAGES[activeIndex].wordColor }}
        >
          CLOCKIT
        </h1>
      </div>

      <div className="onepermit-hero__dots" aria-hidden="true">
        {HERO_IMAGES.map((_, index) => (
          <span
            key={index}
            className="onepermit-hero__dot"
            style={{ width: index === activeIndex ? 20 : 6, opacity: index === activeIndex ? 0.95 : 0.35 }}
          />
        ))}
      </div>

      <div className="onepermit-hero__carousel" aria-hidden="true">
        {HERO_IMAGES.map(({ src }, index) => (
          <div
            key={src}
            className="onepermit-hero__figure"
            style={{ transition: TRANSITION, ...getFigureStyle(index) }}
          >
            <img src={src} alt="" draggable={false} />
          </div>
        ))}
      </div>

      <div className="onepermit-hero__summary">
        <button className="onepermit-hero__arrow" onClick={() => navigate("next")} aria-label="Show next role">
          <ArrowRight size={26} strokeWidth={2.25} />
        </button>
      </div>

    </section>
  );
}
