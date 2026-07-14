import { adminDb } from "@/lib/firebase-admin.server";
import { type Plan } from "@/lib/schemas";

const DEFAULT_PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic Plan",
    tagline: "Essential assets to kickstart your business presence.",
    priceMonthly: 29,
    priceYearly: 23,
    billedYearly: 276,
    features: [
      "Website (Template)",
      "3 Posts + 1 Reel per month",
      "AI Chatbot + Voice support",
      "Basic SEO optimization",
      "Google Business Profile setup",
    ],
    maxReports: 5,
    maxStorageGb: 2,
    supportLevel: "basic",
    active: true,
  },
  {
    id: "plus",
    name: "Plus Plan",
    tagline: "Designed for expanding businesses seeking growth.",
    priceMonthly: 59,
    priceYearly: 47,
    billedYearly: 564,
    features: [
      "Website (Customized layout)",
      "5 Posts + 2 Reels per month",
      "AI Voicebot integration",
      "Advanced SEO optimization",
      "Email marketing campaigns",
      "Includes all Basic features",
    ],
    maxReports: 20,
    maxStorageGb: 10,
    supportLevel: "priority",
    active: true,
  },
  {
    id: "pro",
    name: "Pro Plan",
    tagline: "Ultimate features for scaling market leaders.",
    priceMonthly: 89,
    priceYearly: 71,
    billedYearly: 852,
    features: [
      "Modern 3D Website design",
      "7 Posts + 3 Reels per month",
      "AI Voice + Chatbot agents",
      "Deep performance analytics",
      "Paid Ads (Google & Meta)",
      "All Social Media Optimization",
      "SEO + GEO + AEO optimization",
      "Includes all Plus features",
    ],
    maxReports: 100,
    maxStorageGb: 50,
    supportLevel: "dedicated",
    active: true,
  },
];

export class PlanRepository {
  private get db() {
    if (!adminDb) {
      throw new Error("Firebase Admin Firestore is not initialized.");
    }
    return adminDb;
  }

  private get collection() {
    return this.db.collection("plans");
  }

  async getPlans(): Promise<Plan[]> {
    const snap = await this.collection.get();
    if (snap.docs.length > 0) {
      return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }) as Plan);
    }
    return DEFAULT_PLANS;
  }

  async savePlan(plan: Plan): Promise<void> {
    await this.collection.doc(plan.id).set(plan, { merge: true });
  }

  async deletePlan(planId: string): Promise<void> {
    await this.collection.doc(planId).delete();
  }
}
export { DEFAULT_PLANS };
