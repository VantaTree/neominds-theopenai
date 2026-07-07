import React from "react";

export function AdminLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8 space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-mm-subtle"></div>
        <div className="absolute inset-0 rounded-full border-4 border-mm-orange border-t-transparent animate-spin"></div>
      </div>
      <span className="text-sm font-semibold tracking-wide" style={{ color: "var(--color-mm-gray)" }}>
        Loading Admin Dashboard...
      </span>
    </div>
  );
}
