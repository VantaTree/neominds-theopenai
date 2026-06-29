import {
  Globe,
  Instagram,
  Film,
  MessageSquare,
  Search,
  Mail,
  Camera,
  Handshake,
  Sparkles,
  Megaphone,
} from "lucide-react";

export interface ConveyerItem {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export const conveyerItems: ConveyerItem[] = [
  { id: "website", label: "Website", Icon: Globe },
  { id: "insta_post", label: "Insta Post", Icon: Instagram },
  { id: "insta_reel", label: "Insta Reel", Icon: Film },
  { id: "chatbot", label: "Chatbot", Icon: MessageSquare },
  { id: "seo", label: "SEO", Icon: Search },
  { id: "email", label: "Email Marketing", Icon: Mail },
  { id: "shoots", label: "Shoots", Icon: Camera },
  { id: "collabs", label: "Collabs", Icon: Handshake },
  { id: "expos", label: "Expos", Icon: Sparkles },
  { id: "paid_ads", label: "Paid Ads", Icon: Megaphone },
];
