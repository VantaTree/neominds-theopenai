import { adminDb } from "@/lib/firebase-admin.server";
import { createZodConverter } from "@/lib/firestore-converter.server";
import { BusinessSchema, type Business } from "@/lib/schemas";

const businessConverter = createZodConverter(BusinessSchema);

export class BusinessRepository {
  private get db() {
    if (!adminDb) {
      throw new Error("Firebase Admin Firestore is not initialized.");
    }
    return adminDb;
  }

  private get collection() {
    return this.db.collection("businesses").withConverter(businessConverter);
  }

  async getBusinesses(): Promise<Business[]> {
    const snap = await this.collection.get();
    return snap.docs.map((d) => d.data());
  }

  async getBusiness(businessId: string): Promise<Business | null> {
    const snap = await this.collection.doc(businessId).get();
    return snap.exists ? snap.data()! : null;
  }

  async getBusinessesByUser(userId: string): Promise<Business[]> {
    const userRef = this.db.collection("users").doc(userId);
    
    const snapRef = await this.collection.where("userId", "==", userRef).get();
    const snapStr = await this.collection.where("userId", "==", userId).get();

    const map = new Map<string, Business>();
    snapRef.docs.forEach((d) => map.set(d.id, d.data()));
    snapStr.docs.forEach((d) => map.set(d.id, d.data()));

    return Array.from(map.values());
  }

  async saveBusiness(business: Business): Promise<void> {
    await this.collection.doc(business.id).set(business, { merge: true });
  }

  async deleteBusiness(businessId: string): Promise<void> {
    await this.collection.doc(businessId).delete();
  }
}
