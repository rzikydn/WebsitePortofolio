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
    if (!path) return;

    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = `${pathLength}`;
    path.style.strokeDashoffset = `${pathLength}`;

    // Native GSAP fromTo tween with 1:1 scrub and dynamic trigger calculation
    const tween = gsap.fromTo(
      path,
      { strokeDashoffset: pathLength },
      {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".about-wrapper",
          start: "top bottom",
          end: () => {
            const wrapper = document.querySelector(".about-wrapper");
            return `+=${wrapper ? wrapper.offsetHeight * 0.75 : window.innerHeight * 3.5}`;
          },
          scrub: true,
          invalidateOnRefresh: true,
        },
      }
    );

    ScrollTrigger.refresh();

    return () => {
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
      tween.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="svg-scroll-background"
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
