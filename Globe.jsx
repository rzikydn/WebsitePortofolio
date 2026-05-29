import React, { useEffect, useRef, useState } from "react"
import createGlobe from "cobe"
import { useMotionValue, useSpring } from "framer-motion"

const MOVEMENT_DAMPING = 1400

export function Globe({ className }) {
  const canvasRef = useRef(null)
  const phiRef = useRef(0)
  const widthRef = useRef(0)
  const pointerInteracting = useRef(null)
  const pointerInteractionMovement = useRef(0)
  const globeInstanceRef = useRef(null)

  // Track Dark Mode dynamically
  const [isDark, setIsDark] = useState(document.body.classList.contains("dark-mode"))

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.body.classList.contains("dark-mode"))
    })
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  const r = useMotionValue(0)
  const rs = useSpring(r, {
    mass: 1,
    damping: 30,
    stiffness: 100,
  })

  const updatePointerInteraction = (value) => {
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab"
    }
  }

  const updateMovement = (clientX) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      r.set(r.get() + delta / MOVEMENT_DAMPING)
    }
  }

  useEffect(() => {
    const onResize = () => {
      if (canvasRef.current) {
        widthRef.current = canvasRef.current.offsetWidth
      }
    }

    window.addEventListener("resize", onResize)
    onResize()

    // Config with high-fidelity markers including Jakarta, Indonesia
    const config = {
      devicePixelRatio: 2,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      phi: 0,
      theta: 0.3,
      dark: isDark ? 1 : 0,
      diffuse: 1.5,
      mapSamples: 16000,
      mapBrightness: isDark ? 6.0 : 1.2,
      baseColor: isDark ? [15 / 255, 23 / 255, 42 / 255] : [1, 1, 1], // slate-900 vs white
      markerColor: [59 / 255, 130 / 255, 246 / 255], // glowing blue accent
      glowColor: isDark ? [30 / 255, 41 / 255, 59 / 255] : [219 / 255, 234 / 255, 254 / 255],
      markers: [
        { location: [-6.2088, 106.8456], size: 0.1 }, // Jakarta, Indonesia (Wildan's Location)
        { location: [14.5995, 120.9842], size: 0.05 }, // Manila
        { location: [35.6762, 139.6503], size: 0.05 }, // Tokyo
        { location: [40.7128, -74.0060], size: 0.06 }, // New York
        { location: [51.5074, -0.1278], size: 0.06 }, // London
        { location: [-33.8688, 151.2093], size: 0.05 }, // Sydney
      ],
    }

    const globe = createGlobe(canvasRef.current, {
      ...config,
      onRender: (state) => {
        if (!pointerInteracting.current) phiRef.current += 0.004
        state.phi = phiRef.current + rs.get()
        state.width = widthRef.current * 2
        state.height = widthRef.current * 2
      },
    })

    globeInstanceRef.current = globe
    setTimeout(() => {
      if (canvasRef.current) canvasRef.current.style.opacity = "1"
    }, 0)

    return () => {
      globe.destroy()
      window.removeEventListener("resize", onResize)
    }
  }, [rs, isDark])

  return (
    <div
      className={`relative mx-auto aspect-square w-full max-w-[450px] overflow-hidden ${className || ""}`}
      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <canvas
        ref={canvasRef}
        className="opacity-0 transition-opacity duration-500 contain-[layout_paint_size]"
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          aspectRatio: "1",
          cursor: "grab",
        }}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX
          updatePointerInteraction(e.clientX)
        }}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  )
}
