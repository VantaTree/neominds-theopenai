import { motion } from "framer-motion";

export default function WhyInvisible() {
  return (
    <section
      id="section_bepwks68k"
      className="w-full pt-16 pb-10 md:pt-24 md:pb-12 bg-[var(--color-mm-bg-gray)] flex justify-center"
    >
      <div className="mx-auto max-w-3xl px-6 sm:px-8 text-center flex flex-col items-center">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-8 w-10 h-10 flex items-center justify-center"
        >
          {/* <img
            src="/images/why/Why-Icon-5.svg"
            alt="Software should be invisible icon"
            className="h-auto w-full"
            draggable={false}
          /> */}
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 font-serif text-[1.778rem] leading-[2rem] tracking-[-0.011em] md:text-[2.222rem] md:leading-[2.444rem] md:tracking-[-0.044em]"
          style={{ color: "var(--color-mm-charcoal)" }}
        >
          The Story Behind the BusinessBuddy
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center font-sans text-sm md:text-base leading-[1.556rem] md:leading-[1.889rem] tracking-[-0.011em]"
          style={{ color: "var(--color-mm-charcoal)" }}
        >
           Realities that inspired us to rethink how businesses grow.
        </motion.p>
      </div>
    </section>
  );
}
