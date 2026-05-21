import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import Lanyard from './Lanyard'
import { ProgressiveBlur } from './ProgressiveBlur'
import ScrollReveal from './ScrollReveal'
import BentoGrid from './BentoGrid'
import LogoLoop from './LogoLoop'
import ExperienceAccordion from './ExperienceAccordion'
import MotionCarousel from './MotionCarousel'
import cardGLB from './card.glb'
import lanyard from './lanyard.png'

// ============================================
// Real Asset Preloader & Loader Tracker
// ============================================
let assetsReady = false;

function signalReady() {
  if (assetsReady) return; // Only fire once
  assetsReady = true;
  window.dispatchEvent(new CustomEvent('assets-ready'));
}

// Safety timeout fallback: never let preloader loop more than 8.5 seconds
setTimeout(() => {
  signalReady();
}, 8500);

// Comprehensive list of all high-resolution/heavy assets to preload
const CRITICAL_IMAGES = [
  "/images/pp2new.png",
  "/images/pp1new.png",
  "/images/SER1.png",
  "/images/SER2.png",
  "/images/SER3.png",
  "/images/mockup1.png",
  "/images/mockup2.png",
  "/images/mockup3.png",
  "/images/mockup4.png",
  "/images/React.png",
  "/images/Vue.png",
  "/images/Node.js.png",
  "/images/Python.png",
  "/images/TypeScript.png",
  "/images/Tailwindcss6.png",
  "/images/Vite.png",
  "/images/HTML.png",
  "/images/GitLab.png"
];

function startAssetPreload() {
  const assetsToLoad = [
    ...CRITICAL_IMAGES,
    lanyard,
    cardGLB
  ];

  let loadedCount = 0;
  const totalAssets = assetsToLoad.length;

  function handleAssetLoaded(url, success) {
    loadedCount++;
    const progressPercentage = 15 + ((loadedCount / totalAssets) * 85); // Scale from 15% to 100%
    
    if (typeof window.updatePreloaderProgress === 'function') {
      window.updatePreloaderProgress(progressPercentage);
    }

    if (loadedCount >= totalAssets) {
      // Wait for the visual progress animation to smoothly hit 100%
      const checkVisualComplete = setInterval(() => {
        if (window.preloaderVisualComplete) {
          clearInterval(checkVisualComplete);
          // Small visual buffer so the user sees 100% before it fades out
          setTimeout(() => {
            signalReady();
          }, 350);
        }
      }, 30);
    }
  }

  assetsToLoad.forEach(url => {
    if (!url) {
      handleAssetLoaded(url, false);
      return;
    }

    // Check if the asset is a 3D model (.glb)
    if (url.endsWith('.glb') || url.includes('.glb') || url.includes('data:application/octet-stream')) {
      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error();
          return res.blob(); // fully downloads GLB into browser cache
        })
        .then(() => handleAssetLoaded(url, true))
        .catch(() => handleAssetLoaded(url, false));
    } else {
      // Standard image preloading
      const img = new Image();
      img.src = url;
      img.onload = () => handleAssetLoaded(url, true);
      img.onerror = () => handleAssetLoaded(url, false);
    }
  });
}

// Start asset downloading immediately on load
if (document.readyState === 'complete') {
  startAssetPreload();
} else {
  window.addEventListener('load', startAssetPreload);
}

// ============================================
// React Component Mounts
// ============================================

function App() {
  const [showLanyard, setShowLanyard] = useState(false);
  const [inViewport, setInViewport] = useState(true);

  useEffect(() => {
    // Listen for custom event dispatched by script.js when preloader finishes
    const handleDrop = () => {
      setShowLanyard(true);
    };

    window.addEventListener('lanyard-drop', handleDrop);

    // High-performance IntersectionObserver to pause/unmount canvas off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInViewport(entry.isIntersecting);
      },
      { threshold: 0.01 } // Trigger even if 1% is visible
    );

    const rootEl = document.getElementById('lanyard-root');
    if (rootEl) observer.observe(rootEl);

    return () => {
      window.removeEventListener('lanyard-drop', handleDrop);
      if (rootEl) observer.unobserve(rootEl);
    };
  }, []);

  return (
    <React.Suspense fallback={null}>
      <Lanyard 
        position={[0, 0, 20]} 
        gravity={[0, -40, 0]} 
        transparent={true} 
        ready={showLanyard} 
        inViewport={inViewport} 
      />
    </React.Suspense>
  );
}

const root = document.getElementById('lanyard-root');
if (root) {
  ReactDOM.createRoot(root).render(<App />);
}

const blurRoot = document.getElementById('progressive-blur-root');
if (blurRoot) {
  ReactDOM.createRoot(blurRoot).render(<ProgressiveBlur height="120px" position="bottom" />);
}

const blurTopRoot = document.getElementById('progressive-blur-top-root');
if (blurTopRoot) {
  ReactDOM.createRoot(blurTopRoot).render(<ProgressiveBlur height="250px" position="top" />);
}

const scrollRevealRoot = document.getElementById('scroll-reveal-root');
if (scrollRevealRoot) {
  ReactDOM.createRoot(scrollRevealRoot).render(
    <ScrollReveal
      baseOpacity={0.1}
      enableBlur={false}
      baseRotation={0}
      blurStrength={0}
    >
      Hi, I'm Wildan Rizky Wijaya. A Data Analyst Enthusiast from Jakarta. Mainly focused on analyzing data and creating insights. I love exploring datasets and visualizing compelling data stories.
    </ScrollReveal>
  );
}

const flowingMenuRoot = document.getElementById('flowing-menu-root');
if (flowingMenuRoot) {
  ReactDOM.createRoot(flowingMenuRoot).render(
    <BentoGrid />
  );
}

// Logo Loop Mount
const logoLoopRoot = document.getElementById('logo-loop-root');
if (logoLoopRoot) {
  const imageLogos = [
    { src: "/images/React.png", alt: "React" },
    { src: "/images/Vue.png", alt: "Vue" },
    { src: "/images/Node.js.png", alt: "Node.js" },
    { src: "/images/Python.png", alt: "Python" },
    { src: "/images/TypeScript.png", alt: "TypeScript" },
    { src: "/images/Tailwindcss6.png", alt: "Tailwind CSS" },
    { src: "/images/Vite.png", alt: "Vite" },
    { src: "/images/HTML.png", alt: "HTML" },
    { src: "/images/GitLab.png", alt: "GitLab" },
  ];

  const LogoLoopWrapper = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth <= 768);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
      <LogoLoop
        logos={imageLogos}
        speed={120}
        direction="left"
        logoHeight={isMobile ? 80 : "8.75rem"}
        gap={isMobile ? 50 : "8.75rem"}
        hoverSpeed={0}
        scaleOnHover
        fadeOut
        fadeOutColor="transparent"
        ariaLabel="Technology skills"
      />
    );
  };

  ReactDOM.createRoot(logoLoopRoot).render(<LogoLoopWrapper />);
}

// Experience Accordion Mount
const experienceRoot = document.getElementById('experience-root');
if (experienceRoot) {
  ReactDOM.createRoot(experienceRoot).render(<ExperienceAccordion />);
}

// Certificates Carousel Mount
const certificatesRoot = document.getElementById('certificates-root');
if (certificatesRoot) {
  ReactDOM.createRoot(certificatesRoot).render(<MotionCarousel />);
}
