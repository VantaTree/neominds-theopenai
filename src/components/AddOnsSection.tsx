import React, { useState, useEffect, useRef } from "react";
import { Camera, Sparkles, Handshake, Megaphone } from "lucide-react";

type Props = {};

interface AddOnItem {
  id: string;
  name: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}

interface AddOnCardProps {
  addon: AddOnItem;
  accent: { r: number; g: number; b: number };
}

// Circular "glass bubble" card component
function AddOnCard({ addon, accent }: AddOnCardProps) {
  const IconComponent = addon.Icon;

  return (
    <div
      style={{
        transform: "translate3d(-50%, -50%, 0) scale(0.65)",
        opacity: 0,
      }}
      className="absolute top-1/2 left-1/2 size-44 sm:size-58 md:size-72 rounded-full flex flex-col items-center justify-center p-5 text-center bg-white/25 border border-white/10 backdrop-blur-md shadow-[inset_0_15px_25px_rgba(255,255,255,0.05),0_15px_25px_rgba(0,0,0,0.12)] hover:border-mm-orange/40 hover:bg-white/35 transition-colors duration-500 group cursor-grab active:cursor-grabbing select-none will-change-transform"
    >
      {/* Glossy reflection layers */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.06),transparent_60%)] pointer-events-none" />
      <div
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 70% 70%, rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.08), transparent 70%)`,
        }}
      />

      <div className="space-y-3 relative z-10 flex flex-col items-center">
        {/* Glowing Icon Badge */}
        <div className="flex h-9 w-9 sm:h-11 sm:w-11 md:h-14 md:w-14 items-center justify-center rounded-full bg-mm-pink/10 text-mm-orange group-hover:bg-mm-pink/20 transition-colors duration-300 shadow-inner">
          <IconComponent className="h-4.5 w-4.5 sm:h-5.5 sm:w-5.5 md:h-6.5 md:w-6.5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" />
        </div>

        <h4 className="text-xs sm:text-sm md:text-lg font-extrabold text-mm-dark tracking-tight max-w-[85%]">
          {addon.name}
        </h4>

        <p className="text-[9px] sm:text-[10px] md:text-xs text-mm-dark/50 leading-normal max-w-[85%] mt-1">
          {addon.description}
        </p>
      </div>
    </div>
  );
}

export default function AddOnsSection({}: Props) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const cardsContainerRef = useRef<HTMLDivElement | null>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const isMouseOver = useRef(false);
  const [isVisible, setIsVisible] = useState(false);

  // Carousel angles & inertia states (using refs only to prevent React re-renders at 60fps)
  const baseAngleRef = useRef(0);
  const tiltRef = useRef(0);
  const tiltVelocityRef = useRef(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startAngle = useRef(0);
  const velocity = useRef(0);

  // Mymind style colors (mapped statically to fit the light gradient background)
  const colorsRef = useRef({
    accent: { r: 255, g: 89, b: 36 }, // #FF5924
    accent2: { r: 255, g: 125, b: 211 }, // #FF7DD3
    foreground: { r: 36, g: 39, b: 45 }, // #24272D
  });

  const addOns: AddOnItem[] = [
    {
      id: "shoot",
      name: "On-ground Shoot",
      description:
        "Professional photo and video coverage for content shoots, reels, and product launches.",
      Icon: Camera,
    },
    {
      id: "expo",
      name: "Expo & Events",
      description:
        "Offline business event promotion, booth branding layouts, and live coverage.",
      Icon: Sparkles,
    },
    {
      id: "collabs",
      name: "Collabs & PR",
      description:
        "Influencer marketing setup, joint partner campaigns, and guest posting opportunities.",
      Icon: Handshake,
    },
    {
      id: "ads",
      name: "Paid Ads Management",
      description:
        "End-to-end setup and optimization of targeted search, video, and display ad campaigns.",
      Icon: Megaphone,
    },
  ];

  // Intersection Observer to pause execution of loops when off-screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 },
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Carousel base angle increment & direct DOM updates loop
  useEffect(() => {
    if (!isVisible) return;
    let animId: number;
    let lastTime = performance.now();

    const update = () => {
      const now = performance.now();
      const dt = Math.min(3, (now - lastTime) / 16.667);
      lastTime = now;

      if (!isDragging.current) {
        if (Math.abs(velocity.current) > 0.0003) {
          baseAngleRef.current += velocity.current * dt;
          velocity.current *= Math.pow(0.95, dt);
        } else {
          baseAngleRef.current += 0.0075 * dt;
        }
        const k = 0.04;
        const damping = 0.88;
        const accel = -k * tiltRef.current;
        tiltVelocityRef.current += accel * dt;
        tiltVelocityRef.current *= Math.pow(damping, dt);
        tiltRef.current += tiltVelocityRef.current * dt;
      }

      // DIRECT HIGH-PERFORMANCE DOM MANIPULATION
      const container = cardsContainerRef.current;
      if (container) {
        const cards = container.children;
        const width =
          container.getBoundingClientRect().width || window.innerWidth;
        const radiusX = Math.min(300, Math.max(130, width * 0.24));
        const radiusZ = 95;

        for (let i = 0; i < cards.length; i++) {
          const card = cards[i] as HTMLDivElement;
          if (!card) continue;

          const angle =
            baseAngleRef.current + i * ((2 * Math.PI) / addOns.length);
          const xFlat = Math.sin(angle) * radiusX;
          const z = Math.cos(angle) * radiusZ;

          // Bobbing wave effect
          const time = now * 0.0012;
          const yBob = Math.sin(time + i * (Math.PI / 2)) * 8;

          const cosTilt = Math.cos(tiltRef.current);
          const sinTilt = Math.sin(tiltRef.current);

          const x = xFlat * cosTilt - yBob * sinTilt;
          const y = xFlat * sinTilt + yBob * cosTilt;

          const scale = 0.55 + ((z + radiusZ) / (2 * radiusZ)) * 0.30;
          const opacity = 0.35 + ((z + radiusZ) / (2 * radiusZ)) * 0.65;
          const zIndex = Math.round(((z + radiusZ) / (2 * radiusZ)) * 100);

          // Disable filters on mobile viewports to prevent GPU processing lag
          const blur = (1 - (z + radiusZ) / (2 * radiusZ)) * 1.8;

          card.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0) scale(${scale})`;
          card.style.opacity = String(opacity);
          card.style.zIndex = String(zIndex);
          card.style.filter = blur > 0.15 ? `blur(${blur}px)` : "none";
        }
      }

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [isVisible]);

  // Window drag listeners to capture sweeps outside the carousel container
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        handleDragMove(e.clientX, e.clientY);
      }
    };

    const handleWindowMouseUp = () => {
      handleDragEnd();
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, []);

  const handleDragStart = (clientX: number, clientY: number) => {
    isDragging.current = true;
    startX.current = clientX;
    startY.current = clientY;
    startAngle.current = baseAngleRef.current;
    velocity.current = 0;
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging.current) return;
    const dx = clientX - startX.current;
    const dy = clientY - startY.current;

    const targetAngle = startAngle.current + dx / 320;
    velocity.current = targetAngle - baseAngleRef.current;
    baseAngleRef.current = targetAngle;

    const prevTilt = tiltRef.current;
    const rawTilt = dx * 0.0008 + dy * 0.0008;
    const maxTilt = 0.28;
    tiltRef.current = Math.min(maxTilt, Math.max(-maxTilt, rawTilt));

    tiltVelocityRef.current = tiltRef.current - prevTilt;
  };

  const handleDragEnd = () => {
    isDragging.current = false;
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    handleDragStart(e.clientX, e.clientY);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  };

  const onTouchEnd = () => {
    handleDragEnd();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    mousePos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    isMouseOver.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    mousePos.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
    isMouseOver.current = true;
  };

  const handleMouseLeave = () => {
    isMouseOver.current = false;
  };

  const handleMouseEnter = () => {
    isMouseOver.current = true;
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={() => {
        isMouseOver.current = true;
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => {
        isMouseOver.current = false;
      }}
      style={{
        background: `
          radial-gradient(ellipse 60% 40% at 50% 60%, rgba(255, 125, 211, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 50% 50% at 20% 40%, rgba(255, 89, 36, 0.08) 0%, transparent 60%),
          #fff0ec
        `,
      }}
      className="relative w-full py-16 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center space-y-3">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-mm-dark tracking-tight pt-2">
            Add ons
          </h3>
        </div>

        {/* 3D Merry-Go-Round Carousel Container */}
        <div
          ref={cardsContainerRef}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="relative w-full h-[260px] sm:h-[300px] mt-10 overflow-visible"
        >
          {addOns.map((addon) => (
            <AddOnCard
              key={addon.id}
              addon={addon}
              accent={colorsRef.current.accent}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
