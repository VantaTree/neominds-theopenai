import { createFileRoute } from "@tanstack/react-router";
import ClientDashboardDesktop from "@/components/client/ClientDashboard";

export const Route = createFileRoute("/_client/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return <ClientDashboardDesktop />;
}
