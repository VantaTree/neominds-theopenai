import { adminDb } from "@/lib/firebase-admin.server";
import { type Subscription } from "@/lib/schemas";

export class SubscriptionRepository {
  private get db() {
    if (!adminDb) {
      throw new Error("Firebase Admin Firestore is not initialized.");
    }
    return adminDb;
  }

  private get collection() {
    return this.db.collection("subscriptions");
  }

  async getSubscriptions(): Promise<Subscription[]> {
    const snap = await this.collection.get();
    return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }) as Subscription);
  }

  async getUserSubscription(uid: string): Promise<Subscription | null> {
    const snap = await this.collection
      .where("uid", "==", uid)
      .where("status", "==", "active")
      .limit(1)
      .get();

    return snap.empty
      ? null
      : ({ id: snap.docs[0].id, ...snap.docs[0].data() } as Subscription);
  }

  async saveSubscription(sub: Subscription): Promise<void> {
    const id = sub.id || `sub_${Date.now()}`;
    await this.collection.doc(id).set({ ...sub, id }, { merge: true });
  }
}
