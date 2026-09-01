import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./SvgWorksScroll.css";

gsap.registerPlugin(ScrollTrigger);

const SvgWorksScroll = () => {
  const containerRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    const path = pathRef.current;
    const worksSection = document.getElementById("works");
    if (!path || !worksSection) return;

    // Get exact length of the SVG curve
    const pathLength = path.getTotalLength();

    // Set initial stroke dash properties
    path.style.strokeDasharray = `${pathLength}`;
    path.style.strokeDashoffset = `${pathLength}`;

    // Native GSAP Tween directly synchronized 1:1 with Lenis
    const tween = gsap.fromTo(
      path,
      { strokeDashoffset: pathLength },
      {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: worksSection,
          start: "top 75%",
          end: "bottom 35%",
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    );

    return () => {
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
      tween.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="svg-works-background"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1000 1000"
        fill="none"
        overflow="visible"
        xmlns="http://www.w3.org/2000/svg"
        className="svg-works-line"
        preserveAspectRatio="none"
        shapeRendering="auto"
        style={{ width: "100%", height: "100%" }}
      >
        <path
          ref={pathRef}
          d="M 570 160 C 680 180, 850 260, 850 380 C 850 500, 700 640, 450 720 C 280 770, 120 780, 100 900 C 80 1020, 180 1120, 330 1180"
          stroke="#C2F84F"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default SvgWorksScroll;
