import { adminDb } from "@/lib/firebase-admin.server";
import { createZodConverter } from "@/lib/firestore-converter.server";
import { ReportSchema, type Report } from "@/lib/schemas";

const reportConverter = createZodConverter(ReportSchema);

export class ReportRepository {
  private get db() {
    if (!adminDb) {
      throw new Error("Firebase Admin Firestore is not initialized.");
    }
    return adminDb;
  }

  private get collection() {
    return this.db.collection("reports").withConverter(reportConverter);
  }

  async getReports(): Promise<Report[]> {
    const snap = await this.collection.get();
    return snap.docs.map((d) => d.data());
  }

  async getReport(reportId: string): Promise<Report | null> {
    const snap = await this.collection.doc(reportId).get();
    return snap.exists ? snap.data()! : null;
  }

  async getReportsByUser(uid: string): Promise<Report[]> {
    const snap = await this.collection.where("userId", "==", uid).get();
    return snap.docs.map((d) => d.data());
  }

  async getReportsByBusiness(businessId: string): Promise<Report[]> {
    const businessRef = this.db.collection("businesses").doc(businessId);
    
    const snapRef = await this.collection.where("businessId", "==", businessRef).get();
    const snapStr = await this.collection.where("businessId", "==", businessId).get();

    const map = new Map<string, Report>();
    snapRef.docs.forEach((d) => map.set(d.id, d.data()));
    snapStr.docs.forEach((d) => map.set(d.id, d.data()));

    return Array.from(map.values());
  }

  async saveReport(report: Report): Promise<void> {
    const id = report.id || `rpt_${Date.now()}`;
    await this.collection.doc(id).set({ ...report, id }, { merge: true });
  }

  async deleteReport(reportId: string): Promise<void> {
    await this.collection.doc(reportId).delete();
  }
}
