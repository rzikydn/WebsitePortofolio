import React, { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export default function ConfettiSideCannons() {
  const hasFired = useRef(false);

  const triggerConfetti = () => {
    const end = Date.now() + 3 * 1000; // 3 seconds of cannons
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 3,
        angle: 60,
        spread: 60,
        startVelocity: 45,
        origin: { x: 0, y: 0.8 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 60,
        startVelocity: 45,
        origin: { x: 1, y: 0.8 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  };

  useEffect(() => {
    // 1. Automatic trigger on scroll into view (for both desktop and mobile)
    const handleIntersection = (entries) => {
      const [entry] = entries;

      if (entry.isIntersecting) {
        if (!hasFired.current) {
          triggerConfetti();
          hasFired.current = true;
        }
      }
    };

    const observerOptions = {
      root: null,
      threshold: 0.8, // Trigger when 80% of the "Get In Touch" button is fully visible in view
    };

    const target = document.querySelector(".contact-section .contact-btn--primary");
    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    if (target) {
      observer.observe(target);
    }

    // 2. Interactive tap/click trigger on the Memoji profile image
    const handleMemojiClick = () => {
      triggerConfetti();
    };

    const memojiContainer = document.querySelector(".contact-image");
    if (memojiContainer) {
      memojiContainer.addEventListener("click", handleMemojiClick);
      memojiContainer.style.cursor = "pointer"; // visual cue
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
      if (memojiContainer) {
        memojiContainer.removeEventListener("click", handleMemojiClick);
      }
    };
  }, []);

  return null; // Invisible behavior-only component
}
