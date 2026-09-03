/**
 * spatialHero.js
 * Multi-scene 3D Spatial Scenes / Spatial Wallpaper parallax engine.
 * Supports:
 * - Both Hero section (#home) and About section (#about) with independent scene observation.
 * - Multi-axis translation (X, Y, Z) with stereoscopic depth separation.
 * - Subtle 3D perspective tilt (rotateX, rotateY) following cursor/device tilt.
 * - Desktop mousemove tracking + Mobile Gyroscope (DeviceOrientation) support.
 * - Hardware-accelerated CSS 3D transforms with buttery-smooth LERP damping and auto-sleep.
 */

export function initSpatialHero() {
    // Respect reduced motion accessibility preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const scenes = document.querySelectorAll('.spatial-scene');
    if (!scenes.length) return;

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

    // Detect mobile / touch screens
    const isMobileDevice = window.innerWidth <= 768 || window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    // Movement & tilt constants calibrated for viewport size
    const MAX_TRAVEL_X = isMobileDevice ? 20 : 85;   // Subtle on mobile (20px) vs expressive on desktop (85px)
    const MAX_TRAVEL_Y = isMobileDevice ? 12 : 55;   // Prevents vertical overlap / clashing with navbar on mobile
    const MAX_TILT_DEG = isMobileDevice ? 1.0 : 3.8;  // Minimal tilt on mobile to preserve clean layout
    const LERP_FACTOR = 0.095; // Butter-smooth damping

    let targetNormalizedX = 0;
    let targetNormalizedY = 0;
    let isRunning = false;
    let rafId = null;

    function hasVisibleScenes() {
        return sceneDataList.some(s => s.isInViewport);
    }

    // Smooth render loop with auto-sleep when movement settles
    function updateFrame() {
        let isMoving = false;

        for (let s = 0; s < sceneDataList.length; s++) {
            const scene = sceneDataList[s];
            if (!scene.isInViewport) continue;

            const layerData = scene.layerData;
            for (let i = 0; i < layerData.length; i++) {
                const item = layerData[i];
                const isLanyardLayer = item.element.classList.contains('spatial-layer--fg');

                item.targetX = targetNormalizedX * MAX_TRAVEL_X * item.depth;

                // On mobile, lock lanyard Y translation so the strap anchor stays pinned off-screen top
                if (isMobileDevice && isLanyardLayer) {
                    item.targetY = 0;
                } else {
                    item.targetY = targetNormalizedY * MAX_TRAVEL_Y * item.depth;
                }

                // Perspective tilt: on mobile, do not rotate lanyard on X axis (which tilts strap down)
                if (item.depth > 0) {
                    if (isMobileDevice && isLanyardLayer) {
                        item.targetRotX = 0;
                        item.targetRotY = targetNormalizedX * MAX_TILT_DEG * 0.5;
                    } else {
                        item.targetRotX = -targetNormalizedY * MAX_TILT_DEG * item.depth * item.tiltFactor;
                        item.targetRotY = targetNormalizedX * MAX_TILT_DEG * item.depth * item.tiltFactor;
                    }
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
        if (!isRunning && hasVisibleScenes()) {
            isRunning = true;
            rafId = requestAnimationFrame(updateFrame);
        }
    }

    // --- Desktop: Mouse movement handler ---
    function onMouseMove(e) {
        if (!hasVisibleScenes()) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        targetNormalizedX = Math.max(-1, Math.min(1, ((e.clientX - width / 2) / (width / 2))));
        targetNormalizedY = Math.max(-1, Math.min(1, ((e.clientY - height / 2) / (height / 2))));

        startLoop();
    }

    function onMouseLeave() {
        targetNormalizedX = 0;
        targetNormalizedY = 0;
        startLoop();
    }

    // --- Mobile: DeviceOrientation (Gyroscope) handler ---
    const BASE_BETA = 45;
    const MAX_TILT_GAMMA = 20;
    const MAX_TILT_BETA = 20;

    function onDeviceOrientation(e) {
        if (!hasVisibleScenes()) return;
        if (e.gamma === null || e.beta === null) return;

        const clampedGamma = Math.max(-MAX_TILT_GAMMA, Math.min(MAX_TILT_GAMMA, e.gamma));
        const clampedBeta = Math.max(-MAX_TILT_BETA, Math.min(MAX_TILT_BETA, e.beta - BASE_BETA));

        targetNormalizedX = clampedGamma / MAX_TILT_GAMMA;
        targetNormalizedY = clampedBeta / MAX_TILT_BETA;

        startLoop();
    }

    function initGyroscope() {
        if (typeof window === 'undefined' || typeof window.DeviceOrientationEvent === 'undefined') return;

        // iOS 13+ requires user interaction to request DeviceOrientation permission
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            const handleFirstGesture = () => {
                DeviceOrientationEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
                        }
                    })
                    .catch(console.error);

                window.removeEventListener('touchstart', handleFirstGesture);
                window.removeEventListener('click', handleFirstGesture);
            };

            window.addEventListener('touchstart', handleFirstGesture, { passive: true });
            window.addEventListener('click', handleFirstGesture, { passive: true });
        } else {
            // Android & modern mobile browsers (HTTPS)
            window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
        }
    }

    // Detect touch device to switch between mouse and gyroscope
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    if (!isTouchDevice) {
        window.addEventListener('mousemove', onMouseMove, { passive: true });
        document.addEventListener('mouseleave', onMouseLeave, { passive: true });
    } else {
        initGyroscope();
    }

    // IntersectionObserver to observe each scene container or its sticky wrapper
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const match = sceneDataList.find(s => {
                const wrapper = s.sceneElement.closest('.about-wrapper');
                return entry.target === (wrapper || s.sceneElement);
            });

            if (match) {
                match.isInViewport = entry.isIntersecting;
                if (entry.isIntersecting) {
                    startLoop();
                }
            }
        });
    }, { threshold: 0.05 });

    sceneDataList.forEach(scene => {
        const wrapper = scene.sceneElement.closest('.about-wrapper');
        observer.observe(wrapper || scene.sceneElement);
    });

    if (hasVisibleScenes()) {
        startLoop();
    }
}
