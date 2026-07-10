import { motion } from "framer-motion";

export default function WhyHero() {
  return (
    <section
      id="section_f658v0dm2"
      className="w-full flex justify-center items-center py-20 md:py-28 bg-[var(--color-mm-bg-gray)] bg-no-repeat bg-scroll"
      style={{
        backgroundImage: "url('/images/why/Why-Background-Larger-New-Three.webp')",
        backgroundPosition: "50% 0%",
      }}
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex flex-col items-center">
          {/* Intro Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-12 w-full max-w-2xl"
          >
            <img
              src="/images/why/Why-Intro.png"
              alt="Everything we do starts with this question."
              className="mx-auto h-auto w-full object-contain"
              draggable={false}
            />
          </motion.div>

          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mb-12 max-w-2xl font-serif text-[2.222rem] leading-[2.444rem] tracking-[-0.044em] md:text-[2.667rem] md:leading-[2.889rem]"
            style={{ color: "var(--color-mm-charcoal)" }}
          >
            <p className="mb-8">
              Everything we do starts with this question.
            </p>
            <p className="mb-8">
              Why should mymind exist? Why should anyone care to use it? Why is privacy so important to us?
            </p>
            <p>
              Eventually, the “why” led us to the because.
            </p>
          </motion.div>

          {/* Intro Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="w-10 h-10 flex items-center justify-center"
          >
            <img
              src="/images/why/Why-Icon-1.svg"
              alt="Intro icon"
              className="h-auto w-full"
              draggable={false}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
