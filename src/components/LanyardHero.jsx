import React, { useState, useEffect, Suspense } from 'react';
import Lanyard from './Lanyard';

export default function LanyardHero() {
  const [mounted, setMounted] = useState(false);
  const [isDropped, setIsDropped] = useState(() => {
    return typeof window !== 'undefined' ? Boolean(window.__LANYARD_DROPPED__) : false;
  });
  const [inViewport, setInViewport] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (!mounted) return;

    const handleDrop = () => {
      if (typeof window !== 'undefined') window.__LANYARD_DROPPED__ = true;
      setIsDropped(true);
    };

    window.addEventListener('lanyard-drop', handleDrop);

    // If preloader is already done or lanyard already dropped
    if (typeof window !== 'undefined' && window.__LANYARD_DROPPED__) {
      setIsDropped(true);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInViewport(entry.isIntersecting);
      },
      { threshold: 0.01 }
    );

    const rootEl = document.getElementById('home');
    if (rootEl) observer.observe(rootEl);

    // Safety fallback: ensure lanyard drops even if event was missed
    const timer = setTimeout(() => {
      handleLanyardLoaded();
      setIsDropped(true);
    }, 1200);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('lanyard-drop', handleDrop);
      if (rootEl) observer.unobserve(rootEl);
    };
  }, [mounted]);

  // Placeholder with exact dimensions to prevent Layout Shift (CLS = 0)
  const placeholder = (
    <div 
      className="lanyard-placeholder" 
      style={{ 
        width: '100%', 
        height: '100vh', 
        minHeight: '100vh', 
        pointerEvents: 'none' 
      }} 
      aria-hidden="true" 
    />
  );

  if (!mounted) {
    return placeholder;
  }

  return (
    <Suspense fallback={placeholder}>
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
