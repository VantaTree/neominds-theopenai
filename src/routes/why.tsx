import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import Lenis from "lenis";
import { MymindNav } from "@/components/mymind/MymindNav";
import { MymindFooter } from "@/components/mymind/MymindFooter";

// Custom Subcomponents
import WhyHero from "@/components/mymind/why/WhyHero";
import WhyNotDifferent from "@/components/mymind/why/WhyNotDifferent";
import WhyTechRelationship from "@/components/mymind/why/WhyTechRelationship";
import WhyNewBeginnings from "@/components/mymind/why/WhyNewBeginnings";
import WhyMeansToEnd from "@/components/mymind/why/WhyMeansToEnd";
import WhyInvisible from "@/components/mymind/why/WhyInvisible";
import WhyPrinciples from "@/components/mymind/why/WhyPrinciples";
import WhyClosingCTA from "@/components/mymind/why/WhyClosingCTA";
import WhyDownloads from "@/components/mymind/why/WhyDownloads";

export const Route = createFileRoute("/why")({
  head: () => ({
    meta: [
      { title: "Why theOpenAI exists" },
      {
        name: "description",
        content:
          "Because why not do something different? We believe in a better relationship with technology, invisible software, and less features with more magic. mymind is built as a clean slate extension for your mind.",
      },
      { property: "og:title", content: "Why mymind exists — mymind" },
      {
        property: "og:description",
        content:
          "Because why not do something different? We believe in a better relationship with technology, invisible software, and less features with more magic.",
      },
    ],
  }),
  component: WhyPage,
});

function WhyPage() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-mm-bg-gray">
      <MymindNav />
      <WhyHero />
      <WhyNotDifferent />
      <WhyTechRelationship />
      <WhyNewBeginnings />
      <WhyMeansToEnd />
      <WhyInvisible />
      <WhyPrinciples />
      <WhyClosingCTA />
      {/* <WhyDownloads /> */}
      <MymindFooter />
    </div>
  );
}
