import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import Lenis from "lenis";
import { motion } from "framer-motion";
import { MymindNav } from "@/components/mymind/MymindNav";
import { MymindFooter } from "@/components/mymind/MymindFooter";
import PLANS from "@/data/plans";
import AnimatedPlanCard from "@/components/AnimatedPlanCard";
import { z } from "zod";
import { useRazorpayCheckout } from "@/hooks/use-razorpay-checkout";
import { useBusiness } from "@/hooks/use-business";

const plansSearchSchema = z.object({
  businessId: z.string().optional(),
  plan: z.string().optional(),
});

export const Route = createFileRoute("/_client/plans")({
  validateSearch: plansSearchSchema,
  head: () => ({
    meta: [
      { title: "Pricing & Plans — mymind" },
      {
        name: "description",
        content:
          "Simple, transparent pricing. Choose the plan that fits your mind. No setup fees, no contracts, cancel anytime.",
      },
      { property: "og:title", content: "Pricing & Plans — mymind" },
      {
        property: "og:description",
        content:
          "Simple, transparent pricing. Choose the plan that fits your mind. No setup fees, no contracts, cancel anytime.",
      },
    ],
  }),
  component: PlansPage,
});

function PlansPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { auth } = Route.useRouteContext();
  const { handleSelectPlan, renderModals } = useRazorpayCheckout();
  const { activeBusiness } = useBusiness();
  const currentPlan = activeBusiness?.plan || "None";

  // Handle plan auto-activation if coming from checkout flow with a pre-selected plan
  useEffect(() => {
    if (search.plan && auth.user) {
      const planToSelect = search.plan;
      // Clear plan parameter from URL so it doesn't trigger repeatedly
      navigate({
        search: (prev: any) => ({ ...prev, plan: undefined }),
        replace: true,
      } as any);
      handleSelectPlan(planToSelect);
    }
  }, [search.plan, auth.user]);

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
    <div className="min-h-screen bg-(--color-mm-plans-bg)">
      {/* Global Navigation */}
      {/* <MymindNav /> */}

      {/* Main Pricing Section */}
      <section className="w-full py-24 md:py-32">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center w-full max-w-screen-2xl">
          {/* Header Text */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.22em] text-(--color-mm-plans-accent)"
          >
            PRICING PLANS
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mb-6 text-center font-serif text-[2.5rem] leading-[2.8rem] md:text-[4rem] md:leading-[4.4rem] tracking-tight text-(--color-mm-plans-dominant)"
          >
            A plan for your mind.
            <br />
            <span className="italic font-serif opacity-80">
              Simple, transparent, magical.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-16 text-center text-sm md:text-base font-sans text-mm-gray max-w-md leading-relaxed"
          >
            No setup fees. No contracts. Cancel or change your plan at any time.
          </motion.p>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-4 w-full mb-16">
            {PLANS.slice(0, 3).map((plan, i) => (
              <AnimatedPlanCard
                key={plan.name}
                plan={plan}
                i={i}
                cardType="default"
                onSelectPlan={handleSelectPlan}
                isCurrent={plan.name === currentPlan}
              />
            ))}
            {PLANS.slice(3, 4).map((plan, i) => (
              <AnimatedPlanCard
                key={plan.name}
                plan={plan}
                i={i}
                cardType="custom"
                onSelectPlan={handleSelectPlan}
                isCurrent={plan.name === currentPlan}
              />
            ))}
          </div>

          {/* Bottom Callout */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center text-sm font-sans text-mm-gray"
          >
            Have questions about our plans?{" "}
            <a
              href="mailto:hey@theopenai.org"
              className="text-(--color-mm-plans-accent) hover:underline font-semibold transition-all underline-offset-4"
            >
              Get in touch
            </a>
          </motion.p>
        </div>
      </section>

      {/* Global Footer */}
      {/* <MymindFooter /> */}

      {/* Dynamic Checkout Modals */}
      {renderModals()}
    </div>
  );
}
