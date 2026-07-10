import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Configuration for playing video/gif:
// - "onhover": video starts playing when the card is hovered, and pauses/resets when unhovered
// - "auto": video autoplays on load and loops continuously
const VIDEO_PLAY_MODE: "onhover" | "auto" = "onhover";

interface FeatureItem {
  img?: string;
  video?: string;
  title: string;
  body: string;
  narrow?: boolean;
  bg?: string;
}

const ROWS: [FeatureItem, FeatureItem][] = [
  [
    {
      // img: "/images/seo.png",
      video: "/videos/seo.mp4",
      title: "SEO",
      body: "Reach more people without paying for every click. Smart SEO helps your business generate long-term traffic and consistent inquiries.",
      narrow: true,
      bg: "#f3f0e7",
    },
    {
      // img: "/images/Website.png",
      video: "/videos/website.mp4",
      title: "Websites",
      body: "Build a professional website that earns trust, generates leads, and becomes the foundation of your digital presence.",
      bg: "#e5eaf2",
    },
  ],
  [
    {
      // img: "/images/posts_reels.png",
      video:"/videos/content_creation.mp4",
      title: "Content Creation (Reels & Posts)",
      body: "Consistent content keeps your business in front of customers. We create social media content that informs, engages, and converts.  ",
      bg: "#dde9d3",
    },
    {
      // img: "/images/business_profile.png",
      video: "/videos/Google_business.mp4",
      title: "Google Business Profile",
      body: "Build a complete business profile to boost your online business.",
      narrow: true,
      bg: "#f4ecef",
    },
  ],
  [
    {
      // img: "/images/marketing.png",
      video: "/videos/optimisation.mp4",
      title: "Social Media Optimization",
      body: "Grow your brand with optimized social profiles, engaging content, and strategies that attract the right audience.",
      narrow: true,
      bg: "#ffece5",
    },
    {
      // img: "/images/VoiceBot.png",
      video: "/videos/chatbot.mp4",
      title: "Chat & Voice Bot",
      body: "Provide 24/7 voice support, qualify leads, and book appointments automatically through AI-powered voice technology.",
      bg: "#f3f0e7",
    },
  ],
  [
    {
      // img: "/images/onground.png",
      video: "/videos/ongroundshoot.mp4",
      title: "On-Ground Shoot",
      body: " Stand out with a modern 3D website that combines stunning visuals, smooth interactions, and responsive performance.",
      bg: "#e5eaf2",
    },
    {
      // img: "/images/3d-Images.png",
      video: "/videos/3d_website.mp4",
      title: "3D  WEBSITES",
      body: "Create immersive 3D experiences that make your business unforgettable and keep visitors engaged.",
      narrow: true,
      bg: "#f4ecef",
    },
  ],
];

function FeatureCard({
  img,
  video,
  title,
  body,
  narrow,
  delay = 0,
  bg = "#F0F2F5",
}: FeatureItem & { delay?: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!videoRef.current || !video) return;

    if (VIDEO_PLAY_MODE === "auto") {
      videoRef.current.play().catch((err) => {
        console.warn("Video autoplay was interrupted or failed:", err);
      });
    } else if (VIDEO_PLAY_MODE === "onhover") {
      if (isHovered) {
        videoRef.current.play().catch((err) => {
          console.warn("Video play was interrupted or failed:", err);
        });
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered, video]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay }}
      whileHover={{ y: -6, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group overflow-hidden rounded-2xl ${narrow ? "flex-5" : "flex-7"}`}
      style={{
        background: bg,
        minWidth: 0,
        willChange: "transform, opacity",
      }}
    >
      <div className="p-4 sm:p-5 pb-0">
        <div className="overflow-hidden rounded-xl">
          {video ? (
            <video
              ref={videoRef}
              src={video}
              muted
              loop
              playsInline
              preload="auto"
              autoPlay={VIDEO_PLAY_MODE === "auto"}
              className="w-full h-auto block object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <img
              src={img}
              alt={title}
              loading="lazy"
              className="w-full h-auto block object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
              }}
            />
          )}
        </div>
      </div>
      <div className="p-4 sm:p-5 pt-3 sm:pt-4">
        <h3
          className="mb-2 leading-snug"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)",
            letterSpacing: "-0.03em",
            color: "#111418",
          }}
        >
          {title}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "#748297", fontFamily: "'Inter', sans-serif" }}
        >
          {body}
        </p>
      </div>
    </motion.div>
  );
}

export function MymindFeatures() {
  const emailVideoRef = useRef<HTMLVideoElement>(null);
  const [isEmailHovered, setIsEmailHovered] = useState(false);

  useEffect(() => {
    if (!emailVideoRef.current) return;

    if (VIDEO_PLAY_MODE === "auto") {
      emailVideoRef.current.play().catch((err) => {
        console.warn("Email video autoplay failed:", err);
      });
    } else if (VIDEO_PLAY_MODE === "onhover") {
      if (isEmailHovered) {
        emailVideoRef.current.play().catch((err) => {
          console.warn("Email video play was interrupted or failed:", err);
        });
      } else {
        emailVideoRef.current.pause();
        emailVideoRef.current.currentTime = 0;
      }
    }
  }, [isEmailHovered]);

  return (
    <section
      className="w-full overflow-x-hidden py-20 md:py-28"
      id="features"
      style={{ background: "linear-gradient(to bottom, #FF5924, #ffffff)" }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 sm:mb-16 text-center">
          {/* <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="mb-5 text-xs font-semibold uppercase tracking-[0.22em]"
            style={{ color: "#FF5924" }}
          >
            EVERYTHING YOU NEED
          </motion.p> */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto max-w-3xl leading-tight"
            style={{
              fontFamily: "'Louize', Georgia, serif",
              fontSize: "clamp(2rem, 5vw, 4.5rem)",
              letterSpacing: "-0.03em",
              color: "#111418",
              fontWeight: 400,
            }}
          >
             Our Features
          </motion.h2>
        </div>

        {/* Rows 0–1 */}
        <div className="flex flex-col gap-5 mb-5">
          {ROWS.slice(0, 2).map((row, ri) => (
            <div key={ri} className="flex flex-col sm:flex-row gap-5">
              <FeatureCard {...row[0]} delay={0} />
              <FeatureCard {...row[1]} delay={0.07} />
            </div>
          ))}
        </div>

        {/* Unlimited edits — full-width dark card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.01 }}
          onMouseEnter={() => setIsEmailHovered(true)}
          onMouseLeave={() => setIsEmailHovered(false)}
          className="group mb-5 overflow-x-hidden overflow-hidden rounded-2xl"
          style={{ background: "#24272D" }}
        >
          <div className="relative overflow-hidden" style={{ minHeight: 280 }}>
            <video
              ref={emailVideoRef}
              src="/videos/Email_Marketing.mp4"
              muted
              loop
              playsInline
              preload="auto"
              autoPlay={VIDEO_PLAY_MODE === "auto"}
              className="absolute right-0 top-0 h-full w-auto object-cover object-right opacity-20 sm:opacity-100 transition-transform duration-500 group-hover:scale-[1.02]"
              style={{ maxWidth: "40%" }}
            />
            <div
              className="relative z-10 flex flex-col justify-center p-8 sm:p-10"
              style={{ maxWidth: 480 }}
            >
              <div
                className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 w-max"
                style={{ background: "#FF5924" }}
              >
                <span className="text-xs font-bold text-white uppercase tracking-widest">
                  24hr turnaround
                </span>
              </div>
              <h3
                className="mb-3 leading-tight"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)",
                  letterSpacing: "-0.03em",
                  color: "#ffffff",
                }}
              >
                Email Marketing
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                From promotions to newsletters, email marketing helps turn interest into long-term loyalty
              </p>
            </div>
          </div>
        </motion.div>

        {/* Rows 2–3 */}
        <div className="flex flex-col gap-5">
          {ROWS.slice(2).map((row, ri) => (
            <div key={ri} className="flex flex-col sm:flex-row gap-5">
              <FeatureCard {...row[0]} delay={0} />
              <FeatureCard {...row[1]} delay={0.07} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
