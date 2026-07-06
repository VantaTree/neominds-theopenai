import React from "react";
import { Link } from "@tanstack/react-router";
import { Settings, Crown } from "lucide-react";

export default function ClientMobileNav() {
  return (
    <nav className="w-full h-15 bg-[#F9FAFC] px-5 flex items-center justify-between z-10 shrink-0 select-none">

      <div className="flex items-center gap-2">
              <img
                src="/logos/logo.PNG"
                alt="theopenai logo"
                style={{ height: "32px", width: "auto", display: "block" }}
              />
      </div>


      <div className="flex items-center gap-3">
        <button className="p-1.5 text-mm-gray hover:text-mm-dark cursor-pointer transition-colors">
          <Settings className="h-4.5 w-4.5" />
        </button>
        <button className="h-7.5 w-7.5 rounded-lg bg-mm-orange/10 border border-mm-orange/20 flex items-center justify-center text-mm-orange cursor-pointer transition-all active:scale-95">
          <Crown className="h-4 w-4 fill-mm-orange/10" />
        </button>
      </div>
    </nav>
  );
}
