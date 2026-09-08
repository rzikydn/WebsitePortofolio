/**
 * spatialHero.js
 * 3D Spatial Scenes / Spatial Wallpaper parallax engine.
 * 
 * Behavior:
 * - Desktop: Full 3D Spatial Wallpaper parallax following mouse cursor (Hero & About sections).
 *   Stereoscopic Z-depth translation and subtle perspective tilt with smooth LERP damping.
 * - Mobile: Pure scroll only. Spatial 3D parallax, gyroscope sensors, and layer shifts are completely
 *   disabled to ensure native, seamless, lightweight scrolling without layout shifts.
 */

export function initSpatialHero() {
    // Respect reduced motion accessibility preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const scenes = document.querySelectorAll('.spatial-scene');
    if (!scenes.length) return;

    // Remove any leftover gyroscope permission pill if previously present
    const leftoverPill = document.getElementById('spatial-gyro-pill');
    if (leftoverPill) leftoverPill.remove();

    // Helper: Determine if device/viewport is desktop with mouse cursor
    function isDesktopViewport() {
        const isSmallScreen = window.innerWidth <= 768;
        const isTouchOnly = window.matchMedia('(pointer: coarse) and (hover: none)').matches;
        return !isSmallScreen && !isTouchOnly;
    }

    // Build scene models
    const sceneDataList = [];

    scenes.forEach(sceneEl => {
        const layers = sceneEl.querySelectorAll('.spatial-layer[data-depth]');
        if (!layers.length) return;

        const layerData = Array.from(layers).map(layer => {
            const depth = parseFloat(layer.getAttribute('data-depth')) || 0.2;
            let zPlane = 0;
            const customZ = layer.getAttribute('data-z-plane');
            if (customZ !== null && !isNaN(parseFloat(customZ))) {
                zPlane = parseFloat(customZ);
            } else if (depth < 0) {
                zPlane = -45; // Background recedes into screen
            } else if (depth > 0.75) {
                zPlane = 40;  // Foreground floats forward
            } else {
                zPlane = 14;  // Midground sits in the middle
            }

            const tiltFactor = parseFloat(layer.getAttribute('data-tilt')) || 1.0;

            return {
                element: layer,
                depth: depth,
                zPlane: zPlane,
                tiltFactor: tiltFactor,
                currentX: 0,
                currentY: 0,
                currentRotX: 0,
                currentRotY: 0,
                targetX: 0,
                targetY: 0,
                targetRotX: 0,
                targetRotY: 0,
            };
        });

        const wrapper = sceneEl.closest('.about-wrapper') || sceneEl;
        const rect = wrapper.getBoundingClientRect();
        const initiallyInView = (rect.bottom > 0 && rect.top < window.innerHeight);

        sceneDataList.push({
            sceneElement: sceneEl,
            layerData: layerData,
            isInViewport: initiallyInView,
        });
    });

    if (!sceneDataList.length) return;

    // Reset all layer transforms to ensure clean, static CSS layout (used on mobile / resize)
    function resetAllLayers() {
        sceneDataList.forEach(scene => {
            scene.layerData.forEach(item => {
                item.currentX = 0;
                item.currentY = 0;
                item.currentRotX = 0;
                item.currentRotY = 0;
                item.targetX = 0;
                item.targetY = 0;
                item.targetRotX = 0;
                item.targetRotY = 0;
                item.element.style.transform = '';
            });
        });
    }

    // Movement & tilt constants calibrated for desktop mouse tracking
    const MAX_TRAVEL_X = 125;   // Max horizontal travel (px)
    const MAX_TRAVEL_Y = 80;    // Max vertical travel (px)
    const MAX_TILT_DEG = 7.2;   // Subtle 3D perspective tilt (deg)
    const LERP_FACTOR = 0.085;  // Butter-smooth damping

    let targetNormalizedX = 0;
    let targetNormalizedY = 0;
    let isRunning = false;
    let rafId = null;

    function hasVisibleScenes() {
        return sceneDataList.some(s => s.isInViewport);
    }

    // Smooth render loop for desktop
    function updateFrame() {
        if (!isDesktopViewport()) {
            resetAllLayers();
            isRunning = false;
            rafId = null;
            return;
        }

        let isMoving = false;

        for (let s = 0; s < sceneDataList.length; s++) {
            const scene = sceneDataList[s];
            if (!scene.isInViewport) continue;

            const layerData = scene.layerData;
            for (let i = 0; i < layerData.length; i++) {
                const item = layerData[i];

                item.targetX = targetNormalizedX * MAX_TRAVEL_X * item.depth;
                item.targetY = targetNormalizedY * MAX_TRAVEL_Y * item.depth;

                if (item.depth > 0) {
                    item.targetRotX = -targetNormalizedY * MAX_TILT_DEG * item.depth * item.tiltFactor;
                    item.targetRotY = targetNormalizedX * MAX_TILT_DEG * item.depth * item.tiltFactor;
                } else {
                    item.targetRotX = 0;
                    item.targetRotY = 0;
                }

                // Interpolate towards target (LERP)
                const dx = item.targetX - item.currentX;
                const dy = item.targetY - item.currentY;
                const drotX = item.targetRotX - item.currentRotX;
                const drotY = item.targetRotY - item.currentRotY;

                if (Math.abs(dx) > 0.02 || Math.abs(dy) > 0.02 || Math.abs(drotX) > 0.01 || Math.abs(drotY) > 0.01) {
                    item.currentX += dx * LERP_FACTOR;
                    item.currentY += dy * LERP_FACTOR;
                    item.currentRotX += drotX * LERP_FACTOR;
                    item.currentRotY += drotY * LERP_FACTOR;
                    isMoving = true;
                } else {
                    item.currentX = item.targetX;
                    item.currentY = item.targetY;
                    item.currentRotX = item.targetRotX;
                    item.currentRotY = item.targetRotY;
                }

                // Apply hardware-accelerated 3D transform
                if (item.depth < 0) {
                    item.element.style.transform = `translate3d(${item.currentX.toFixed(2)}px, ${item.currentY.toFixed(2)}px, ${item.zPlane}px)`;
                } else {
                    item.element.style.transform = `translate3d(${item.currentX.toFixed(2)}px, ${item.currentY.toFixed(2)}px, ${item.zPlane}px) rotateX(${item.currentRotX.toFixed(2)}deg) rotateY(${item.currentRotY.toFixed(2)}deg)`;
                }
            }
        }

        if (isMoving && hasVisibleScenes()) {
            rafId = requestAnimationFrame(updateFrame);
        } else {
            isRunning = false;
            rafId = null;
        }
    }

    function startLoop() {
        if (!isDesktopViewport()) return;
        if (!isRunning && hasVisibleScenes()) {
            isRunning = true;
            rafId = requestAnimationFrame(updateFrame);
        }
    }

    // --- Desktop: Mouse movement handler ---
    function onMouseMove(e) {
        if (!isDesktopViewport()) return;
        // Ignore touch-emulated pointer events
        if (e.pointerType === 'touch' || (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents)) return;
        if (!hasVisibleScenes()) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        targetNormalizedX = Math.max(-1, Math.min(1, ((e.clientX - width / 2) / (width / 2))));
        targetNormalizedY = Math.max(-1, Math.min(1, ((e.clientY - height / 2) / (height / 2))));

        startLoop();
    }

    function onMouseLeave() {
        if (!isDesktopViewport()) return;
        targetNormalizedX = 0;
        targetNormalizedY = 0;
        startLoop();
    }

    // --- Handle window resize between Desktop and Mobile ---
    let resizeTimer = null;
    function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (!isDesktopViewport()) {
                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
                isRunning = false;
                targetNormalizedX = 0;
                targetNormalizedY = 0;
                resetAllLayers();
            } else {
                if (hasVisibleScenes()) {
                    startLoop();
                }
            }
        }, 150);
    }

    // Desktop events
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    // IntersectionObserver to observe each scene container or its sticky wrapper
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const match = sceneDataList.find(s => {
                const wrapper = s.sceneElement.closest('.about-wrapper');
                return entry.target === (wrapper || s.sceneElement);
            });

            if (match) {
                match.isInViewport = entry.isIntersecting;
                if (entry.isIntersecting && isDesktopViewport()) {
                    startLoop();
                }
            }
        });
    }, { threshold: [0, 0.05] });

    sceneDataList.forEach(scene => {
        const wrapper = scene.sceneElement.closest('.about-wrapper');
        observer.observe(wrapper || scene.sceneElement);
    });

    // Initial activation check
    if (!isDesktopViewport()) {
        resetAllLayers();
    } else if (hasVisibleScenes()) {
        startLoop();
    }
}
