import { motion } from "framer-motion";

export function MymindPhilosophy() {
  return (
    <section
      className="w-full overflow-x-hidden pt-20 pb-0 md:pt-28 lg:pt-36"
      style={{ background: "#FFF5F0" }}
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="relative mb-8 flex flex-col items-center"
        >
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              width: "min(500px, 80vw)",
              maxWidth: "calc(100% - 32px)",
              height: "min(250px, 40vw)",
              border: "1px solid rgba(0,0,0,0.08)",
              borderBottom: "none",
              borderRadius: "9999px 9999px 0 0",
              top: 40,
            }}
          />
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10"
            style={{ willChange: "transform" }}
          >
            <img
              src="/images/statement_mymind_guy.svg"
              alt="theopenai mascot"
              loading="lazy"
              className="h-auto w-16 sm:w-20 md:w-24"
              draggable={false}
            />
          </motion.div>
        </motion.div> */}

        {/* Founder text */}
        <div
          className="text-center"
          style={{
            fontFamily: "'Louize', Georgia, serif",
            fontSize: "clamp(1.2rem, 2.8vw, 2rem)",
            lineHeight: 1.4,
            letterSpacing: "-0.03em",
            color: "#111418",
          }}
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            Built by <em>Ali Asgar</em> &amp; <em>Mohd Abdul Khadar</em> — we kept meeting
            hardworking business owners renting their customers from platforms, paying agencies
            thousands for a basic website, or stuck on Wix at midnight.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mb-8"
          >
            Led by CEO <em>Syeda Sidra Fatima</em>, theopenai was built from scratch to give
            every business owner their own space online — to tell their story, own their
            customers, and get found on Google and AI search like ChatGPT.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mb-8"
          >
            When you go live, you get a dedicated developer and support team. New form, holiday
            redesign, domain transfer — we handle it. Reach us anytime at{" "}
            <a
              href="mailto:hey@theopenai.org"
              style={{ color: "#FF5924", textDecoration: "none" }}
            >
              hey@theopenai.org
            </a>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.36 }}
            className="mb-12"
          >
            We'd rather you spend less time managing your website, and more time doing what
            makes your business grow.
          </motion.p>
        </div>

        {/* Founder badges */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {["ex-Google engineers", "ex-$1B startup founders", "Chamber of Commerce tech advisors"].map((badge) => (
            <span
              key={badge}
              className="rounded-full px-4 py-2 text-xs font-semibold"
              style={{ background: "#fff0ec", color: "#FF5924", fontFamily: "'Inter', sans-serif" }}
            >
              {badge}
            </span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex justify-center pb-14"
        >
          <a
            href="#"
            className="inline-flex items-center gap-3 rounded-full px-8 sm:px-10 py-3.5 sm:py-4 text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
            style={{ background: "#FF5924", minHeight: 44 }}
          >
            Get my free draft
          </a>
        </motion.div>
      </div>
    </section>
  );
}
