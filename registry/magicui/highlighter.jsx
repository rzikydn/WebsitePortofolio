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

    const checkVisibility = () => {
      const wordEl = element.querySelector('.word') || element;
      const computedOpacity = parseFloat(window.getComputedStyle(wordEl).opacity);

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

    // Initially check and hide if unrevealed
    checkVisibility();

    const mutationObserver = new MutationObserver(() => {
      checkVisibility();
    });

    const words = element.querySelectorAll('.word');
    if (words.length > 0) {
      words.forEach((w) => {
        mutationObserver.observe(w, { attributes: true, attributeFilter: ['style', 'class'] });
      });
    } else {
      mutationObserver.observe(element, { attributes: true, attributeFilter: ['style', 'class'] });
    }

    window.addEventListener('scroll', checkVisibility, { passive: true });

    resizeObserver = new ResizeObserver(() => {
      if (isShown) {
        annotation.hide();
        annotation.show();
      }
    });
    resizeObserver.observe(element);

    return () => {
      mutationObserver.disconnect();
      window.removeEventListener('scroll', checkVisibility);
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
    <span ref={elementRef} className="relative inline-block bg-transparent">
      {children}
    </span>
  );
}

export default Highlighter;
