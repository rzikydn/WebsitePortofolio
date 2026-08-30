import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { ProgressiveBlur } from './ProgressiveBlur'
import CrowdCanvas from './CrowdCanvas'
import { Highlighter } from '@/registry/magicui/highlighter'

// Direct component imports so all components & assets are bundled and mounted immediately
import Lanyard from './Lanyard'
import ScrollReveal from './ScrollReveal'
import BentoGrid from './BentoGrid'
import LogoLoop from './LogoLoop'
import ExperienceAccordion from './ExperienceAccordion'
import MotionCarousel from './MotionCarousel'
import ConfettiSideCannons from './ConfettiSideCannons'
import SvgFollowScroll from './SvgFollowScroll'
import SvgWorksScroll from './SvgWorksScroll'
import ExpandableScreenDemo from './ExpandableScreenDemo'

// ============================================
// Comprehensive Preloader Asset Pipeline
// ============================================
const CRITICAL_IMAGES = [
  // 1. Hero Peeps Crowd Background
  '/images/peeps/all-peeps.webp',

  // 2. BentoGrid Project Cards
  '/images/mockup1.webp',
  '/images/mockup2.webp',
  '/images/mockup3.webp',
  '/images/mockup4.webp',

  // 3. Technical Skill Logos
  '/images/React.webp',
  '/images/Vue.webp',
  '/images/Node.js.webp',
  '/images/Python.webp',
  '/images/TypeScript.webp',
  '/images/Tailwindcss6.webp',
  '/images/Vite.webp',
  '/images/HTML.webp',
  '/images/GitLab.webp',

  // 4. Certificates
  '/images/SER1.webp',
  '/images/SER2.webp',
  '/images/SER3.webp',

  // 5. Contact Me Memoji Avatars
  '/images/pp2new.webp',
  '/images/pp1new.webp'
];

const totalUnits = CRITICAL_IMAGES.length + 2; // Images + Lanyard 3D + CrowdCanvas
let loadedUnits = 0;
let signalFired = false;

function stepProgress() {
  loadedUnits++;
  const ratio = Math.min(1, loadedUnits / totalUnits);
  const progressPercent = Math.round(ratio * 100);

  if (typeof window.updatePreloaderProgress === 'function') {
    window.updatePreloaderProgress(progressPercent);
  }

  if (loadedUnits >= totalUnits) {
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

// Safety fallback: if user has a very slow connection, finish after 4.5s max
setTimeout(() => {
  signalReady();
}, 4500);

// Preload & decode all images in parallel during the preloader
CRITICAL_IMAGES.forEach((url) => {
  let done = false;
  const onDone = () => {
    if (done) return;
    done = true;
    stepProgress();
  };

  const img = new Image();
  img.onload = () => {
    if (img.decode) {
      img.decode().then(onDone).catch(onDone);
    } else {
      onDone();
    }
  };
  img.onerror = onDone; // Don't block preloader if 1 asset fails
  img.src = url;
  if (img.complete) {
    onDone();
  }
});

function App({ onLanyardReady }) {
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

  return (
    <Lanyard 
      position={[0, 0, 20]} 
      gravity={[0, -40, 0]} 
      transparent={true} 
      ready={showLanyard} 
      inViewport={inViewport} 
      onLoaded={onLanyardReady}
    />
  );
}

// ============================================
// Immediate Component Mounts (Rendered under preloader overlay)
// ============================================
if (!window.__MAIN_JSX_MOUNTED__) {
  window.__MAIN_JSX_MOUNTED__ = true;

  // 1. Hero Lanyard Mount
  const root = document.getElementById('lanyard-root');
  if (root) {
    ReactDOM.createRoot(root).render(<App onLanyardReady={() => stepProgress()} />);
  }

  // 2. Hero Blurs Mount
  const blurRoot = document.getElementById('progressive-blur-root');
  if (blurRoot) {
    ReactDOM.createRoot(blurRoot).render(<ProgressiveBlur height="120px" position="bottom" />);
  }

  const blurTopRoot = document.getElementById('progressive-blur-top-root');
  if (blurTopRoot) {
    ReactDOM.createRoot(blurTopRoot).render(<ProgressiveBlur height="250px" position="top" />);
  }

  // 3. Hero Crowd Canvas Mount
  const crowdCanvasRoot = document.getElementById('crowd-canvas-root');
  if (crowdCanvasRoot) {
    ReactDOM.createRoot(crowdCanvasRoot).render(
      <CrowdCanvas onLoaded={() => stepProgress()} />
    );
  }

  // 4. About Section (ScrollReveal)
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

  // 5. Works Section (Bento Grid & Works SVG)
  const bentoRoot = document.getElementById('flowing-menu-root');
  if (bentoRoot) {
    ReactDOM.createRoot(bentoRoot).render(<BentoGrid />);
  }

  const worksSvgRoot = document.getElementById('works-svg-root');
  if (worksSvgRoot) {
    ReactDOM.createRoot(worksSvgRoot).render(<SvgWorksScroll />);
  }

  // 6. Skills Section (LogoLoop)
  const logoLoopRoot = document.getElementById('logo-loop-root');
  if (logoLoopRoot) {
    const imageLogos = [
      { src: "/images/React.webp", alt: "React" },
      { src: "/images/Vue.webp", alt: "Vue" },
      { src: "/images/Node.js.webp", alt: "Node.js" },
      { src: "/images/Python.webp", alt: "Python" },
      { src: "/images/TypeScript.webp", alt: "TypeScript" },
      { src: "/images/Tailwindcss6.webp", alt: "Tailwind CSS" },
      { src: "/images/Vite.webp", alt: "Vite" },
      { src: "/images/HTML.webp", alt: "HTML" },
      { src: "/images/GitLab.webp", alt: "GitLab" },
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

  // 7. Experience Section (Static timeline with SVG follow)
  const expRoot = document.getElementById('experience-root');
  if (expRoot) {
    ReactDOM.createRoot(expRoot).render(<ExperienceAccordion />);
  }

  const svgFollowRoot = document.getElementById('svg-follow-scroll-root');
  if (svgFollowRoot) {
    ReactDOM.createRoot(svgFollowRoot).render(<SvgFollowScroll />);
  }

  // 8. Certificates Section (MotionCarousel)
  const certRoot = document.getElementById('certificates-root');
  if (certRoot) {
    ReactDOM.createRoot(certRoot).render(<MotionCarousel />);
  }

  // 9. Contact & Confetti Section
  const confettiRoot = document.getElementById('confetti-root');
  if (confettiRoot) {
    ReactDOM.createRoot(confettiRoot).render(<ConfettiSideCannons />);
  }

  const contactBtnRoot = document.getElementById('contact-btn-root');
  if (contactBtnRoot) {
    ReactDOM.createRoot(contactBtnRoot).render(<ExpandableScreenDemo />);
  }
}
