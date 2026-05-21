import React, { useState, useEffect } from "react";

export function ProgressiveBlur({
  className = "",
  height = "30%",
  position = "bottom",
  blurLevels = [6, 20], // Optimized to just 2 efficient levels for maximum scrolling performance
}) {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getPositionStyle = () => {
    if (position === "top") return { top: 0, left: 0, right: 0 };
    if (position === "bottom") return { bottom: 0, left: 0, right: 0 };
    return { top: 0, bottom: 0, left: 0, right: 0 };
  };

  // Performance-optimized blur layers (only 2 layers on desktop, 1 on mobile)
  // This drastically cuts down GPU composite times and prevents scroll lag
  return (
    <div
      className={`gradient-blur ${className}`}
      style={{
        pointerEvents: "none",
        position: "absolute",
        left: 0,
        right: 0,
        zIndex: 10,
        height: position === "both" ? "100%" : height,
        ...getPositionStyle(),
      }}
    >
      {/* Light Blur Layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          backdropFilter: `blur(${blurLevels[0]}px)`,
          WebkitBackdropFilter: `blur(${blurLevels[0]}px)`,
          maskImage:
            position === "bottom"
              ? `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)`
              : `linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)`,
          WebkitMaskImage:
            position === "bottom"
              ? `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)`
              : `linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)`,
        }}
      />

      {/* Stronger Blur Layer (Desktop only) */}
      {!isMobile && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            backdropFilter: `blur(${blurLevels[1]}px)`,
            WebkitBackdropFilter: `blur(${blurLevels[1]}px)`,
            maskImage:
              position === "bottom"
                ? `linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 100%)`
                : `linear-gradient(to top, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 100%)`,
            WebkitMaskImage:
              position === "bottom"
                ? `linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 100%)`
                : `linear-gradient(to top, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 100%)`,
          }}
        />
      )}

      {/* Seamless Fade Layer to Theme Color */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          background: position === "bottom"
            ? `linear-gradient(to bottom, rgba(var(--blur-fade-color), 0) 0%, rgba(var(--blur-fade-color), 1) 100%)`
            : position === "top"
              ? `linear-gradient(to top, rgba(var(--blur-fade-color), 0) 0%, rgba(var(--blur-fade-color), 1) 100%)`
              : `transparent`,
          pointerEvents: "none"
        }}
      />
    </div>
  );
}
