import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
    smoothWheel: true,
    syncTouch: false,
});

// High-Performance cached ScrollSpy to avoid DOM querying and layout thrashing on every frame
let cachedSections = [];

function cacheSectionPositions() {
    const navItems = document.querySelectorAll('.floating-navbar a[href^="#"]');
    if (!navItems.length) return;
    
    cachedSections = Array.from(navItems).map(item => {
        const target = document.querySelector(item.getAttribute('href'));
        if (target) {
            return {
                id: item.getAttribute('href'),
                element: target,
                top: target.offsetTop,
                height: target.offsetHeight,
                navLink: item
            };
        }
        return null;
    }).filter(Boolean);
}

// Perform caching at optimal times to guarantee accurate measurements
window.addEventListener('load', cacheSectionPositions);
window.addEventListener('resize', cacheSectionPositions);
document.addEventListener('DOMContentLoaded', cacheSectionPositions);
// Multiple timeouts to capture delayed dynamic layout renders
setTimeout(cacheSectionPositions, 500);
setTimeout(cacheSectionPositions, 1500);
setTimeout(cacheSectionPositions, 3000);

// Dynamic active navbar link on scroll (ScrollSpy) — with dirty flag to skip redundant DOM updates
let lastActiveId = "";

lenis.on('scroll', () => {
    ScrollTrigger.update();
    
    if (cachedSections.length === 0) {
        cacheSectionPositions();
        if (cachedSections.length === 0) return;
    }
    
    let currentActive = "";
    const scrollPos = window.scrollY + window.innerHeight / 3;
    
    for (let i = 0; i < cachedSections.length; i++) {
        const section = cachedSections[i];
        if (scrollPos >= section.top && scrollPos < section.top + section.height) {
            currentActive = section.id;
        }
    }
    
    // Skip DOM mutations if active section hasn't changed (biggest perf win)
    if (currentActive && currentActive !== lastActiveId) {
        lastActiveId = currentActive;
        for (let i = 0; i < cachedSections.length; i++) {
            const section = cachedSections[i];
            if (section.id === currentActive) {
                if (!section.navLink.classList.contains('active')) {
                    section.navLink.classList.add('active');
                }
            } else {
                if (section.navLink.classList.contains('active')) {
                    section.navLink.classList.remove('active');
                }
            }
        }
    }
});

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

function init() {
    const preloaderContent = document.querySelector(".preloader-content");
    const preloaderWrap = document.querySelector(".preloader-wrap");
    
    let finished = false;
    let assetsReady = false;
    let minTimeReached = false;
    
    // Listen for signal from main.jsx that all React components are ready
    window.addEventListener('assets-ready', () => {
        assetsReady = true;
        tryFinish();
    });
    
    // Minimum 3.5s so greetings cycle at least once
    setTimeout(() => {
        minTimeReached = true;
        tryFinish();
    }, 3500);
    
    // Fallback: finish preloader after max 8 seconds even if assets-ready never fires
    setTimeout(() => {
        finishPreloader();
    }, 8000);
    
    function tryFinish() {
        if (assetsReady && minTimeReached) {
            finishPreloader();
        }
    }
    
    function finishPreloader() {
        if (finished) return;
        finished = true;
        
        // 1. Instantly complete progress bar to 100%
        if (typeof window.completePreloaderProgress === 'function') {
            window.completePreloaderProgress();
        }
        
        // 2. Fade out the text & progress bar
        if (preloaderContent) {
            preloaderContent.classList.add("fade-out");
        }
        
        // 3. Slide up the background after text fades out
        setTimeout(() => {
            preloaderWrap.classList.add("slide-up");
            
            // Allow scrolling on the main body
            document.body.style.overflow = "auto";
            
            // 4. Drop the lanyard after preloader clears and page is quiet
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('lanyard-drop'));
            }, 200);
            
            // 5. Remove preloader from DOM after transition completes (1.4s)
            setTimeout(() => {
                preloaderWrap.style.display = "none";
            }, 1400);
            
        }, 400); // Wait 400ms for text fade-out
    }

    // --- Dark Mode Toggle Logic ---
    const themeToggleBtn = document.querySelector('.theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('i');

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');

        // Switch between moon and sun icon
        if (document.body.classList.contains('dark-mode')) {
            themeIcon.classList.remove('ph-moon-stars');
            themeIcon.classList.add('ph-sun');
        } else {
            themeIcon.classList.remove('ph-sun');
            themeIcon.classList.add('ph-moon-stars');
        }
    });
}

// Module scripts are deferred — DOM may already be loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Smooth scroll navigation using Lenis for all anchor links starting with "#"
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (!targetId || targetId === '#') return;
        
        try {
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                // Update active state instantly on click for navbar items
                document.querySelectorAll('.floating-navbar a[href^="#"]').forEach(item => item.classList.remove('active'));
                const matchingNavLink = document.querySelector(`.floating-navbar a[href="${targetId}"]`);
                if (matchingNavLink) {
                    matchingNavLink.classList.add('active');
                }
                
                lenis.scrollTo(target, {
                    duration: 2,
                    easing: (t) => 1 - Math.pow(1 - t, 4), // easeOutQuart
                });
            }
        } catch (err) {
            console.error('Error in smooth scroll selector:', err);
        }
    });
});
