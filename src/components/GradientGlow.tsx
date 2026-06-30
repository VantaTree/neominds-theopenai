import React from "react";

export interface GradientGlowProps {
  /** The first color of the gradient aura (Red/Pink by default) */
  color1?: string;
  /** The second color of the gradient aura (Orange by default) */
  color2?: string;
  /** The third color of the gradient aura (Purple/Blue by default) */
  color3?: string;
  /** The size of the circle (e.g. '1000px', 1000) */
  size?: string | number;
  /** The minimum size of the circle (e.g. '500px', 500) */
  minSize?: string | number;
  /** The blur amount for the glowing background (e.g. '100px', 100) */
  blur?: string | number;
  /** The spin animation duration (e.g. '20s', 20000) */
  speed?: string | number;
  /** The inset spacing of the aura relative to the center circle */
  inset?: string | number;
  /** The background color of the inner circle (if shown) */
  centerColor?: string;
  /** Whether to mask out the center of the aura to make it hollow (default: true) */
  maskCenter?: boolean;
  /** The size of the hollow cutout in the center (default: '38%') */
  maskSize?: string | number;
  /** Opacity of the glow aura background (default: 0.15 for background blending) */
  glowOpacity?: number | string;
  /** Whether to show the solid center circle (default: true if relative, false if absolute) */
  showCenter?: boolean;
  /** CSS positioning: 'absolute' (default) or 'relative' */
  position?: "absolute" | "relative" | "fixed" | "sticky";
  /** Z-index value (default: 0) */
  zIndex?: number;
  /** Pointer events control (default: 'none' for background use) */
  pointerEvents?: "auto" | "none";
  /** Children elements to place inside the center circle */
  children?: React.ReactNode;
  /** Custom class name for the wrapper container */
  className?: string;
  /** Custom class name for the inner content container */
  contentClassName?: string;
  /** Custom style overrides for the wrapper container */
  style?: React.CSSProperties;
}

export default function GradientGlow({
  color1 = "#ff5e62",
  color2 = "#ff9966",
  color3 = "#8a2be2",
  size,
  minSize,
  blur,
  speed,
  inset,
  centerColor = "transparent", // Defaults to transparent to support hollow look
  maskCenter = true,
  maskSize = "38%",
  glowOpacity,
  showCenter,
  position = "absolute",
  zIndex = 0,
  pointerEvents = "none",
  children,
  className = "",
  contentClassName = "",
  style = {},
}: GradientGlowProps) {
  // Determine adaptive defaults based on the position strategy
  const isAbsolute = position === "absolute";

  const finalSize =
    size !== undefined ? size : isAbsolute ? "1000px" : undefined;
  const finalMinSize = minSize !== undefined ? minSize : undefined;
  const finalBlur = blur !== undefined ? blur : isAbsolute ? "100px" : "40px";
  const finalSpeed = speed !== undefined ? speed : isAbsolute ? "20s" : "15s";
  const finalInset = inset !== undefined ? inset : isAbsolute ? "-12%" : "-3%";
  const finalGlowOpacity =
    glowOpacity !== undefined ? glowOpacity : isAbsolute ? 0.15 : 0.8;
  const finalShowCenter = showCenter !== undefined ? showCenter : !isAbsolute;

  // Normalize dimension and time variables
  const formattedSize =
    finalSize !== undefined
      ? typeof finalSize === "number"
        ? `${finalSize}px`
        : finalSize
      : undefined;
  const formattedMinSize =
    finalMinSize !== undefined
      ? typeof finalMinSize === "number"
        ? `${finalMinSize}px`
        : finalMinSize
      : undefined;
  const formattedBlur =
    typeof finalBlur === "number" ? `${finalBlur}px` : finalBlur;
  const formattedSpeed =
    typeof finalSpeed === "number" ? `${finalSpeed}ms` : finalSpeed;
  const formattedInset =
    typeof finalInset === "number" ? `${finalInset}px` : finalInset;
  const formattedMaskSize =
    typeof maskSize === "number" ? `${maskSize}%` : maskSize;

  // Custom properties for styling the elements
  const cssVariables = {
    "--color-1": color1,
    "--color-2": color2,
    "--color-3": color3,
    "--glow-blur": formattedBlur,
    "--spin-speed": formattedSpeed,
    "--glow-inset": formattedInset,
    "--center-color": centerColor,
    "--glow-opacity": String(finalGlowOpacity),
    "--mask-size": formattedMaskSize,
  } as React.CSSProperties;

  if (formattedSize) {
    (cssVariables as any)["--circle-size"] = formattedSize;
  }

  // Build root wrapper styles
  const wrapperStyle: React.CSSProperties = {
    ...cssVariables,
    position,
    zIndex,
    pointerEvents,
    flexShrink: 0, // Prevents layout squeezing
    ...(formattedSize
      ? { width: "var(--circle-size)", height: "var(--circle-size)" }
      : {}),
    ...(formattedMinSize
      ? { minWidth: formattedMinSize, minHeight: formattedMinSize }
      : {}),
    ...style,
  };

  // If absolute, apply horizontal centering defaults similar to mymind-bg-glow
  if (isAbsolute) {
    // wrapperStyle.left = style.left !== undefined ? style.left : "50%";
    // wrapperStyle.top = style.top !== undefined ? style.top : "-12%";
    wrapperStyle.transform =
      style.transform !== undefined ? style.transform : "translateX(-50%)";
    wrapperStyle.maxWidth =
      style.maxWidth !== undefined ? style.maxWidth : "150vw";
  }

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={wrapperStyle}
    >
      {/* Injecting spin animation keyframes scoped to this component */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes gradient-glow-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `,
        }}
      />

      {/* The Aura (Animated background) */}
      <div
        className="absolute rounded-full"
        style={{
          inset: "var(--glow-inset)",
          opacity: "var(--glow-opacity)",
          zIndex: 1,
          maskImage: maskCenter
            ? "radial-gradient(circle, transparent var(--mask-size), black var(--mask-size))"
            : "none",
          WebkitMaskImage: maskCenter
            ? "radial-gradient(circle, transparent var(--mask-size), black var(--mask-size))"
            : "none",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            top: "calc(-1 * var(--glow-inset))",
            left: "calc(-1 * var(--glow-inset))",
            right: "calc(-1 * var(--glow-inset))",
            bottom: "calc(-1 * var(--glow-inset))",
            background:
              "conic-gradient(var(--color-1), var(--color-2), var(--color-3), var(--color-1))",
            filter: "blur(var(--glow-blur))",
            animation: "gradient-glow-spin var(--spin-speed) linear infinite",
          }}
        />
      </div>

      {/* The Solid Center (optional) */}
      {finalShowCenter ? (
        <div
          className={`relative w-full h-full rounded-full flex flex-col items-center justify-center overflow-hidden ${contentClassName}`}
          style={{
            backgroundColor: "var(--center-color)",
            zIndex: 2,
          }}
        >
          {children}
        </div>
      ) : (
        // If not showing center, just render children on top of the aura
        children && (
          <div
            className={`relative w-full h-full flex flex-col items-center justify-center z-10 ${contentClassName}`}
          >
            {children}
          </div>
        )
      )}
    </div>
  );
}
