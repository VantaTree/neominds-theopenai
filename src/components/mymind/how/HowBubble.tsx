import { motion } from "framer-motion";

export default function HowBubble() {
  return (
    <section
      id="section_3d8471afc"
      className="w-full py-16 md:py-24 bg-[var(--color-mm-bg-gray)]"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex flex-col items-center">
          {/* Animated Bubble Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-12 w-full max-w-2xl"
          >
            <img
              src="/images/how/Bubble.png"
              alt="Magical categorization bubble"
              className="mx-auto h-auto w-full object-contain"
              draggable={false}
            />
          </motion.div>

          {/* Description Text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="max-w-2xl font-serif text-[2.222rem] leading-[2.444rem] tracking-[-0.044em] md:text-[2.667rem] md:leading-[2.889rem]"
            style={{ color: "var(--color-mm-charcoal)" }}
          >
            <p className="mb-8">
              Yes! No need to waste time categorizing or organizing anything, your new mind magically does it all for you.
            </p>
            <p>
              This way you can immediately find what you need later with a simple search.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
