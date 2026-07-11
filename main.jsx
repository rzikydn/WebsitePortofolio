import React, { useState, useEffect, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { ProgressiveBlur } from './ProgressiveBlur'
import ScrollReveal from './ScrollReveal'
import cardGLB from './card.glb'
import lanyard from './lanyard.png'

// Lazy loaded heavy components for optimal page-load performance
const Lanyard = React.lazy(() => import('./Lanyard'));
const BentoGrid = React.lazy(() => import('./BentoGrid'));
const LogoLoop = React.lazy(() => import('./LogoLoop'));
const ExperienceAccordion = React.lazy(() => import('./ExperienceAccordion'));
const MotionCarousel = React.lazy(() => import('./MotionCarousel'));
const SmoothCursor = React.lazy(() => import('./SmoothCursor'));
const ConfettiSideCannons = React.lazy(() => import('./ConfettiSideCannons'));
const Globe = React.lazy(() => import('./Globe'));
const CrowdCanvas = React.lazy(() => import('./CrowdCanvas'));
const SvgFollowScroll = React.lazy(() => import('./SvgFollowScroll'));
const SvgWorksScroll = React.lazy(() => import('./SvgWorksScroll'));

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

// Only preload essential above-the-fold assets required for the hero section
// to prevent network congestion and slow FCP/LCP on mobile devices.
const CRITICAL_IMAGES = [];


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

// Start asset downloading immediately
startAssetPreload();

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
    <Suspense fallback={null}>
      <BentoGrid />
    </Suspense>
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
      <Suspense fallback={null}>
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
      </Suspense>
    );
  };

  ReactDOM.createRoot(logoLoopRoot).render(<LogoLoopWrapper />);
}

// Experience Accordion Mount
const experienceRoot = document.getElementById('experience-root');
if (experienceRoot) {
  ReactDOM.createRoot(experienceRoot).render(
    <Suspense fallback={null}>
      <ExperienceAccordion />
    </Suspense>
  );
}

// Certificates Carousel Mount
const certificatesRoot = document.getElementById('certificates-root');
if (certificatesRoot) {
  ReactDOM.createRoot(certificatesRoot).render(
    <Suspense fallback={null}>
      <MotionCarousel />
    </Suspense>
  );
}

// Smooth Cursor Mount
const smoothCursorRoot = document.getElementById('smooth-cursor-root');
if (smoothCursorRoot) {
  ReactDOM.createRoot(smoothCursorRoot).render(
    <Suspense fallback={null}>
      <SmoothCursor />
    </Suspense>
  );
}

// Confetti Mount
const confettiRoot = document.getElementById('confetti-root');
if (confettiRoot) {
  ReactDOM.createRoot(confettiRoot).render(
    <Suspense fallback={null}>
      <ConfettiSideCannons />
    </Suspense>
  );
}

// Globe Mount (for contact page)
const globeRoot = document.getElementById('globe-root');
if (globeRoot) {
  ReactDOM.createRoot(globeRoot).render(
    <Suspense fallback={null}>
      <Globe />
    </Suspense>
  );
}

// Crowd Canvas Mount
const crowdCanvasRoot = document.getElementById('crowd-canvas-root');
if (crowdCanvasRoot) {
  ReactDOM.createRoot(crowdCanvasRoot).render(
    <Suspense fallback={null}>
      <CrowdCanvas />
    </Suspense>
  );
}

// SVG Follow Scroll Mount
const svgFollowScrollRoot = document.getElementById('svg-follow-scroll-root');
if (svgFollowScrollRoot) {
  ReactDOM.createRoot(svgFollowScrollRoot).render(
    <Suspense fallback={null}>
      <SvgFollowScroll />
    </Suspense>
  );
}

// Works SVG Mount
const worksSvgRoot = document.getElementById('works-svg-root');
if (worksSvgRoot) {
  ReactDOM.createRoot(worksSvgRoot).render(
    <Suspense fallback={null}>
      <SvgWorksScroll />
    </Suspense>
  );
}


