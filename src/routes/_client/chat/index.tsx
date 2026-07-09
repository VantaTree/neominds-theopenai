import React from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_client/chat/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center p-8 bg-[#F8F9FA] select-none h-full w-full">
      <div className="w-16 h-16 rounded-full bg-mm-orange/10 flex items-center justify-center text-mm-orange mb-4 shadow-xs animate-pulse">
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h2 className="text-base font-black text-mm-dark">Agency Chat Channels</h2>
      <p className="text-xs text-mm-gray mt-1 max-w-[280px]">
        Select a service channel from the left sidebar to start chatting with your account manager and developers.
      </p>
    </div>
  );
}
