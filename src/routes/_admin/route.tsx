import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/shared";
import { QueryClientProvider } from "@tanstack/react-query";

export const Route = createFileRoute("/_admin")({
  component: RouteComponent,
});

function RouteComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </QueryClientProvider>
  );
}
