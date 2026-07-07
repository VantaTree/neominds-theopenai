import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import ClientDashboardDesktop from "@/components/client/ClientDashboardDesktop";
import ClientDashboardMobile from "@/components/client/ClientDashboardMobile";

export const Route = createFileRoute("/_client/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) {
    return <ClientDashboardMobile />;
  }

  return <ClientDashboardDesktop />;
}
