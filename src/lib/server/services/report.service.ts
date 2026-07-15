import { adminDb } from "@/lib/firebase-admin.server";
import { ReportRepository } from "../repositories/report.repository";
import { BusinessRepository } from "../repositories/business.repository";
import { UserRepository } from "../repositories/user.repository";
import { type Report, type Business } from "@/lib/schemas";
import { ValidationError } from "../../errors";

export class ReportService {
  private reportRepo = new ReportRepository();
  private businessRepo = new BusinessRepository();
  private userRepo = new UserRepository();

  async getReports(): Promise<Report[]> {
    return this.reportRepo.getReports();
  }

  async getReport(reportId: string): Promise<Report | null> {
    return this.reportRepo.getReport(reportId);
  }

  async getReportsByUser(uid: string): Promise<Report[]> {
    return this.reportRepo.getReportsByUser(uid);
  }

  async getReportsByBusiness(businessId: string): Promise<Report[]> {
    return this.reportRepo.getReportsByBusiness(businessId);
  }

  async saveReport(report: Report): Promise<void> {
    report.updatedAt = new Date();
    await this.reportRepo.saveReport(report);
  }

  async deleteReport(reportId: string): Promise<void> {
    await this.reportRepo.deleteReport(reportId);
  }

  async submitAssessment(
    decoded: any,
    data: {
      businessName: string;
      industry: string;
      businessDescription: string;
      websiteUrl?: string | null;
      primaryGoal: string;
      targetAudience: string;
    }
  ): Promise<{ result: any; businessId: string; reportId: string }> {
    if (!adminDb) {
      throw new Error("Firebase Admin Firestore is not initialized.");
    }

    const userBusinesses = await this.businessRepo.getBusinessesByUser(decoded.uid);
    const hasUnpaidBusiness = userBusinesses.some((b) => b.plan === "None");
    if (hasUnpaidBusiness) {
      throw new ValidationError(
        "You must purchase a paid plan for your existing business before you can add a new one."
      );
    }

    const agentBackendUrl = process.env.VITE_AGENT_BACKEND_URL || "http://localhost:8081";
    const apiKey = process.env.BB_AGENT_API_KEY || "bb-agent-default-secret-key-2026";

    const response = await fetch(`${agentBackendUrl}/api/assessment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        businessName: data.businessName,
        industry: data.industry,
        businessDescription: data.businessDescription,
        websiteUrl: data.websiteUrl || "",
        primaryGoal: data.primaryGoal,
        targetAudience: data.targetAudience,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from AI agent backend:", errorText);
      throw new Error(`AI Agent backend returned error: ${response.statusText}`);
    }

    const result = await response.json();

    const businessId = adminDb.collection("businesses").doc().id;
    const newBusiness: Business = {
      id: businessId,
      userId: decoded.uid,
      plan: "None",
      addons: [],
      businessName: data.businessName,
      businessType: data.industry,
      contactEmail: decoded.email || null,
      contactPhone: "",
      websiteUrl: data.websiteUrl || "",
      paymentStatus: "Pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.businessRepo.saveBusiness(newBusiness);

    const reportId = adminDb.collection("reports").doc().id;
    const newReport: Report = {
      id: reportId,
      businessId: businessId,
      title: `${data.businessName} - AI Assessment Report`,
      createdAt: new Date(),
      updatedAt: new Date(),
      data: result,
    };
    await this.reportRepo.saveReport(newReport);

    const userDoc = await this.userRepo.getUser(decoded.uid);
    if (userDoc) {
      const updatedBusinesses = await this.businessRepo.getBusinessesByUser(decoded.uid);
      userDoc.businessCount = updatedBusinesses.length;
      userDoc.updatedAt = new Date();
      await this.userRepo.saveUser(userDoc);
    }

    return { result, businessId, reportId };
  }
}
