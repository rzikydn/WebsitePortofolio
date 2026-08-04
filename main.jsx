import React, { useState, useEffect, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { ProgressiveBlur } from './ProgressiveBlur'
import ScrollReveal from './ScrollReveal'
import Lanyard from './Lanyard'
import CrowdCanvas from './CrowdCanvas'
import { Highlighter } from '@/registry/magicui/highlighter'

// Lazy loaded non-hero components
const BentoGrid = React.lazy(() => import('./BentoGrid'));
const LogoLoop = React.lazy(() => import('./LogoLoop'));
const ExperienceAccordion = React.lazy(() => import('./ExperienceAccordion'));
const MotionCarousel = React.lazy(() => import('./MotionCarousel'));
const ConfettiSideCannons = React.lazy(() => import('./ConfettiSideCannons'));
const SvgFollowScroll = React.lazy(() => import('./SvgFollowScroll'));
const SvgWorksScroll = React.lazy(() => import('./SvgWorksScroll'));

import cardGLB from './card.glb'
import lanyardImg from './lanyard.png'

// ============================================
// Real Asset Preloader & Loader Tracker
// ============================================
const CRITICAL_IMAGES = [
  cardGLB,
  lanyardImg,
  '/images/peeps/all-peeps.png',
  '/images/SER1.png',
  '/images/SER2.png',
  '/images/SER3.png',
  '/images/mockup1.png',
  '/images/mockup2.png',
  '/images/mockup3.png',
  '/images/mockup4.png',
  '/images/pp1new.png',
  '/images/pp2new.png'
];

let lanyardReady = false;
let crowdReady = false;
let imagesReady = false;
let signalFired = false;

function updateProgress() {
  let progress = 35;
  if (imagesReady) progress += 25;
  if (crowdReady) progress += 20;
  if (lanyardReady) progress += 20;

  if (typeof window.updatePreloaderProgress === 'function') {
    window.updatePreloaderProgress(progress);
  }

  if (imagesReady && crowdReady && lanyardReady) {
    signalReady();
  }
}

function signalReady() {
  if (signalFired) return;
  signalFired = true;

  if (typeof window.updatePreloaderProgress === 'function') {
    window.updatePreloaderProgress(100);
  }

  window.dispatchEvent(new CustomEvent('assets-ready'));
}

// Safety fallback after max 5 seconds even on poor network
setTimeout(() => {
  signalReady();
}, 5000);

// Preload all site assets concurrently during preloader greeting
function preloadAssets(urls) {
  let loadedCount = 0;
  return new Promise((resolve) => {
    if (!urls || !urls.length) return resolve();
    urls.forEach((url) => {
      if (!url) {
        loadedCount++;
        if (loadedCount >= urls.length) resolve();
        return;
      }
      if (typeof url === 'string' && url.endsWith('.glb')) {
        fetch(url)
          .then(() => {
            loadedCount++;
            if (loadedCount >= urls.length) resolve();
          })
          .catch(() => {
            loadedCount++;
            if (loadedCount >= urls.length) resolve();
          });
      } else {
        const img = new Image();
        img.src = url;
        const handleLoad = () => {
          loadedCount++;
          if (loadedCount >= urls.length) {
            resolve();
          }
        };
        if (img.complete) {
          handleLoad();
        } else {
          img.onload = handleLoad;
          img.onerror = handleLoad;
        }
      }
    });
  });
}

preloadAssets(CRITICAL_IMAGES).then(() => {
  imagesReady = true;
  updateProgress();
});

// ============================================
// React Component Mounts
// ============================================

function App() {
  const [showLanyard, setShowLanyard] = useState(false);
  const [inViewport, setInViewport] = useState(true);

  useEffect(() => {
    const handleDrop = () => {
      setShowLanyard(true);
    };

    window.addEventListener('lanyard-drop', handleDrop);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInViewport(entry.isIntersecting);
      },
      { threshold: 0.01 }
    );

    const rootEl = document.getElementById('home');
    if (rootEl) observer.observe(rootEl);

    return () => {
      window.removeEventListener('lanyard-drop', handleDrop);
      if (rootEl) observer.unobserve(rootEl);
    };
  }, []);

  const handleLanyardLoaded = () => {
    lanyardReady = true;
    updateProgress();
  };

  return (
    <Lanyard 
      position={[0, 0, 20]} 
      gravity={[0, -40, 0]} 
      transparent={true} 
      ready={showLanyard} 
      inViewport={inViewport} 
      onLoaded={handleLanyardLoaded}
    />
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
      Hi, I'm Wildan Rizky Wijaya. A Data Analyst Enthusiast from Jakarta. Mainly focused on{' '}
      <Highlighter action="underline" color="#FF9800">
        analyzing data
      </Highlighter>{' '}
      and{' '}
      <Highlighter action="highlight" color="#87CEFA">
        creating insights.
      </Highlighter>{' '}
      I love exploring datasets and visualizing compelling data stories.
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

// Confetti Mount
const confettiRoot = document.getElementById('confetti-root');
if (confettiRoot) {
  ReactDOM.createRoot(confettiRoot).render(
    <Suspense fallback={null}>
      <ConfettiSideCannons />
    </Suspense>
  );
}

// Crowd Canvas Mount
const crowdCanvasRoot = document.getElementById('crowd-canvas-root');
if (crowdCanvasRoot) {
  const handleCrowdLoaded = () => {
    crowdReady = true;
    updateProgress();
  };

  ReactDOM.createRoot(crowdCanvasRoot).render(
    <CrowdCanvas onLoaded={handleCrowdLoaded} />
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
