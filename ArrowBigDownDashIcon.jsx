import React, { forwardRef, useCallback, useImperativeHandle, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

const DASH_VARIANTS = {
  normal: { translateY: 0 },
  animate: {
    translateY: [0, 2, 0],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
    },
  },
};

const ARROW_VARIANTS = {
  normal: { translateY: 0 },
  animate: {
    translateY: [0, 6, 0],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
    },
  },
};

const ArrowBigDownDashIcon = forwardRef(({ onMouseEnter, onMouseLeave, className, size = 32, ...props }, ref) => {
  const controls = useAnimation();
  const isControlledRef = useRef(false);

  useImperativeHandle(ref, () => {
    isControlledRef.current = true;
    return {
      startAnimation: () => controls.start("animate"),
      stopAnimation: () => controls.start("normal"),
    };
  });

  const handleMouseEnter = useCallback(
    (e) => {
      if (isControlledRef.current) {
        onMouseEnter?.(e);
      } else {
        controls.start("animate");
      }
    },
    [controls, onMouseEnter]
  );

  const handleMouseLeave = useCallback(
    (e) => {
      if (isControlledRef.current) {
        onMouseLeave?.(e);
      } else {
        controls.start("normal");
      }
    },
    [controls, onMouseLeave]
  );

  // Automatically start the bouncing animation for mobile looping
  useEffect(() => {
    controls.start("animate");
  }, [controls]);

  return (
    <div
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ display: "inline-flex", justifyContent: "center", alignItems: "center" }}
      {...props}
    >
      <svg
        fill="none"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        <motion.path animate={controls} d="M15 5H9" variants={DASH_VARIANTS} />
        <motion.path
          animate={controls}
          d="M15 9v3h4l-7 7-7-7h4V9z"
          variants={ARROW_VARIANTS}
        />
      </svg>
    </div>
  );
});

ArrowBigDownDashIcon.displayName = "ArrowBigDownDashIcon";

export { ArrowBigDownDashIcon };
export default ArrowBigDownDashIcon;
