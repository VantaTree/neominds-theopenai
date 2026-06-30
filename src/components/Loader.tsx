import React from "react";
import { Activity } from "lucide-react";

interface LoaderProps {
  statusText: string;
  elapsedTime: number;
  progress: number;
  showProgress?: boolean;
}

export default function Loader({ statusText, elapsedTime, progress, showProgress = true }: LoaderProps) {
  // Format seconds as M:SS (e.g., 0:00, 1:24)
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainSecs = secs % 60;
    return `${mins}:${remainSecs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-2xl text-center space-y-6 px-4 animate-fadeIn">
      {/* CSS injected directly for custom keyframe support */}
      <style>{`
        @keyframes loadingShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer-bar {
          position: relative;
          overflow: hidden;
        }
        .shimmer-bar::after {
          content: '';
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          animation: loadingShimmer 1.5s infinite;
        }
      `}</style>

      {/* Top Badge: AI Analyzer Active */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-mm-pink/30 bg-mm-pink/5 px-4 py-1.5 text-[10px] font-bold tracking-wider text-mm-pink uppercase select-none animate-pulse">
          <Activity className="h-3.5 w-3.5" />
          AI Analyzer Active
        </div>
      </div>

      {/* Main Title & Description */}
      <div className="space-y-4 max-w-xl mx-auto">
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-mm-dark leading-tight">
          Running Deep Audit
        </h1>
        <p className="text-sm sm:text-base text-mm-gray font-normal leading-relaxed">
          The agent crew is executing discovery lookups and competitor benchmarks. This process takes approximately 3-4 minutes.
        </p>
      </div>

      {/* Loading Status & Timer Container */}
      <div className="w-full max-w-md mx-auto pt-4 space-y-3">
        <div className="flex justify-between items-center text-xs font-bold font-sans">
          <span className="text-mm-red tracking-wide animate-pulse">
            {statusText}
          </span>
          <span className="text-mm-dark/80 font-mono tracking-wider">
            {formatTime(elapsedTime)}
          </span>
        </div>

        {/* Shimmer flat progress bar */}
        {showProgress && (
          <div className="w-full bg-mm-subtle h-1 rounded-full overflow-hidden">
            <div
              className="shimmer-bar bg-mm-red h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
