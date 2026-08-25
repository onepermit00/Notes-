import React, { useEffect, useRef } from 'react';

export function LuminaSlider() {
  const containerRef = useRef(null);

  useEffect(() => {
    const loadScript = (src, globalName) => new Promise((res, rej) => {
      if (window[globalName]) { res(); return; }
      if (document.querySelector(`script[src="${src}"]`)) {
        const check = setInterval(() => {
          if (window[globalName]) { clearInterval(check); res(); }
        }, 50);
        setTimeout(() => { clearInterval(check); rej(new Error(`Timeout: ${globalName}`)); }, 10000);
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => setTimeout(() => res(), 100);
      s.onerror = () => rej(new Error(`Failed: ${src}`));
      document.head.appendChild(s);
    });

    const loadScripts = async () => {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js', 'gsap');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', 'THREE');
      } catch (e) {
        console.error('Script load error:', e);
      }
      initApplication();
    };

    const initApplication = () => {
      const gsap = window.gsap;
      const THREE = window.THREE;
      if (!gsap || !THREE) { console.error('Libraries not loaded'); return; }

      const SLIDER_CONFIG = {
        settings: {
          transitionDuration: 2.5, autoSlideSpeed: 5000, currentEffect: "glass", currentEffectPreset: "Default",
          globalIntensity: 1.0, speedMultiplier: 1.0, distortionStrength: 1.0, colorEnhancement: 1.0,
          glassRefractionStrength: 1.0, glassChromaticAberration: 1.0, glassBubbleClarity: 1.0, glassEdgeGlow: 1.0, glassLiquidFlow: 1.0,
          frostIntensity: 1.5, frostCrystalSize: 1.0, frostIceCoverage: 1.0, frostTemperature: 1.0, frostTexture: 1.0,
          rippleFrequency: 25.0, rippleAmplitude: 0.08, rippleWaveSpeed: 1.0, rippleRippleCount: 1.0, rippleDecay: 1.0,
          plasmaIntensity: 1.2, plasmaSpeed: 0.8, plasmaEnergyIntensity: 0.4, plasmaContrastBoost: 0.3, plasmaTurbulence: 1.0,
          timeshiftDistortion: 1.6, timeshiftBlur: 1.5, timeshiftFlow: 1.4, timeshiftChromatic: 1.5, timeshiftTurbulence: 1.4
        }
      };

      let currentSlideIndex = 0;
      let isTransitioning = false;
      let shaderMaterial, renderer, scene, camera;
      let slideTextures = [];
      let texturesLoaded = false;
      let autoSlideTimer = null;
      let progressAnimation = null;
      let sliderEnabled = false;

      const SLIDE_DURATION = () => SLIDER_CONFIG.settings.autoSlideSpeed;
      const PROGRESS_UPDATE_INTERVAL = 50;
      const TRANSITION_DURATION = () => SLIDER_CONFIG.settings.transitionDuration;

      const slides = [
        { title: "Care Visibility", description: "Know exactly what's happening with your loved one.", media: "https://assets.codepen.io/7558/orange-portrait-001.jpg" },
        { title: "Peace of Mind", description: "Real-time updates that end caregiver anxiety.", media: "https://assets.codepen.io/7558/orange-portrait-002.jpg" },
        { title: "Every Task Verified", description: "Photo proof, GPS check-in, and timestamps you trust.", media: "https://assets.codepen.io/7558/orange-portrait-003.jpg" },
        { title: "Family Connected", description: "One shared feed. Everyone in the loop, instantly.", media: "https://assets.codepen.io/7558/orange-portrait-004.jpg" },
        { title: "AI Copilot", description: "Smart care insights, proactively surfaced.", media: "https://assets.codepen.io/7558/orange-portrait-005.jpg" },
        { title: "Care OS", description: "Your family's care command center, available 24/7.", media: "https://assets.codepen.io/7558/orange-portrait-006.jpg" }
      ];

      const vertexShader = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
      const fragmentShader = `
        uniform sampler2D uTexture1, uTexture2;
        uniform float uProgress;
        uniform vec2 uResolution, uTexture1Size, uTexture2Size;
        uniform int uEffectType;
        uniform float uGlobalIntensity, uSpeedMultiplier, uDistortionStrength, uColorEnhancement;
        uniform float uGlassRefractionStrength, uGlassChromaticAberration, uGlassBubbleClarity, uGlassEdgeGlow, uGlassLiquidFlow;
        uniform float uFrostIntensity, uFrostCrystalSize, uFrostIceCoverage, uFrostTemperature, uFrostTexture;
        uniform float uRippleFrequency, uRippleAmplitude, uRippleWaveSpeed, uRippleRippleCount, uRippleDecay;
        uniform float uPlasmaIntensity, uPlasmaSpeed, uPlasmaEnergyIntensity, uPlasmaContrastBoost, uPlasmaTurbulence;
        uniform float uTimeshiftDistortion, uTimeshiftBlur, uTimeshiftFlow, uTimeshiftChromatic, uTimeshiftTurbulence;
        varying vec2 vUv;

        vec2 getCoverUV(vec2 uv, vec2 textureSize) {
          vec2 s = uResolution / textureSize;
          float scale = max(s.x, s.y);
          vec2 scaledSize = textureSize * scale;
          vec2 offset = (uResolution - scaledSize) * 0.5;
          return (uv * uResolution - offset) / scaledSize;
        }

        vec4 glassEffect(vec2 uv, float progress) {
          float time = progress * 5.0 * uSpeedMultiplier;
          vec2 uv1 = getCoverUV(uv, uTexture1Size); vec2 uv2 = getCoverUV(uv, uTexture2Size);
          float maxR = length(uResolution) * 0.85; float br = progress * maxR;
          vec2 p = uv * uResolution; vec2 c = uResolution * 0.5;
          float d = length(p - c); float nd = d / max(br, 0.001);
          float param = smoothstep(br + 3.0, br - 3.0, d);
          vec4 img;
          if (param > 0.0) {
            float ro = 0.08 * uGlassRefractionStrength * uDistortionStrength * uGlobalIntensity * pow(smoothstep(0.3 * uGlassBubbleClarity, 1.0, nd), 1.5);
            vec2 dir = (d > 0.0) ? (p - c) / d : vec2(0.0);
            vec2 distUV = uv2 - dir * ro;
            distUV += vec2(sin(time + nd * 10.0), cos(time * 0.8 + nd * 8.0)) * 0.015 * uGlassLiquidFlow * uSpeedMultiplier * nd * param;
            float ca = 0.02 * uGlassChromaticAberration * uGlobalIntensity * pow(smoothstep(0.3, 1.0, nd), 1.2);
            img = vec4(texture2D(uTexture2, distUV + dir * ca * 1.2).r, texture2D(uTexture2, distUV + dir * ca * 0.2).g, texture2D(uTexture2, distUV - dir * ca * 0.8).b, 1.0);
            if (uGlassEdgeGlow > 0.0) {
              float rim = smoothstep(0.95, 1.0, nd) * (1.0 - smoothstep(1.0, 1.01, nd));
              img.rgb += rim * 0.08 * uGlassEdgeGlow * uGlobalIntensity;
            }
          } else { img = texture2D(uTexture2, uv2); }
          vec4 oldImg = texture2D(uTexture1, uv1);
          if (progress > 0.95) img = mix(img, texture2D(uTexture2, uv2), (progress - 0.95) / 0.05);
          return mix(oldImg, img, param);
        }

        vec4 frostEffect(vec2 uv, float progress) { return mix(texture2D(uTexture1, getCoverUV(uv, uTexture1Size)), texture2D(uTexture2, getCoverUV(uv, uTexture2Size)), progress); }
        vec4 rippleEffect(vec2 uv, float progress) { return mix(texture2D(uTexture1, getCoverUV(uv, uTexture1Size)), texture2D(uTexture2, getCoverUV(uv, uTexture2Size)), progress); }
        vec4 plasmaEffect(vec2 uv, float progress) { return mix(texture2D(uTexture1, getCoverUV(uv, uTexture1Size)), texture2D(uTexture2, getCoverUV(uv, uTexture2Size)), progress); }
        vec4 timeshiftEffect(vec2 uv, float progress) { return mix(texture2D(uTexture1, getCoverUV(uv, uTexture1Size)), texture2D(uTexture2, getCoverUV(uv, uTexture2Size)), progress); }

        void main() {
          if (uEffectType == 0) gl_FragColor = glassEffect(vUv, uProgress);
          else if (uEffectType == 1) gl_FragColor = frostEffect(vUv, uProgress);
          else if (uEffectType == 2) gl_FragColor = rippleEffect(vUv, uProgress);
          else if (uEffectType == 3) gl_FragColor = plasmaEffect(vUv, uProgress);
          else gl_FragColor = timeshiftEffect(vUv, uProgress);
        }
      `;

      const getEffectIndex = (n) => ({ glass: 0, frost: 1, ripple: 2, plasma: 3, timeshift: 4 })[n] || 0;

      const updateShaderUniforms = () => {
        if (!shaderMaterial) return;
        const s = SLIDER_CONFIG.settings;
        const u = shaderMaterial.uniforms;
        for (const key in s) {
          const uName = 'u' + key.charAt(0).toUpperCase() + key.slice(1);
          if (u[uName]) u[uName].value = s[key];
        }
        u.uEffectType.value = getEffectIndex(s.currentEffect);
      };

      const splitText = (text) => {
        return text.split('').map(char =>
          `<span style="display:inline-block;opacity:0;">${char === ' ' ? '&nbsp;' : char}</span>`
        ).join('');
      };

      const updateContent = (idx) => {
        const titleEl = document.getElementById('mainTitle');
        const descEl = document.getElementById('mainDesc');
        if (titleEl && descEl) {
          gsap.to(titleEl.children, { y: -20, opacity: 0, duration: 0.5, stagger: 0.02, ease: "power2.in" });
          gsap.to(descEl, { y: -10, opacity: 0, duration: 0.4, ease: "power2.in" });
          setTimeout(() => {
            titleEl.innerHTML = splitText(slides[idx].title);
            descEl.textContent = slides[idx].description;
            gsap.set(titleEl.children, { opacity: 0 });
            gsap.set(descEl, { y: 20, opacity: 0 });
            const children = titleEl.children;
            switch (idx) {
              case 0:
                gsap.set(children, { y: 20 });
                gsap.to(children, { y: 0, opacity: 1, duration: 0.8, stagger: 0.03, ease: "power3.out" });
                gsap.to(descEl, { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out" });
                break;
              case 1:
                gsap.set(children, { y: -20 });
                gsap.to(children, { y: 0, opacity: 1, duration: 0.8, stagger: 0.03, ease: "back.out(1.7)" });
                gsap.to(descEl, { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out" });
                break;
              case 2:
                gsap.set(children, { filter: "blur(10px)", scale: 1.5, y: 0 });
                gsap.to(children, { filter: "blur(0px)", scale: 1, opacity: 1, duration: 1, stagger: { amount: 0.5, from: "random" }, ease: "power2.out" });
                gsap.to(descEl, { y: 0, opacity: 1, duration: 1, delay: 0.3, ease: "power2.out" });
                break;
              case 3:
                gsap.set(children, { scale: 0, y: 0 });
                gsap.to(children, { scale: 1, opacity: 1, duration: 0.6, stagger: 0.05, ease: "back.out(1.5)" });
                gsap.to(descEl, { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out" });
                break;
              case 4:
                gsap.set(children, { rotationX: 90, y: 0, transformOrigin: "50% 50%" });
                gsap.to(children, { rotationX: 0, opacity: 1, duration: 0.8, stagger: 0.04, ease: "power2.out" });
                gsap.to(descEl, { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power2.out" });
                break;
              case 5:
                gsap.set(children, { x: 30, y: 0 });
                gsap.to(children, { x: 0, opacity: 1, duration: 0.8, stagger: 0.03, ease: "power3.out" });
                gsap.to(descEl, { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out" });
                break;
              default:
                gsap.set(children, { y: 20 });
                gsap.to(children, { y: 0, opacity: 1, duration: 0.8, stagger: 0.03, ease: "power3.out" });
                gsap.to(descEl, { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out" });
            }
          }, 500);
        }
      };

      const updateNavigationState = (idx) =>
        document.querySelectorAll(".slide-nav-item").forEach((el, i) => el.classList.toggle("active", i === idx));

      const updateSlideProgress = (idx, prog) => {
        const el = document.querySelectorAll(".slide-nav-item")[idx]?.querySelector(".slide-progress-fill");
        if (el) { el.style.width = `${prog}%`; el.style.opacity = '1'; }
      };

      const quickResetProgress = (idx) => {
        const el = document.querySelectorAll(".slide-nav-item")[idx]?.querySelector(".slide-progress-fill");
        if (el) {
          el.style.transition = "width 0.2s ease-out";
          el.style.width = "0%";
          setTimeout(() => { el.style.transition = "width 0.1s linear, opacity 0.3s ease"; }, 200);
        }
      };

      const updateCounter = (idx) => {
        const sn = document.getElementById("slideNumber");
        if (sn) sn.textContent = String(idx + 1).padStart(2, "0");
        const st = document.getElementById("slideTotal");
        if (st) st.textContent = String(slides.length).padStart(2, "0");
      };

      const stopAutoSlideTimer = () => {
        if (progressAnimation) clearInterval(progressAnimation);
        if (autoSlideTimer) clearTimeout(autoSlideTimer);
        progressAnimation = null;
        autoSlideTimer = null;
      };

      const startAutoSlideTimer = () => {
        if (!texturesLoaded || !sliderEnabled) return;
        stopAutoSlideTimer();
        let progress = 0;
        const increment = (100 / SLIDE_DURATION()) * PROGRESS_UPDATE_INTERVAL;
        progressAnimation = setInterval(() => {
          if (!sliderEnabled) { stopAutoSlideTimer(); return; }
          progress += increment;
          updateSlideProgress(currentSlideIndex, progress);
          if (progress >= 100) {
            clearInterval(progressAnimation);
            progressAnimation = null;
            if (!isTransitioning) navigateToSlide((currentSlideIndex + 1) % slides.length);
          }
        }, PROGRESS_UPDATE_INTERVAL);
      };

      const safeStartTimer = (delay = 0) => {
        stopAutoSlideTimer();
        if (sliderEnabled && texturesLoaded) {
          if (delay > 0) autoSlideTimer = setTimeout(startAutoSlideTimer, delay);
          else startAutoSlideTimer();
        }
      };

      const navigateToSlide = (targetIndex) => {
        if (isTransitioning || targetIndex === currentSlideIndex) return;
        stopAutoSlideTimer();
        quickResetProgress(currentSlideIndex);
        const currentTexture = slideTextures[currentSlideIndex];
        const targetTexture = slideTextures[targetIndex];
        if (!currentTexture || !targetTexture) return;
        isTransitioning = true;
        shaderMaterial.uniforms.uTexture1.value = currentTexture;
        shaderMaterial.uniforms.uTexture2.value = targetTexture;
        shaderMaterial.uniforms.uTexture1Size.value = currentTexture.userData.size;
        shaderMaterial.uniforms.uTexture2Size.value = targetTexture.userData.size;
        updateContent(targetIndex);
        currentSlideIndex = targetIndex;
        updateCounter(currentSlideIndex);
        updateNavigationState(currentSlideIndex);
        gsap.fromTo(shaderMaterial.uniforms.uProgress,
          { value: 0 },
          {
            value: 1,
            duration: TRANSITION_DURATION(),
            ease: "power2.inOut",
            onComplete: () => {
              shaderMaterial.uniforms.uProgress.value = 0;
              shaderMaterial.uniforms.uTexture1.value = targetTexture;
              shaderMaterial.uniforms.uTexture1Size.value = targetTexture.userData.size;
              isTransitioning = false;
              safeStartTimer(100);
            }
          }
        );
      };

      const createSlidesNavigation = () => {
        const nav = document.getElementById("slidesNav");
        if (!nav) return;
        nav.innerHTML = "";
        slides.forEach((slide, i) => {
          const item = document.createElement("div");
          item.className = `slide-nav-item${i === 0 ? " active" : ""}`;
          item.dataset.slideIndex = String(i);
          item.innerHTML = `<div class="slide-progress-line"><div class="slide-progress-fill"></div></div><div class="slide-nav-title">${slide.title}</div>`;
          item.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!isTransitioning && i !== currentSlideIndex) {
              stopAutoSlideTimer();
              quickResetProgress(currentSlideIndex);
              navigateToSlide(i);
            }
          });
          nav.appendChild(item);
        });
      };

      const loadImageTexture = (src) => new Promise((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        loader.load(src, (t) => {
          t.minFilter = t.magFilter = THREE.LinearFilter;
          t.userData = { size: new THREE.Vector2(t.image.width, t.image.height) };
          resolve(t);
        }, undefined, reject);
      });

      const initRenderer = async () => {
        const canvas = document.querySelector(".webgl-canvas");
        if (!canvas) return;
        scene = new THREE.Scene();
        camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        shaderMaterial = new THREE.ShaderMaterial({
          uniforms: {
            uTexture1: { value: null }, uTexture2: { value: null }, uProgress: { value: 0 },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            uTexture1Size: { value: new THREE.Vector2(1, 1) }, uTexture2Size: { value: new THREE.Vector2(1, 1) },
            uEffectType: { value: 0 },
            uGlobalIntensity: { value: 1.0 }, uSpeedMultiplier: { value: 1.0 },
            uDistortionStrength: { value: 1.0 }, uColorEnhancement: { value: 1.0 },
            uGlassRefractionStrength: { value: 1.0 }, uGlassChromaticAberration: { value: 1.0 },
            uGlassBubbleClarity: { value: 1.0 }, uGlassEdgeGlow: { value: 1.0 }, uGlassLiquidFlow: { value: 1.0 },
            uFrostIntensity: { value: 1.0 }, uFrostCrystalSize: { value: 1.0 },
            uFrostIceCoverage: { value: 1.0 }, uFrostTemperature: { value: 1.0 }, uFrostTexture: { value: 1.0 },
            uRippleFrequency: { value: 25.0 }, uRippleAmplitude: { value: 0.08 },
            uRippleWaveSpeed: { value: 1.0 }, uRippleRippleCount: { value: 1.0 }, uRippleDecay: { value: 1.0 },
            uPlasmaIntensity: { value: 1.2 }, uPlasmaSpeed: { value: 0.8 },
            uPlasmaEnergyIntensity: { value: 0.4 }, uPlasmaContrastBoost: { value: 0.3 }, uPlasmaTurbulence: { value: 1.0 },
            uTimeshiftDistortion: { value: 1.6 }, uTimeshiftBlur: { value: 1.5 },
            uTimeshiftFlow: { value: 1.4 }, uTimeshiftChromatic: { value: 1.5 }, uTimeshiftTurbulence: { value: 1.4 }
          },
          vertexShader,
          fragmentShader
        });

        scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMaterial));

        for (const s of slides) {
          try { slideTextures.push(await loadImageTexture(s.media)); }
          catch { console.warn("Texture load failed"); }
        }

        if (slideTextures.length >= 2) {
          shaderMaterial.uniforms.uTexture1.value = slideTextures[0];
          shaderMaterial.uniforms.uTexture2.value = slideTextures[1];
          shaderMaterial.uniforms.uTexture1Size.value = slideTextures[0].userData.size;
          shaderMaterial.uniforms.uTexture2Size.value = slideTextures[1].userData.size;
          texturesLoaded = true;
          sliderEnabled = true;
          updateShaderUniforms();
          const wrapper = document.querySelector(".slider-wrapper");
          if (wrapper) wrapper.classList.add("loaded");
          safeStartTimer(500);
        }

        const renderLoop = () => { requestAnimationFrame(renderLoop); renderer.render(scene, camera); };
        renderLoop();
      };

      createSlidesNavigation();
      updateCounter(0);

      const titleEl = document.getElementById('mainTitle');
      const descEl = document.getElementById('mainDesc');
      if (titleEl && descEl) {
        titleEl.innerHTML = splitText(slides[0].title);
        descEl.textContent = slides[0].description;
        gsap.fromTo(titleEl.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.03, ease: "power3.out", delay: 0.5 });
        gsap.fromTo(descEl, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.8 });
      }

      initRenderer();

      const onVisibility = () => { if (document.hidden) stopAutoSlideTimer(); else if (!isTransitioning) safeStartTimer(); };
      const onResize = () => {
        if (renderer) {
          renderer.setSize(window.innerWidth, window.innerHeight);
          shaderMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
        }
      };
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("resize", onResize);
    };

    loadScripts();
    return () => {};
  }, []);

  return (
    <main className="slider-wrapper" ref={containerRef}>
      <canvas className="webgl-canvas" />
      <span className="slide-number" id="slideNumber">01</span>
      <span className="slide-total" id="slideTotal">06</span>
      <div className="slide-content">
        <h1 className="slide-title" id="mainTitle" />
        <p className="slide-description" id="mainDesc" />
      </div>
      <nav className="slides-navigation" id="slidesNav" />
    </main>
  );
}

export default LuminaSlider;
