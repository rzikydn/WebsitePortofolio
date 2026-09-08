import React, { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './ScrollReveal.css';

gsap.registerPlugin(ScrollTrigger);

const processChildren = (children, keyPrefix = 'sr') => {
  return React.Children.map(children, (child, childIndex) => {
    if (typeof child === 'string') {
      return child.split(/(\s+)/).map((word, wordIndex) => {
        if (word.match(/^\s+$/)) return word;
        return (
          <span className="word" key={`${keyPrefix}-${childIndex}-${wordIndex}`}>
            {word}
          </span>
        );
      });
    }

    if (React.isValidElement(child)) {
      return React.cloneElement(
        child,
        {
          key: `${keyPrefix}-${childIndex}`,
          ...child.props,
        },
        processChildren(child.props.children, `${keyPrefix}-${childIndex}`)
      );
    }

    return child;
  });
};

const ScrollReveal = ({
  children,
  slide1,
  slide2,
  baseOpacity = 0.1,
  containerClassName = '',
  textClassName = '',
}) => {
  const containerRef = useRef(null);
  const slide1Ref = useRef(null);
  const slide2Ref = useRef(null);

  const content1 = slide1 || children;
  const content2 = slide2;

  const splitText1 = useMemo(() => {
    return content1 ? processChildren(content1, 'sr-s1') : null;
  }, [content1]);

  const splitText2 = useMemo(() => {
    return content2 ? processChildren(content2, 'sr-s2') : null;
  }, [content2]);

  useEffect(() => {
    const container = containerRef.current;
    const s1 = slide1Ref.current;
    const s2 = slide2Ref.current;
    if (!container || !s1) return;

    const words1 = s1.querySelectorAll('.word');
    const words2 = s2 ? s2.querySelectorAll('.word') : [];

    // Fallback if only single slide is provided
    if (!s2 || words2.length === 0) {
      const st = gsap.fromTo(
        words1,
        { opacity: baseOpacity },
        {
          ease: 'none',
          opacity: 1,
          stagger: 0.05,
          force3D: true,
          scrollTrigger: {
            trigger: '.about-wrapper',
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            fastScrollEnd: true,
            invalidateOnRefresh: true,
          },
        }
      );
      return () => {
        if (st.scrollTrigger) st.scrollTrigger.kill();
        st.kill();
      };
    }

    // Helper to compute travel distance so slide fully exits beyond the screen edge (pinggir layar)
    const getTravelDistance = (slideEl) => {
      const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const slideW = (slideEl && slideEl.offsetWidth) ? slideEl.offsetWidth : 800;
      return Math.round((screenW + slideW) / 2 + 100);
    };

    // MULTI-SLIDE CONTINUOUS HORIZONTAL TRANSITION & DUAL SCROLL REVEAL
    // Initial states: slide 1 centered (x: 0); slide 2 parked off-screen to the right
    gsap.set(s1, { x: 0, opacity: 1, force3D: true });
    gsap.set(s2, { x: () => getTravelDistance(s2), opacity: 0, force3D: true });
    gsap.set(words1, { opacity: baseOpacity, force3D: true });
    gsap.set(words2, { opacity: baseOpacity, force3D: true });

    // Single synchronized scrubbed timeline connected to .about-wrapper scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.about-wrapper',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    });

    // Timeline normalized scale (Total duration: 10.0 units)
    // -----------------------------------------------------------------
    // Phase 1: Slide 1 Scroll Reveal (0.0 -> 2.1)
    // Finishes all words quickly and cleanly
    tl.to(
      words1,
      {
        opacity: 1,
        stagger: {
          amount: 1.8,
        },
        ease: 'none',
        duration: 0.3,
      },
      0
    );

    // Phase 2: Settle / Reading buffer for Slide 1 (2.1 -> 3.2)
    // Slide 1 stays centered and fully visible for ~11% of scroll

    // Phase 3: Continuous Horizontal Slide (3.2 -> 4.6)
    // Slide 1 slides OUT from center all the way past the left screen edge (pinggir layar)
    // Slide 2 slides IN from beyond the right screen edge (pinggir layar) to center
    tl.to(
      s1,
      {
        x: () => -getTravelDistance(s1),
        opacity: 0,
        ease: 'power2.inOut',
        duration: 1.4,
      },
      3.2
    );

    tl.fromTo(
      s2,
      { x: () => getTravelDistance(s2), opacity: 0 },
      {
        x: 0,
        opacity: 1,
        ease: 'power2.inOut',
        duration: 1.4,
      },
      3.2
    );

    // Phase 4: Slide 2 Scroll Reveal (4.6 -> 6.7)
    // Finishes all 27 words by t = 6.7 (67% of total scroll)
    tl.to(
      words2,
      {
        opacity: 1,
        stagger: {
          amount: 1.8,
        },
        ease: 'none',
        duration: 0.3,
      },
      4.6
    );

    // Phase 5: Generous Settle / Reading buffer for Slide 2 (6.7 -> 10.0)
    // Slide 2 is 100% revealed, highlighted, and rock-solid in the center
    // for a full 33% of the scroll runway before My Works begins to scroll up!
    tl.set({}, {}, 10.0);

    return () => {
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
    };
  }, [baseOpacity, splitText1, splitText2]);

  return (
    <div ref={containerRef} className={`scroll-reveal-slider ${containerClassName}`}>
      {/* Slide 1 */}
      <div ref={slide1Ref} className="scroll-reveal-slide scroll-reveal-slide-1">
        <h2 className="scroll-reveal">
          <p className={`scroll-reveal-text ${textClassName}`}>{splitText1}</p>
        </h2>
      </div>

      {/* Slide 2 (if provided) */}
      {content2 ? (
        <div ref={slide2Ref} className="scroll-reveal-slide scroll-reveal-slide-2">
          <h2 className="scroll-reveal">
            <p className={`scroll-reveal-text ${textClassName}`}>{splitText2}</p>
          </h2>
        </div>
      ) : null}
    </div>
  );
};

export default ScrollReveal;
