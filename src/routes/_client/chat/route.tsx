import React from "react";
import { createFileRoute, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import ChatNav from "../../../components/client/ChatNav";

export const Route = createFileRoute("/_client/chat")({
  component: RouteComponent,
});

function RouteComponent() {
  const { domain } = useParams({ strict: false });
  const navigate = useNavigate();

  const handleSelectChat = (id: string) => {
    navigate({
      to: "/chat/$domain",
      params: { domain: id },
    });
  };

  return (
    <div className="flex-1 w-full h-full flex overflow-hidden bg-[#F9FAFC] font-sans">
      <div className={`${domain ? "hidden md:block" : "block"} w-full md:w-[350px] lg:w-[380px] h-full shrink-0`}>
        <ChatNav activeChatId={domain} onSelectChat={handleSelectChat} />
      </div>

      <div className={`${domain ? "block" : "hidden md:flex"} flex-1 h-full flex flex-col min-w-0 bg-[#F8F9FA] relative`}>
        <Outlet />
      </div>
    </div>
  );
}
