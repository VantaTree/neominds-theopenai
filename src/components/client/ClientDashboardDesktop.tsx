import React from "react";
import ClientNav from "./ClientNav";
import AnalyticsCard from "./AnalyticsCard";
import BusinessTaskCard from "./BusinessTaskCard";
import UpgradeCard from "./UpgradeCard";

export default function ClientDashboardDesktop() {
  return (
    <div className="min-h-screen bg-[#F9FAFC] flex flex-col font-sans">
      {/* Top Header Navigation */}
      <ClientNav />

      {/* Spacer to push content below fixed header */}
      <div className="h-15 shrink-0" />

      {/* Main Content Area */}
      <main className="flex-1 w-full px-6 py-8 md:px-8 md:py-10 space-y-8">

        {/* Analytics Section - 4 Columns */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <AnalyticsCard category="google" />
          <AnalyticsCard category="website" />
          <AnalyticsCard category="social" />
          <AnalyticsCard category="campaign" />
        </section>

        {/* Action / Task Section - 4 Columns */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          {/* Card 1: Website and SEO */}
          <BusinessTaskCard
            name="Website and SEO"
            category="seo"
            progress={80}
            currentTask={{
              title: "On-Page SEO Optimization",
              description: "Optimizing meta tags and content"
            }}
            upcomingTask={{
              title: "Technical SEO Audit",
              description: "Site speed and mobile usability check"
            }}
          />

          {/* Card 2: Marketing */}
          <BusinessTaskCard
            name="Marketing"
            category="marketing"
            progress={65}
            currentTask={{
              title: "Social Media Campaign",
              description: "Running engagement campaign"
            }}
            upcomingTask={{
              title: "Content Calendar",
              description: "Planning posts for next month"
            }}
          />

          {/* Card 3: Automation (Locked) */}
          <BusinessTaskCard
            name="Automation"
            category="automation"
            locked={true}
          />

          {/* Card 4: Unlock Features Upgrade */}
          <UpgradeCard />

        </section>

      </main>
    </div>
  );
}
