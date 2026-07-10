import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import lottie from "lottie-web";

gsap.registerPlugin(ScrollTrigger);

export default function HowHero() {
  const lottieContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lottieContainerRef.current) return;

    // Load Lottie animation
    const anim = lottie.loadAnimation({
      container: lottieContainerRef.current,
      renderer: "svg",
      loop: false,
      autoplay: false,
      path: "/images/how/Animation-No-Loop.json",
    });

    let st: ScrollTrigger | null = null;

    anim.addEventListener("DOMLoaded", () => {
      const totalFrames = anim.totalFrames;

      // Bind Lottie frames to ScrollTrigger progress
      st = ScrollTrigger.create({
        trigger: lottieContainerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          const targetFrame = Math.round(self.progress * (totalFrames - 1));
          anim.goToAndStop(targetFrame, true);
        },
      });
    });

    return () => {
      anim.destroy();
      if (st) st.kill();
    };
  }, []);

  return (
    <section
      id="section_9258ce189"
      className="w-full pt-28 pb-12 bg-[var(--color-mm-bg-gray)] bg-no-repeat bg-scroll"
      style={{
        backgroundImage: "url('/images/how/How-Background-Larger.webp')",
        backgroundPosition: "50% 0%",
      }}
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          {/* Intro Heading Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-12 w-full max-w-3xl"
          >
            <img
              src="/images/how/How-Intro.png"
              alt="How it works intro"
              className="mx-auto h-auto w-full object-contain"
              draggable={false}
            />
          </motion.div>

          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="mb-16 max-w-2xl text-center font-serif text-[2.222rem] leading-[2.444rem] tracking-[-0.044em] md:text-[2.667rem] md:leading-[2.889rem]"
            style={{ color: "var(--color-mm-charcoal)" }}
          >
            <p className="mb-8">
              There’s a lot of magic and some artificial intelligence inside, but let’s keep it simple for the time being...
            </p>
            <p>
              Everytime you find something you want to remember, you just save it to mymind.
            </p>
          </motion.div>

          {/* Lottie Animation Holder */}
          <div className="w-full max-w-4xl mx-auto overflow-hidden">
            <div
              ref={lottieContainerRef}
              className="w-full aspect-[4/3] max-w-[1440px] mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
