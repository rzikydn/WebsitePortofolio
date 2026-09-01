import React, { useEffect, useRef } from "react";

const CrowdCanvas = ({ src = "/images/peeps/all-peeps.webp", rows = 15, cols = 7, onLoaded }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let loadedFired = false;
    const fireLoaded = () => {
      if (loadedFired) return;
      loadedFired = true;
      if (onLoaded) onLoaded();
    };

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const config = { src, rows, cols };

    // UTILS
    const randomRange = (min, max) => min + Math.random() * (max - min);
    const randomIndex = (array) => randomRange(0, array.length) | 0;
    const removeFromArray = (array, i) => array.splice(i, 1)[0];
    const removeItemFromArray = (array, item) => removeFromArray(array, array.indexOf(item));
    const removeRandomFromArray = (array) => removeFromArray(array, randomIndex(array));

    const isMobile = window.innerWidth <= 768;
    const scaleFactor = isMobile ? 0.55 : 0.88;
    const targetFps = isMobile ? 35 : 60;
    const frameInterval = 1000 / targetFps;

    // FACTORY FUNCTIONS
    const createPeep = ({ image, rect }) => {
      const peep = {
        image,
        rect: [],
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        anchorY: 0,
        scaleX: 1,
        speed: 40,
        direction: 1,
        bounceSpeed: 18,
        bounceHeight: 8,
        bouncePhase: 0,
        setRect: (rect) => {
          peep.rect = rect;
          peep.width = rect[2] * scaleFactor;
          peep.height = rect[3] * scaleFactor;
        },
        render: (ctx) => {
          ctx.save();
          ctx.translate(peep.x, peep.y);
          ctx.scale(peep.scaleX, 1);
          ctx.drawImage(
            peep.image,
            peep.rect[0],
            peep.rect[1],
            peep.rect[2],
            peep.rect[3],
            0,
            0,
            peep.width,
            peep.height
          );
          ctx.restore();
        },
      };

      peep.setRect(rect);
      return peep;
    };

    const resetPeep = (peep, stage, randomizeInitialX = false) => {
      const direction = Math.random() > 0.5 ? 1 : -1;
      const offsetY = randomRange(-20, 40);
      const startY = stage.height - peep.height + offsetY;

      peep.direction = direction;
      peep.scaleX = direction;
      // Realistic walking speed: traverses screen in ~8-14 seconds
      const baseDuration = randomRange(8, 14);
      peep.speed = (stage.width + peep.width * 2) / baseDuration;
      peep.bounceSpeed = randomRange(14, 22); // footstep bounce frequency
      peep.bounceHeight = randomRange(4, 8);
      peep.bouncePhase = randomRange(0, Math.PI * 2);
      peep.anchorY = startY;
      peep.y = startY;

      if (randomizeInitialX) {
        // Spread across screen initially
        peep.x = randomRange(0, stage.width);
      } else {
        peep.x = direction === 1 ? -peep.width * 1.2 : stage.width + peep.width * 0.2;
      }
    };

    const img = document.createElement("img");
    const stage = { width: 0, height: 0 };
    let lastWidth = 0;

    const allPeeps = [];
    const availablePeeps = [];
    const crowd = [];

    const createPeeps = () => {
      const { rows, cols } = config;
      const { naturalWidth: width, naturalHeight: height } = img;
      const total = rows * cols;
      const rectWidth = width / rows;
      const rectHeight = height / cols;

      for (let i = 0; i < total; i++) {
        allPeeps.push(
          createPeep({
            image: img,
            rect: [
              (i % rows) * rectWidth,
              ((i / rows) | 0) * rectHeight,
              rectWidth,
              rectHeight,
            ],
          })
        );
      }
    };

    const initCrowd = () => {
      const maxActivePeeps = isMobile ? 6 : 42;
      const count = Math.min(availablePeeps.length, maxActivePeeps);

      for (let i = 0; i < count; i++) {
        if (availablePeeps.length === 0) break;
        const peep = removeRandomFromArray(availablePeeps);
        resetPeep(peep, stage, true);
        crowd.push(peep);
      }
      crowd.sort((a, b) => a.anchorY - b.anchorY);
    };

    let cachedMaskGradient = null;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.save();
      ctx.scale(dpr, dpr);

      for (let i = 0; i < crowd.length; i++) {
        crowd[i].render(ctx);
      }

      ctx.restore();

      if (cachedMaskGradient) {
        ctx.save();
        ctx.globalCompositeOperation = "destination-in";
        ctx.fillStyle = cachedMaskGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
    };

    let rafId = null;
    let lastTime = 0;
    let isCanvasVisible = true;

    const tick = (timestamp) => {
      if (!isCanvasVisible || document.visibilityState === "hidden") {
        rafId = null;
        return;
      }

      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;

      if (elapsed >= frameInterval) {
        // Cap dt to prevent huge jumps if tab was unfocused
        const dt = Math.min(elapsed / 1000, 0.1);
        lastTime = timestamp - (elapsed % frameInterval);

        // Update peep positions (ultra-lightweight coordinate math, 0 GSAP overhead)
        for (let i = 0; i < crowd.length; i++) {
          const peep = crowd[i];
          peep.x += peep.direction * peep.speed * dt;
          peep.bouncePhase += peep.bounceSpeed * dt;
          peep.y = peep.anchorY - Math.abs(Math.sin(peep.bouncePhase)) * peep.bounceHeight;

          // Check if peep has left the viewport boundaries
          const outRight = peep.direction === 1 && peep.x > stage.width + peep.width * 0.5;
          const outLeft = peep.direction === -1 && peep.x < -peep.width * 1.5;

          if (outRight || outLeft) {
            removeItemFromArray(crowd, peep);
            availablePeeps.push(peep);

            // Spawn next peep from pool
            if (availablePeeps.length > 0) {
              const newPeep = removeRandomFromArray(availablePeeps);
              resetPeep(newPeep, stage, false);
              crowd.push(newPeep);
            }
          }
        }

        render();
      }

      rafId = requestAnimationFrame(tick);
    };

    const startAnimation = () => {
      if (!rafId && isCanvasVisible) {
        lastTime = 0;
        rafId = requestAnimationFrame(tick);
      }
    };

    const stopAnimation = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const resize = (currentWidth, currentHeight) => {
      if (!canvas) return;
      if (!currentWidth || !currentHeight) {
        currentWidth = canvas.clientWidth;
        currentHeight = canvas.clientHeight;
      }
      if (!currentWidth || !currentHeight) return;

      // Ignore height-only resizes (caused by mobile URL bar show/hide)
      if (currentWidth === lastWidth) return;

      lastWidth = currentWidth;
      stage.width = currentWidth;
      stage.height = currentHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = currentWidth * dpr;
      canvas.height = currentHeight * dpr;

      cachedMaskGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      cachedMaskGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      cachedMaskGradient.addColorStop(0.35, "rgba(0, 0, 0, 1)");
      cachedMaskGradient.addColorStop(1, "rgba(0, 0, 0, 1)");

      crowd.length = 0;
      availablePeeps.length = 0;
      availablePeeps.push(...allPeeps);

      initCrowd();
      render();
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        resize(width, height);
      }
    });

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isCanvasVisible = entry.isIntersecting;
        if (isCanvasVisible) {
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      { threshold: 0.01 }
    );

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isCanvasVisible) {
        startAnimation();
      } else {
        stopAnimation();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    let initialized = false;
    const init = () => {
      if (initialized) return;
      if (!img.naturalWidth || !img.naturalHeight) return;
      initialized = true;
      createPeeps();
      resize();
      resizeObserver.observe(canvas);
      visibilityObserver.observe(canvas);
      fireLoaded();
      startAnimation();
    };

    img.onload = init;
    img.src = config.src;
    if (img.complete && img.naturalWidth > 0) {
      init();
    }

    return () => {
      stopAnimation();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, [src, rows, cols]);

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: isMobile ? "45vh" : "55vh",
        pointerEvents: "none",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          transform: "translate3d(0, 0, 0)",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      />
    </div>
  );
};

export default CrowdCanvas;
