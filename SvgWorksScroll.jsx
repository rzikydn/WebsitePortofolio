import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import React, { useEffect, useState } from "react";
import "./SvgWorksScroll.css";

const SvgWorksScroll = () => {
  const { scrollY } = useScroll();
  const [vh, setVh] = useState(typeof window !== "undefined" ? window.innerHeight : 900);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Map absolute scrollY to drawing progress (0 to 1)
  // Start drawing much earlier (vh * 2.8) so the line begins when MY WORKS is ~10-20% visible
  // Complete drawing by vh * 5.0 (balanced drawing speed)
  const pathLength = useTransform(scrollY, (y) => {
    const startDrawing = vh * 2.8;
    const endDrawing = vh * 5.0;

    if (y <= startDrawing) return 0;
    if (y >= endDrawing) return 1;
    return (y - startDrawing) / (endDrawing - startDrawing);
  });

  // Listen to pathLength changes to toggle visibility (hides the green dot at pathLength=0)
  useMotionValueEvent(pathLength, "change", (latest) => {
    setIsVisible(latest > 0.001);
  });

  return (
    <div
      className="svg-works-background"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.15s ease",
      }}
    >
      <svg
        viewBox="0 0 1000 1000"
        fill="none"
        overflow="visible"
        xmlns="http://www.w3.org/2000/svg"
        className="svg-works-line"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%" }}
      >
        <motion.path
          d="M 570 160 C 680 180, 850 260, 850 380 C 850 500, 700 640, 450 720 C 280 770, 120 780, 100 900 C 80 1020, 180 1120, 330 1180"
          stroke="#C2F84F"
          strokeWidth="8"
          strokeLinecap="round"
          style={{
            pathLength: pathLength,
          }}
        />
      </svg>
    </div>
  );
};

export default SvgWorksScroll;
