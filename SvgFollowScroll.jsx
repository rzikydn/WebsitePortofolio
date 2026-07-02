import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef, useEffect, useState } from "react";
import "./SvgFollowScroll.css";

const SvgFollowScroll = () => {
  const ref = useRef(null);
  const { scrollY } = useScroll();
  const [isVisible, setIsVisible] = useState(false);
  const [vh, setVh] = useState(typeof window !== "undefined" ? window.innerHeight : 900);

  useEffect(() => {
    const handleResize = () => setVh(window.innerHeight);
    const handleScroll = () => {
      // Hide the path (including the starting dot) when at the very top of the page
      setIsVisible(window.scrollY > 30);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Map scrollY to pathLength dynamically based on viewport height (vh)
  // vh is the Home section scroll range, and the About reveal ends at vh + (vh * 3.5 * 0.6) = vh * 3.1
  const pathLength = useTransform(scrollY, (y) => {
    const startReveal = vh;
    const endReveal = vh * 3.1;

    if (y <= 0) return 0;
    if (y < startReveal) {
      // Draw first half of path (Hero section) from 0 to 0.56
      return (y / startReveal) * 0.56;
    }
    if (y < endReveal) {
      // Draw second half of path (About section) from 0.56 to 1.0, syncing with text reveal
      const pct = (y - startReveal) / (endReveal - startReveal);
      return 0.56 + pct * 0.44;
    }
    return 1;
  });

  return (
    <div 
      ref={ref} 
      className="svg-scroll-background"
      style={{ 
        opacity: isVisible ? 1 : 0, 
        transition: "opacity 0.3s ease" 
      }}
    >
      <LinePath
        className="svg-scroll-line"
        pathLength={pathLength}
      />
    </div>
  );
};

const LinePath = ({ className, pathLength }) => {
  return (
    <svg
      viewBox="0 0 1000 1500"
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="none"
      style={{ width: "100%", height: "100%" }}
    >
      <motion.path
        d="M 370 320 C 300 320, 120 330, 100 400 C 80 480, 500 480, 500 620 C 500 740, 850 740, 850 900 C 850 1040, 150 1040, 150 1200 C 150 1340, 600 1340, 500 1500"
        stroke="#C2F84F"
        strokeWidth="8"
        strokeLinecap="round"
        style={{
          pathLength: pathLength,
        }}
      />
    </svg>
  );
};

export default SvgFollowScroll;
