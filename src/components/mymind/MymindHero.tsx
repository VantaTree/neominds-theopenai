import { motion } from "framer-motion";
import { useLightbox } from "./LightboxContext";
import { MymindIntroVideo } from "./MymindIntroVideo";
import { Link } from "@tanstack/react-router";

const KEYWORD_PILLS = [
  { label: "website", color: "#FF5924", textColor: "#FF5924" },
  { label: "CRM", color: "#a78bfa", textColor: "#7c3aed" },
  { label: "SEO", color: "#FF7DD3", textColor: "#d946a8" },
  { label: "Analytics", color: "#a78bfa", textColor: "#7c3aed" },
  { label: "AI Automation", color: "#fb923c", textColor: "#ea580c" },
  { label: "Marketing", color: "#FFE926", textColor: "#ca8a04" },
];

const DESKTOP_VIDEO = "/videos/intro-desktop.mp4";
const IPHONE_VIDEO = "/videos/intro-iphone.mp4";
const IPHONE_MOCKUP = "/images/iphone-video-mockup.webp";

export function MymindHero() {
  const { openLightbox } = useLightbox();

  return (
    <section className="relative flex w-full flex-col items-center justify-center overflow-hidden pt-16 sm:pt-20">
      {/* Content */}
      <div className="relative text-6xl sm:text-7xl md:text-8xl lg:text-9xl z-10 mx-auto w-full text-wrap px-4 sm:px-6 lg:pt-8 pt-12 sm:pt-16 text-center">
        {/* Headline */}
        <h1
          className="mb-8 sm:mb-10 leading-[1.05]"
          style={{
            fontFamily: "'Louize', Georgia, serif",
            // fontSize: "clamp(2.8rem, 7rem)",
            letterSpacing: "-0.03em",
            color: "#111418",
            fontWeight: 400,
            willChange: "transform, opacity",
          }}
        >
          <div style={{ overflow: "hidden", paddingBottom: "0.15em", marginBottom: "-0.15em" }}>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Affordable Digital growth,
            </motion.span>
          </div>
          <div style={{ overflow: "hidden", paddingBottom: "0.15em", marginBottom: "-0.15em" }}>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
            >
              Built for your Business
            </motion.span>
          </div>
        </h1>

        {/* Subheadline with tagged pills */}
        {/* <div
          className="mx-auto mb-8 sm:mb-10 max-w-xl"
          style={{
            color: "#4A5465",
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(1rem, 2vw, 1.15rem)",
            lineHeight: 1.7,
          }}
        >
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span>Your</span>
            {KEYWORD_PILLS.slice(0, 4).map((pill, i) => (
              <motion.span
                key={pill.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.06 }}
                className="inline-flex items-center rounded-full border px-3 py-0.5 text-sm font-medium"
                style={{
                  borderColor: pill.color,
                  color: pill.textColor,
                  background: "rgba(255,255,255,0.7)",
                }}
              >
                {pill.label}
              </motion.span>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 mt-1">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="inline-flex items-center rounded-full border px-3 py-0.5 text-sm font-medium"
              style={{
                borderColor: KEYWORD_PILLS[3].color,
                color: KEYWORD_PILLS[3].textColor,
                background: "rgba(255,255,255,0.7)",
              }}
            >
              {KEYWORD_PILLS[4].label}
            </motion.span>
            <span>and</span>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.56 }}
              className="inline-flex items-center rounded-full border px-3 py-0.5 text-sm font-medium"
              style={{
                borderColor: KEYWORD_PILLS[4].color,
                color: KEYWORD_PILLS[4].textColor,
                background: "rgba(255,255,255,0.7)",
              }}
            >
              {KEYWORD_PILLS[5].label}
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              managed by us $29.99/month.
            </motion.span>
          </div>
        </div> */}

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-5"
          style={{ willChange: "transform, opacity" }}
        >
          <motion.div
            whileHover={{
              scale: 1.05,
              boxShadow: "0 8px 30px rgba(255,89,36,0.35)",
            }}
            className="flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white"
            style={{ background: "#FF5924" }}
          >
            <Link to="/assessment">Know your Business</Link>
          </motion.div>
        </motion.div>
      </div>

      <div className="mb-6"></div>

      {/* <MymindIntroVideo /> */}
    </section>
  );
}
