import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import Lanyard from './Lanyard'
import { ProgressiveBlur } from './ProgressiveBlur'
import ScrollReveal from './ScrollReveal'
import FlowingMenu from './FlowingMenu'
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
    { link: '#', text: 'Mirov', subtitle: 'BSMR Workspace SaaS Platform', image: 'https://picsum.photos/600/400?random=1' },
    { link: '#', text: 'Certification Dashboard', subtitle: 'Data Driven Insight', image: 'https://picsum.photos/600/400?random=2' },
    { link: '#', text: 'KeluhKesah', subtitle: 'Anonymous Menfess-like App', image: 'https://picsum.photos/600/400?random=3' },
    { link: '#', text: 'E-Commerce Dashboard', subtitle: 'Interactive sales & analytics dashboard', image: 'https://picsum.photos/600/400?random=4' }
  ];

  ReactDOM.createRoot(flowingMenuRoot).render(
    <FlowingMenu items={demoItems}
      speed={15}
      textColor="#ffffff"
      bgColor="transparent"
      marqueeBgColor="#ffffff"
      marqueeTextColor="#0f172a"
      borderColor="rgba(255,255,255,0.2)"
    />
  );
}
