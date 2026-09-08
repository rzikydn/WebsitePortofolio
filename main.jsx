import React, { useState, useEffect, Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { ProgressiveBlur } from './ProgressiveBlur'
import { Highlighter } from '@/registry/magicui/highlighter'

// Lazy loaded heavy 3D components to eliminate critical bundle & physics blocking LCP
const LazyLanyard = lazy(() => import('./Lanyard'))

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
// Comprehensive Preloader Asset Pipeline ("The Gate")
// Preloads all critical images, 3D Lanyard, and mounts components
// ============================================
const CRITICAL_IMAGES = [
  '/images/logox.webp',
  '/images/mockup1.webp',
  '/images/mockup2.webp',
  '/images/mockup3.webp',
  '/images/mockup4.webp',
  '/images/dragon2.webp',
  '/images/caset.webp',
  '/images/tv.webp',
  '/images/sakura.webp'
];

let imagesLoaded = false;
let lanyardLoaded = false;
let signalFired = false;

function checkAllAssetsReady() {
  if (imagesLoaded && lanyardLoaded && !signalFired) {
    signalFired = true;
    if (typeof window.updatePreloaderProgress === 'function') {
      window.updatePreloaderProgress(100);
    }
    window.dispatchEvent(new CustomEvent('assets-ready'));
  }
}

// Fallback safety: Release gate after max 3.2s even on slow connections
setTimeout(() => {
  imagesLoaded = true;
  lanyardLoaded = true;
  checkAllAssetsReady();
}, 3200);

// Preload and decode images asynchronously off the main thread
let loadedCount = 0;
CRITICAL_IMAGES.forEach((url) => {
  const img = new Image();
  const onDone = () => {
    loadedCount++;
    const ratio = Math.min(1, loadedCount / CRITICAL_IMAGES.length);
    if (typeof window.updatePreloaderProgress === 'function') {
      window.updatePreloaderProgress(Math.round(ratio * 90));
    }
    if (loadedCount >= CRITICAL_IMAGES.length) {
      imagesLoaded = true;
      checkAllAssetsReady();
    }
  };

  img.onload = () => {
    if (img.decode) {
      img.decode().then(onDone).catch(onDone);
    } else {
      onDone();
    }
  };
  img.onerror = onDone;
  img.src = url;
  if (img.complete) {
    onDone();
  }
});

function App({ onLanyardReady }) {
  const [isDropped, setIsDropped] = useState(false);
  const [inViewport, setInViewport] = useState(true);

  useEffect(() => {
    const handleDrop = () => {
      setIsDropped(true);
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
    <Suspense fallback={null}>
      <LazyLanyard 
        position={[0, 0, 20]} 
        gravity={[0, -40, 0]} 
        transparent={true} 
        ready={isDropped} 
        inViewport={inViewport} 
        onLoaded={onLanyardReady}
      />
    </Suspense>
  );
}

// ============================================
// Staggered Component Mounts under Preloader Curtain
// Mounts all components across micro-ticks so main thread never drops frames
// ============================================
if (!window.__MAIN_JSX_MOUNTED__) {
  window.__MAIN_JSX_MOUNTED__ = true;

  const markLanyardReady = () => {
    lanyardLoaded = true;
    checkAllAssetsReady();
  };

  // 1. Immediate: Hero Lanyard (warmed up with zero gravity under preloader) & Blurs
  const root = document.getElementById('lanyard-root');
  if (root) {
    ReactDOM.createRoot(root).render(<App onLanyardReady={markLanyardReady} />);
  }

  const blurRoot = document.getElementById('progressive-blur-root');
  if (blurRoot) {
    ReactDOM.createRoot(blurRoot).render(<ProgressiveBlur height="120px" position="bottom" />);
  }

  const blurTopRoot = document.getElementById('progressive-blur-top-root');
  if (blurTopRoot) {
    ReactDOM.createRoot(blurTopRoot).render(<ProgressiveBlur height="250px" position="top" />);
  }

  // 2. Tick 1 (+50ms): About Section (ScrollReveal)
  setTimeout(() => {
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
  }, 50);

  // 3. Tick 2 (+100ms): Works Section (Bento Grid & Works SVG)
  setTimeout(() => {
    const bentoRoot = document.getElementById('flowing-menu-root');
    if (bentoRoot) {
      ReactDOM.createRoot(bentoRoot).render(<BentoGrid />);
    }

    const worksSvgRoot = document.getElementById('works-svg-root');
    if (worksSvgRoot) {
      ReactDOM.createRoot(worksSvgRoot).render(<SvgWorksScroll />);
    }
  }, 100);

  // 4. Tick 3 (+150ms): Skills & Experience Sections
  setTimeout(() => {
    const logoLoopRoot = document.getElementById('logo-loop-root');
    if (logoLoopRoot) {
      const imageLogos = [
        { src: "/images/React.webp", alt: "React", width: 156, height: 80 },
        { src: "/images/Vue.webp", alt: "Vue", width: 142, height: 80 },
        { src: "/images/Node.js.webp", alt: "Node.js", width: 142, height: 80 },
        { src: "/images/Python.webp", alt: "Python", width: 142, height: 80 },
        { src: "/images/TypeScript.webp", alt: "TypeScript", width: 142, height: 80 },
        { src: "/images/Tailwindcss6.webp", alt: "Tailwind CSS", width: 157, height: 80 },
        { src: "/images/Vite.webp", alt: "Vite", width: 142, height: 80 },
        { src: "/images/HTML.webp", alt: "HTML", width: 142, height: 80 },
        { src: "/images/GitLab.webp", alt: "GitLab", width: 142, height: 80 },
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

    const expRoot = document.getElementById('experience-root');
    if (expRoot) {
      ReactDOM.createRoot(expRoot).render(<ExperienceAccordion />);
    }

    const svgFollowRoot = document.getElementById('svg-follow-scroll-root');
    if (svgFollowRoot) {
      ReactDOM.createRoot(svgFollowRoot).render(<SvgFollowScroll />);
    }
  }, 150);

  // 5. Tick 4 (+200ms): Certificates & Contact Sections
  setTimeout(() => {
    const certRoot = document.getElementById('certificates-root');
    if (certRoot) {
      ReactDOM.createRoot(certRoot).render(<MotionCarousel />);
    }

    const confettiRoot = document.getElementById('confetti-root');
    if (confettiRoot) {
      ReactDOM.createRoot(confettiRoot).render(<ConfettiSideCannons />);
    }

    const contactBtnRoot = document.getElementById('contact-btn-root');
    if (contactBtnRoot) {
      ReactDOM.createRoot(contactBtnRoot).render(<ExpandableScreenDemo />);
    }
  }, 200);
}
