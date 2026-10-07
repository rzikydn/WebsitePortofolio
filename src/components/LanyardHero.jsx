import React, { useState, useEffect, Suspense } from 'react';
import Lanyard from './Lanyard';

export default function LanyardHero() {
  const [isDropped, setIsDropped] = useState(false);
  const [inViewport, setInViewport] = useState(true);

  const handleLanyardLoaded = () => {
    if (typeof window !== 'undefined') {
      window.lanyardLoaded = true;
      if (typeof window.updatePreloaderProgress === 'function') {
        window.updatePreloaderProgress(100);
      }
      window.dispatchEvent(new CustomEvent('assets-ready'));
    }
  };

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

    // Safety fallback: if event not yet fired after 1.5s, signal ready
    const timer = setTimeout(() => {
      handleLanyardLoaded();
    }, 1500);

    return () => {
      clearTimeout(timer);
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
        ready={isDropped} 
        inViewport={inViewport} 
        onLoaded={handleLanyardLoaded}
      />
    </Suspense>
  );
}
