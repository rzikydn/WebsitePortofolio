import { gsap } from "gsap";
import React, { useEffect, useRef } from "react";

const CrowdCanvas = ({ src = "/images/peeps/all-peeps.png", rows = 15, cols = 7 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const config = {
      src,
      rows,
      cols,
    };

    // UTILS
    const randomRange = (min, max) => min + Math.random() * (max - min);
    const randomIndex = (array) => randomRange(0, array.length) | 0;
    const removeFromArray = (array, i) => array.splice(i, 1)[0];
    const removeItemFromArray = (array, item) => removeFromArray(array, array.indexOf(item));
    const removeRandomFromArray = (array) => removeFromArray(array, randomIndex(array));
    const getRandomFromArray = (array) => array[randomIndex(array) | 0];

    // TWEEN FACTORIES
    const resetPeep = ({ stage, peep }) => {
      const direction = Math.random() > 0.5 ? 1 : -1;
      const offsetY = randomRange(-20, 40);
      const startY = stage.height - peep.height + offsetY;
      let startX;
      let endX;

      if (direction === 1) {
        startX = -peep.width;
        endX = stage.width;
        peep.scaleX = 1;
      } else {
        startX = stage.width + peep.width;
        endX = 0;
        peep.scaleX = -1;
      }

      peep.x = startX;
      peep.y = startY;
      peep.anchorY = startY;

      return {
        startX,
        startY,
        endX,
      };
    };

    const normalWalk = ({ peep, props }) => {
      const { startX, startY, endX } = props;
      const xDuration = 10;
      const yDuration = 0.25;

      const tl = gsap.timeline();
      tl.timeScale(randomRange(0.5, 1.5));
      tl.to(
        peep,
        {
          duration: xDuration,
          x: endX,
          ease: "none",
        },
        0,
      );
      tl.to(
        peep,
        {
          duration: yDuration,
          repeat: xDuration / yDuration,
          yoyo: true,
          y: startY - 10,
        },
        0,
      );

      return tl;
    };

    const walks = [normalWalk];

    const scaleFactor = 0.32;

    // FACTORY FUNCTIONS
    const createPeep = ({ image, rect }) => {
      const peep = {
        image,
        rect: [],
        width: 0,
        height: 0,
        drawArgs: [],
        x: 0,
        y: 0,
        anchorY: 0,
        scaleX: 1,
        walk: null,
        setRect: (rect) => {
          peep.rect = rect;
          peep.width = rect[2] * scaleFactor;
          peep.height = rect[3] * scaleFactor;
          peep.drawArgs = [peep.image, ...rect, 0, 0, peep.width, peep.height];
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
            peep.height,
          );
          ctx.restore();
        },
      };

      peep.setRect(rect);
      return peep;
    };

    // MAIN
    const img = document.createElement("img");
    const stage = {
      width: 0,
      height: 0,
    };

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
          }),
        );
      }
    };

    const initCrowd = () => {
      const isMobile = window.innerWidth <= 768;
      const maxActivePeeps = isMobile ? 18 : 85;
      const count = Math.min(availablePeeps.length, maxActivePeeps);

      for (let i = 0; i < count; i++) {
        const peep = addPeepToCrowd();
        if (peep && peep.walk) {
          peep.walk.progress(Math.random());
        }
      }
    };

    const addPeepToCrowd = () => {
      if (availablePeeps.length === 0) return;
      const peep = removeRandomFromArray(availablePeeps);
      const walk = getRandomFromArray(walks)({
        peep,
        props: resetPeep({
          peep,
          stage,
        }),
      }).eventCallback("onComplete", () => {
        removePeepFromCrowd(peep);
        addPeepToCrowd();
      });

      peep.walk = walk;

      crowd.push(peep);
      crowd.sort((a, b) => a.anchorY - b.anchorY);

      return peep;
    };

    const removePeepFromCrowd = (peep) => {
      removeItemFromArray(crowd, peep);
      availablePeeps.push(peep);
    };

    const render = () => {
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(devicePixelRatio, devicePixelRatio);

      crowd.forEach((peep) => {
        peep.render(ctx);
      });

      // Apply linear gradient fade-out mask to bottom of crowd
      const fadeHeight = stage.height * 0.45;
      const gradient = ctx.createLinearGradient(0, stage.height - fadeHeight, 0, stage.height);
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 1)");

      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = gradient;
      ctx.fillRect(0, stage.height - fadeHeight, stage.width, fadeHeight);

      ctx.restore();
    };

    const resize = (currentWidth, currentHeight) => {
      if (!canvas) return;
      if (!currentWidth || !currentHeight) {
        currentWidth = canvas.clientWidth;
        currentHeight = canvas.clientHeight;
      }
      if (!currentWidth || !currentHeight) return;

      // Ignore height-only resizes (caused by mobile URL bar show/hide) to prevent canvas reset and flickering
      if (currentWidth === lastWidth) {
        return;
      }

      lastWidth = currentWidth;
      stage.width = currentWidth;
      stage.height = currentHeight;
      canvas.width = currentWidth * devicePixelRatio;
      canvas.height = currentHeight * devicePixelRatio;

      crowd.forEach((peep) => {
        if (peep.walk) peep.walk.kill();
      });

      crowd.length = 0;
      availablePeeps.length = 0;
      availablePeeps.push(...allPeeps);

      initCrowd();
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        resize(width, height);
      }
    });

    let inViewport = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewport = entry.isIntersecting;
        if (inViewport) {
          crowd.forEach(peep => {
            if (peep.walk) peep.walk.resume();
          });
          gsap.ticker.add(render);
        } else {
          crowd.forEach(peep => {
            if (peep.walk) peep.walk.pause();
          });
          gsap.ticker.remove(render);
        }
      },
      { threshold: 0.01 }
    );

    const init = () => {
      createPeeps();
      resize();
      resizeObserver.observe(canvas);
      io.observe(canvas);
    };

    img.onload = init;
    img.src = config.src;

    return () => {
      resizeObserver.disconnect();
      io.disconnect();
      gsap.ticker.remove(render);
      crowd.forEach((peep) => {
        if (peep.walk) peep.walk.kill();
      });
    };
  }, [src, rows, cols]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "45vh",
        pointerEvents: "none",
        zIndex: 1,
        transform: "translate3d(0, 0, 0)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    />
  );
};

export default CrowdCanvas;
