import { useState } from "react";
import FeatureConveyer from "./FeatureConveyer";
import { conveyerItems } from "./conveyerData";

const itemImages: Record<string, string> = {
  website: "/images/plus_website.png",
  insta_post: "/images/basic_posts.png",
  insta_reel: "/images/plus_posts.png",
  chatbot: "/images/basic_chatbot.png",
  seo: "/images/basic_seo.png",
  email: "/images/email_marketing.png",
  shoots: "/images/pro_3d.png",
  collabs: "/images/pro_social.png",
  expos: "/images/pro_voice.png",
  paid_ads: "/images/pro_ads.png",
};

const itemDescriptions: Record<
  string,
  { title: string; desc: string; color: string }
> = {
  website: {
    title: "Custom Website",
    desc: "A stunning, responsive, custom-designed conversion machine built for your business.",
    color: "#FF5924",
  },
  insta_post: {
    title: "Instagram Grid Content",
    desc: "Scroll-stopping grid posts and visuals tailored to your unique brand identity.",
    color: "#FF7DD3",
  },
  insta_reel: {
    title: "Instagram Reels",
    desc: "Highly engaging video shorts and reels designed to captivate and expand your reach.",
    color: "#85D3FF",
  },
  chatbot: {
    title: "AI Chat Assistant",
    desc: "24/7 smart assistant to answer client questions and capture leads instantly.",
    color: "#5CB13E",
  },
  seo: {
    title: "Search Engine Optimization",
    desc: "Dominate Google search results and local maps to ensure customers find you first.",
    color: "#FFE926",
  },
  email: {
    title: "Email Marketing Campaigns",
    desc: "Automated newsletter flows and follow-ups to turn prospects into loyal clients.",
    color: "#FF6866",
  },
  shoots: {
    title: "Professional Shoots",
    desc: "On-site commercial photography and videography to capture your business in action.",
    color: "#FF5924",
  },
  collabs: {
    title: "Brand Partnerships",
    desc: "Strategic collaborations with local creators and complementary brands.",
    color: "#FF7DD3",
  },
  expos: {
    title: "Event Expos & Displays",
    desc: "Stunning pop-up banners, display designs, and booth layouts for local events.",
    color: "#85D3FF",
  },
  paid_ads: {
    title: "Paid Advertising",
    desc: "Targeted campaigns on Meta, Google, and TikTok to scale your client acquisition.",
    color: "#5CB13E",
  },
};

export default function FeatureProjector() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = conveyerItems[activeIndex];
  const activeData = itemDescriptions[activeItem?.id] || {
    title: "Grow Your Business",
    desc: "Fully managed digital presence.",
    color: "#FF5924",
  };

  const activeImg = itemImages[activeItem?.id] || "/images/plus_website.png";

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto select-none overflow-visible py-4 px-4 font-sans">
      {/* Vintage Screen Styles */}
      <style>{`
        @keyframes film-flicker {
          0%, 100% { opacity: 0.94; transform: scale(1) rotate(0deg); }
          25% { opacity: 0.88; transform: scale(1.002) rotate(0.05deg) translate(0.5px, -0.5px); }
          50% { opacity: 0.96; transform: scale(0.998) rotate(-0.05deg) translate(-0.5px, 0.5px); }
          75% { opacity: 0.90; transform: scale(1.001) rotate(0.02deg) translate(0.5px, 0.5px); }
        }

        @keyframes scratch-vertical-1 {
          0% { transform: translateY(-100%); opacity: 0.2; }
          100% { transform: translateY(100%); opacity: 0.2; }
        }

        @keyframes scratch-vertical-2 {
          0% { transform: translateY(-100%); opacity: 0; }
          40% { transform: translateY(-100%); opacity: 0.3; }
          90% { transform: translateY(100%); opacity: 0.3; }
          100% { transform: translateY(100%); opacity: 0; }
        }

        .vintage-projection {
          overflow: hidden;
          filter: sepia(0.35) contrast(1.1) brightness(0.9);
          animation: film-flicker 0.12s infinite;
          background-color: #1a1a1a;
          box-shadow: inset 0 0 40px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.15);
        }

        .vintage-projection::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, transparent 40%, rgba(0, 0, 0, 0.6) 100%);
          z-index: 10;
          pointer-events: none;
        }

        /* simulated film grain */
        .vintage-grain {
          position: absolute;
          inset: 0;
          opacity: 0.04;
          background-image: repeating-radial-gradient(circle, #fff, #fff 1px, transparent 1px, transparent 4px);
          z-index: 8;
          pointer-events: none;
        }

        .scratch-line-1 {
          animation: scratch-vertical-1 0.6s infinite linear;
        }

        .scratch-line-2 {
          animation: scratch-vertical-2 0.4s infinite linear;
          animation-delay: 0.15s;
        }
      `}</style>

      {/* 1. HTML Projection Screen (placed in normal document flow, responsive) */}
      <div className="relative w-full max-w-3xl aspect-16/10 overflow-hidden vintage-projection flex items-center justify-center rounded-lg border-4 border-mm-dark shadow-2xl z-10">
        {/* Active Feature Image */}
        <img
          src={activeImg}
          alt={activeData.title}
          className="w-full h-full object-cover transition-opacity duration-300 opacity-80"
        />

        {/* Film Grain Layer */}
        <div className="vintage-grain" />

        {/* Film Scratches and Dust */}
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {/* Left scratch line */}
          <div className="absolute w-px h-full bg-white/20 left-[30%] scratch-line-1" />
          {/* Center scratch line */}
          <div className="absolute w-[1.5px] h-[60%] bg-black/40 left-[55%] scratch-line-2" />
          {/* Right scratch line */}
          <div
            className="absolute w-[0.5px] h-[80%] bg-white/15 left-[78%] scratch-line-1"
            style={{ animationDelay: "0.3s" }}
          />
        </div>

        {/* Retro lens flare center highlight */}
        <div className="absolute inset-0 bg-radial from-white/10 to-transparent pointer-events-none z-10 mix-blend-screen" />
      </div>

      {/* 2. Film Slide Title/Caption Box (placed below screen in document flow) */}
      <div className="w-full text-center mt-6 mb-4 px-4 z-20 pointer-events-none">
        <div className="flex items-center justify-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0 animate-pulse"
            style={{ backgroundColor: activeData.color }}
          />
          <h4 className="text-xs font-bold text-mm-dark tracking-widest uppercase">
            {activeData.title}
          </h4>
        </div>
        <p className="text-sm text-mm-gray mt-1.5 font-medium max-w-xl mx-auto">
          {activeData.desc}
        </p>
      </div>

      {/* 3. Projector & Conveyor Assembly (placed below caption in document flow) */}
      <div className="w-full relative -mt-20">
        <FeatureConveyer onActiveItemChange={setActiveIndex} />
      </div>
    </div>
  );
}
