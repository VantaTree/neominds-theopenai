import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Plan {
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  isPopular: boolean;
  buttonText: string;
}

interface PriceCardProps {
  plan: Plan;
  isAnnual: boolean;
  i: number;
}

const simWidth = 96;
const simHeight = 144;
const size = simWidth * simHeight;

export default function PriceCard({ plan, isAnnual, i }: PriceCardProps) {
  const currentPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
  const [isWarping, setIsWarping] = useState(false);
  
  const cardRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const displacementMapRef = useRef<SVGFEDisplacementMapElement | null>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const buttonCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const buffer1Ref = useRef(new Float32Array(size));
  const buffer2Ref = useRef(new Float32Array(size));
  
  const isRunningRef = useRef(false);
  const texCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const texDataRef = useRef<Uint8ClampedArray | null>(null);
  
  const colorsRef = useRef({
    background: { r: 255, g: 255, b: 255, a: 255 }, // White
    foreground: { r: 36, g: 39, b: 45, a: 255 }, // mm-dark: #24272D
    accent: { r: 255, g: 89, b: 36, a: 255 }, // mm-orange: #FF5924
    accent2: { r: 224, g: 78, b: 29, a: 255 }, // mm-orange slightly darker: #e04e1d
  });

  // Track previous mouse position/time for velocity
  const lastMousePos = useRef({ x: 0, y: 0, time: 0 });

  // Unique filter ID for cloth warping
  const filterId = useRef(`cloth-warp-${plan.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`).current;

  // Warp animation states
  const warpScaleRef = useRef(0);
  const warpTargetRef = useRef(0);

  // Parse CSS variable into RGBA using temporary 1x1 canvas context fill
  const loadColors = () => {
    if (!canvasRef.current) return;
    const styles = window.getComputedStyle(canvasRef.current);
    
    const bg = '#ffffff';
    const fg = styles.getPropertyValue('--color-mm-dark').trim() || '#24272D';
    const acc = styles.getPropertyValue('--color-mm-orange').trim() || '#FF5924';
    const acc2 = '#e04e1d';

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 1;
    tempCanvas.height = 1;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      const parseColor = (colStr: string, fallback: { r: number; g: number; b: number; a: number }) => {
        tempCtx.fillStyle = colStr;
        tempCtx.clearRect(0, 0, 1, 1);
        tempCtx.fillRect(0, 0, 1, 1);
        const data = tempCtx.getImageData(0, 0, 1, 1).data;
        if (data[3] === 0) return fallback;
        return { r: data[0], g: data[1], b: data[2], a: data[3] };
      };
      
      colorsRef.current = {
        background: parseColor(bg, colorsRef.current.background),
        foreground: parseColor(fg, colorsRef.current.foreground),
        accent: parseColor(acc, colorsRef.current.accent),
        accent2: parseColor(acc2, colorsRef.current.accent2),
      };
    }
  };

  // Generate plain offscreen background texture matching page background
  const generateTexture = () => {
    let texCanvas = texCanvasRef.current;
    if (!texCanvas) {
      texCanvas = document.createElement('canvas');
      texCanvas.width = simWidth;
      texCanvas.height = simHeight;
      texCanvasRef.current = texCanvas;
    }
    
    const texCtx = texCanvas.getContext('2d');
    if (!texCtx) return;
    
    const bg = colorsRef.current.background;
    
    texCtx.clearRect(0, 0, simWidth, simHeight);
    
    // Plain solid background to match the card background perfectly (no grid, no gradient)
    texCtx.fillStyle = `rgb(${bg.r}, ${bg.g}, ${bg.b})`;
    texCtx.fillRect(0, 0, simWidth, simHeight);
    
    const texImgData = texCtx.getImageData(0, 0, simWidth, simHeight);
    texDataRef.current = texImgData.data;
  };

  // Run simulation height updates
  const updateWaveSimulation = () => {
    const b1 = buffer1Ref.current;
    const b2 = buffer2Ref.current;
    const damping = 0.955; // wave energy decay
    
    for (let y = 1; y < simHeight - 1; y++) {
      for (let x = 1; x < simWidth - 1; x++) {
        const idx = y * simWidth + x;
        b2[idx] = (
          b1[idx - 1] +
          b1[idx + 1] +
          b1[idx - simWidth] +
          b1[idx + simWidth]
        ) / 2 - b2[idx];
        b2[idx] *= damping;
      }
    }
    
    // Swap height buffers
    buffer1Ref.current = b2;
    buffer2Ref.current = b1;

    // Apply fast edge damping to boundaries to absorb ripples and prevent sticking
    for (let y = 0; y < simHeight; y++) {
      for (let x = 0; x < simWidth; x++) {
        if (x === 0 || x === simWidth - 1 || y === 0 || y === simHeight - 1) {
          const idx = y * simWidth + x;
          buffer1Ref.current[idx] *= 0.82; // fast border decay
        }
      }
    }
  };

  // Render height differences to canvas using refraction displacement mapping & specular highlights
  const renderWater = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const texData = texDataRef.current;
    if (!texData) return;
    
    const outImgData = ctx.createImageData(simWidth, simHeight);
    const outData = outImgData.data;
    
    const acc = colorsRef.current.accent;
    const b1 = buffer1Ref.current;
    
    for (let y = 0; y < simHeight; y++) {
      for (let x = 0; x < simWidth; x++) {
        const idx = y * simWidth + x;
        
        const xPrev = x > 0 ? b1[idx - 1] : 0;
        const xNext = x < simWidth - 1 ? b1[idx + 1] : 0;
        const yPrev = y > 0 ? b1[idx - simWidth] : 0;
        const yNext = y < simHeight - 1 ? b1[idx + simWidth] : 0;
        
        // Gradient slope
        const dx = xNext - xPrev;
        const dy = yNext - yPrev;
        
        // Refraction displacement (looks up neighboring pixels based on wave slope)
        const refractionScale = 1.8;
        const rx = Math.min(simWidth - 1, Math.max(0, x + Math.round(dx * refractionScale)));
        const ry = Math.min(simHeight - 1, Math.max(0, y + Math.round(dy * refractionScale)));
        
        const srcIdx = (ry * simWidth + rx) * 4;
        const destIdx = idx * 4;
        
        // Shading slope (specular highlight or shadow)
        const slope = -dx - dy;
        let r = texData[srcIdx];
        let g = texData[srcIdx + 1];
        let b = texData[srcIdx + 2];
        let a = texData[srcIdx + 3];
        
        if (slope > 0) {
          const highlight = slope * 2.8;
          // Specular wave highlight tinted slightly with the accent color
          r = Math.min(255, r + highlight * 0.72 + (highlight * 0.28 * acc.r / 255));
          g = Math.min(255, g + highlight * 0.72 + (highlight * 0.28 * acc.g / 255));
          b = Math.min(255, b + highlight * 0.72 + (highlight * 0.28 * acc.b / 255));
        } else if (slope < 0) {
          // Shadow valley in waves
          const shadow = -slope * 1.2;
          r = Math.max(0, r - shadow * 0.45);
          g = Math.max(0, g - shadow * 0.45);
          b = Math.max(0, b - shadow * 0.45);
        }
        
        outData[destIdx] = r;
        outData[destIdx + 1] = g;
        outData[destIdx + 2] = b;
        outData[destIdx + 3] = a;
      }
    }
    
    ctx.putImageData(outImgData, 0, 0);
  };

  // Render water ripple heights onto button canvas in real time
  const renderButtonRipple = () => {
    const btnCanvas = buttonCanvasRef.current;
    if (!btnCanvas || !cardRef.current || !buttonRef.current) return;
    const btnCtx = btnCanvas.getContext('2d');
    if (!btnCtx) return;

    const cardRect = cardRef.current.getBoundingClientRect();
    const btnRect = buttonRef.current.getBoundingClientRect();

    if (cardRect.width === 0 || cardRect.height === 0 || btnRect.width === 0 || btnRect.height === 0) return;

    // Calculate button coordinates relative to the card container
    const x = btnRect.left - cardRect.left;
    const y = btnRect.top - cardRect.top;

    // Map physical coordinates to simulation grid coordinates
    const simX1 = Math.round((x / cardRect.width) * simWidth);
    const simY1 = Math.round((y / cardRect.height) * simHeight);
    const simX2 = Math.round(((x + btnRect.width) / cardRect.width) * simWidth);
    const simY2 = Math.round(((y + btnRect.height) / cardRect.height) * simHeight);

    const btnW = simX2 - simX1;
    const btnH = simY2 - simY1;

    if (btnW <= 0 || btnH <= 0) return;

    // Resize button canvas to match simulation pixels
    if (btnCanvas.width !== btnW || btnCanvas.height !== btnH) {
      btnCanvas.width = btnW;
      btnCanvas.height = btnH;
    }

    const btnImgData = btnCtx.createImageData(btnW, btnH);
    const btnData = btnImgData.data;

    // Button ripple uses white if the button background is orange, or orange if the button background is transparent/white
    const rippleColor = plan.isPopular 
      ? { r: 255, g: 255, b: 255 } 
      : colorsRef.current.accent;
    const b1 = buffer1Ref.current;

    for (let by = 0; by < btnH; by++) {
      const sy = simY1 + by;
      if (sy < 0 || sy >= simHeight) continue;

      for (let bx = 0; bx < btnW; bx++) {
        const sx = simX1 + bx;
        if (sx < 0 || sx >= simWidth) continue;

        const simIdx = sy * simWidth + sx;
        const destIdx = (by * btnW + bx) * 4;

        const h = b1[simIdx];

        // Draw color on button only where the ripple peak is located
        if (h > 0.8) {
          const maxOpacity = plan.isPopular ? 0.75 : 0.55;
          const opacity = Math.min(maxOpacity, (h - 0.8) * 0.08);

          btnData[destIdx] = rippleColor.r;
          btnData[destIdx + 1] = rippleColor.g;
          btnData[destIdx + 2] = rippleColor.b;
          btnData[destIdx + 3] = Math.round(opacity * 255);
        } else {
          // Transparent outside the peaks
          btnData[destIdx] = 0;
          btnData[destIdx + 1] = 0;
          btnData[destIdx + 2] = 0;
          btnData[destIdx + 3] = 0;
        }
      }
    }

    btnCtx.putImageData(btnImgData, 0, 0);
  };

  // Simulation tick loop
  const tick = () => {
    if (!canvasRef.current) {
      isRunningRef.current = false;
      return;
    }

    updateWaveSimulation();
    renderWater();
    renderButtonRipple();

    // Interpolate cloth edge warp scale
    warpScaleRef.current =
      warpScaleRef.current * 0.88 + warpTargetRef.current * 0.12;
    warpTargetRef.current *= 0.93; // decay target warp scale

    const activeWarp = warpScaleRef.current > 0.05;
    if (activeWarp !== isWarping) {
      setIsWarping(activeWarp);
    }

    if (activeWarp && displacementMapRef.current) {
      displacementMapRef.current.setAttribute("scale", warpScaleRef.current.toFixed(2));
    }

    // Measure active wave energy
    let maxEnergy = 0;
    const b1 = buffer1Ref.current;
    for (let i = 0; i < size; i++) {
      const val = Math.abs(b1[i]);
      if (val > maxEnergy) {
        maxEnergy = val;
      }
    }

    // Continue running if active ripples exist or if cloth is still settling/warping
    if (maxEnergy > 0.04 || warpScaleRef.current > 0.1) {
      requestAnimationFrame(tick);
    } else {
      // Clean settlement and put to sleep
      b1.fill(0);
      buffer2Ref.current.fill(0);
      renderWater();

      // Clear button ripple canvas
      const btnCanvas = buttonCanvasRef.current;
      if (btnCanvas) {
        const btnCtx = btnCanvas.getContext("2d");
        if (btnCtx) {
          btnCtx.clearRect(0, 0, btnCanvas.width, btnCanvas.height);
        }
      }

      warpScaleRef.current = 0;
      warpTargetRef.current = 0;
      setIsWarping(false);
      if (displacementMapRef.current) {
        displacementMapRef.current.setAttribute("scale", "0");
      }

      isRunningRef.current = false;
    }
  };

  const wakeUp = () => {
    if (!isRunningRef.current) {
      isRunningRef.current = true;
      requestAnimationFrame(tick);
    }
  };

  const splash = (x: number, y: number, velocity: number) => {
    const baseStrength = 15;
    const strength = Math.min(125, baseStrength + velocity * 40);
    const radius = Math.min(4, 1 + Math.floor(velocity * 0.8));

    const b1 = buffer1Ref.current;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const sx = x + dx;
        const sy = y + dy;
        if (sx >= 0 && sx < simWidth && sy >= 0 && sy < simHeight) {
          if (dx * dx + dy * dy <= radius * radius) {
            b1[sy * simWidth + sx] += strength;
          }
        }
      }
    }

    wakeUp();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const time = performance.now();

    const prev = lastMousePos.current;
    if (prev.time > 0) {
      const dt = time - prev.time;
      if (dt > 0) {
        const dx = x - prev.x;
        const dy = y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const velocity = dist / dt; // speed in px/ms

        // Map to simulation grid coordinates
        const simX = Math.round((x / rect.width) * simWidth);
        const simY = Math.round((y / rect.height) * simHeight);

        splash(simX, simY, velocity);

        // Warp cloth effect: disable on mobile width (< 768px)
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
        if (!isMobile) {
          const warpLimit = 22;
          const targetWarp = Math.min(warpLimit, velocity * 7.5);
          if (targetWarp > warpTargetRef.current) {
            warpTargetRef.current = targetWarp;
          }
        }
      }
    }

    lastMousePos.current = { x, y, time };
  };

  const handleMouseEnter = () => {
    lastMousePos.current = { x: 0, y: 0, time: 0 };
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    lastMousePos.current = { x, y, time: performance.now() };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const time = performance.now();

    const prev = lastMousePos.current;
    if (prev.time > 0) {
      const dt = time - prev.time;
      if (dt > 0) {
        const dx = x - prev.x;
        const dy = y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const velocity = dist / dt;

        const simX = Math.round((x / rect.width) * simWidth);
        const simY = Math.round((y / rect.height) * simHeight);

        splash(simX, simY, velocity);
      }
    }

    lastMousePos.current = { x, y, time };
  };

  const handleTouchEnd = () => {
    lastMousePos.current = { x: 0, y: 0, time: 0 };
  };

  // Set up initial colors and texture rendering
  useEffect(() => {
    loadColors();
    generateTexture();
    renderWater();
  }, []);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: i * 0.08 }}
      style={{ filter: isWarping ? `url(#${filterId})` : "none" }}
      className={`relative rounded-3xl border p-8 flex flex-col justify-between transition-all duration-300 bg-white/90 backdrop-blur-md shadow-sm will-change-[filter] ${
        plan.isPopular
          ? "border-mm-orange/40 shadow-xl shadow-mm-orange/5 ring-1 ring-mm-orange/30 scale-102 z-10 md:-translate-y-2"
          : "border-mm-dark/5 shadow-lg shadow-mm-dark/5 hover:border-mm-orange/30"
      }`}
    >
      {/* Water Ripple Simulation Canvas */}
      <canvas
        ref={canvasRef}
        width={simWidth}
        height={simHeight}
        className="absolute inset-0 w-full h-full -z-10 rounded-[inherit] pointer-events-none opacity-85 transition-opacity duration-300"
      />

      {plan.isPopular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-mm-orange px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
          Most Popular
        </span>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-extrabold text-mm-dark tracking-tight">
            {plan.name}
          </h3>
          <p className="text-xs text-mm-gray mt-1 leading-relaxed">
            {plan.description}
          </p>
        </div>

        {/* Price Display */}
        <div className="pt-2 border-t border-mm-dark/5">
          <div className="flex items-baseline text-mm-dark">
            <span
              style={{ fontFamily: "'Louize', Georgia, serif" }}
              className="text-4xl sm:text-5xl font-bold tracking-tight"
            >
              ${currentPrice}
            </span>
            <span className="text-sm font-semibold text-mm-gray ml-1">
              /mth
            </span>
          </div>
          <span className="text-[10px] font-bold text-mm-gray block mt-1 uppercase tracking-wider">
            {isAnnual ? "Billed annually" : "Billed monthly"}
          </span>
        </div>

        {/* Features List */}
        <ul className="space-y-3.5 pt-4 border-t border-mm-dark/5 text-sm">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mm-orange/10 text-mm-orange mt-0.5">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
              <span className="text-mm-dark/85 leading-tight font-medium">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button */}
      <div className="mt-8">
        <button
          ref={buttonRef}
          className={`w-full rounded-2xl py-3.5 text-xs font-bold uppercase tracking-wider transition-all active:scale-98 cursor-pointer relative overflow-hidden ${
            plan.isPopular
              ? "bg-mm-orange text-white shadow-md shadow-mm-orange/15 hover:opacity-95"
              : "border border-mm-dark/10 bg-transparent text-mm-dark hover:bg-mm-dark/5"
          }`}
        >
          {/* Internal canvas for dynamic, local ripple overlays */}
          <canvas
            ref={buttonCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none rounded-[inherit]"
          />
          <span className="relative z-10">{plan.buttonText}</span>
        </button>
      </div>

      {/* SVG filter for responsive cloth edge warping */}
      <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}>
        <defs>
          <filter id={filterId}>
            <feTurbulence
              ref={turbulenceRef}
              type="fractalNoise"
              baseFrequency="0.008 0.015"
              numOctaves="1"
              result="noise"
            />
            <feDisplacementMap
              ref={displacementMapRef}
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
    </motion.div>
  );
}
