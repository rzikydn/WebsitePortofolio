import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import React, { useEffect, useState } from "react";
import "./SvgWorksScroll.css";

const SvgWorksScroll = () => {
  const { scrollY } = useScroll();
  const [vh, setVh] = useState(typeof window !== "undefined" ? window.innerHeight : 900);

  useEffect(() => {
    const handleResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Map absolute scrollY to drawing progress (0 to 1)
  const pathLength = useTransform(scrollY, (y) => {
    const startDrawing = vh * 2.8;
    const endDrawing = vh * 5.0;

    if (y <= startDrawing) return 0;
    if (y >= endDrawing) return 1;
    return (y - startDrawing) / (endDrawing - startDrawing);
  });

  // Native Framer Motion opacity motion value (0 when pathLength is 0, 1 when drawing starts)
  const opacity = useTransform(pathLength, [0, 0.001, 1], [0, 1, 1]);

  return (
    <motion.div
      className="svg-works-background"
      style={{
        opacity,
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
    </motion.div>
  );
};

export default SvgWorksScroll;
