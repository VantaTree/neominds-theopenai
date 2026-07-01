import { motion } from "framer-motion";

const downloads = [
  {
    name: "iOS",
    logo: "/images/why/Astore.svg",
    action: "GET APP",
    url: "https://apps.apple.com/us/app/mymind-extend-your-mind/id1520332347",
  },
  {
    name: "Android",
    logo: "/images/why/PStore.svg",
    action: "GET APP",
    url: "https://play.google.com/store/apps/details?id=com.mymind.access&hl=en_US",
  },
  {
    name: "Chrome",
    logo: "/images/why/Google-Chrome.svg",
    action: "INSTALL",
    url: "https://chrome.google.com/webstore/detail/mymind-%E2%80%94-an-extension-for/nmgcefdhjpjefhgcpocffdlibknajbmj",
  },
  {
    name: "Edge",
    logo: "/images/why/Explorer.svg",
    action: "INSTALL",
    url: "https://chrome.google.com/webstore/detail/mymind-%E2%80%94-an-extension-for/nmgcefdhjpjefhgcpocffdlibknajbmj",
  },
  {
    name: "Safari",
    logo: "/images/why/Safari.svg",
    action: "INSTALL",
    url: "https://apps.apple.com/us/app/mymind-extend-your-mind/id1532801185?mt=12",
  },
];

export default function WhyDownloads() {
  return (
    <section
      id="section_9101686fd"
      className="hidden md:block w-full py-16 md:py-24 bg-[var(--color-mm-bg-gray)]"
    >
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <div className="grid grid-cols-5 items-stretch justify-center">
          {downloads.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`flex flex-col items-center justify-between text-center px-4 py-8 ${
                index < downloads.length - 1
                  ? "border-r border-[var(--color-mm-border-light)]"
                  : ""
              }`}
            >
              {/* Logo */}
              <div className="mb-6 h-12 w-12 flex items-center justify-center">
                <img
                  src={item.logo}
                  alt={`${item.name} logo`}
                  className="h-auto w-full max-h-full object-contain"
                  draggable={false}
                />
              </div>

              {/* Title */}
              <h3
                className="mb-4 font-serif text-[1.5rem] md:text-[1.778rem] leading-[1.667rem] tracking-[-0.072em]"
                style={{ color: "var(--color-mm-charcoal)" }}
              >
                {item.name}
              </h3>

              {/* Link button */}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-[0.888rem] font-semibold tracking-[0.022em] text-[var(--color-mm-orange)] hover:text-black transition-colors duration-200"
              >
                {item.action}
              </a>
            </motion.div>
          ))}
        </div>

        {/* Footer info link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <a
            href="https://mymind.helpscoutdocs.com/article/97-install-browser-extension"
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-[0.778rem] leading-[1.556rem] tracking-[0.022em] text-[var(--color-mm-gray)] hover:opacity-75 transition-opacity duration-200"
          >
            Looking for another browser?
          </a>
        </motion.div>
      </div>
    </section>
  );
}
