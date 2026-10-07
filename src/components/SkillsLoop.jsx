import React, { useState, useEffect } from 'react';
import LogoLoop from './LogoLoop';

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

export default function SkillsLoop() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

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
}
