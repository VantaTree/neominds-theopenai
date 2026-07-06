import React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Home, Folder, Building2, User } from "lucide-react";

export default function ClientBottomLinks() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-mm-border h-16 flex items-center justify-around select-none font-sans">
      {/* Home */}
      <Link
        to="/dashboard"
        className={`flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors ${
          location.pathname === "/dashboard" ? "text-mm-orange" : "text-mm-gray hover:text-mm-dark"
        }`}
      >
        <Home className="h-4.5 w-4.5" />
        <span className="text-[10px] font-black tracking-wide">Home</span>
      </Link>

      {/* Projects */}
      <Link
        to="/projects"
        className={`flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors ${
          location.pathname === "/projects" ? "text-mm-orange" : "text-mm-gray hover:text-mm-dark"
        }`}
      >
        <Folder className="h-4.5 w-4.5" />
        <span className="text-[10px] font-extrabold tracking-wide">Projects</span>
      </Link>

      {/* Our Business */}
      <button
        disabled
        className="flex flex-col items-center justify-center space-y-1 text-mm-gray/40 cursor-not-allowed"
      >
        <Building2 className="h-4.5 w-4.5" />
        <span className="text-[10px] font-extrabold tracking-wide">Our Business</span>
      </button>

      {/* Profile */}
      <button className="flex flex-col items-center justify-center space-y-1 text-mm-gray hover:text-mm-dark cursor-pointer">
        <User className="h-4.5 w-4.5" />
        <span className="text-[10px] font-extrabold tracking-wide">Profile</span>
      </button>
    </div>
  );
}
