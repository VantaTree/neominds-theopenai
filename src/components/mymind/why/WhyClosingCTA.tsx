import { motion } from "framer-motion";

export default function WhyClosingCTA() {
  return (
    <section
      id="section_e92940848"
      className="w-full py-20 md:py-32 bg-[var(--color-mm-bg-gray)] flex justify-center"
    >
      <div className="mx-auto max-w-4xl px-6 sm:px-8 text-center flex flex-col items-center">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-8 w-16 h-16 flex items-center justify-center"
        >
          <img
            src="/images/why/Closing-Icon.svg"
            alt="Closing Icon"
            className="h-auto w-full"
            draggable={false}
          />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-12 font-serif text-[2.222rem] leading-[2.444rem] tracking-[-0.044em] md:text-[3.6rem] md:leading-[4rem] lg:text-[4.444rem] lg:leading-[4.889rem]"
          style={{ color: "var(--color-mm-charcoal)" }}
        >
          We’re trying to do something different with mymind.
          <br />
          <br />
          It’s a refreshing approach to remembering the things you deeply care
          about.
        </motion.h2>

        {/* Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.a
            href="https://access.mymind.com/signin"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block rounded-full bg-[var(--color-mm-orange)] text-white px-8 py-3.5 text-xs font-semibold tracking-[0.044em] transition-colors duration-200 hover:bg-black"
          >
            CREATE YOUR NEW MIND
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
