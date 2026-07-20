import React, { useState, useEffect, useMemo } from "react";
import { createFileRoute, Outlet, useNavigate, useParams, useLocation } from "@tanstack/react-router";
import ChatNav from "../../../components/client/ChatNav";
import { StreamChat } from "stream-chat";
import { useBusiness } from "@/hooks/use-business";
import { useStreamConnection, getCachedClientStreamCredentials } from "@/lib/stream-connection";

export const Route = createFileRoute("/_client/chat")({
  component: RouteComponent,
});

export interface ChatContextType {
  chatClient: StreamChat | null;
  loading: boolean;
}

export const ChatContext = React.createContext<ChatContextType>({
  chatClient: null,
  loading: true,
});

export const useChat = () => React.useContext(ChatContext);

function RouteComponent() {
  const location = useLocation();
  const pathParts = location.pathname.split("/");
  const domain = pathParts[2] || "";
  const navigate = useNavigate();
  const { activeBusiness } = useBusiness();
  const [creds, setCreds] = useState<{ apiKey: string; uid: string; name: string; token: string } | null>(null);
  const [credsLoading, setCredsLoading] = useState(true);

  const businessId = activeBusiness?.id || "";

  useEffect(() => {
    if (!businessId) {
      setCreds(null);
      setCredsLoading(false);
      return;
    }

    let isSubscribed = true;
    setCredsLoading(true);

    getCachedClientStreamCredentials(businessId)
      .then((res) => {
        if (isSubscribed) {
          setCreds(res);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch client Stream credentials:", err);
        if (isSubscribed) {
          setCreds(null);
        }
      })
      .finally(() => {
        if (isSubscribed) {
          setCredsLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [businessId]);

  const connectionOptions = useMemo(() => {
    if (!creds) return null;
    return {
      apiKey: creds.apiKey,
      user: { id: creds.uid, name: creds.name },
      token: creds.token,
    };
  }, [creds]);

  const { client: chatClient, loading: connectionLoading } = useStreamConnection(connectionOptions);

  const loading = credsLoading || connectionLoading;

  const handleSelectChat = (id: string) => {
    navigate({
      to: "/chat/$domain",
      params: { domain: id },
    });
  };

  return (
    <ChatContext.Provider value={{ chatClient, loading }}>
      <div className="flex-1 w-full h-full flex overflow-hidden bg-[#F9FAFC] font-sans">
        <div className={`${domain ? "hidden md:block" : "block"} w-full md:w-[350px] lg:w-[380px] h-full shrink-0`}>
          <ChatNav 
            activeChatId={domain} 
            onSelectChat={handleSelectChat} 
            chatClient={chatClient}
            loading={loading}
          />
        </div>

        <div className={`${domain ? "block" : "hidden md:flex"} flex-1 h-full flex flex-col min-w-0 bg-[#F8F9FA] relative overflow-hidden`}>
          <Outlet />
        </div>
      </div>
    </ChatContext.Provider>
  );
}
