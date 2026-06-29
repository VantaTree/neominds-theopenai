import { useEffect, useRef, useState } from "react";
import { conveyerItems } from "./conveyerData";

export default function FeatureConveyer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const trackRef = useRef<SVGPathElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progress = useRef(0);
  const lastScrollY = useRef(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Define SVG coordinate space path (400x650)
  const pathD =
    "M 200,30 C 380,30 380,150 200,150 C 20,150 20,270 200,270 C 380,270 380,390 200,390 C 20,390 20,510 200,510 C 380,510 380,630 200,630";

  useEffect(() => {
    if (typeof window !== "undefined") {
      lastScrollY.current = window.scrollY;
    }
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

      // 1. Slow automatic downwards rolling movement
      progress.current += 0.6;

      // 2. Animate the track dash offset to look like rolling tracks
      if (trackRef.current) {
        trackRef.current.style.strokeDashoffset = `${-progress.current}px`;
      }

      let visibleSvgHeight = 650;
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        if (containerWidth > 0) {
          visibleSvgHeight = 400 * (containerHeight / containerWidth);
        }
      }

      const spacing = totalLength / conveyerItems.length;

      // 3. Move each feature item capsule along the spline
      conveyerItems.forEach((_, index) => {
        const el = itemRefs.current[index];
        if (!el) return;

        // Loop the distance along the track
        const dist = (progress.current + index * spacing) % totalLength;
        const pt = path.getPointAtLength(dist);

        // Map coordinates to percentage of parent container dimensions
        const xPct = (pt.x / 400) * 100;
        const yPct = (pt.y / 650) * 100;

        // 3D perspective depth scale (items look larger as they come down the hill)
        // const scale = 0.55 + 0.45 * (pt.y / 650);
        const scale = 0.8;

        // Fade in near top (y < 80) and fade out near bottom (y > visibleSvgHeight - 50)
        let opacity = 1;
        if (pt.y < 80) {
          opacity = (pt.y - 30) / 50;
        } else if (pt.y > visibleSvgHeight - 50) {
          opacity = (visibleSvgHeight - pt.y) / 50;
        }
        opacity = Math.max(0, Math.min(1, opacity));

        el.style.left = `${xPct}%`;
        el.style.top = `${yPct}%`;
        el.style.transform = `translate(-50%, -100%) scale(${scale})`;
        el.style.opacity = `${opacity}`;
      });

      animationFrameId = requestAnimationFrame(updatePositions);
    };

    animationFrameId = requestAnimationFrame(updatePositions);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLoaded]);

  // Immersive Wheel Scroll takeover
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      progress.current += e.deltaY * 0.8;
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [isLoaded]);

  // Touch Swipe / Drag interaction (smooth takeover)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDragging = false;
    let startY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = e.clientY - startY;
      startY = e.clientY;
      progress.current -= deltaY * 1.5;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      isDragging = true;
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const deltaY = e.touches[0].clientY - startY;
      startY = e.touches[0].clientY;
      progress.current -= deltaY * 1.5;
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
    <div
      ref={containerRef}
      className="relative w-full aspect-400/650 select-none cursor-grab active:cursor-grabbing overflow-visible bg-transparent"
    >
      {/* Background Hill Spline Tracks */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        viewBox="0 0 400 650"
        fill="none"
      >
        {/* Winding track support pillars (3D scaffold look) */}
        {/* <line
          x1="335"
          y1="90"
          x2="335"
          y2="650"
          className="stroke-foreground/5"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <line
          x1="65"
          y1="210"
          x2="65"
          y2="650"
          className="stroke-foreground/5"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <line
          x1="335"
          y1="330"
          x2="335"
          y2="650"
          className="stroke-foreground/5"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        <line
          x1="65"
          y1="450"
          x2="65"
          y2="650"
          className="stroke-foreground/5"
          strokeWidth="1"
          strokeDasharray="3 3"
        /> */}

        {/* Hidden spline path used for coordinates */}
        <path ref={pathRef} d={pathD} fill="none" stroke="none" />

        {/* Thick conveyor outer belt */}
        <path
          d={pathD}
          fill="none"
          className="stroke-mm-orange/15"
          strokeWidth="32"
          strokeLinecap="round"
        />

        {/* Inner rolling link path */}
        <path
          ref={trackRef}
          d={pathD}
          fill="none"
          className="stroke-mm-orange/40"
          strokeWidth="2.5"
          strokeDasharray="8 8"
        />
      </svg>

      {/* Floating Traversed Pinpoint Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-visible">
        {conveyerItems.map((item, index) => {
          const Icon = item.Icon;
          return (
            <div
              key={item.id}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className="absolute flex flex-col items-center pointer-events-auto"
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -100%) scale(0.8)",
                opacity: 0,
              }}
            >
              {/* Label positioned over the top of the big icon */}
              <span className="text-[12px] font-extrabold uppercase tracking-wide text-mm-dark/80 bg-white/95 border border-mm-border px-2 py-0.5 rounded-md shadow-sm mb-1 z-10 whitespace-nowrap">
                {item.label}
              </span>

              {/* Pinpoint shape base */}
              <div className="relative w-16 h-16 bg-mm-orange rounded-t-full rounded-bl-full rotate-45 flex items-center justify-center shadow-md border border-white/20">
                {/* Icon unrotated */}
                <div className="-rotate-45 flex items-center justify-center text-white">
                  <Icon className="size-8" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
