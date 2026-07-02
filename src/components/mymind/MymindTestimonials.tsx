import { useEffect, useRef, useState } from "react";
import { Compass, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";

interface Testimonial {
  id: string;
  name: string;
  businessName: string;
  projectDescription: string;
  text: string;
  imagePath: string;
  x: number; // coordinate in virtual space
  y: number;
}

interface Pulse {
  fromIdx: number;
  toIdx: number;
  progress: number;
  speed: number;
}

const rawTestimonials = [
  {
    id: "hr_candidate_screening",
    name: "Jonathan Vance",
    businessName: "TalentStream Partners",
    projectDescription: "AI Resume Screener — Fit Scores & Red Flags",
    text: "The n8n pipeline saves our recruitment team hours every day. Candidates are pre-screened in seconds and graded against live criteria with zero data entry.",
    imagePath: "/images/portfolio/hr-automation.png",
  },
  {
    id: "mindspace_ai",
    name: "Dr. Amit Patel",
    businessName: "Mindspace / GoodMind",
    projectDescription: "TARA: 24/7 AI Companion PWA",
    text: "TARA offers an incredibly empathetic and low-latency voice and text chat experience for mental wellness. Elevating support with Firebase and ElevenLabs integration.",
    imagePath: "/images/portfolio/mindspace.jpeg",
  },
  {
    id: "flooringinc_analytics",
    name: "Robert H.",
    businessName: "IncStores E-commerce",
    projectDescription: "360° E‑commerce Analytics & AI Queries",
    text: "Connecting Magento to this MySQL dashboard with a Groq NL-to-SQL bot allows anyone on our team to query sales and revenue in plain English.",
    imagePath: "/images/portfolio/dashboard.png",
  },
  {
    id: "project_buddy",
    name: "Sarah Jenkins",
    businessName: "Vertex AI / Slack RAG",
    projectDescription: "Project Buddy: Slack-integrated RAG Bot",
    text: "Finding answers in our Google Drive document corpus was reduced from 20 minutes to 2 seconds. The Slack thread context integration is exceptionally intuitive.",
    imagePath: "/images/portfolio/project-buddy.png",
  },
  {
    id: "mindspace_ai_dashboard",
    name: "Elena Rostova",
    businessName: "Mindspace Platform",
    projectDescription: "Mindspace.ai Admin Control Panel",
    text: "Our admin team now has absolute control over users, notifications, and engagement analytics. The AI-generated push notifications are a massive productivity boost.",
    imagePath: "/images/portfolio/mindspace-dashboard.png",
  },
  {
    id: "ai_co_teacher",
    name: "Marcus Chen",
    businessName: "Horizon EdTech",
    projectDescription: "AI Co-Teacher: Lesson & Quiz Generator",
    text: "Teachers at our academy cut lesson planning and quiz prep time down by 80%. We can track attendance and struggling students from a single screen.",
    imagePath: "/images/portfolio/coteacher.png",
  },
  {
    id: "ai_lms",
    name: "David K.",
    businessName: "Apex Learning Systems",
    projectDescription: "AI LMS: Adaptive Learning & Auto-Grading",
    text: "The adaptive quiz engine and NLP auto-grading are outstanding. Our dropout alerts have significantly improved student completion rates.",
    imagePath: "/images/portfolio/lms.png",
  },
  {
    id: "smart_fee_management",
    name: "Julian V.",
    businessName: "Vanguard Colleges",
    projectDescription: "Smart Fee Management & Receipts",
    text: "Automating payment links and WhatsApp reminders cleared our outstanding collections. The financial forecasting dashboard gives perfect clarity.",
    imagePath: "/images/portfolio/fee collection.png",
  },
  {
    id: "ai_social_posts",
    name: "Aisha Rahman",
    businessName: "Zenith Retail",
    projectDescription: "AI Social Posts: One-Prompt Creator",
    text: "Creating both the graphics and captions in a single prompt and scheduling them directly has scaled our social media presence without extra hires.",
    imagePath: "/images/portfolio/market.jpeg",
  },
  {
    id: "aristotle_practice_buddy",
    name: "Professor Harris",
    businessName: "Aristotle Academics",
    projectDescription: "Aristotle: AI Practice & Handwriting Buddy",
    text: "Real-time handwriting recognition and mistake detection guide students step-by-step, turning study struggles into rewarding breakthroughs.",
    imagePath: "/images/portfolio/Aristotle.png",
  },
  {
    id: "expirio_inventory",
    name: "Lisa Miller",
    businessName: "Expirio Kitchens",
    projectDescription: "Expirio: Expiry Alerts & Recipe Suggester",
    text: "Expirio completely resolved duplicate orders and inventory waste in our pantry and kitchen. The recipe generator uses up expiring stock beautifully.",
    imagePath: "/images/portfolio/expirio.jpg",
  },
  {
    id: "ai_complaint_classifier",
    name: "Carlos M.",
    businessName: "Techflow Support",
    projectDescription: "AI Complaint Classifier & Router",
    text: "By reading ticket sentiment and routing complaints automatically, our manual triage workload was cut by 60%. Highly recommend.",
    imagePath: "/images/portfolio/complaint.jpeg",
  },
  {
    id: "ai_textbook_tool",
    name: "Hannah Abbott",
    businessName: "EduSmart Tools",
    projectDescription: "AI Textbook Platform: Summaries & Flashcards",
    text: "Uploading 400-page textbooks and instantly generating matching quizzes and active-recall flashcards has transformed student revision.",
    imagePath: "/images/portfolio/textbook.png",
  },
  {
    id: "ai_sql_chatbot",
    name: "Victor Petrov",
    businessName: "Finova Tech Data",
    projectDescription: "AI SQL Chatbot: Natural Language Analytics",
    text: "Our business users can query complex databases in plain English without writing a single line of SQL. Secure, quick, and robust.",
    imagePath: "/images/portfolio/mysql.png",
  },
  {
    id: "aqsa_calligraphy",
    name: "Aqsa Rauf",
    businessName: "AAQSAA Calligraphy",
    projectDescription: "Luxury Calligraphy Portfolio & Commissions",
    text: "The Gold/Glassmorphism SPA represents my artwork perfectly. The secure Gmail SMTP commission flow has made custom bookings seamless.",
    imagePath: "/images/portfolio/aqsa.png",
  },
  {
    id: "neo_emotion",
    name: "Simon Templar",
    businessName: "Neo Emotion Labs",
    projectDescription: "Neo Emotion: Real-Time Face Emotion AI",
    text: "Real-time webcam facial expression analysis with ResNet-18 has given our interactive apps a stable, high-performance empathy layer.",
    imagePath: "/images/portfolio/neomotion.png",
  },
  {
    id: "aimc_assistant",
    name: "Zafar Iqbal",
    businessName: "AIMC Associates",
    projectDescription: "AIMC Assistant: Urdu-English Waqf Chat",
    text: "Having a bilingual document assistant has made navigating dense legal judgments and Supreme Court files in Urdu and English incredibly easy.",
    imagePath: "/images/portfolio/aimc.png",
  },
  {
    id: "neominds_attendance",
    name: "George K.",
    businessName: "MediCore Workforce",
    projectDescription: "NeoMinds Attendance: Privacy-First Face AI",
    text: "An enterprise attendance kiosk using face embeddings instead of raw photos is the perfect balance of payroll accuracy and employee privacy.",
    imagePath: "/images/portfolio/attendence.png",
  },
];

// Seedable PRNG (Linear Congruential Generator) using the number of testimonials as seed
function createRandom(seed: number) {
  let state = seed;
  return function () {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const N = rawTestimonials.length;
const rand = createRandom(N);
const centerX = 950;
const centerY = 650;
const rx = 850; // Spacing between cards
const ry = 850; // Spacing between cards
const rangeX = rx + 150; // Camera boundaries scale factor X
const rangeY = ry + 150; // Camera boundaries scale factor Y

// Fibonacci spiral distribution (2D lattice grid)
const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians (~2.39996)
const testimonials: Testimonial[] = rawTestimonials.map((t, i) => {
  const r = Math.sqrt(i + 0.5) / Math.sqrt(N);
  const angle = i * goldenAngle;
  const x = Math.round(centerX + Math.cos(angle) * rx * r);
  const y = Math.round(centerY + Math.sin(angle) * ry * r);
  return {
    ...t,
    x,
    y,
  };
});

interface ControlPoint {
  x: number;
  y: number;
}

const getControlPoint = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): ControlPoint => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len === 0) return { x: mx, y: my };
  const px = -dy / len;
  const py = dx / len;
  const offset = len * 0.15; // 15% curvature offset
  return {
    x: mx + px * offset,
    y: my + py * offset,
  };
};

// Dynamically generate connection lines
const connections: number[][] = [];
const seen = new Set<string>();

const addConnection = (u: number, v: number) => {
  if (u === v) return;
  const min = Math.min(u, v);
  const max = Math.max(u, v);
  const key = `${min}-${max}`;
  if (!seen.has(key)) {
    seen.add(key);
    connections.push([min, max]);
  }
};

// 1. Ensure connectivity by forming a ring
for (let i = 0; i < N; i++) {
  addConnection(i, (i + 1) % N);
}

// 2. Add some random chords to make it look like a network web
const extraConnectionsCount = Math.max(2, Math.floor(N * 0.5));
for (let i = 0; i < extraConnectionsCount; i++) {
  const u = Math.floor(rand() * N);
  let v = Math.floor(rand() * N);
  while (u === v) {
    v = Math.floor(rand() * N);
  }
  addConnection(u, v);
}

// 3. Build connectionMap for routing of active pulses
const connectionMap: Record<number, number[]> = {};
for (let i = 0; i < N; i++) {
  connectionMap[i] = [];
}
connections.forEach(([u, v]) => {
  connectionMap[u].push(v);
  connectionMap[v].push(u);
});

// 4. Initialize pulses using the generated connections
const initialPulses: Pulse[] = [];
const numPulses = Math.min(connections.length, 4);
for (let i = 0; i < numPulses; i++) {
  const [u, v] = connections[i];
  initialPulses.push({
    fromIdx: u,
    toIdx: v,
    progress: (i * 0.25) % 1.0,
    speed: 0.005 + i * 0.001,
  });
}

// Bubble testimonials config for mobile (NO image, just text)
const BUBBLE_TESTIMONIALS = rawTestimonials.map((t, i) => ({
  text: t.text,
  name: t.name,
  role: t.projectDescription,
  result: t.businessName,
  position: i % 3 === 0 ? "left" : i % 3 === 1 ? "center" : "right",
  delay: (i % 4) * 0.1,
}));

function getBubbleClass(position: string): string {
  const map: Record<string, string> = {
    left: "mx-auto sm:mr-auto sm:ml-8",
    center: "mx-auto",
    right: "mx-auto sm:ml-auto sm:mr-8",
  };
  return map[position] ?? "mx-auto";
}

export function MymindTestimonials() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const graphWrapperRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<HTMLDivElement | null>(null);

  // Active highlighted card
  const [activeIndex, setActiveIndex] = useState(0);

  // Viewport camera parameters
  const camXRef = useRef(centerX);
  const camYRef = useRef(centerY);
  const zoomRef = useRef(0.75);

  const targetCamX = useRef(centerX);
  const targetCamY = useRef(centerY);
  const targetZoom = useRef(0.75);

  // Interaction tracking state
  const isDraggingController = useRef(false);
  const isDraggingGraph = useRef(false);
  const lastInteractionTime = useRef(performance.now());

  // Mouse coords for dragging graph directly
  const dragGraphStartX = useRef(0);
  const dragGraphStartY = useRef(0);
  const dragCamStartX = useRef(centerX);
  const dragCamStartY = useRef(centerY);

  // Controller relative ball position (range [-70, 70] for X, [-40, 40] for Y)
  const [ballPos, setBallPos] = useState({ x: 0, y: 0 });
  const ballPosRef = useRef({ x: 0, y: 0 });

  // Mobile touch gesture classification tracking
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const isScrollingPageRef = useRef(false);
  const isGestureDeterminedRef = useRef(false);

  // Floating pulses running in the background web
  const pulsesRef = useRef<Pulse[]>(initialPulses);

  // Mymind style colors (mapped statically to fit the light gradient background)
  const colorsRef = useRef({
    foreground: { r: 36, g: 39, b: 45 }, // #24272D
    accent: { r: 255, g: 89, b: 36 }, // #FF5924
    accent2: { r: 255, g: 125, b: 211 }, // #FF7DD3
  });

  // Update loop for camera interpolation and canvas rendering
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    const update = () => {
      const now = performance.now();
      const dt = Math.min(3, (now - lastTime) / 16.667);
      lastTime = now;

      // Autoplay cycle between cards when idle (6 seconds)
      const timeSinceInteract = now - lastInteractionTime.current;
      if (
        timeSinceInteract > 3000 &&
        !isDraggingController.current &&
        !isDraggingGraph.current
      ) {
        // Change focused card index
        const elapsedIntervals = Math.floor(timeSinceInteract / 6000);
        const nextIndex = elapsedIntervals % testimonials.length;
        if (nextIndex !== activeIndex) {
          setActiveIndex(nextIndex);
          targetCamX.current = testimonials[nextIndex].x;
          targetCamY.current = testimonials[nextIndex].y;
          targetZoom.current = 1.15;
        }
      }

      // Dynamic zoom-out on camera movement transit (so we see the network graph while shifting cards)
      const distToTarget = Math.hypot(
        targetCamX.current - camXRef.current,
        targetCamY.current - camYRef.current,
      );
      if (
        distToTarget > 100 &&
        !isDraggingController.current &&
        !isDraggingGraph.current
      ) {
        targetZoom.current = Math.max(0.72, 1.15 - distToTarget * 0.001);
      } else if (!isDraggingController.current && !isDraggingGraph.current) {
        targetZoom.current = 1.15;
      }

      // Smooth Camera LERP interpolation
      camXRef.current += (targetCamX.current - camXRef.current) * 0.08 * dt;
      camYRef.current += (targetCamY.current - camYRef.current) * 0.08 * dt;
      zoomRef.current += (targetZoom.current - zoomRef.current) * 0.08 * dt;

      // Sync tracking ball with actual camera position in real-time
      if (!isDraggingController.current) {
        const currentPctX = (camXRef.current - centerX) / rangeX;
        const currentPctY = (camYRef.current - centerY) / rangeY;
        const clampedPctX = Math.min(1, Math.max(-1, currentPctX));
        const clampedPctY = Math.min(1, Math.max(-1, currentPctY));
        setBallPos({
          x: clampedPctX * 70,
          y: clampedPctY * 40,
        });
        ballPosRef.current = {
          x: clampedPctX * 70,
          y: clampedPctY * 40,
        };
      }

      // Apply transformations to HTML cards container wrapper
      const canvas = canvasRef.current;
      if (graphWrapperRef.current && canvas) {
        const w = canvas.width;
        const h = canvas.height;
        graphWrapperRef.current.style.transform = `translate3d(${w / 2}px, ${h / 2}px, 0) scale(${zoomRef.current}) translate3d(${-camXRef.current}px, ${-camYRef.current}px, 0)`;
      }

      // Draw background network web connections on canvas
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const w = canvas.width;
          const h = canvas.height;

          // Coordinate grid lines
          const fg = colorsRef.current.foreground;
          ctx.strokeStyle = `rgba(${fg.r}, ${fg.g}, ${fg.b}, 0.025)`;
          ctx.lineWidth = 1;
          const gridSpacing = 90 * zoomRef.current;
          const startGridX =
            (w / 2 - camXRef.current * zoomRef.current) % gridSpacing;
          const startGridY =
            (h / 2 - camYRef.current * zoomRef.current) % gridSpacing;

          for (let x = startGridX; x < w; x += gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
          }
          for (let y = startGridY; y < h; y += gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
          }

          // Node connection paths (curved quadratic Bezier)
          const acc = colorsRef.current.accent;
          const acc2 = colorsRef.current.accent2;

          ctx.lineWidth = 2 * zoomRef.current;
          connections.forEach(([i, j]) => {
            const c1 = testimonials[i];
            const c2 = testimonials[j];

            const x1 = w / 2 + (c1.x - camXRef.current) * zoomRef.current;
            const y1 = h / 2 + (c1.y - camYRef.current) * zoomRef.current;
            const x2 = w / 2 + (c2.x - camXRef.current) * zoomRef.current;
            const y2 = h / 2 + (c2.y - camYRef.current) * zoomRef.current;

            const ctrl = getControlPoint(c1.x, c1.y, c2.x, c2.y);
            const cx = w / 2 + (ctrl.x - camXRef.current) * zoomRef.current;
            const cy = h / 2 + (ctrl.y - camYRef.current) * zoomRef.current;

            const grad = ctx.createLinearGradient(x1, y1, x2, y2);
            grad.addColorStop(0, `rgba(${acc.r}, ${acc.g}, ${acc.b}, 0.15)`);
            grad.addColorStop(1, `rgba(${acc2.r}, ${acc2.g}, ${acc2.b}, 0.15)`);

            ctx.strokeStyle = grad;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.quadraticCurveTo(cx, cy, x2, y2);
            ctx.stroke();
          });

          // Moving pulses on curved paths
          ctx.fillStyle = `rgba(${acc.r}, ${acc.g}, ${acc.b}, 0.85)`;
          pulsesRef.current.forEach((pulse) => {
            pulse.progress += pulse.speed * dt;
            if (pulse.progress >= 1) {
              pulse.progress = 0;
              // Reroute to a connected node
              pulse.fromIdx = pulse.toIdx;
              const possible = connectionMap[pulse.fromIdx];
              pulse.toIdx =
                possible[Math.floor(Math.random() * possible.length)];
            }

            const u = Math.min(pulse.fromIdx, pulse.toIdx);
            const v = Math.max(pulse.fromIdx, pulse.toIdx);
            const c1 = testimonials[u];
            const c2 = testimonials[v];

            const x1 = w / 2 + (c1.x - camXRef.current) * zoomRef.current;
            const y1 = h / 2 + (c1.y - camYRef.current) * zoomRef.current;
            const x2 = w / 2 + (c2.x - camXRef.current) * zoomRef.current;
            const y2 = h / 2 + (c2.y - camYRef.current) * zoomRef.current;

            const ctrl = getControlPoint(c1.x, c1.y, c2.x, c2.y);
            const cx = w / 2 + (ctrl.x - camXRef.current) * zoomRef.current;
            const cy = h / 2 + (ctrl.y - camYRef.current) * zoomRef.current;

            const startX = pulse.fromIdx === u ? x1 : x2;
            const startY = pulse.fromIdx === u ? y1 : y2;
            const endX = pulse.fromIdx === u ? x2 : x1;
            const endY = pulse.fromIdx === u ? y2 : y1;

            const t = pulse.progress;
            const mt = 1 - t;
            const px = mt * mt * startX + 2 * mt * t * cx + t * t * endX;
            const py = mt * mt * startY + 2 * mt * t * cy + t * t * endY;

            ctx.beginPath();
            ctx.arc(px, py, 4 * zoomRef.current, 0, 2 * Math.PI);
            ctx.shadowColor = `rgba(${acc.r}, ${acc.g}, ${acc.b}, 0.7)`;
            ctx.shadowBlur = 6 * zoomRef.current;
            ctx.fill();
            ctx.shadowBlur = 0;
          });
        }
      }

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, [activeIndex]);

  // Window drag/mouse handlers for controller puck and direct canvas dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingController.current && controllerRef.current) {
        const rect = controllerRef.current.getBoundingClientRect();
        const centerXVal = rect.left + rect.width / 2;
        const centerYVal = rect.top + rect.height / 2;

        const relX = e.clientX - centerXVal;
        const relY = e.clientY - centerYVal;

        // Clamp ball to controller bounding limits
        const clampedX = Math.min(70, Math.max(-70, relX));
        const clampedY = Math.min(40, Math.max(-40, relY));

        setBallPos({ x: clampedX, y: clampedY });
        ballPosRef.current = { x: clampedX, y: clampedY };

        // Scale camera targets dynamically
        const pctX = clampedX / 70;
        const pctY = clampedY / 40;
        targetCamX.current = centerX + pctX * rangeX;
        targetCamY.current = centerY + pctY * rangeY;
        targetZoom.current = 0.68; // Zoom out during pan
        lastInteractionTime.current = performance.now();
      }

      if (isDraggingGraph.current) {
        const dx = e.clientX - dragGraphStartX.current;
        const dy = e.clientY - dragGraphStartY.current;

        // Move camera opposite to drag direction scaled by zoom (2x panning speed)
        targetCamX.current = dragCamStartX.current - (dx * 2) / zoomRef.current;
        targetCamY.current = dragCamStartY.current - (dy * 2) / zoomRef.current;
        targetZoom.current = 0.68; // zoom out while panning
        lastInteractionTime.current = performance.now();
      }
    };

    const handleMouseUp = () => {
      let shouldSnap = false;
      if (isDraggingController.current) {
        isDraggingController.current = false;
        shouldSnap = true;
      }
      if (isDraggingGraph.current) {
        isDraggingGraph.current = false;
        shouldSnap = true;
      }

      if (shouldSnap) {
        // Snap to nearest testimonial card
        let nearestIdx = 0;
        let minDist = Infinity;
        testimonials.forEach((card, idx) => {
          const dist = Math.hypot(
            card.x - targetCamX.current,
            card.y - targetCamY.current,
          );
          if (dist < minDist) {
            minDist = dist;
            nearestIdx = idx;
          }
        });

        setActiveIndex(nearestIdx);
        targetCamX.current = testimonials[nearestIdx].x;
        targetCamY.current = testimonials[nearestIdx].y;
        targetZoom.current = 1.15; // Snap zoom close-up
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Touch listener handlers
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];

      // Handle controller dragging
      if (isDraggingController.current && controllerRef.current) {
        e.preventDefault(); // Lock page scrolling during controller drag
        const rect = controllerRef.current.getBoundingClientRect();
        const centerXVal = rect.left + rect.width / 2;
        const centerYVal = rect.top + rect.height / 2;

        const relX = touch.clientX - centerXVal;
        const relY = touch.clientY - centerYVal;

        const clampedX = Math.min(70, Math.max(-70, relX));
        const clampedY = Math.min(40, Math.max(-40, relY));

        setBallPos({ x: clampedX, y: clampedY });
        ballPosRef.current = { x: clampedX, y: clampedY };

        const pctX = clampedX / 70;
        const pctY = clampedY / 40;
        targetCamX.current = centerX + pctX * rangeX;
        targetCamY.current = centerY + pctY * rangeY;
        targetZoom.current = 0.68;
        lastInteractionTime.current = performance.now();
        return;
      }

      // Handle graph dragging with gesture classification
      if (isDraggingGraph.current) {
        if (isScrollingPageRef.current) {
          return; // Let the browser scroll the page naturally
        }

        const dxRaw = touch.clientX - touchStartXRef.current;
        const dyRaw = touch.clientY - touchStartYRef.current;

        if (!isGestureDeterminedRef.current) {
          const dist = Math.hypot(dxRaw, dyRaw);
          if (dist > 8) {
            isGestureDeterminedRef.current = true;
            // If the gesture is mostly vertical, let it scroll the page
            if (Math.abs(dyRaw) > Math.abs(dxRaw) * 1.2) {
              isScrollingPageRef.current = true;
              isDraggingGraph.current = false;
              return;
            }
          } else {
            return; // Wait for enough movement to determine gesture
          }
        }

        // Lock scrolling once we confirm it's a pan gesture
        e.preventDefault();

        const dx = touch.clientX - dragGraphStartX.current;
        const dy = touch.clientY - dragGraphStartY.current;

        // Panning 2x faster
        targetCamX.current = dragCamStartX.current - (dx * 2) / zoomRef.current;
        targetCamY.current = dragCamStartY.current - (dy * 2) / zoomRef.current;
        targetZoom.current = 0.68;
        lastInteractionTime.current = performance.now();
      }
    };

    const handleTouchEnd = () => {
      let shouldSnap = false;
      if (isDraggingController.current) {
        isDraggingController.current = false;
        shouldSnap = true;
      }
      if (isDraggingGraph.current) {
        isDraggingGraph.current = false;
        shouldSnap = true;
      }

      if (shouldSnap) {
        let nearestIdx = 0;
        let minDist = Infinity;
        testimonials.forEach((card, idx) => {
          const dist = Math.hypot(
            card.x - targetCamX.current,
            card.y - targetCamY.current,
          );
          if (dist < minDist) {
            minDist = dist;
            nearestIdx = idx;
          }
        });

        setActiveIndex(nearestIdx);
        targetCamX.current = testimonials[nearestIdx].x;
        targetCamY.current = testimonials[nearestIdx].y;
        targetZoom.current = 1.15;
      }
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchEnd);
    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, []);

  const handleControllerMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    isDraggingController.current = true;
    lastInteractionTime.current = performance.now();
  };

  const handleControllerTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    isDraggingController.current = true;
    lastInteractionTime.current = performance.now();
  };

  const handleGraphMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left-click only
    isDraggingGraph.current = true;
    dragGraphStartX.current = e.clientX;
    dragGraphStartY.current = e.clientY;
    dragCamStartX.current = camXRef.current;
    dragCamStartY.current = camYRef.current;
    lastInteractionTime.current = performance.now();
  };

  const handleGraphTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    isDraggingGraph.current = true;
    dragGraphStartX.current = touch.clientX;
    dragGraphStartY.current = touch.clientY;
    dragCamStartX.current = camXRef.current;
    dragCamStartY.current = camYRef.current;
    lastInteractionTime.current = performance.now();

    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    isScrollingPageRef.current = false;
    isGestureDeterminedRef.current = false;
  };

  const handleCardClick = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    lastInteractionTime.current = performance.now();
    setActiveIndex(idx);
    targetCamX.current = testimonials[idx].x;
    targetCamY.current = testimonials[idx].y;
    targetZoom.current = 1.15;
  };

  return (
    <section
      style={{
        backgroundImage: "url('/images/mymind_review_neue-1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Section Header */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center flex flex-col items-center gap-3 relative z-30">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: "#FF5924" }}
        >
          Client Testimonials
        </motion.p>
        <h2
          className="text-[#111418] tracking-tight leading-[1.05]"
          style={{
            fontFamily: "'Louize', Georgia, serif",
            fontSize: "clamp(2.8rem, 8vw, 5.5rem)",
            letterSpacing: "-0.03em",
            fontWeight: 400,
          }}
        >
          Client Testimonials
        </h2>
        <p
          className="max-w-lg leading-relaxed"
          style={{
            color: "#4A5465",
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(1rem, 2vw, 1.15rem)",
          }}
        >
          Drag the canvas directly or slide the relative tracking ball on the
          control pad below to explore the project web.
        </p>
      </div>

      <div
        ref={containerRef}
        id="testimonials"
        className="relative w-full overflow-hidden"
      >
        {/* 1. MOBILE BUBBLE VIEWPORT (< md) */}
        <div className="md:hidden mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20">
          {/* Floating testimonial bubbles — top 3 */}
          <div className="flex flex-col gap-12 sm:gap-14 mb-14 sm:mb-20 w-full">
            {BUBBLE_TESTIMONIALS.slice(0, 3).map((t, i) => {
              const isLeft = i % 2 === 0;
              const floatConfigs = [
                { y: [0, -10, 0] as number[], duration: 4, delay: 0 },
                { y: [0, -7, 0] as number[], duration: 3.2, delay: 0.5 },
                { y: [0, -12, 0] as number[], duration: 4.8, delay: 1 },
              ];
              const fc = floatConfigs[i % floatConfigs.length];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.6, delay: t.delay }}
                  className={`w-full max-w-[460px] ${isLeft ? "self-end" : "self-start"}`}
                >
                  <motion.div
                    animate={{ y: fc.y }}
                    transition={{
                      duration: fc.duration,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: fc.delay,
                    }}
                    style={{ willChange: "transform" }}
                    className="w-full"
                  >
                    {/* Speech bubble box */}
                    <div
                      className="relative rounded-[46px] bg-white px-5 sm:px-6 py-4 sm:py-5"
                      style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}
                    >
                      <p className="text-sm leading-relaxed md:text-base text-left font-sans text-mm-dark">
                        &ldquo;{t.text}&rdquo;
                      </p>
                    </div>

                    {/* Speech bubble trail and metadata */}
                    {isLeft ? (
                      <div className="relative flex flex-col items-start pl-12 mt-2 w-full">
                        {/* Trail dots */}
                        <div className="flex flex-col items-start gap-1.5 -mt-1 mb-2">
                          <div className="size-3.5 rounded-full bg-white shadow-sm ml-8" />
                          <div className="size-2 rounded-full bg-white/80 shadow-xs ml-4.5" />
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center gap-3">
                          <div className="text-left">
                            <p className="text-xs font-semibold text-mm-dark font-sans">
                              {t.name}
                            </p>
                            <p className="text-xs text-mm-gray font-sans mt-0.5">
                              {t.role}
                            </p>
                          </div>
                          <span
                            className="shrink-0 text-center rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                            style={{ background: "#fff0ec", color: "#FF5924" }}
                          >
                            {t.result}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative flex flex-col items-end pr-12 mt-2 w-full">
                        {/* Trail dots */}
                        <div className="flex flex-col items-end gap-1.5 -mt-1 mb-2">
                          <div className="size-3.5 rounded-full bg-white shadow-sm mr-8" />
                          <div className="size-2 rounded-full bg-white/80 shadow-xs mr-4.5" />
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <div className="text-right">
                            <p className="text-xs font-semibold text-mm-dark font-sans">
                              {t.name}
                            </p>
                            <p className="text-xs text-mm-gray font-sans mt-0.5">
                              {t.role}
                            </p>
                          </div>
                          <span
                            className="shrink-0 text-center rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                            style={{ background: "#fff0ec", color: "#FF5924" }}
                          >
                            {t.result}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Section heading */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
            className="mb-14 sm:mb-20 text-center leading-tight"
            style={{
              fontFamily: "'Louize', Georgia, serif",
              fontSize: "clamp(2.5rem, 7vw, 6rem)",
              letterSpacing: "-0.03em",
              color: "white",
              fontWeight: 400,
            }}
          >
            Real results.
            <br />
            Real businesses.
          </motion.h2>

          {/* More bubbles below heading */}
          <div className="flex flex-col gap-12 sm:gap-14 w-full">
            {BUBBLE_TESTIMONIALS.slice(3, 5).map((t, i) => {
              const globalIndex = i + 3;
              const isLeft = globalIndex % 2 === 0;
              const floatConfigs = [
                { y: [0, -8, 0] as number[], duration: 3.6, delay: 0.8 },
                { y: [0, -11, 0] as number[], duration: 5, delay: 0.3 },
              ];
              const fc = floatConfigs[i % floatConfigs.length];
              return (
                <motion.div
                  key={globalIndex}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.6, delay: t.delay }}
                  className={`w-full max-w-[460px] ${isLeft ? "self-end" : "self-start"}`}
                >
                  <motion.div
                    animate={{ y: fc.y }}
                    transition={{
                      duration: fc.duration,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: fc.delay,
                    }}
                    style={{ willChange: "transform" }}
                    className="w-full"
                  >
                    {/* Speech bubble box */}
                    <div
                      className="relative rounded-4xl bg-white px-5 sm:px-6 py-4 sm:py-5"
                      style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}
                    >
                      <p className="text-sm leading-relaxed md:text-base text-left font-sans text-mm-dark">
                        &ldquo;{t.text}&rdquo;
                      </p>
                    </div>

                    {/* Speech bubble trail and metadata */}
                    {isLeft ? (
                      <div className="relative flex flex-col items-start pl-12 mt-2 w-full">
                        {/* Trail dots */}
                        <div className="flex flex-col items-start gap-1.5 -mt-1 mb-2">
                          <div className="size-3.5 rounded-full bg-white shadow-sm ml-8" />
                          <div className="size-2 rounded-full bg-white/80 shadow-xs ml-4.5" />
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center gap-3">
                          <div className="text-left">
                            <p className="text-xs font-semibold text-mm-dark font-sans">
                              {t.name}
                            </p>
                            <p className="text-xs text-mm-gray font-sans mt-0.5">
                              {t.role}
                            </p>
                          </div>
                          <span
                            className="shrink-0 text-center rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                            style={{ background: "#fff0ec", color: "#FF5924" }}
                          >
                            {t.result}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative flex flex-col items-end pr-12 mt-2 w-full">
                        {/* Trail dots */}
                        <div className="flex flex-col items-end gap-1.5 -mt-1 mb-2">
                          <div className="size-3.5 rounded-full bg-white shadow-sm mr-8" />
                          <div className="size-2 rounded-full bg-white/80 shadow-xs mr-4.5" />
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <div className="text-right">
                            <p className="text-xs font-semibold text-mm-dark font-sans">
                              {t.name}
                            </p>
                            <p className="text-xs text-mm-gray font-sans mt-0.5">
                              {t.role}
                            </p>
                          </div>
                          <span
                            className="shrink-0 text-center rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                            style={{ background: "#fff0ec", color: "#FF5924" }}
                          >
                            {t.result}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 2. DESKTOP INTERACTIVE GRAPH VIEWPORT (>= md) */}
        <div
          className="hidden md:block w-full h-[800px] select-none cursor-grab active:cursor-grabbing relative"
          onMouseDown={handleGraphMouseDown}
          onTouchStart={handleGraphTouchStart}
        >
          {/* Background canvas connections web */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          {/* Tilted / Panned graph layout wrapper */}
          <div
            ref={graphWrapperRef}
            className="absolute inset-0 pointer-events-none will-change-transform"
            style={{ transformOrigin: "0 0" }}
          >
            {testimonials.map((card, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={card.id}
                  style={{
                    position: "absolute",
                    left: `${card.x}px`,
                    top: `${card.y}px`,
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "auto",
                    zIndex: isActive ? 40 : 10,
                  }}
                  onClick={(e) => handleCardClick(idx, e)}
                >
                  {/* Premium Testimonial Card */}
                  <div
                    className={`w-[230px] sm:w-[285px] rounded-2xl border bg-white border-mm-border shadow-2xl flex flex-col transition-all duration-500 will-change-transform ${
                      isActive
                        ? "ring-1 ring-mm-orange border-mm-orange/40 scale-115 md:scale-150 shadow-[0_15px_45px_rgba(255,89,36,0.12)]"
                        : "opacity-60 scale-90 saturate-50 hover:opacity-90"
                    }`}
                  >
                    {/* Large Project Image - Flush with top card boundary */}
                    <div className="w-full aspect-16/10 overflow-hidden rounded-t-2xl bg-[#f0f2f5] border-b border-black/5 relative">
                      <img
                        src={card.imagePath}
                        alt={card.businessName}
                        className="w-full h-full object-cover select-none pointer-events-none"
                        style={{
                          objectFit: "cover",
                          height: "100%",
                        }}
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Card Details & Quote Body - Inner padding applied here */}
                    <div className="p-4 flex flex-col gap-3">
                      {/* Meta details */}
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm sm:text-base text-mm-orange tracking-tight leading-none font-sans">
                            {card.businessName}
                          </span>
                          <span className="flex items-center gap-0.5 text-[10px] text-mm-gray font-bold uppercase tracking-wider font-sans">
                            {card.name}
                            <BadgeCheck className="h-3 w-3 text-mm-orange shrink-0" />
                          </span>
                        </div>
                        <span className="text-xs text-mm-dark/60 font-medium leading-tight mt-1 font-sans">
                          {card.projectDescription}
                        </span>
                      </div>

                      {/* 2-line Review Text */}
                      <p className="text-mm-dark/85 text-xs sm:text-sm italic leading-relaxed line-clamp-2 font-sans">
                        "{card.text}"
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Control Pad Controller */}
          <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 z-20 flex flex-col items-center gap-1">
            <span className="text-[9px] uppercase font-extrabold tracking-widest text-mm-dark/40 leading-none">
              Tracking HUD
            </span>
            <div
              ref={controllerRef}
              className="relative w-[160px] h-[100px] rounded-2xl bg-white/50 border border-black/5 backdrop-blur-lg shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing"
              onMouseDown={handleControllerMouseDown}
              onTouchStart={handleControllerTouchStart}
            >
              {/* Inner Grid & Guides */}
              <div className="absolute inset-1.5 rounded-[10px] border border-dashed border-mm-dark/10 pointer-events-none flex items-center justify-center">
                <div className="absolute w-[95%] h-px bg-mm-dark/5" />
                <div className="absolute h-[90%] w-px bg-mm-dark/5" />
              </div>

              {/* Mini Testimonial Node Markers on the pad */}
              {testimonials.map((node, idx) => {
                const nodePctX = (node.x - centerX) / rangeX;
                const nodePctY = (node.y - centerY) / rangeY;
                const isActive = idx === activeIndex;
                return (
                  <div
                    key={node.id}
                    className={`absolute size-1.5 rounded-full transition-all duration-300 pointer-events-none ${
                      isActive
                        ? "bg-mm-orange scale-150 shadow-[0_0_6px_rgba(255,89,36,0.6)]"
                        : "bg-mm-dark/20"
                    }`}
                    style={{
                      transform: `translate3d(${nodePctX * 70}px, ${nodePctY * 40}px, 0)`,
                    }}
                  />
                );
              })}

              {/* Draggable Tracking Ball */}
              <div
                className="absolute size-6 rounded-full bg-mm-orange hover:bg-mm-pink shadow-[0_0_12px_rgba(255,89,36,0.5)] flex items-center justify-center pointer-events-none transition-colors duration-200"
                style={{
                  transform: `translate3d(${ballPos.x}px, ${ballPos.y}px, 0)`,
                }}
              >
                <div className="size-2 rounded-full bg-white opacity-90" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
