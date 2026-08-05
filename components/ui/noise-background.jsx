import React from 'react';
import './noise-background.css';

export function NoiseBackground({
  children,
  containerClassName = '',
  gradientColors = [
    'rgb(255, 100, 150)',
    'rgb(100, 150, 255)',
    'rgb(255, 200, 100)',
  ],
  noiseOpacity = 0.3,
  speed = 6,
}) {
  const gradientString = gradientColors.join(', ');

  return (
    <div className={`noise-bg-container ${containerClassName}`}>
      {/* Animated gradient ring background */}
      <div
        className="noise-bg-gradient"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, ${gradientString})`,
          animationDuration: `${speed}s`,
        }}
      />

      {/* SVG noise texture overlay */}
      <svg className="noise-bg-svg" aria-hidden="true">
        <filter id="noiseFilterBg">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilterBg)" opacity={noiseOpacity} />
      </svg>

      {/* Inner Children Content */}
      <div className="noise-bg-content">
        {children}
      </div>
    </div>
  );
}

export default NoiseBackground;
