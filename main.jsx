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
const ConfettiSideCannons = React.lazy(() => import('./ConfettiSideCannons'));
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

// Signal ready after initial render to avoid blocking FCP/LCP
setTimeout(() => {
  signalReady();
}, 100);

// A simple wrapper to defer rendering of heavy non-critical components to optimize initial load
function Defer({ children, delay = 1000 }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const handle = setTimeout(() => {
      setReady(true);
    }, delay);
    return () => clearTimeout(handle);
  }, [delay]);
  return ready ? children : null;
}

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

    // Observe the entire Hero container to pause/unmount Canvas offscreen
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
      <Defer delay={1500}>
        <BentoGrid />
      </Defer>
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
        <Defer delay={1500}>
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
        </Defer>
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
      <Defer delay={2000}>
        <ExperienceAccordion />
      </Defer>
    </Suspense>
  );
}

// Certificates Carousel Mount
const certificatesRoot = document.getElementById('certificates-root');
if (certificatesRoot) {
  ReactDOM.createRoot(certificatesRoot).render(
    <Suspense fallback={null}>
      <Defer delay={2500}>
        <MotionCarousel />
      </Defer>
    </Suspense>
  );
}



// Confetti Mount
const confettiRoot = document.getElementById('confetti-root');
if (confettiRoot) {
  ReactDOM.createRoot(confettiRoot).render(
    <Suspense fallback={null}>
      <Defer delay={3500}>
        <ConfettiSideCannons />
      </Defer>
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
      <Defer delay={1200}>
        <SvgFollowScroll />
      </Defer>
    </Suspense>
  );
}

// Works SVG Mount
const worksSvgRoot = document.getElementById('works-svg-root');
if (worksSvgRoot) {
  ReactDOM.createRoot(worksSvgRoot).render(
    <Suspense fallback={null}>
      <Defer delay={1800}>
        <SvgWorksScroll />
      </Defer>
    </Suspense>
  );
}


