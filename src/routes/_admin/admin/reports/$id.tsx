import { createFileRoute, Link } from "@tanstack/react-router";
import { getReportFn } from "@/lib/server-functions";
import ReportComponent from "@/components/Report";
import { AdminLoader } from "@/components/AdminLoader";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/reports/$id")({
  head: () => ({ meta: [{ title: "Report Details — GrowConsult AI" }] }),
  loader: async ({ params }) => {
    try {
      const report = await getReportFn({ data: params.id });
      return { report };
    } catch (err) {
      console.error("Loader failed to fetch report detail:", err);
      return { report: null };
    }
  },
  pendingComponent: AdminLoader,
  pendingMs: 0,
  component: ReportDetailPage,
});

function ReportDetailPage() {
  const { report } = Route.useLoaderData();

  if (!report) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-mm-dark">Report not found</h2>
        <Link
          to="/admin/reports"
          className="text-mm-orange hover:underline text-xs mt-2 inline-block"
        >
          Back to Reports List
        </Link>
      </div>
    );
  }

  const businessIdStr =
    typeof report.businessId === "object" && report.businessId !== null
      ? (report.businessId as any).id
      : report.businessId;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/reports"
          className="p-2 bg-white border border-mm-border hover:bg-mm-subtle/50 rounded-xl transition-all cursor-pointer text-mm-dark"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <div className="text-xs text-mm-gray">
            <Link to="/admin/reports" className="hover:underline">
              Reports
            </Link>{" "}
            / {report.id}
          </div>
          <h1 className="text-xl font-bold mt-1 text-mm-dark">
            {report.title}
          </h1>
        </div>
      </div>

      <div className="bg-white border border-mm-border rounded-[24px] p-6 shadow-xs">
        <ReportComponent
          initialData={report.data as any}
          businessId={businessIdStr || undefined}
          isAdmin={true}
        />
      </div>
    </div>
  );
}
