import { motion } from "framer-motion";

interface FeatureItem {
  img: string;
  title: string;
  body: string;
  narrow?: boolean;
}

const ROWS: [FeatureItem, FeatureItem][] = [
  [
    {
      img: "/images/NOTE.png",
      title: "SEO built-in from day one",
      body: "Proper meta tags, schema markup, local signals, and sitemap — all configured and managed monthly. Most clients see movement on Google within 60–90 days.",
      narrow: true,
    },
    {
      img: "/images/BKMRK.webp",
      title: "Smart CRM",
      body: "Every form submission, call, and booking lands in one inbox. No spreadsheets, no sticky notes. Your leads are organized and ready to follow up.",
    },
  ],
  [
    {
      img: "/images/READ.webp",
      title: "Automated review requests",
      body: "Review requests go out automatically after every job. Clients go from 4.2 to 4.8 stars in months — without lifting a finger.",
    },
    {
      img: "/images/COL.webp",
      title: "Integrated calendar",
      body: "No need for Calendly. Your booking calendar lives right on your site. Clients book, you get notified, it syncs automatically.",
      narrow: true,
    },
  ],
  [
    {
      img: "/images/AI.webp",
      title: "Get found on ChatGPT",
      body: "Search discovery across AI agents and platforms. Your business gets surfaced when people ask ChatGPT, Perplexity, and AI-powered search engines for recommendations.",
      narrow: true,
    },
    {
      img: "/images/LNKS.webp",
      title: "Domain & hosting included",
      body: "We handle your domain, hosting, SSL, and uptime. Nothing to set up. Nothing to renew. Everything just works — at $9.99/month, all in.",
    },
  ],
  [
    {
      img: "/images/SEREN.webp",
      title: "Monthly SEO management",
      body: "SEO isn't a one-time setup. We optimize your content monthly, monitor rankings, and adapt your strategy as Google and AI search evolve.",
    },
    {
      img: "/images/TOMFIN.webp",
      title: "Real support. Real humans.",
      body: "Reach us by email, text, or chat. No ticket queues. No waiting on hold. Every edit is done within 24 hours — most the same day.",
      narrow: true,
    },
  ],
];

function FeatureCard({
  img,
  title,
  body,
  narrow,
  delay = 0,
}: FeatureItem & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay }}
      whileHover={{ y: -6, boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
      className={`group overflow-hidden rounded-2xl ${narrow ? "flex-5" : "flex-7"}`}
      style={{
        background: "#F0F2F5",
        minWidth: 0,
        willChange: "transform, opacity",
      }}
    >
      <div className="overflow-hidden">
        <img
          src={img}
          alt={title}
          loading="lazy"
          className="w-full h-auto block object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
          }}
        />
      </div>
      <div className="p-5 sm:p-7">
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
  return (
    <section
      className="w-full overflow-x-hidden py-20 md:py-28"
      id="features"
      style={{ background: "#fff" }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 sm:mb-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="mb-5 text-xs font-semibold uppercase tracking-[0.22em]"
            style={{ color: "#FF5924" }}
          >
            EVERYTHING YOU NEED
          </motion.p>
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
            AI Business Ecosystem
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
          className="mb-5 overflow-x-hidden overflow-hidden rounded-2xl"
          style={{ background: "#24272D" }}
        >
          <div className="relative overflow-hidden" style={{ minHeight: 280 }}>
            <img
              src="/images/mobile-img.webp"
              alt="theopenai on mobile"
              loading="lazy"
              className="absolute right-0 top-0 h-full w-auto object-cover object-right opacity-20 sm:opacity-100"
              style={{ maxWidth: "40%" }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
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
                Unlimited edits, forever
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                New promo, holiday redesign, photo update, business hours change
                — just message us. We handle it within 24 hours. No extra
                charge. Ever.
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
