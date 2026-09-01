import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./SvgFollowScroll.css";

gsap.registerPlugin(ScrollTrigger);

const SvgFollowScroll = () => {
  const containerRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    const path = pathRef.current;
    const container = containerRef.current;
    if (!path || !container) return;

    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = `${pathLength}`;
    path.style.strokeDashoffset = `${pathLength}`;

    const st = ScrollTrigger.create({
      start: 0,
      end: () => window.innerHeight * 3.1,
      scrub: true,
      onUpdate: (self) => {
        const y = self.scroll();
        const vh = window.innerHeight;
        const startReveal = vh;
        const endReveal = vh * 3.1;

        if (y <= 30) {
          container.style.opacity = "0";
          container.style.visibility = "hidden";
          path.style.strokeDashoffset = `${pathLength}`;
          return;
        }

        container.style.visibility = "visible";
        container.style.opacity = "1";

        let progress = 0;
        if (y < startReveal) {
          progress = (y / startReveal) * 0.56;
        } else if (y < endReveal) {
          const pct = (y - startReveal) / (endReveal - startReveal);
          progress = 0.56 + pct * 0.44;
        } else {
          progress = 1;
        }

        path.style.strokeDashoffset = `${pathLength * (1 - Math.min(1, Math.max(0, progress)))}`;
      },
      onLeaveBack: () => {
        container.style.opacity = "0";
        container.style.visibility = "hidden";
      }
    });

    ScrollTrigger.refresh();

    return () => {
      st.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="svg-scroll-background"
      style={{
        opacity: 0,
        visibility: "hidden",
        transition: "opacity 0.3s ease",
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1000 1500"
        fill="none"
        overflow="visible"
        xmlns="http://www.w3.org/2000/svg"
        className="svg-scroll-line"
        preserveAspectRatio="none"
        shapeRendering="auto"
        style={{ width: "100%", height: "100%" }}
      >
        <path
          ref={pathRef}
          d="M 352 320 C 282 320, 102 330, 82 400 C 62 480, 500 480, 500 620 C 500 740, 850 740, 850 900 C 850 1040, 150 1040, 150 1200 C 150 1340, 600 1340, 500 1500"
          stroke="#C2F84F"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default SvgFollowScroll;
