import { useEffect, useRef, useState } from "react";
import { conveyerItems } from "./conveyerData";

interface FeatureConveyerProps {
  onActiveItemChange?: (index: number) => void;
}

export default function FeatureConveyer({
  onActiveItemChange,
}: FeatureConveyerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const trackRef = useRef<SVGPathElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progress = useRef(0);
  const lastActiveRef = useRef(-1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  // Path matching 800x300 viewBox layout:
  // Starts at top of right reel (600, 209), loops clockwise around right reel,
  // exits bottom-left and runs along bottom (y = 281) under the projector body,
  // enters Left Reel (200, 281) from bottom, loops clockwise around it, and terminates at top.
  const pathD =
    "M 600,209 C 500,209 460,170 400,170 C 340,170 300,209 200,209 C 164,209 164,281 200,281 C 300,281 500,281 600,281 C 636,281 636,209 600,209";

  // References to the spinning reel wheels
  const reelRef = useRef<SVGGElement>(null);
  const leftReelRef = useRef<SVGGElement>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    let animationFrameId: number;

    const updatePositions = () => {
      if (!pathRef.current) {
        animationFrameId = requestAnimationFrame(updatePositions);
        return;
      }

      const path = pathRef.current;
      let totalLength = 0;
      try {
        totalLength = path.getTotalLength();
      } catch (e) {
        // Fallback for load order
      }

      if (totalLength === 0) {
        animationFrameId = requestAnimationFrame(updatePositions);
        return;
      }

      // 1. Automatic downwards/forwards rolling movement (slowed down for premium feel)
      progress.current += 0.3;

      // 2. Animate the track dash offset
      if (trackRef.current) {
        trackRef.current.style.strokeDashoffset = `${progress.current}px`;
      }

      // Spin both reels clockwise in sync with progress
      if (reelRef.current) {
        reelRef.current.style.transform = `rotate(${-progress.current * 2}deg)`;
      }

      if (leftReelRef.current) {
        leftReelRef.current.style.transform = `rotate(${-progress.current * 2}deg)`;
      }

      const spacing = totalLength / conveyerItems.length;
      let closestIndex = 0;
      let minDistance = Infinity;

      // 3. Move each feature item pinpoint along the spline
      conveyerItems.forEach((_, index) => {
        const el = itemRefs.current[index];
        if (!el) return;

        // Loop the distance along the track
        const dist = (progress.current + index * spacing) % totalLength;
        const pt = path.getPointAtLength(dist);

        // Map coordinates to percentage of parent container dimensions (800x300)
        const xPct = (pt.x / 800) * 100;
        const yPct = (pt.y / 300) * 100;

        // Scale pinpoint: active pinpoint is slightly larger for a subtle, elegant zoom
        const isActive = index === activeIndexRef.current;
        const scale = isActive ? 0.9 : 0.75;

        // Fade in near start (reel) and fade out near end (projector entrance)
        let opacity = 1;
        if (dist < 50) {
          opacity = dist / 50;
        } else if (dist > totalLength - 40) {
          opacity = (totalLength - dist) / 40;
        }
        opacity = Math.max(0, Math.min(1, opacity));

        el.style.left = `${xPct}%`;
        el.style.top = `${yPct}%`;
        el.style.transform = `translate(-50%, -50%) scale(${scale})`;
        el.style.opacity = `${opacity}`;

        // Find which item is closest to the projector lens gate (centered at x = 400, top track y = 170)
        // We restrict pt.y < 220 to avoid selecting returning items on the bottom track
        const isNearGate = pt.x > 300 && pt.x < 500 && pt.y < 220;
        if (isNearGate) {
          const diff = Math.abs(pt.x - 400);
          if (diff < minDistance) {
            minDistance = diff;
            closestIndex = index;
          }
        }
      });

      // Call the callback when the active projected item changes
      if (closestIndex !== lastActiveRef.current) {
        lastActiveRef.current = closestIndex;
        activeIndexRef.current = closestIndex;
        setActiveIndex(closestIndex);
        onActiveItemChange?.(closestIndex);
      }

      animationFrameId = requestAnimationFrame(updatePositions);
    };

    animationFrameId = requestAnimationFrame(updatePositions);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLoaded, onActiveItemChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDragging = false;
    let startX = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.clientX;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      startX = e.clientX;
      progress.current -= deltaX * 1.5;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      isDragging = true;
      startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const deltaX = e.touches[0].clientX - startX;
      startX = e.touches[0].clientX;
      progress.current -= deltaX * 1.5;
    };

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleMouseUp);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleMouseUp);
    };
  }, [isLoaded]);

  return (
    <div className="w-full overflow-visible relative flex justify-center h-[300px]">
      <div
        ref={containerRef}
        className="select-none cursor-grab active:cursor-grabbing overflow-visible bg-transparent font-sans"
        style={{
          width: "800px",
          height: "300px",
          position: "absolute",
          left: "50%",
          top: 0,
          transform: "translate(-50%, 0)",
          transformOrigin: "top center",
          overflow: "visible",
        }}
      >
        {/* Background SVG path, film reel and projector structure */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          viewBox="0 0 800 300"
          fill="none"
          style={{ zIndex: 20 }}
        >
          <defs>
            <linearGradient
              id="lensBeamGradient"
              x1="0.5"
              y1="0.85"
              x2="0.5"
              y2="0.2"
            >
              <stop offset="0%" stopColor="#FFE926" stopOpacity="0.45" />
              <stop offset="35%" stopColor="#FFE926" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#FFE926" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Projected Light Beam Cone (with flicker/pulsing) */}
          {/* Shoots from lens (400, 150) straight up beyond the Y=0 boundary onto the screen */}
          <polygon
            points="400,148 400,152 720,-300 80,-300"
            fill="url(#lensBeamGradient)"
            style={{ mixBlendMode: "screen" }}
            className="animate-pulse duration-75"
          />

          {/* Projector Body Image rendered inside SVG for absolute locked-coordinate alignment */}
          <image
            href="/images/projector_no_wheels.png"
            x="295"
            y="75"
            width="210"
            height="210"
          />

          {/* 1. Right Film Supply Reel (Mounted on Projector Right Arm) */}
          <g ref={reelRef} style={{ transformOrigin: "600px 245px" }}>
            <circle
              cx="600"
              cy="245"
              r="36"
              fill="none"
              stroke="#24272D"
              strokeWidth="5"
            />
            <circle
              cx="600"
              cy="245"
              r="32"
              fill="none"
              stroke="#B29B7C"
              strokeWidth="1"
            />
            <circle cx="600" cy="245" r="10" fill="#24272D" />
            <circle cx="600" cy="245" r="3" fill="#B29B7C" />
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <circle
                key={angle}
                cx={600 + 20 * Math.cos((angle * Math.PI) / 180)}
                cy={245 + 20 * Math.sin((angle * Math.PI) / 180)}
                r="5"
                fill="white"
                stroke="#24272D"
                strokeWidth="1.2"
              />
            ))}
          </g>

          {/* 1b. Left Film Take-up Reel (Mounted on Projector Left Arm) */}
          <g ref={leftReelRef} style={{ transformOrigin: "200px 245px" }}>
            <circle
              cx="200"
              cy="245"
              r="36"
              fill="none"
              stroke="#24272D"
              strokeWidth="5"
            />
            <circle
              cx="200"
              cy="245"
              r="32"
              fill="none"
              stroke="#B29B7C"
              strokeWidth="1"
            />
            <circle cx="200" cy="245" r="10" fill="#24272D" />
            <circle cx="200" cy="245" r="3" fill="#B29B7C" />
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <circle
                key={angle}
                cx={200 + 20 * Math.cos((angle * Math.PI) / 180)}
                cy={245 + 20 * Math.sin((angle * Math.PI) / 180)}
                r="5"
                fill="white"
                stroke="#24272D"
                strokeWidth="1.2"
              />
            ))}
          </g>

          {/* Hidden spline path used for coordinates */}
          <path ref={pathRef} d={pathD} fill="none" stroke="none" />

          {/* Conveyor outer belt */}
          <path
            d={pathD}
            fill="none"
            className="stroke-mm-orange/10"
            strokeWidth="24"
            strokeLinecap="round"
          />

          {/* Inner rolling link path */}
          <path
            ref={trackRef}
            d={pathD}
            fill="none"
            className="stroke-mm-orange/40"
            strokeWidth="2"
            strokeDasharray="8 8"
          />
        </svg>

        {/* Floating Traversed Pinpoint Icons */}
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {conveyerItems.map((item, index) => {
            const Icon = item.Icon;
            const isActive = index === activeIndex;
            return (
              <div
                key={item.id}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className="absolute flex flex-col items-center pointer-events-auto transition-opacity duration-150"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%) scale(0.7)",
                  opacity: 0,
                }}
              >
                {/* Pinpoint shape base - Highlighting when active */}
                <div
                  className={`relative w-11 h-11 rounded-full flex items-center justify-center shadow-md border-2 transition-all duration-300 ${
                    isActive
                      ? "bg-white border-mm-orange text-mm-orange shadow-[0_0_15px_rgba(255,107,38,0.75)]"
                      : "bg-mm-orange border-white text-white"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
