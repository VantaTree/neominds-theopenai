import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Lenis from "lenis";
import { motion } from "framer-motion";
import { MymindNav } from "@/components/mymind/MymindNav";
import { MymindFooter } from "@/components/mymind/MymindFooter";
import PLANS from "@/data/plans";
import AnimatedPlanCard from "@/components/AnimatedPlanCard";
import { z } from "zod";
import { toast } from "sonner";
import { Building2, CheckCircle, Loader2 } from "lucide-react";

const plansSearchSchema = z.object({
  businessId: z.string().optional(),
  plan: z.string().optional(),
});

export const Route = createFileRoute("/plans")({
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

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(search.businessId || null);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [targetPlan, setTargetPlan] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any | null>(null);

  // Load user's businesses if logged in
  useEffect(() => {
    if (auth.user) {
      setLoadingBusinesses(true);
      import("@/lib/server-functions").then(({ getMyBusinessesFn }) => {
        getMyBusinessesFn()
          .then((res) => {
            const list = res || [];
            setBusinesses(list);
            if (search.businessId && list.some((b: any) => b.id === search.businessId)) {
              setSelectedBusinessId(search.businessId);
            } else if (list.length === 1) {
              setSelectedBusinessId(list[0].id);
            }
          })
          .catch((err) => console.error("Error loading businesses:", err))
          .finally(() => setLoadingBusinesses(false));
      });
    }
  }, [auth.user, search.businessId]);

  // Handle plan auto-activation if coming from checkout flow with a pre-selected plan
  useEffect(() => {
    if (search.plan && auth.user && businesses.length > 0) {
      const planToSelect = search.plan;
      // Clear plan parameter from URL so it doesn't trigger repeatedly
      navigate({
        search: (prev) => ({ ...prev, plan: undefined }),
        replace: true,
      });
      handleSelectPlan(planToSelect);
    }
  }, [search.plan, auth.user, businesses]);

  // Load Razorpay script dynamically
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSelectPlan = async (planName: string) => {
    if (planName === "Customize") return;

    const typedPlan = planName as "Basic" | "Plus" | "Pro";

    if (!auth.user) {
      toast.info("Please sign up or log in to purchase a plan.", {
        description: "You will be redirected back to complete your subscription.",
      });
      navigate({
        to: "/login",
        search: { redirect: `/plans?plan=${planName}${search.businessId ? `&businessId=${search.businessId}` : ""}` },
      });
      return;
    }

    if (businesses.length === 0 && !loadingBusinesses) {
      toast.error("No Business Profile Found", {
        description: "Please set up a business profile before purchasing a plan.",
      });
      navigate({ to: "/businessProfile" });
      return;
    }

    setTargetPlan(planName);

    let activeBizId = selectedBusinessId;
    if (businesses.length > 1 && !activeBizId) {
      setShowBusinessModal(true);
      return;
    }

    if (!activeBizId && businesses.length === 1) {
      activeBizId = businesses[0].id;
      setSelectedBusinessId(activeBizId);
    }

    if (activeBizId) {
      await startCheckout(activeBizId, typedPlan);
    }
  };

  const startCheckout = async (businessId: string, planName: "Basic" | "Plus" | "Pro") => {
    setCheckoutLoading(true);
    try {
      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      const { createRazorpayOrderFn } = await import("@/lib/server-functions");
      const orderRes = await createRazorpayOrderFn({
        data: { businessId, planName },
      });

      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID!;
      const targetBiz = businesses.find((b) => b.id === businessId);

      const options = {
        key: keyId,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "GrowConsult AI",
        description: `${planName} Plan Subscription`,
        image: "/logos/logo_mini.png",
        order_id: orderRes.orderId,
        handler: async (response: any) => {
          setCheckoutLoading(true);
          try {
            const { verifyRazorpayPaymentFn } = await import("@/lib/server-functions");
            const verifyRes = await verifyRazorpayPaymentFn({
              data: {
                businessId,
                planName,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
            });

            if (verifyRes.success) {
              setPaymentSuccess({
                plan: planName,
                businessName: targetBiz?.businessName || "your business",
                paymentId: response.razorpay_payment_id,
              });
              toast.success("Subscription Activated!", {
                description: `Successfully upgraded to the ${planName} plan.`,
              });
            } else {
              throw new Error("Verification failed on the server.");
            }
          } catch (verifyErr: any) {
            console.error("Payment verification failed:", verifyErr);
            toast.error("Payment Verification Failed", {
              description: verifyErr.message || "Please contact support if funds were deducted.",
            });
          } finally {
            setCheckoutLoading(false);
          }
        },
        prefill: {
          name: auth.user?.displayName || "",
          email: auth.user?.email || "",
          contact: targetBiz?.contactPhone || "",
        },
        theme: {
          color: "#FF5924",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (failedRes: any) => {
        console.error("Razorpay payment failed:", failedRes.error);
        toast.error("Payment Failed", {
          description: failedRes.error.description || "The transaction could not be processed.",
        });
      });
      rzp.open();
    } catch (err: any) {
      console.error("Error during checkout initiation:", err);
      toast.error("Checkout Failed", {
        description: err.message || "Failed to initialize payment gateway.",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

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
      <MymindNav />

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
              />
            ))}
            {PLANS.slice(3, 4).map((plan, i) => (
              <AnimatedPlanCard 
                key={plan.name} 
                plan={plan} 
                i={i} 
                cardType="custom" 
                onSelectPlan={handleSelectPlan}
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
      <MymindFooter />

      {/* Business Selection Modal */}
      {showBusinessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-fadeIn">
          <div className="bg-white border border-mm-border rounded-[28px] max-w-md w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-mm-orange/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-mm-dark uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 size={16} className="text-mm-orange" />
                  Select Business Profile
                </h3>
                <p className="text-xs text-mm-gray">
                  Choose which business profile you wish to upgrade to the <strong className="text-mm-orange">{targetPlan}</strong> plan.
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowBusinessModal(false);
                  setTargetPlan(null);
                }}
                className="text-mm-gray hover:text-mm-dark bg-mm-subtle/50 hover:bg-mm-subtle p-1.5 rounded-full transition-colors cursor-pointer text-xs font-bold leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {businesses.map((b) => (
                <div
                  key={b.id}
                  onClick={() => {
                    setSelectedBusinessId(b.id);
                  }}
                  className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-200 ${
                    selectedBusinessId === b.id
                      ? "bg-mm-orange/5 border-mm-orange shadow-[0_4px_12px_rgba(255,89,36,0.06)]"
                      : "bg-white border-mm-border hover:bg-mm-subtle/30 hover:border-mm-gray/30"
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-black text-mm-dark">{b.businessName}</h4>
                    <span className="text-[10px] text-mm-gray block mt-0.5 capitalize">{b.businessType || "Consulting"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                      b.plan === "Pro" ? "bg-purple-100 text-purple-700" :
                      b.plan === "Plus" ? "bg-blue-100 text-blue-700" :
                      b.plan === "Basic" ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {b.plan || "None"}
                    </span>
                    <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                      selectedBusinessId === b.id
                        ? "border-mm-orange bg-mm-orange text-white"
                        : "border-mm-border"
                    }`}>
                      {selectedBusinessId === b.id && <span className="text-[9px] font-black">✓</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={async () => {
                if (selectedBusinessId && targetPlan) {
                  const currentTargetPlan = targetPlan;
                  const currentBusinessId = selectedBusinessId;
                  setShowBusinessModal(false);
                  await startCheckout(currentBusinessId, currentTargetPlan as any);
                }
              }}
              disabled={!selectedBusinessId}
              className="w-full py-3 bg-mm-orange hover:bg-mm-orange/95 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-mm-orange/10 uppercase tracking-widest"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      {paymentSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-fadeIn">
          <div className="bg-white border border-mm-border rounded-[28px] max-w-md w-full p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-mm-orange to-amber-400" />
            
            <div className="mx-auto h-20 w-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle size={40} className="text-emerald-500 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-mm-dark leading-tight tracking-tight">
                Payment Successful!
              </h3>
              <p className="text-xs text-mm-gray leading-relaxed max-w-[280px] mx-auto">
                Your subscription is now active. <strong className="text-mm-dark">{paymentSuccess.businessName}</strong> has been upgraded to the <strong className="text-mm-orange">{paymentSuccess.plan}</strong> plan.
              </p>
            </div>

            <div className="bg-mm-subtle/30 border border-mm-border rounded-2xl p-4 text-[10px] text-mm-gray font-semibold space-y-1.5 text-left max-w-[300px] mx-auto">
              <div className="flex justify-between">
                <span>Payment Gateway</span>
                <span className="font-bold text-mm-dark text-right">Razorpay</span>
              </div>
              <div className="flex justify-between">
                <span>Transaction ID</span>
                <span className="font-bold text-mm-dark text-right cursor-pointer select-all">{paymentSuccess.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className="font-bold text-emerald-600 text-right uppercase">Paid & Verified</span>
              </div>
            </div>

            <button
              onClick={() => {
                setPaymentSuccess(null);
                navigate({ to: "/dashboard" });
              }}
              className="w-full py-3.5 bg-mm-dark hover:opacity-95 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer uppercase tracking-widest shadow-md"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Checkout Loading Overlay */}
      {checkoutLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[1px]">
          <div className="bg-white border border-mm-border rounded-2xl px-6 py-5 flex items-center gap-3 shadow-lg">
            <Loader2 className="animate-spin text-mm-orange" size={20} />
            <span className="text-xs font-bold text-mm-dark">Processing payment session...</span>
          </div>
        </div>
      )}
    </div>
  );
}

