import React, { useState, useEffect } from "react";
import { createFileRoute, Outlet, useNavigate, useParams, useLocation } from "@tanstack/react-router";
import ChatNav from "../../../components/client/ChatNav";
import { StreamChat } from "stream-chat";
import { getClientStreamCredentialsFn } from "@/lib/server-functions";
import { useBusiness } from "@/hooks/use-business";

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
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [loading, setLoading] = useState(true);

  const businessId = activeBusiness?.id || "";

  useEffect(() => {
    let clientInstance: StreamChat | null = null;
    let isSubscribed = true;

    async function initStream() {
      if (!businessId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const creds = await getClientStreamCredentialsFn({ data: businessId });
        if (!isSubscribed) return;

        clientInstance = StreamChat.getInstance(creds.apiKey);
        await clientInstance.connectUser(
          { id: creds.uid, name: creds.name },
          creds.token
        );
        
        if (isSubscribed) {
          setChatClient(clientInstance);
        }
      } catch (err) {
        console.error("Failed to initialize Stream client:", err);
        if (isSubscribed) {
          setChatClient(null);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    initStream();

    return () => {
      isSubscribed = false;
      if (clientInstance) {
        clientInstance.disconnectUser();
      }
    };
  }, [businessId]);

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
