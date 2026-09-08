'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { annotate } from 'rough-notation';

export function Highlighter({
  children,
  action = 'highlight',
  color = '#ffd1dc',
  strokeWidth = 1.5,
  animationDuration = 600,
  iterations = 2,
  padding = 2,
  multiline = true,
}) {
  const elementRef = useRef(null);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Disable highlights/annotations completely on mobile screens
    if (window.matchMedia('(max-width: 768px)').matches) {
      return;
    }

    let annotation = null;
    let resizeObserver = null;
    let isShown = false;

    const annotationConfig = {
      type: action,
      color,
      strokeWidth,
      animationDuration,
      iterations,
      padding,
      multiline,
    };

    annotation = annotate(element, annotationConfig);

    let checkRaf = null;

    const checkVisibility = () => {
      const wordEl = element.querySelector('.word') || element;
      // Read opacity directly from inline style set by GSAP to avoid expensive window.getComputedStyle() layout thrashing
      const inlineOpacity = wordEl.style ? wordEl.style.opacity : "";
      const computedOpacity = inlineOpacity !== "" ? parseFloat(inlineOpacity) : 1;

      if (computedOpacity >= 0.6) {
        if (!isShown) {
          isShown = true;
          annotation.show();
          const svgEl = element.querySelector('.rough-annotation-svg');
          if (svgEl) {
            svgEl.style.transition = 'opacity 0.3s ease';
            svgEl.style.opacity = '1';
          }
        }
      } else {
        if (isShown) {
          isShown = false;
          const svgEl = element.querySelector('.rough-annotation-svg');
          if (svgEl) {
            svgEl.style.opacity = '0';
          }
          annotation.hide();
        }
      }
    };

    const scheduleCheck = () => {
      if (checkRaf) return;
      checkRaf = requestAnimationFrame(() => {
        checkVisibility();
        checkRaf = null;
      });
    };

    // Initially check and hide if unrevealed
    checkVisibility();

    const mutationObserver = new MutationObserver(() => {
      scheduleCheck();
    });

    const words = element.querySelectorAll('.word');
    if (words.length > 0) {
      words.forEach((w) => {
        mutationObserver.observe(w, { attributes: true, attributeFilter: ['style', 'class'] });
      });
    } else {
      mutationObserver.observe(element, { attributes: true, attributeFilter: ['style', 'class'] });
    }

    window.addEventListener('scroll', scheduleCheck, { passive: true });

    resizeObserver = new ResizeObserver(() => {
      if (isShown) {
        annotation.hide();
        annotation.show();
      }
    });
    resizeObserver.observe(element);

    return () => {
      if (checkRaf) cancelAnimationFrame(checkRaf);
      mutationObserver.disconnect();
      window.removeEventListener('scroll', scheduleCheck);
      if (resizeObserver) resizeObserver.disconnect();
      annotation?.remove();
    };
  }, [
    action,
    color,
    strokeWidth,
    animationDuration,
    iterations,
    padding,
    multiline,
  ]);

  return (
    <span ref={elementRef} className="relative inline bg-transparent">
      {children}
    </span>
  );
}

export default Highlighter;
