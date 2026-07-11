import { motion } from "framer-motion";

export default function WhyNotDifferent() {
  return (
    <section
      id="section_qb5u2sf29"
      className="w-full py-16 md:py-24 bg-[var(--color-mm-bg-gray)] flex justify-center"
    >
      <div className="mx-auto max-w-3xl px-6 sm:px-8 text-center flex flex-col items-center">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="mb-8 font-serif text-[1.778rem] leading-[2rem] tracking-[-0.044em] md:text-[2.222rem] md:leading-[2.444rem]"
          style={{ color: "var(--color-mm-charcoal)" }}
        >
         Because Business Has Changed.
        </motion.h2>

        {/* Content Paragraphs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12 text-justify text-sm leading-[1.556rem] md:text-base md:leading-[1.889rem]"
          style={{ color: "var(--color-mm-charcoal)" }}
        >
          <p className="mb-6 font-sans tracking-[-0.011em]">
            In today's digital world, having a business is not enough. If people can't find you online, they can't choose you. 
          </p>
          <p className="font-sans tracking-[-0.011em]">
            Many businesses still rely on methods that worked years ago, such as word of mouth, printed marketing, walk-in customers, and manual follow-ups. While these approaches still have value, they are no longer enough on their own.
          </p>
        </motion.div>

        {/* Section divider label */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-6 text-xs font-semibold uppercase tracking-[0.22em]"
          style={{ color: "var(--color-mm-gray)" }}
        >
          {/* MORE ON HOW WE THINK */}
        </motion.p>

        {/* Links Cards */}
        {/* <div className="w-full max-w-lg flex flex-col gap-3">
          {[
            {
              title: "How did we end up creating mymind?",
              url: "https://mymind.com/an-extension-for-your-real-mind-where-it-all-began",
            },
            {
              title: "How can we build an extension of your mind?",
              url: "https://mymind.com/how-can-we-build-an-extension-of-your-mind",
            },
          ].map((item, i) => (
            <motion.a
              key={item.title}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="flex items-center rounded-full bg-white px-6 py-3.5 transition-all duration-200"
              style={{
                boxShadow: "4px 4px 33px rgba(116, 130, 151, 0.13)",
              }}
            >
              <img
                src="/images/why/more-book-new.svg"
                alt="Book icon"
                className="mr-3 h-6 w-6 flex-shrink-0"
                draggable={false}
              />
              <span
                className="text-left font-sans text-sm md:text-base font-medium tracking-[-0.011em] text-[var(--color-mm-gray)] transition-colors duration-200 hover:text-[var(--color-mm-orange)]"
              >
                {item.title}
              </span>
            </motion.a>
          ))}
        </div> */}
      </div>
    </section>
  );
}
