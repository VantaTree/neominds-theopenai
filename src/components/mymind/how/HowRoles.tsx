import { motion } from "framer-motion";

interface BulletItem {
  text: string;
  url: string;
}

interface RoleData {
  id: string;
  badge: string;
  title: string;
  description: string;
  loveTitle?: string;
  loveBullets: BulletItem[];
  image: string;
  bgVar: string;
  textVar: string;
  isDark: boolean;
  shadowClass: "ui-block" | "ui-block-light";
}

const ROLES_DATA: RoleData[] = [
  {
    id: "designers",
    badge: "FOR DESIGNERS",
    title: "Your moodboard & visual inspiration",
    description: "Designers use mymind to collect visual inspiration, save their favorite online resources and generate moodboards on the fly within seconds.",
    loveTitle: "WHY DESIGNERS LOVE IT",
    loveBullets: [
      { text: "Generate moodboards in seconds", url: "/videos#same-vibe" },
      { text: "Search images by color", url: "/videos#saving-images" },
      { text: "Save favorite colors & color palettes", url: "/videos#save-colors" },
      { text: "Easily save visual references with one click", url: "https://www.youtube.com/watch?v=c-mHnkDWQwQ" },
    ],
    image: "/images/how/01.png",
    bgVar: "var(--color-mm-role-designers-bg)",
    textVar: "#ffffff",
    isDark: true,
    shadowClass: "ui-block",
  },
  {
    id: "writers",
    badge: "FOR WRITERS",
    title: "Distraction free writing & ideation.",
    description: "Writers use mymind to take notes, free-write drafts, save text highlights from the web and collect inspiration for their next big article or award winning ad.",
    loveTitle: "WHY WRITERS LOVE IT",
    loveBullets: [
      { text: "Quick & effortless note taking", url: "https://www.youtube.com/watch?v=5_H41A9_5do" },
      { text: "Beautiful focused writing in focus mode", url: "https://www.youtube.com/watch?v=5_H41A9_5do" },
      { text: "Save writing references with one click", url: "/videos#save-anything-with-one-click" },
      { text: "Collect highlights & inspiration", url: "https://www.youtube.com/watch?v=4J666uPWKa0" },
    ],
    image: "/images/how/02.png",
    bgVar: "var(--color-mm-role-writers-bg)",
    textVar: "var(--color-mm-role-text-dark)",
    isDark: false,
    shadowClass: "ui-block-light",
  },
  {
    id: "marketers",
    badge: "FOR MARKETERS",
    title: "A marketers swipe-file.",
    description: "Every marketer should keep a swipe file with inspiration and best practices for copywriting, sales or campaign strategy. mymind is exactly that.",
    loveTitle: "WHY MARKETERS LOVE IT",
    loveBullets: [
      { text: "One-click saving of visual references", url: "/videos#save-anything-with-one-click" },
      { text: "OCR text recognition for finding text in visuals", url: "/videos#search" },
      { text: "Contextual notes & todos for swipe files", url: "/videos#notes" },
      { text: "Collect highlights & inspiration", url: "/videos#save-anything-with-one-click" },
    ],
    image: "/images/how/03.png",
    bgVar: "var(--color-mm-role-marketers-bg)",
    textVar: "var(--color-mm-role-text-dark)",
    isDark: false,
    shadowClass: "ui-block-light",
  },
  {
    id: "developers",
    badge: "FOR DEVELOPERS",
    title: "Inspiration and resource hub.",
    description: "Developers use mymind to bookmark and organize their go-to resources. Keep all your code snippets in one place. Easy to find when you need them.",
    loveTitle: "WHY DEVELOPERS LOVE IT",
    loveBullets: [
      { text: "Quick & effortless markdown note taking", url: "/videos#notes" },
      { text: "Keep track of todos", url: "/videos#notes" },
      { text: "Easy save & recall of code snippets", url: "/videos#save-anything-with-one-click" },
      { text: "Collect inspiration & resource material", url: "/videos#save-anything-with-one-click" },
    ],
    image: "/images/how/04.png",
    bgVar: "var(--color-mm-role-developers-bg)",
    textVar: "#ffffff",
    isDark: true,
    shadowClass: "ui-block",
  },
  {
    id: "researchers",
    badge: "FOR RESEARCHERS",
    title: "Your private knowledge-base.",
    description: "Researchers use mymind to collect data and find unexpected connections between bits of information. From web clippings, PDFs to articles and research papers.",
    loveTitle: "WHY RESEARCHERS LOVE IT",
    loveBullets: [
      { text: "Easy to add contextual notes to material", url: "/videos#notes" },
      { text: "Reading Mode for articles & research papers", url: "/videos#reading-mode" },
      { text: "Text highlights & OCR text recognition", url: "/videos#search" },
      { text: "Collect PDFs and research papers", url: "/videos#save-anything-with-one-click" },
    ],
    image: "/images/how/05.png",
    bgVar: "var(--color-mm-role-researchers-bg)",
    textVar: "var(--color-mm-role-text-green)",
    isDark: false,
    shadowClass: "ui-block-light",
  },
  {
    id: "everyone",
    badge: "FOR EVERYONE",
    title: "An extension for your mind.",
    description: "Use it for your recipes. Your meme collection. Your poems. Your reading list. Your vision board. Your to-do list. Or all of the above. mymind has no rules.",
    loveBullets: [],
    image: "/images/how/06.png",
    bgVar: "var(--color-mm-role-everyone-bg)",
    textVar: "var(--color-mm-role-text-purple)",
    isDark: false,
    shadowClass: "ui-block-light",
  },
];

export default function HowRoles() {
  return (
    <section id="section_ce931ac9e" className="w-full py-16 md:py-24 bg-[var(--color-mm-bg-gray)]">
      {/* Intro Header */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center mb-20 md:mb-28">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-xs font-semibold uppercase tracking-[0.22em]"
          style={{ color: "#FF5924" }}
        >
          MYMIND IS MADE FOR
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="font-serif text-[2.222rem] leading-[2.444rem] tracking-[-0.022em] md:text-[2.667rem] md:leading-[2.889rem] lg:text-[4.333rem] lg:leading-[4.722rem]"
          style={{ color: "var(--color-mm-charcoal)" }}
        >
          Designers, writers, marketers, researchers, developers and visual minds of all kind.
        </motion.h2>
      </div>

      {/* Roles Grid / Rows */}
      <div className="mx-auto max-w-[1370px] w-[95vw] px-4 sm:px-6">
        <div className="flex flex-col gap-12 md:gap-16">
          {ROLES_DATA.map((role) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-[18px] items-stretch"
              style={{
                backgroundColor: role.bgVar,
                color: role.textVar,
              }}
            >
              {/* Text Side */}
              <div className="col-span-1 md:col-span-7 xl:col-span-6 flex flex-col justify-center px-8 py-12 md:py-16 lg:pl-28 lg:pr-12">
                {/* Badge Tag */}
                <div
                  className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider border mb-6 w-fit select-none"
                  style={{
                    borderColor: role.isDark ? "rgba(255,255,255,0.3)" : "rgba(35,42,53,0.2)",
                    color: role.textVar,
                  }}
                >
                  {role.badge}
                </div>

                {/* Title */}
                <h3 className="font-serif text-[2rem] md:text-[2.222rem] leading-[2.222rem] md:leading-[2.444rem] tracking-[-0.022em] mb-6">
                  {role.title}
                </h3>

                {/* Description */}
                <p
                  className="font-sans text-sm md:text-[0.889rem] leading-[1.333rem] mb-8 max-w-lg"
                  style={{ opacity: 0.85 }}
                >
                  {role.description}
                </p>

                {/* Interactive Sub-Bullets */}
                {role.loveBullets.length > 0 && (
                  <div className="space-y-4">
                    {role.loveTitle && (
                      <h4
                        className="text-[0.778rem] font-semibold tracking-wider font-sans mb-3"
                        style={{
                          color: role.isDark ? "var(--color-mm-muted-gray)" : "inherit",
                          opacity: role.isDark ? 1 : 0.6,
                        }}
                      >
                        {role.loveTitle}
                      </h4>
                    )}
                    <ul className="space-y-3 font-sans text-sm">
                      {role.loveBullets.map((bullet) => (
                        <li key={bullet.text} className="flex items-start gap-2.5">
                          <span
                            className="mt-2 w-1.5 h-1.5 rounded-full shrink-0"
                            style={{
                              backgroundColor: role.textVar,
                              opacity: 0.5,
                            }}
                          />
                          <a
                            href={bullet.url}
                            target={bullet.url.startsWith("http") ? "_blank" : "_self"}
                            rel="noopener noreferrer"
                            className="hover:underline transition-all underline-offset-4"
                            style={{
                              color: role.isDark ? "var(--color-mm-muted-gray)" : "inherit",
                              opacity: role.isDark ? 1 : 0.9,
                            }}
                          >
                            {bullet.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Image Side */}
              <div className="col-span-1 md:col-span-5 xl:col-span-6 flex items-center justify-end relative h-fit md:h-auto overflow-hidden self-center md:self-stretch">
                <img
                  src={role.image}
                  alt={role.title}
                  draggable={false}
                  className={`w-full h-full object-cover object-left max-h-[400px] md:max-h-none select-none ${
                    role.shadowClass === "ui-block"
                      ? "rounded-t-2xl md:rounded-l-2xl md:rounded-r-none shadow-2xl border-l border-t border-[rgba(255,255,255,0.08)]"
                      : "rounded-t-2xl md:rounded-l-2xl md:rounded-r-none shadow-md border-l border-t border-[rgba(0,0,0,0.04)]"
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
