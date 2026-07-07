import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/admin/templates")({
  head: () => ({ meta: [{ title: "Templates — GrowConsult AI" }] }),
  component: () => (
    <div className="space-y-6 font-sans text-mm-dark select-none">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-mm-dark">Templates</h1>
      <div className="bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
        <p className="text-sm font-medium text-mm-gray">Templates module — coming soon.</p>
      </div>
    </div>
  ),
});
