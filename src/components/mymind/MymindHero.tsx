import { motion } from "framer-motion";

const KEYWORD_PILLS = [
  { label: "website", color: "#FF5924", textColor: "#FF5924" },
  { label: "CRM", color: "#a78bfa", textColor: "#7c3aed" },
  { label: "SEO", color: "#FF7DD3", textColor: "#d946a8" },
  { label: "Analytics", color: "#a78bfa", textColor: "#7c3aed" },
  { label: "AI Automation", color: "#fb923c", textColor: "#ea580c" },
  { label: "Marketing", color: "#FFE926", textColor: "#ca8a04" },
];

const DASHBOARD_ROWS = [
  { bg: "#fff", h: 56, type: "stat", label: "+47 leads this month", val: "↑ 40%" },
  { bg: "#f3f3f5", h: 44, type: "bar", label: "" },
  { bg: "#fff0ec", h: 44, type: "review", label: "★★★★★  Maria R." },
  { bg: "#f3f3f5", h: 56, type: "stat", label: "Page 1 on Google", val: "90 days" },
  { bg: "#fff", h: 44, type: "bar", label: "" },
  { bg: "#fff0ec", h: 44, type: "review", label: "★★★★★  Steven B." },
  { bg: "#f3f3f5", h: 56, type: "stat", label: "Reviews automated", val: "4.8 ★" },
  { bg: "#fff", h: 44, type: "bar", label: "" },
];

export function MymindHero() {
  return (
    <section
      className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden pt-16 sm:pt-20"
      style={{
        background: `
          radial-gradient(ellipse 55% 80% at 8% 50%, rgba(255, 110, 40, 0.82) 0%, transparent 60%),
          radial-gradient(ellipse 55% 80% at 92% 50%, rgba(255, 155, 125, 0.72) 0%, transparent 60%),
          radial-gradient(ellipse 52% 62% at 50% 48%, #ffffff 0%, rgba(255, 242, 236, 0.96) 42%, transparent 72%),
          linear-gradient(155deg, #ffd4b8 0%, #ffe8d8 35%, #ffc8b4 100%)
        `,
      }}
    >
      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">

        {/* Headline */}
        <h1
          className="mb-8 sm:mb-10 leading-[1.05]"
          style={{
            fontFamily: "'Louize', Georgia, serif",
            fontSize: "clamp(2.8rem, 8vw, 7rem)",
            letterSpacing: "-0.03em",
            color: "#111418",
            fontWeight: 400,
            willChange: "transform, opacity",
          }}
        >
          <div style={{ overflow: "hidden" }}>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              AI finds the problem
            </motion.span>
          </div>
          <div style={{ overflow: "hidden" }}>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
            >
              Experts deliver the solution
            </motion.span>
          </div>
        </h1>

        {/* Subheadline with tagged pills */}
        <div
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
                style={{ borderColor: pill.color, color: pill.textColor, background: "rgba(255,255,255,0.7)" }}
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
              style={{ borderColor: KEYWORD_PILLS[3].color, color: KEYWORD_PILLS[3].textColor, background: "rgba(255,255,255,0.7)" }}
            >
              {KEYWORD_PILLS[4].label}
            </motion.span>
            <span>and</span>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.56 }}
              className="inline-flex items-center rounded-full border px-3 py-0.5 text-sm font-medium"
              style={{ borderColor: KEYWORD_PILLS[4].color, color: KEYWORD_PILLS[4].textColor, background: "rgba(255,255,255,0.7)" }}
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
        </div>

        {/* CTA row */}
        {/* <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-5 mb-4"
          style={{ willChange: "transform, opacity" }}
        >
          <motion.a
            href="#"
            whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(255,89,36,0.35)" }}
            className="flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white"
            style={{ background: "#FF5924" }}
          >
            Get My Free Draft
          </motion.a>
          {[
            { label: "Free. No credit card.", icon: "✓" },
            { label: "Live in 24 hours.", icon: "⚡" },
            { label: "10,000+ sites made", icon: "★" },
          ].map((item) => (
            <motion.span
              key={item.label}
              whileHover={{ scale: 1.04, boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
              className="flex items-center gap-2 rounded-full border bg-white/80 px-4 py-2 text-sm font-medium transition-colors hover:bg-white"
              style={{ color: "#24272D", borderColor: "rgba(0,0,0,0.1)" }}
            >
              <span style={{ color: "#FF5924" }}>{item.icon}</span>
              {item.label}
            </motion.span>
          ))}
        </motion.div> */}
      </div>

      {/* Browser chrome mockup preview */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.8 }}
        className="relative z-10 mx-auto hidden w-full max-w-5xl px-4 sm:px-6 pb-0 sm:block"
      >
        <div
          className="overflow-hidden rounded-t-2xl shadow-2xl"
          style={{ border: "1px solid rgba(0,0,0,0.08)", borderBottom: "none", background: "#f5f5f7" }}
        >
          {/* Browser bar */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ background: "#e8e8ea", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <span className="h-3 w-3 rounded-full" style={{ background: "#FF5F57" }} />
            <span className="h-3 w-3 rounded-full" style={{ background: "#FEBC2E" }} />
            <span className="h-3 w-3 rounded-full" style={{ background: "#28C840" }} />
            <div
              className="mx-auto flex h-6 items-center rounded-md px-4 text-xs"
              style={{ background: "#fff", color: "#748297", minWidth: 200 }}
            >
              theopenai.org
            </div>
            <div className="ml-auto hidden items-center gap-4 text-xs sm:flex" style={{ color: "#748297" }}>
              <span className="font-semibold" style={{ color: "#24272D" }}>Dashboard</span>
              <span>SEO</span>
              <span>CRM</span>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="relative" style={{ height: 260, overflow: "hidden" }}>
            <div className="grid grid-cols-4 gap-2 p-3" style={{ opacity: 0.55 }}>
              {DASHBOARD_ROWS.map((card, i) => (
                <div
                  key={i}
                  className="rounded-xl"
                  style={{ background: card.bg, height: card.h, minHeight: card.h }}
                >
                  {card.type === "stat" && (
                    <div className="flex h-full items-center justify-between p-3">
                      <span className="text-xs leading-relaxed" style={{ color: "#748297", fontFamily: "'Inter', sans-serif" }}>
                        {card.label}
                      </span>
                      <span className="text-xs font-bold" style={{ color: "#FF5924" }}>{card.val}</span>
                    </div>
                  )}
                  {card.type === "review" && (
                    <div className="flex h-full items-center p-3">
                      <span className="text-xs" style={{ color: "#748297", fontFamily: "'Inter', sans-serif" }}>{card.label}</span>
                    </div>
                  )}
                  {card.type === "bar" && (
                    <div className="p-3">
                      <div className="mb-1 h-2 rounded" style={{ background: "#FF5924", width: "70%", opacity: 0.3 }} />
                      <div className="h-2 rounded" style={{ background: "#ddd", width: "50%" }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Fade to white at bottom */}
            <div
              className="absolute inset-x-0 bottom-0"
              style={{ height: 120, background: "linear-gradient(to bottom, transparent, #f5f5f7)" }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
