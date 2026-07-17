import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_client/add")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
