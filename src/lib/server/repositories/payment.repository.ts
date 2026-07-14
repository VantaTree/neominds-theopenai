import { adminDb } from "@/lib/firebase-admin.server";
import { createZodConverter } from "@/lib/firestore-converter.server";
import { PaymentSchema, type Payment } from "@/lib/schemas";

const paymentConverter = createZodConverter(PaymentSchema);

export class PaymentRepository {
  private get db() {
    if (!adminDb) {
      throw new Error("Firebase Admin Firestore is not initialized.");
    }
    return adminDb;
  }

  private get collection() {
    return this.db.collection("payments").withConverter(paymentConverter);
  }

  async getPayments(): Promise<Payment[]> {
    const snap = await this.collection.get();
    return snap.docs.map((d) => d.data());
  }

  async savePayments(payments: Payment[]): Promise<void> {
    const batch = this.db.batch();
    for (const p of payments) {
      const ref = this.collection.doc(String(p.id));
      batch.set(ref, p, { merge: true });
    }
    await batch.commit();
  }
}
