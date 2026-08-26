import React, { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import "../styles/hero.css";
import conciergeCharacter from "../assets/hero-characters/concierge-clean.png";
import doormanCharacter from "../assets/hero-characters/doorman-clean.png";
import securityCharacter from "../assets/hero-characters/security-clean.png";
import attendantCharacter from "../assets/hero-characters/attendant-clean.png";

export const HERO_IMAGES = [
  {
    src: conciergeCharacter,
    bg: "#FFFFFF",
    centerScale: 1.2,
  },
  {
    src: doormanCharacter,
    bg: "#FFFFFF",
    centerScale: 1.2,
  },
  {
    src: securityCharacter,
    bg: "#FFFFFF",
    centerScale: 1.6,
  },
  {
    src: attendantCharacter,
    bg: "#FFFFFF",
    centerScale: 1.2,
  },
];

const EASE = "cubic-bezier(0.22,1,0.36,1)";
const DURATION_MS = 650;
const TRANSITION = `transform 650ms ${EASE}, filter 650ms ${EASE}, opacity 650ms ${EASE}, left 650ms ${EASE}`;

export default function HeroSection({
  onExplore = () => {},
}) {
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
    setActiveIndex((current) => direction === "next" ? (current + 1) % 4 : (current + 3) % 4);
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
  const left = (activeIndex + 3) % 4;
  const right = (activeIndex + 1) % 4;

  const getFigureStyle = (index) => {
    const height = isMobile ? "58%" : "46%";
    if (index === center) {
      return {
        left: "50%",
        height,
        bottom: 0,
        transform: `translateX(-50%) scale(${HERO_IMAGES[index].centerScale ?? 1})`,
        transformOrigin: "bottom center",
        filter: "none",
        opacity: 1,
        zIndex: 20,
      };
    }
    if (index === left) {
      return {
        left: isMobile ? "18%" : "28%",
        height,
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
        left: isMobile ? "82%" : "72%",
        height,
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
      opacity: 0.4,
      zIndex: 5,
    };
  };

  return (
    <section className="onepermit-hero" aria-label="onepermit introduction">
      <div
        className="onepermit-hero__field"
        style={{ backgroundColor: HERO_IMAGES[activeIndex].bg }}
        aria-hidden="true"
      />

      <div className="onepermit-hero__wordmark" aria-hidden="true">ONEPERMIT</div>

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
        <p className="onepermit-hero__name">onepermit</p>
        {!isMobile && (
          <p className="onepermit-hero__copy">
            Real-time workforce operations and accountability for property management, concierge services, cleaning, security, and hospitality teams.
          </p>
        )}
        <div className="onepermit-hero__arrows">
          <button className="onepermit-hero__arrow" onClick={() => navigate("prev")} aria-label="Previous hero image">
            <ArrowLeft size={26} strokeWidth={2.25} />
          </button>
          <button className="onepermit-hero__arrow" onClick={() => navigate("next")} aria-label="Next hero image">
            <ArrowRight size={26} strokeWidth={2.25} />
          </button>
        </div>
      </div>

      <a
        className="onepermit-hero__explore"
        href="#onepermit-explore"
        onClick={(event) => { event.preventDefault(); onExplore(); }}
      >
        Explore now
        <ArrowRight className="onepermit-hero__explore-icon" strokeWidth={2.25} />
      </a>
    </section>
  );
}
