import React from "react";
import { Crown } from "lucide-react";

export default function UpgradeCard() {
  return (
    <div className="bg-[#FFFDF8] border border-amber-200 rounded-3xl p-6.5 flex flex-col md:flex-row justify-between items-center text-center md:text-left min-h-[380px] md:min-h-0 md:py-6 md:px-8 shadow-[0_8px_30px_rgba(245,158,11,0.03)] relative overflow-hidden select-none hover:shadow-[0_12px_40px_rgba(245,158,11,0.06)] transition-all duration-300">
      
      {/* Background radial soft light */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,211,0,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="flex-1 flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start space-y-5 md:space-y-0 md:space-x-5 relative z-10">
        {/* Crown Badge */}
        <div className="h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-[0_4px_20px_rgba(245,158,11,0.1)] shrink-0">
          <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
            <Crown className="h-5 w-5 text-amber-600 fill-amber-500/20" />
          </div>
        </div>
        
        {/* Content text */}
        <div className="space-y-1">
          <h3 className="text-[17px] font-black text-mm-dark leading-tight tracking-tight max-w-[180px] md:max-w-none mx-auto md:mx-0">
            Unlock More Powerful Features
          </h3>
          <p className="text-xs text-mm-gray leading-relaxed max-w-[220px] md:max-w-none mx-auto md:mx-0">
            Upgrade your plan to access automation, advanced insights and more.
          </p>
        </div>
      </div>

      {/* Upgrade Button */}
      <button className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-3 px-6 rounded-2xl shadow-sm transition-all active:scale-95 cursor-pointer relative z-10 shrink-0 md:ml-4">
        <Crown className="h-4 w-4 fill-white text-amber-500" />
        <span>Upgrade</span>
      </button>

    </div>
  );
}
