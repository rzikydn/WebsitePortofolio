import React, { useState, useEffect, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { ProgressiveBlur } from './ProgressiveBlur'
import CrowdCanvas from './CrowdCanvas'
import { Highlighter } from '@/registry/magicui/highlighter'

// Dynamically imported components (Look-ahead code-split)
const Lanyard = React.lazy(() => import('./Lanyard'));
const ScrollReveal = React.lazy(() => import('./ScrollReveal'));
const BentoGrid = React.lazy(() => import('./BentoGrid'));
const LogoLoop = React.lazy(() => import('./LogoLoop'));
const ExperienceAccordion = React.lazy(() => import('./ExperienceAccordion'));
const MotionCarousel = React.lazy(() => import('./MotionCarousel'));
const ConfettiSideCannons = React.lazy(() => import('./ConfettiSideCannons'));
const SvgFollowScroll = React.lazy(() => import('./SvgFollowScroll'));
const SvgWorksScroll = React.lazy(() => import('./SvgWorksScroll'));
const ExpandableScreenDemo = React.lazy(() => import('./ExpandableScreenDemo'));

// Only preload critical hero peeps background
const CRITICAL_IMAGES = [
  '/images/peeps/all-peeps.webp'
];

let imagesLoadedRatio = 0;
let crowdReady = false;
let signalFired = false;

function updateProgress() {
  let progress = 50 + Math.round(imagesLoadedRatio * 30);
  if (crowdReady) progress += 20;

  if (typeof window.updatePreloaderProgress === 'function') {
    window.updatePreloaderProgress(progress);
  }

  if (imagesLoadedRatio >= 1 && crowdReady) {
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

// Safety fallback after max 800ms
setTimeout(() => {
  signalReady();
}, 800);

function preloadImages(urls) {
  const total = urls.length;
  if (!total) {
    imagesLoadedRatio = 1;
    updateProgress();
    return;
  }

  let loadedCount = 0;

  urls.forEach((url) => {
    let doneCalled = false;
    const done = () => {
      if (doneCalled) return;
      doneCalled = true;
      loadedCount++;
      imagesLoadedRatio = loadedCount / total;
      updateProgress();
    };

    const timer = setTimeout(done, 800);

    const img = new Image();
    img.onload = () => {
      clearTimeout(timer);
      done();
    };
    img.onerror = () => {
      clearTimeout(timer);
      done();
    };
    img.src = url;
    if (img.complete) {
      clearTimeout(timer);
      done();
    }
  });
}

preloadImages(CRITICAL_IMAGES);

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

  return (
    <Suspense fallback={null}>
      <Lanyard 
        position={[0, 0, 20]} 
        gravity={[0, -40, 0]} 
        transparent={true} 
        ready={showLanyard} 
        inViewport={inViewport} 
      />
    </Suspense>
  );
}

// Look-ahead Lazy Mount Helper
function lazyMount(elementId, renderFn, rootMargin = '400px 0px') {
  const el = document.getElementById(elementId);
  if (!el) return;

  if (typeof IntersectionObserver === 'undefined') {
    renderFn(el);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        renderFn(el);
      }
    },
    { rootMargin, threshold: 0.01 }
  );

  observer.observe(el);
}

// ============================================
// React Component Mounts (Guarded to prevent duplicate rendering)
// ============================================

if (!window.__MAIN_JSX_MOUNTED__) {
  window.__MAIN_JSX_MOUNTED__ = true;

  // Hero Lanyard Mount
  const root = document.getElementById('lanyard-root');
  if (root) {
    ReactDOM.createRoot(root).render(<App />);
  }

  // Hero Blurs Mount
  const blurRoot = document.getElementById('progressive-blur-root');
  if (blurRoot) {
    ReactDOM.createRoot(blurRoot).render(<ProgressiveBlur height="120px" position="bottom" />);
  }

  const blurTopRoot = document.getElementById('progressive-blur-top-root');
  if (blurTopRoot) {
    ReactDOM.createRoot(blurTopRoot).render(<ProgressiveBlur height="250px" position="top" />);
  }

  // Hero Crowd Canvas Mount
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

  // Look-Ahead 1: About Section (triggers when within 400px)
  lazyMount('scroll-reveal-root', (el) => {
    ReactDOM.createRoot(el).render(
      <Suspense fallback={null}>
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
      </Suspense>
    );
  }, '400px 0px');

  // Look-Ahead 2: Works Section (Bento Grid & Works SVG)
  lazyMount('flowing-menu-root', (el) => {
    ReactDOM.createRoot(el).render(
      <Suspense fallback={null}>
        <BentoGrid />
      </Suspense>
    );
  }, '450px 0px');

  lazyMount('works-svg-root', (el) => {
    ReactDOM.createRoot(el).render(
      <Suspense fallback={null}>
        <SvgWorksScroll />
      </Suspense>
    );
  }, '450px 0px');

  // Look-Ahead 3: Skills Section (LogoLoop)
  lazyMount('logo-loop-root', (el) => {
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

    ReactDOM.createRoot(el).render(<LogoLoopWrapper />);
  }, '450px 0px');

  // Look-Ahead 4: Experience Section
  lazyMount('experience-root', (el) => {
    ReactDOM.createRoot(el).render(
      <Suspense fallback={null}>
        <ExperienceAccordion />
      </Suspense>
    );
  }, '450px 0px');

  lazyMount('svg-follow-scroll-root', (el) => {
    ReactDOM.createRoot(el).render(
      <Suspense fallback={null}>
        <SvgFollowScroll />
      </Suspense>
    );
  }, '450px 0px');

  // Look-Ahead 5: Certificates Section
  lazyMount('certificates-root', (el) => {
    ReactDOM.createRoot(el).render(
      <Suspense fallback={null}>
        <MotionCarousel />
      </Suspense>
    );
  }, '450px 0px');

  // Look-Ahead 6: Contact & Confetti Section
  lazyMount('confetti-root', (el) => {
    ReactDOM.createRoot(el).render(
      <Suspense fallback={null}>
        <ConfettiSideCannons />
      </Suspense>
    );
  }, '450px 0px');

  lazyMount('contact-btn-root', (el) => {
    ReactDOM.createRoot(el).render(
      <Suspense fallback={
        <a href="mailto:rzikydn@gmail.com" className="contact-btn contact-btn--primary">
          Get In Touch &rarr;
        </a>
      }>
        <ExpandableScreenDemo />
      </Suspense>
    );
  }, '450px 0px');
}
