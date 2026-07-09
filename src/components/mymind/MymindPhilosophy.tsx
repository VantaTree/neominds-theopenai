import { motion } from "framer-motion";

export function MymindPhilosophy() {
  return (
    <section
      className="w-full overflow-x-hidden pt-20 pb-0 md:pt-28 lg:pt-36"
      style={{ background: "#FFF5F0" }}
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

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
      </div>
    </section>
  );
}
