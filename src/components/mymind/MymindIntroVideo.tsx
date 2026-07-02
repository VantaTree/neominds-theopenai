import { motion } from "framer-motion";
import { useLightbox } from "./LightboxContext";

const DESKTOP_VIDEO = "/videos/intro-desktop.mp4";
const IPHONE_VIDEO = "/videos/intro-iphone.mp4";
const IPHONE_MOCKUP = "/images/iphone-video-mockup.webp";

export function MymindIntroVideo() {
  const { openLightbox } = useLightbox();

  return (
    <section className="w-full overflow-x-hidden pb-16 sm:pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          {/* Desktop video container */}
          <div
            onClick={() => openLightbox("pQZKRf1gF9w")}
            className="relative overflow-hidden rounded-2xl shadow-2xl cursor-pointer group"
            style={{ aspectRatio: "2200 / 1560" }}
          >
            <video
              src={DESKTOP_VIDEO}
              autoPlay
              muted
              playsInline
              loop
              className="h-full w-full object-cover"
              style={{ display: "block" }}
            />

            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 transition-colors duration-300 group-hover:bg-black/10">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition-transform duration-300 group-hover:scale-110"
                style={{
                  background:
                    "linear-gradient(180deg, #FF5924 0%, #FFA86A 100%)",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="white"
                  className="ml-1 h-7 w-7"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
