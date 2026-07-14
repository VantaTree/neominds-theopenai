import { adminDb } from "@/lib/firebase-admin.server";
import { createZodConverter } from "@/lib/firestore-converter.server";
import { AuditLogSchema, type AuditLog } from "@/lib/schemas";

const auditLogConverter = createZodConverter(AuditLogSchema);

export class AuditRepository {
  private get db() {
    if (!adminDb) {
      throw new Error("Firebase Admin Firestore is not initialized.");
    }
    return adminDb;
  }

  private get collection() {
    return this.db.collection("auditLog").withConverter(auditLogConverter);
  }

  async logAuditEvent(
    uid: string,
    action: string,
    payload: Record<string, any>,
    actor = "System",
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const id = `log_${Date.now()}`;
    const entry: AuditLog = {
      id,
      timestamp: new Date(),
      action,
      payload,
      uid,
      userName: actor || "System",
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    };
    await this.collection.doc(id).set(entry);
  }

  async getAuditLog(limitCount = 100): Promise<AuditLog[]> {
    const snap = await this.collection
      .orderBy("timestamp", "desc")
      .limit(limitCount)
      .get();
    return snap.docs.map((d) => d.data());
  }
}
