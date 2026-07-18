import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Globe, Instagram, Video, Zap } from "lucide-react";

export const Route = createFileRoute("/_client/add/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="relative h-screen bg-white text-[#0F172A] flex flex-col items-center justify-start md:justify-center px-4 md:px-6 py-12 md:py-20 font-sans select-none overflow-y-auto">
      {/* Top Left Back Button */}
      <Link
        to="/projects"
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-mm-orange transition-colors cursor-pointer z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Projects</span>
      </Link>

      <div className="w-full max-w-5xl flex flex-col items-center my-auto">
        {/* Logo emblem */}
        <div className="flex items-center justify-center mb-6">
          <img
            src="/logos/logo.PNG"
            alt="theopenai logo"
            className="h-7 w-auto object-contain"
          />
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-2xl md:text-4xl font-extrabold text-center text-[#0F172A] tracking-tight mb-2 max-w-xl">
          What would you like to build today?
        </h1>
        <p className="text-xs md:text-sm font-medium text-gray-500 text-center mb-8 md:mb-12">
          Choose one service.
        </p>

        {/* Cards Grid - 2 columns on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 w-full mb-8 md:mb-12">
          {/* Card 1: Website */}
          <Link
            to="/add/website"
            className="flex flex-col items-start p-4 md:p-6 bg-white border border-gray-200 rounded-[16px] md:rounded-[20px] shadow-xs hover:border-mm-orange hover:ring-2 hover:ring-mm-orange/10 transition-all duration-200 text-left cursor-pointer group"
          >
            <div className="bg-gray-50 border border-gray-100 text-gray-500 rounded-xl p-2.5 md:p-3 mb-3 md:mb-4 shrink-0 transition-colors group-hover:bg-mm-orange/10 group-hover:text-mm-orange group-hover:border-mm-orange/20">
              <Globe className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h3 className="font-bold text-sm md:text-base text-[#0F172A] mb-1 md:mb-1.5 transition-colors group-hover:text-mm-orange">
              Website
            </h3>
            <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed line-clamp-2 md:line-clamp-none">
              Build modern, fast and responsive websites.
            </p>
          </Link>

          {/* Card 2: Instagram Post */}
          <Link
            to="/add/post"
            className="flex flex-col items-start p-4 md:p-6 bg-white border border-gray-200 rounded-[16px] md:rounded-[20px] shadow-xs hover:border-mm-orange hover:ring-2 hover:ring-mm-orange/10 transition-all duration-200 text-left cursor-pointer group"
          >
            <div className="bg-gray-50 border border-gray-100 text-gray-500 rounded-xl p-2.5 md:p-3 mb-3 md:mb-4 shrink-0 transition-colors group-hover:bg-mm-orange/10 group-hover:text-mm-orange group-hover:border-mm-orange/20">
              <Instagram className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h3 className="font-bold text-sm md:text-base text-[#0F172A] mb-1 md:mb-1.5 transition-colors group-hover:text-mm-orange">
              Instagram Post
            </h3>
            <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed line-clamp-2 md:line-clamp-none">
              Create high-converting instagram posts.
            </p>
          </Link>

          {/* Card 3: Instagram Reel */}
          <Link
            to="/chat/$domain"
            params={{ domain: "marketing" }}
            className="flex flex-col items-start p-4 md:p-6 bg-white border border-gray-200 rounded-[16px] md:rounded-[20px] shadow-xs hover:border-mm-orange hover:ring-2 hover:ring-mm-orange/10 transition-all duration-200 text-left cursor-pointer group"
          >
            <div className="bg-gray-50 border border-gray-100 text-gray-500 rounded-xl p-2.5 md:p-3 mb-3 md:mb-4 shrink-0 transition-colors group-hover:bg-mm-orange/10 group-hover:text-mm-orange group-hover:border-mm-orange/20">
              <Video className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h3 className="font-bold text-sm md:text-base text-[#0F172A] mb-1 md:mb-1.5 transition-colors group-hover:text-mm-orange">
              Instagram Reel
            </h3>
            <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed line-clamp-2 md:line-clamp-none">
              Create engaging video reels and scripts.
            </p>
          </Link>

          {/* Card 4: Automations */}
          <Link
            to="/chat/$domain"
            params={{ domain: "automation" }}
            className="flex flex-col items-start p-4 md:p-6 bg-white border border-gray-200 rounded-[16px] md:rounded-[20px] shadow-xs hover:border-mm-orange hover:ring-2 hover:ring-mm-orange/10 transition-all duration-200 text-left cursor-pointer group"
          >
            <div className="bg-gray-50 border border-gray-100 text-gray-500 rounded-xl p-2.5 md:p-3 mb-3 md:mb-4 shrink-0 transition-colors group-hover:bg-mm-orange/10 group-hover:text-mm-orange group-hover:border-mm-orange/20">
              <Zap className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h3 className="font-bold text-sm md:text-base text-[#0F172A] mb-1 md:mb-1.5 transition-colors group-hover:text-mm-orange">
              Automations
            </h3>
            <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed line-clamp-2 md:line-clamp-none">
              Automate workflows and save hours of work.
            </p>
          </Link>
        </div>

        {/* View More Button */}
        {/* <button className="border border-gray-200 text-gray-600 hover:text-mm-orange hover:border-mm-orange bg-white hover:bg-gray-50 font-extrabold text-xs px-6 py-2.5 rounded-full shadow-xs cursor-pointer active:scale-95 transition-all">
          View More
        </button> */}
      </div>
    </div>
  );
}
