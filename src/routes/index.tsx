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
import { MymindContact } from "@/components/mymind/MymindContact";
import GradientArc from "@/components/GradientArc";
import { StoreboxFAQ } from "@/components/mymind/StoreboxFAQ";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "theopenai — Website + CRM + SEO. Done for you." },
      {
        name: "description",
        content:
          "Get the website your business deserves in 24 hours. No DIY. We design. We manage. $9.99/month. SEO, CRM, reviews and unlimited edits included.",
      },
      {
        property: "og:title",
        content: "theopenai — Website + CRM + SEO. Done for you.",
      },
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
    <div className="min-h-screen z-0">
      <MymindNav />
      <div
        className="relative w-full overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 55% 50% at 8% 30%, rgba(255, 110, 40, 0.82) 0%, transparent 60%),
            radial-gradient(ellipse 55% 50% at 92% 30%, rgba(255, 155, 125, 0.72) 0%, transparent 60%),
            radial-gradient(ellipse 52% 40% at 50% 28%, #ffffff 0%, rgba(255, 242, 236, 0.96) 42%, transparent 72%),
            linear-gradient(180deg, #ffd4b8 0%, #ffe8d8 25%, #ffc8b4 60%, #ffffff 100%)
          `,
        }}
      >
        <MymindHero />
        <MymindIntroVideo />
      </div>
      <div className="relative z-0">
        <MymindManifesto />
        <GradientArc
          position="absolute"
          color1="var(--color-mm-orange)"
          color2="var(--color-mm-red)"
          color3="var(--color-mm-peach)"
          glowOpacity={0.8}
          strokeWidth={170}
          zIndex={-1}
          style={{
            left: "50%",
            bottom: "-38%",
          }}
        />
      </div>
      <MymindSmartBookmarking />
      <MymindFeatures />
      <MymindTestimonials />
      <MymindUseCases />
      <MymindPhilosophy />
      <MymindDownloads />
      <AddOnsSection />
      <MymindContact />
      <StoreboxFAQ/>
      <MymindFooter />
    </div>
  );
}
