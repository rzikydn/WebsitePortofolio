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

    // Detect mobile / touch screens with high reliability
    const isMobileDevice = 
        window.innerWidth <= 768 || 
        ('ontouchstart' in window) || 
        (navigator.maxTouchPoints > 0) || 
        window.matchMedia('(pointer: coarse)').matches;

    // Movement & tilt constants calibrated for viewport size
    // Desktop has wide cursor travel; mobile has responsive gyroscope tilt travel
    const MAX_TRAVEL_X = isMobileDevice ? 45 : 125;   // Noticeable, tangible travel on mobile phone tilt
    const MAX_TRAVEL_Y = isMobileDevice ? 32 : 80;    // Fluid vertical responsiveness on tilt
    const MAX_TILT_DEG = isMobileDevice ? 6.2 : 7.2;  // Pronounced, tactile 3D perspective tilt
    const LERP_FACTOR = 0.085; // Butter-smooth damping

    let targetNormalizedX = 0;
    let targetNormalizedY = 0;
    let isRunning = false;
    let rafId = null;
    let gyroscopeActive = false;

    function hasVisibleScenes() {
        return sceneDataList.some(s => {
            if (s.isInViewport) return true;
            const wrapper = s.sceneElement.closest('.about-wrapper') || s.sceneElement;
            const rect = wrapper.getBoundingClientRect();
            return (rect.bottom > -100 && rect.top < window.innerHeight + 100);
        });
    }

    // Smooth render loop with auto-sleep when movement settles
    function updateFrame() {
        let isMoving = false;

        for (let s = 0; s < sceneDataList.length; s++) {
            const scene = sceneDataList[s];
            const wrapper = scene.sceneElement.closest('.about-wrapper') || scene.sceneElement;
            const rect = wrapper.getBoundingClientRect();
            const inView = scene.isInViewport || (rect.bottom > -100 && rect.top < window.innerHeight + 100);
            if (!inView) continue;

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
        // If gyroscope is actively sending sensor updates, lock out mouse events
        if (gyroscopeActive) return;
        // On mobile devices, ignore mouse events completely so finger/scroll touch gestures do not hijack parallax
        if (isMobileDevice) return;
        // Extra safety against simulated mouse events generated from touch
        if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
        if (e.pointerType === 'touch') return;

        if (!hasVisibleScenes()) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        targetNormalizedX = Math.max(-1, Math.min(1, ((e.clientX - width / 2) / (width / 2))));
        targetNormalizedY = Math.max(-1, Math.min(1, ((e.clientY - height / 2) / (height / 2))));

        startLoop();
    }

    function onMouseLeave() {
        if (gyroscopeActive || isMobileDevice) return;
        targetNormalizedX = 0;
        targetNormalizedY = 0;
        startLoop();
    }

    // --- Mobile: DeviceOrientation (Gyroscope) handler ---
    let calibratedBeta = null;
    let calibratedGamma = null;
    const SENSITIVITY_RANGE_GAMMA = 22; // Degrees of tilt from center for max X parallax
    const SENSITIVITY_RANGE_BETA = 22;  // Degrees of tilt from center for max Y parallax

    function onDeviceOrientation(e) {
        if (e.gamma === null || e.beta === null) return;

        // Flag gyroscope as actively delivering sensor hardware data
        gyroscopeActive = true;

        if (!hasVisibleScenes()) return;

        // Account for screen rotation (portrait vs landscape)
        const orientationAngle = (window.screen?.orientation?.angle) ?? window.orientation ?? 0;
        let rawGamma = e.gamma;
        let rawBeta = e.beta;

        if (orientationAngle === 90) {
            rawGamma = e.beta;
            rawBeta = -e.gamma;
        } else if (orientationAngle === -90 || orientationAngle === 270) {
            rawGamma = -e.beta;
            rawBeta = e.gamma;
        } else if (orientationAngle === 180) {
            rawGamma = -e.gamma;
            rawBeta = -e.beta;
        }

        // Dynamic auto-calibration for natural hand-holding angle:
        // Establish natural holding angle on first read, and gently adapt over time
        if (calibratedBeta === null) {
            calibratedBeta = Math.max(20, Math.min(70, rawBeta));
            calibratedGamma = Math.max(-20, Math.min(20, rawGamma));
        } else {
            // Continuous smooth recentering (0.25% per event) prevents getting stuck if user changes posture
            calibratedBeta += (Math.max(15, Math.min(75, rawBeta)) - calibratedBeta) * 0.0025;
            calibratedGamma += (Math.max(-25, Math.min(25, rawGamma)) - calibratedGamma) * 0.0025;
        }

        const deltaGamma = rawGamma - calibratedGamma;
        const deltaBeta = rawBeta - calibratedBeta;

        targetNormalizedX = Math.max(-1, Math.min(1, deltaGamma / SENSITIVITY_RANGE_GAMMA));
        targetNormalizedY = Math.max(-1, Math.min(1, deltaBeta / SENSITIVITY_RANGE_BETA));

        startLoop();
    }

    function bindOrientationEvents() {
        window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
        window.addEventListener('deviceorientationabsolute', onDeviceOrientation, { passive: true });
    }

    function showIOSPermissionPill(onRequest) {
        if (sessionStorage.getItem('spatial_gyro_granted') === 'true') {
            return;
        }

        if (document.getElementById('spatial-gyro-pill')) return;

        const pill = document.createElement('button');
        pill.id = 'spatial-gyro-pill';
        pill.className = 'spatial-gyro-pill';
        pill.setAttribute('aria-label', 'Aktifkan Efek 3D Gyroscope');
        pill.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"></path>
            </svg>
            <span>Aktifkan 3D Gyroscope</span>
        `;

        pill.addEventListener('click', (e) => {
            e.stopPropagation();
            onRequest();
        });

        document.body.appendChild(pill);
    }

    function cleanupPermissionUI() {
        sessionStorage.setItem('spatial_gyro_granted', 'true');
        const pill = document.getElementById('spatial-gyro-pill');
        if (pill) {
            pill.classList.add('spatial-gyro-pill--hide');
            setTimeout(() => pill.remove(), 400);
        }
    }

    function initGyroscope() {
        if (typeof window === 'undefined') return;

        // iOS 13+ requires explicit user gesture permission
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            const checkAndRequest = () => {
                DeviceOrientationEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            bindOrientationEvents();
                            cleanupPermissionUI();
                        }
                    })
                    .catch(err => {
                        console.warn('Gyroscope permission request:', err);
                    });
            };

            // Attempt on first direct user gesture (touchend or click)
            const onUserGesture = () => {
                checkAndRequest();
            };

            window.addEventListener('touchend', onUserGesture, { passive: true });
            window.addEventListener('click', onUserGesture, { passive: true });

            // Display floating badge on iOS to guarantee user can activate with a single tap
            showIOSPermissionPill(checkAndRequest);
        } else {
            // Android & all modern standards-compliant mobile browsers (HTTPS)
            bindOrientationEvents();
        }
    }

    // Always register desktop mouse tracking (safely ignored on mobile and when gyro is active)
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave, { passive: true });

    // Always initialize mobile gyroscope support
    initGyroscope();

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
    }, { threshold: [0, 0.05] });

    sceneDataList.forEach(scene => {
        const wrapper = scene.sceneElement.closest('.about-wrapper');
        observer.observe(wrapper || scene.sceneElement);
    });

    if (hasVisibleScenes()) {
        startLoop();
    }
}
