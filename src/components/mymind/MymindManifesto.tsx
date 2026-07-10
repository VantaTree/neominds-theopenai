import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import GradientArc from "../GradientArc";

const NO_LIST = [
  "overpriced websites",
  "growth barriers",
  "unclear priorities",
  "technical headaches",
  "expensive trial & error",
];

export function MymindManifesto() {
  return (
    <>
      {/* ─── Part 1: Manifesto text (white bg) ─── */}
      <section
        className="w-full overflow-x-hidden pt-20 md:pt-28 lg:pt-36 pb-2 md:pb-3"
      // style={{ background: "#fff" }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-justify">
          {/* Label */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center text-lg font-semibold tracking-[0.22em]"
            style={{ color: "#748297" }}
          >
            What is theOpenAI
          </motion.p>

          {/* Body paragraphs */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
            style={{
              fontFamily: "'Louize', Georgia, serif",
              fontSize: "clamp(1.3rem, 2.8vw, 2.2rem)",
              letterSpacing: "-0.02em",
              color: "#1a2035",
              fontWeight: 400,
              lineHeight: 1.45,
            }}
          >
            <p className="mb-10">
              <span
                style={{
                  fontStyle: "italic",
                  fontSize: "clamp(2.5rem, 6vw, 5rem)",
                  lineHeight: 0.9,
                  float: "left",
                  marginRight: "0.1em",
                  marginTop: "0.05em",
                }}
              >
                We
              </span>{" "}
              analyze your business through AI agents, providing you with digital services from website development to digital marketing and AI Automation by experts at a very affordable price
            </p>

            <p className="mb-5 ">
              our platform is dedicated to help startups, local to medium businesses, and growing enterprises to establish a powerful online presence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Part 2: NO list on peach/orange gradient ─── */}
      <section
        className="w-full overflow-x-hidden py-20 md:py-12"
      // style={{
      //   background: `
      //     radial-gradient(ellipse 70% 90% at 15% 60%, rgba(255, 200, 170, 0.9) 0%, transparent 65%),
      //     radial-gradient(ellipse 60% 80% at 85% 40%, rgba(255, 180, 160, 0.8) 0%, transparent 60%),
      //     linear-gradient(160deg, #fff0e8 0%, #ffe8d8 50%, #ffd8c8 100%)
      //   `,
      // }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Large NO list */}
          <div className="flex flex-col items-start w-max mx-auto gap-0">
            {NO_LIST.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  type: "spring",
                  stiffness: 80,
                  damping: 15,
                  delay: i * 0.1,
                }}
                whileHover={{ x: 8 }}
                className="flex items-center gap-3"
              >
                <svg
                  width="74"
                  height="39"
                  viewBox="0 0 74 39"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    flexShrink: 0,
                    width: "clamp(44px, 8vw, 74px)",
                    height: "auto",
                  }}
                >
                  <path
                    d="M31.4439 38V1.36832H24.3139V25.6L9.07222 1.36832H0.185547V38H7.31555V12.0117L23.9522 38H31.4439Z"
                    fill="#FF5924"
                  />
                  <path
                    d="M43.72 19.6583C43.72 11.3917 49.5066 7.46499 55.1383 7.46499C60.8216 7.46499 66.6083 11.3917 66.6083 19.6583C66.6083 27.925 60.8216 31.8517 55.1383 31.8517C49.5066 31.8517 43.72 27.925 43.72 19.6583ZM36.3316 19.71C36.3316 31.49 45.2183 38.775 55.1383 38.775C65.11 38.775 73.9966 31.49 73.9966 19.71C73.9966 7.87832 65.11 0.593323 55.1383 0.593323C45.2183 0.593323 36.3316 7.87832 36.3316 19.71Z"
                    fill="#FF5924"
                  />
                </svg>
                <span
                  style={{
                    fontFamily: "'Louize', Georgia, serif",
                    fontSize: "clamp(2rem, 8vw, 3.5rem)",
                    fontWeight: 400,
                    letterSpacing: "-0.025em",
                    color: "#3A475A",
                    lineHeight: 1.3,
                  }}
                >
                  {item}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Part 3: Welcome to theopenai ─── */}
      <section
        className="relative w-full overflow-x-hidden py-20 md:py-28 lg:py-36"
      // style={{
      //   background: `
      //     radial-gradient(ellipse 65% 85% at 12% 55%, rgba(255, 90, 20, 0.78) 0%, transparent 58%),
      //     radial-gradient(ellipse 65% 85% at 88% 45%, rgba(255, 130, 90, 0.65) 0%, transparent 58%),
      //     radial-gradient(ellipse 50% 60% at 50% 50%, rgba(255, 180, 140, 0.4) 0%, transparent 70%),
      //     linear-gradient(145deg, #ff7840 0%, #ff9060 40%, #ffb090 100%)
      //   `,
      // }}
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          {/* <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src="/images/statement_mymind_guy.svg"
                alt="theopenai"
                className="h-20 w-auto"
                draggable={false}
              />
            </motion.div>
          </motion.div> */}

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <h2
              className="mb-4"
              style={{
                fontFamily: "'Louize', Georgia, serif",
                fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
                letterSpacing: "-0.03em",
                color: "#fff",
                fontWeight: 400,
                lineHeight: 1.05,
              }}
            >
              Welcome to <em>theOpenAI</em>
            </h2>
            <p
              className="mb-1 md:mb-8"
              style={{
                fontFamily: "'Louize', Georgia, serif",
                fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)",
                color: "rgba(255,255,255,0.85)",
                fontStyle: "italic",
                letterSpacing: "-0.02em",
              }}
            >
              Analyze, Execute, Grow
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 flex justify-center"
          >
            <Link
              to="/assessment"
              className="inline-flex items-center gap-3 rounded-full px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{
                background: "#FF5924",
                border: "1.5px solid rgba(255,255,255,0.3)",
                minHeight: 44,
              }}
            >
              Know your Business
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>
      <div className="pb-20 md:pb-20"></div>
    </>
  );
}
