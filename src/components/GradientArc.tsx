import React from 'react';

export interface GradientArcProps {
  /** The first color of the sunrise arc (Pastel Pistachio by default) */
  color1?: string;
  /** The second color of the sunrise arc (Pure Mint by default) */
  color2?: string;
  /** The third color of the sunrise arc (Soft Aqua by default) */
  color3?: string;
  /** Stroke width of the arcs (default: 50) */
  strokeWidth?: number | string;
  /** Blur intensity (standard deviation) (default: 35) */
  blur?: number;
  /** Float animation duration (e.g. '8s', 8000) */
  speed?: string | number;
  /** Maximum floating vertical offset (default: 20 for 20px) */
  floatOffset?: number | string;
  /** Opacity of the background arc (default: 1) */
  glowOpacity?: number | string;
  /** CSS positioning (default: 'absolute') */
  position?: 'absolute' | 'relative' | 'fixed' | 'sticky';
  /** Z-index value (default: 0) */
  zIndex?: number;
  /** Pointer events control (default: 'none') */
  pointerEvents?: 'auto' | 'none';
  /** Custom class name for the wrapper container */
  className?: string;
  /** Custom style overrides for the wrapper container */
  style?: React.CSSProperties;
  /** SVG viewBox (default: "0 0 1000 600") */
  viewBox?: string;
  /** Width of the SVG element (default: '100%') */
  width?: string | number;
  /** Height of the SVG element (default: '100%') */
  height?: string | number;
}

export default function GradientArc({
  color1 = '#e2f0cb',
  color2 = '#b5ead7',
  color3 = '#98d8d6',
  strokeWidth = 50,
  blur = 35,
  speed = '8s',
  floatOffset = 20,
  glowOpacity = 1,
  position = 'absolute',
  zIndex = 0,
  pointerEvents = 'none',
  className = '',
  style = {},
  viewBox = '0 0 1000 600',
  width = '100%',
  height = '100%',
}: GradientArcProps) {
  // Normalize animation variables
  const formattedSpeed = typeof speed === 'number' ? `${speed}ms` : speed;
  const formattedOffset = typeof floatOffset === 'number' ? `${floatOffset}px` : floatOffset;

  // Custom properties for styling the elements
  const cssVariables = {
    '--color-1': color1,
    '--color-2': color2,
    '--color-3': color3,
    '--arc-speed': formattedSpeed,
    '--arc-opacity': String(glowOpacity),
  } as React.CSSProperties;

  // Build root wrapper styles
  const wrapperStyle: React.CSSProperties = {
    ...cssVariables,
    position,
    zIndex,
    pointerEvents,
    width,
    height,
    opacity: 'var(--arc-opacity)',
    ...style,
  };

  // If absolute, apply horizontal centering defaults similar to GradientGlow
  if (position === 'absolute') {
    // wrapperStyle.left = style.left !== undefined ? style.left : '50%';
    // wrapperStyle.top = style.top !== undefined ? style.top : '0px';
    wrapperStyle.transform = style.transform !== undefined ? style.transform : 'translateX(-50%)';
  }

  // Create a unique filter ID to avoid conflicts if multiple arcs exist
  const filterId = React.useId().replace(/:/g, '');

  return (
    <div className={`flex items-center justify-center ${className}`} style={wrapperStyle}>
      {/* Injecting float keyframes locally so the component is completely self-contained */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-arc-animation-${filterId} {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(-${formattedOffset}) scale(1.02); }
        }
      `}} />

      <svg
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <filter id={`rainbow-blur-${filterId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={blur} />
          </filter>
        </defs>

        <g
          filter={`url(#rainbow-blur-${filterId})`}
          style={{
            animation: `float-arc-animation-${filterId} var(--arc-speed) ease-in-out infinite alternate`,
            transformOrigin: 'center',
          }}
        >
          <path
            d="M -100, 110 Q 500, 510 1100, 110"
            fill="none"
            stroke="var(--color-1)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          <path
            d="M -100, 150 Q 500, 550 1100, 150"
            fill="none"
            stroke="var(--color-2)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          <path
            d="M -100, 190 Q 500, 590 1100, 190"
            fill="none"
            stroke="var(--color-3)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}