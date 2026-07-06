import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import Lenis from "lenis";
import { MymindNav } from "@/components/mymind/MymindNav";
import { MymindFooter } from "@/components/mymind/MymindFooter";

// Custom Subcomponents
import HowHero from "@/components/mymind/how/HowHero";
import HowBubble from "@/components/mymind/how/HowBubble";
import HowRoles from "@/components/mymind/how/HowRoles";
import HowClosing from "@/components/mymind/how/HowClosing";
import HowDownloads from "@/components/mymind/how/HowDownloads";

export const Route = createFileRoute("/how")({
  head: () => ({
    meta: [
      { title: "How theOpenAI" },
      {
        name: "description",
        content:
          "No sorting. No folder structure. No tagging. Let artificial intelligence and magic do the heavy lifting for you.",
      },
      { property: "og:title", content: "How mymind works — mymind" },
      {
        property: "og:description",
        content:
          "No sorting. No folder structure. No tagging. Let artificial intelligence and magic do the heavy lifting for you.",
      },
    ],
  }),
  component: HowPage,
});

function HowPage() {
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
    <div className="min-h-screen bg-[var(--color-mm-bg-gray)]">
      <MymindNav />
      <HowHero />
      <HowBubble />
      <HowRoles />
      <HowClosing />
      <HowDownloads />
      <MymindFooter />
    </div>
  );
}
