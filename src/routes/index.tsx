import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import Lenis from "lenis";
import { MymindNav } from "@/components/mymind/MymindNav";
import { MymindHero } from "@/components/mymind/MymindHero";
import { MymindIntroVideo } from "@/components/mymind/MymindIntroVideo";
import { MymindManifesto } from "@/components/mymind/MymindManifesto";
import { MymindSmartBookmarking } from "@/components/mymind/MymindSmartBookmarking";
import { MymindAI } from "@/components/mymind/MymindAI";
import { MymindSearch } from "@/components/mymind/MymindSearch";
import { MymindFeatures } from "@/components/mymind/MymindFeatures";
import { MymindInteractiveFeatures } from "@/components/mymind/MymindInteractiveFeatures";
import { MymindTestimonials } from "@/components/mymind/MymindTestimonials";
import { MymindUseCases } from "@/components/mymind/MymindUseCases";
import { MymindPhilosophy } from "@/components/mymind/MymindPhilosophy";
import { MymindDownloads } from "@/components/mymind/MymindDownloads";
import { MymindFooter } from "@/components/mymind/MymindFooter";
import AddOnsSection from "@/components/AddOnsSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "theopenai — Website + CRM + SEO. Done for you." },
      {
        name: "description",
        content:
          "Get the website your business deserves in 24 hours. No DIY. We design. We manage. $9.99/month. SEO, CRM, reviews and unlimited edits included.",
      },
      { property: "og:title", content: "theopenai — Website + CRM + SEO. Done for you." },
      {
        property: "og:description",
        content:
          "Get the website your business deserves in 24 hours. No DIY. We design. We manage. $9.99/month.",
      },
    ],
  }),
  component: MymindPage,
});

function MymindPage() {
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
    <div className="min-h-screen bg-white]">
      <MymindNav />
      <MymindHero />
      <MymindIntroVideo />
      <MymindManifesto />
      <MymindSmartBookmarking />
      {/* <MymindAI /> */}
      {/* <MymindSearch /> */}
      <MymindFeatures />
      <MymindInteractiveFeatures />
      <MymindTestimonials />
      <MymindUseCases />
      <MymindPhilosophy />
      <MymindDownloads />
      <AddOnsSection/>
      <MymindFooter />
    </div>
  );
}
