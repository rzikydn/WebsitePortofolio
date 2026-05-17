import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import Lanyard from './Lanyard'
import { ProgressiveBlur } from './ProgressiveBlur'
import ScrollReveal from './ScrollReveal'
import FlowingMenu from './FlowingMenu'
import LogoLoop from './LogoLoop'
import ExperienceAccordion from './ExperienceAccordion'

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

  useEffect(() => {
    // Listen for custom event dispatched by script.js when preloader finishes
    const handleDrop = () => {
      setShowLanyard(true);
    };

    window.addEventListener('lanyard-drop', handleDrop);
    return () => window.removeEventListener('lanyard-drop', handleDrop);
  }, []);

  return (
    <React.Suspense fallback={null}>
      <Lanyard position={[0, 0, 20]} gravity={[0, -40, 0]} transparent={true} ready={showLanyard} />
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
  const demoItems = [
    { link: 'https://www.linkedin.com/posts/wildan-rizky_datawrangling-python-streamlit-ugcPost-7347899508191653888-traJ?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAFi3r_wBZ0KuCEAXJEQ6VKSY8xQfCpqM4_s', text: 'Jakarta Demographics', subtitle: 'Interactive Population Data & Analytics Dashboard', image: '/images/mockup1.png' },
    { link: 'https://planner.bsmr.org', text: 'Mirov', subtitle: 'BSMR Workspace SaaS Platform', image: '/images/mockup2.png' },
    { link: 'https://www.linkedin.com/posts/wildan-rizky_dataanalytics-dashboard-streamlit-ugcPost-7371386743175983104-Y5rB?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAFi3r_wBZ0KuCEAXJEQ6VKSY8xQfCpqM4_s', text: 'Certification Dashboard', subtitle: 'SaaS Certification Analytics', image: '/images/mockup3.png' },
    { link: 'https://uasdatawarehouse.streamlit.app/', text: 'Olist Market Insight', subtitle: 'Interactive sales & analytics dashboard', image: '/images/mockup4.png' }
  ];

  ReactDOM.createRoot(flowingMenuRoot).render(
    <FlowingMenu items={demoItems}
      speed={15}
      textColor="var(--menu-text)"
      bgColor="transparent"
      marqueeBgColor="var(--menu-text)"
      marqueeTextColor="var(--black-section-bg)"
      borderColor="var(--menu-border)"
    />
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
        logoHeight={isMobile ? 80 : 140}
        gap={isMobile ? 50 : 140}
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
