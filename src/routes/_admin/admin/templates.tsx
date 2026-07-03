import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/admin/shared";

export const Route = createFileRoute("/_admin/admin/templates")({
  component: () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "var(--color-heading)" }}>Templates</h1>
      <Card><p style={{ color: "var(--color-body)" }}>Templates module — coming soon.</p></Card>
    </div>
  ),
});
