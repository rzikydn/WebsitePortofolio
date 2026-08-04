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
  enableBlur = true,
  baseOpacity = 0.1,
  blurStrength = 4,
  containerClassName = '',
  textClassName = '',
  pinContainer = '.about-section',
}) => {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    return processChildren(children);
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const pinEl = pinContainer ? document.querySelector(pinContainer) : null;
    const wordElements = el.querySelectorAll('.word');

    const st = gsap.fromTo(
      wordElements,
      { opacity: baseOpacity },
      {
        ease: 'none',
        opacity: 1,
        stagger: 0.05,
        scrollTrigger: {
          trigger: '.about-wrapper',
          start: 'top top',
          end: () => {
            const wrapper = document.querySelector('.about-wrapper');
            // End animation at 80% of wrapper scroll distance
            return `+=${wrapper ? wrapper.offsetHeight * 0.6 : 1500}`;
          },
          scrub: true,
        }
      }
    );

    return () => {
      if (st && st.scrollTrigger) {
        st.scrollTrigger.kill();
      }
      st.kill();
    };
  }, [enableBlur, baseOpacity, blurStrength, pinContainer]);

  return (
    <h2 ref={containerRef} className={`scroll-reveal ${containerClassName}`}>
      <p className={`scroll-reveal-text ${textClassName}`}>{splitText}</p>
    </h2>
  );
};

export default ScrollReveal;
