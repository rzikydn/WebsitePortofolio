import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import Lanyard from './Lanyard'
import { ProgressiveBlur } from './ProgressiveBlur'
import ScrollReveal from './ScrollReveal'
import BentoGrid from './BentoGrid'
import LogoLoop from './LogoLoop'
import ExperienceAccordion from './ExperienceAccordion'
import MotionCarousel from './MotionCarousel'

// ============================================
// Asset Loading Tracker
// ============================================
let assetsReady = false;

function signalReady() {
  if (assetsReady) return; // Only fire once
  assetsReady = true;
  window.dispatchEvent(new CustomEvent('assets-ready'));
}

// Strategy 1: Use window.onload (fires when ALL resources are loaded: images, fonts, scripts)
window.addEventListener('load', () => {
  signalReady();
});

// Strategy 2: Safety timeout — never let preloader loop more than 8 seconds
setTimeout(() => {
  signalReady();
}, 8000);

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
