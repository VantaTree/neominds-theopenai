import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";

interface UseCase {
  label: string;
  headline: string;
  headlineItalic?: string;
  image: string;
  color: string;
}

const USE_CASES: UseCase[] = [
  {
    label: "Healthcare",
    headline: "Helping healthcare providers attract more patients,",
    headlineItalic: " and build a trusted digital presence.",
    image: "/images/healthcare.jpeg",
    color: "#FF5924",
  },
  {
    label: "Education",
    headline:
      "Helping schools, Montessori institutions, and learning centers increase admissions,",
    headlineItalic: " and grow with AI-powered digital solutions",
    image: "/images/education.png",
    color: "#FF7DD3",
  },
  {
    label: "Hospitality",
    headline: "Hospitality brands increase reservations,",
    headlineItalic: " strengthen their online reputation",
    image: "/images/hospitality.jpeg",
    color: "#85D3FF",
  },
  {
    label: "Food Industry",
    headline:
      "Empowering food businesses , food manufacturers, cloud kitchens,",
    headlineItalic: " and gourmet food companies",
    image: "/images/kunafa.jpeg",
    color: "#5CB13E",
  },
  {
    label: "Restaurants",
    headline: "Helping restaurants, cafés, hotels,",
    headlineItalic: " automate guest engagement.",
    image: "/images/food.png",
    color: "#FFE926",
  },
  {
    label: "Finance & Investments",
    headline: "Helping financial advisors, investment firms ",
    headlineItalic: "generate qualified leads, strengthen client relationships",
    image: "/images/client_work.jpeg",
    color: "#FF6866",
  },
];

export function MymindUseCases() {
  const [active, setActive] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);

  // Programmatically scroll the tab container to center the active tab on mobile/small screens
  useEffect(() => {
    const container = tabsContainerRef.current;
    if (container) {
      const buttons = container.querySelectorAll("button");
      const activeTab = buttons[active];
      if (activeTab) {
        const containerRect = container.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();
        const targetScrollLeft =
          container.scrollLeft +
          (tabRect.left - containerRect.left) -
          containerRect.width / 2 +
          tabRect.width / 2;

        container.scrollTo({
          left: targetScrollLeft,
          behavior: "smooth",
        });
      }
    }
  }, [active]);

  // Sync active state index with Embla selection changes
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setActive(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  // Auto-play interval that automatically resets/restarts whenever the active index changes
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4500); // switch every 4.5 seconds

    return () => clearInterval(interval);
  }, [emblaApi, active]);

  return (
    <section
      className="w-full overflow-x-hidden bg-white py-20 md:py-28"
      id="use-cases"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 sm:mb-12 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "#FF5924" }}
          >
            USE CASES
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="leading-tight"
            style={{
              fontFamily: "'Louize', Georgia, serif",
              fontSize: "clamp(1.7rem, 3.5vw, 3rem)",
              letterSpacing: "-0.03em",
              color: "#000",
              fontWeight: 400,
            }}
          >
            For every kind of business.
          </motion.h2>
        </div>

        {/* Tab selector */}
        <div
          ref={tabsContainerRef}
          className="mb-8 sm:mb-10 overflow-x-hidden scrollbar-none border-b select-none"
          style={{ borderColor: "#F0F0F0" }}
        >
          <div
            className="flex gap-6 sm:gap-8 pb-px justify-start md:justify-center"
            style={{ minWidth: "max-content" }}
          >
            {USE_CASES.map((uc, i) => (
              <motion.button
                key={uc.label}
                onClick={() => emblaApi?.scrollTo(i)}
                whileHover={{ backgroundColor: "rgba(0,0,0,0.04)" }}
                className="shrink-0 relative pb-4 text-base sm:text-lg font-semibold transition-colors duration-300 cursor-pointer rounded-sm"
                style={{
                  color: active === i ? "#FF5924" : "#748297",
                  fontFamily: "'Inter', sans-serif",
                  minHeight: 44,
                }}
              >
                {uc.label}
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-[#FF5924] transition-all duration-300"
                  style={{ width: active === i ? "30px" : "0px" }}
                />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Sliding Main Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {USE_CASES.map((uc, i) => (
              <div key={i} className="flex-[0_0_100%] min-w-0 px-1">
                <div
                  className="relative w-full h-[320px] sm:h-[450px] md:h-[500px] overflow-hidden rounded-2xl shadow-xl flex items-center justify-center bg-[#f8f9fa] cursor-grab active:cursor-grabbing select-none border border-[#E2E6EE]"
                  style={{
                    background: uc.color + "18",
                  }}
                >
                  {/* Headline overlay */}
                  <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 sm:p-8 md:p-12 bg-linear-to-t from-white/95 via-white/40 to-transparent">
                    <p
                      className="text-xs font-semibold uppercase tracking-widest mb-2 sm:mb-3"
                      style={{ color: uc.color }}
                    >
                      Built for {uc.label}
                    </p>
                    <h3
                      className="max-w-lg leading-tight"
                      style={{
                        fontFamily: "'Louize', Georgia, serif",
                        fontSize: "clamp(1.3rem, 3vw, 2.25rem)",
                        letterSpacing: "-0.02em",
                        color: "#000",
                        fontWeight: 400,
                      }}
                    >
                      {uc.headline}
                      {uc.headlineItalic && (
                        <em style={{ fontStyle: "italic" }}>
                          {uc.headlineItalic}
                        </em>
                      )}
                    </h3>
                  </div>

                  <img
                    src={uc.image}
                    alt={uc.label}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-90"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="mt-8 flex justify-center gap-2">
          {USE_CASES.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className="h-2 rounded-full transition-all duration-300 cursor-pointer"
              style={{
                width: active === i ? 24 : 8,
                background: active === i ? "#FF5924" : "#E2E6EE",
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
