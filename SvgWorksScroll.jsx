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
    const container = containerRef.current;
    if (!path || !container) return;

    const worksSection = document.getElementById("works");
    if (!worksSection) return;

    // Get exact length of the SVG curve
    const pathLength = path.getTotalLength();

    // Set initial stroke dash properties
    path.style.strokeDasharray = `${pathLength}`;
    path.style.strokeDashoffset = `${pathLength}`;

    // Create ScrollTrigger tied to #works section, integrated directly with Lenis ticker
    const st = ScrollTrigger.create({
      trigger: worksSection,
      start: "top 75%", // Starts drawing smoothly as Works enters viewport
      end: "bottom 35%", // Finishes drawing near the end of Works
      scrub: 0.4, // Silky smooth interpolation synchronized with Lenis
      onUpdate: (self) => {
        const progress = self.progress;
        if (progress > 0.005) {
          if (container.style.visibility !== "visible") {
            container.style.visibility = "visible";
            container.style.opacity = "1";
          }
          path.style.strokeDashoffset = `${pathLength * (1 - progress)}`;
        } else {
          if (container.style.visibility !== "hidden") {
            container.style.visibility = "hidden";
            container.style.opacity = "0";
          }
          path.style.strokeDashoffset = `${pathLength}`;
        }
      },
      onLeaveBack: () => {
        container.style.visibility = "hidden";
        container.style.opacity = "0";
      },
      onToggle: (self) => {
        // Culling: completely hide container when out of trigger area
        if (!self.isActive && self.progress === 0) {
          container.style.visibility = "hidden";
          container.style.opacity = "0";
        }
      }
    });

    // Refresh ScrollTrigger to calculate exact section geometry
    ScrollTrigger.refresh();

    return () => {
      st.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="svg-works-background"
      style={{ visibility: "hidden", opacity: 0 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1000 1000"
        fill="none"
        overflow="visible"
        xmlns="http://www.w3.org/2000/svg"
        className="svg-works-line"
        preserveAspectRatio="none"
        shapeRendering="geometricPrecision"
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
