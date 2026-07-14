import { BusinessRepository } from "../repositories/business.repository";
import { type Business } from "@/lib/schemas";
import { ValidationError } from "../../errors";

export class BusinessService {
  private businessRepo = new BusinessRepository();

  async getBusinesses(): Promise<Business[]> {
    return this.businessRepo.getBusinesses();
  }

  async getBusiness(businessId: string): Promise<Business | null> {
    return this.businessRepo.getBusiness(businessId);
  }

  async getBusinessesByUser(userId: string): Promise<Business[]> {
    return this.businessRepo.getBusinessesByUser(userId);
  }

  async saveBusiness(business: Business): Promise<void> {
    business.updatedAt = new Date();
    await this.businessRepo.saveBusiness(business);
  }

  async deleteBusiness(businessId: string): Promise<void> {
    await this.businessRepo.deleteBusiness(businessId);
  }

  async validateUnpaidBusinesses(uid: string): Promise<void> {
    const userBusinesses = await this.businessRepo.getBusinessesByUser(uid);
    const hasUnpaidBusiness = userBusinesses.some((b) => b.plan === "None");
    if (hasUnpaidBusiness) {
      throw new ValidationError(
        "You must purchase a paid plan for your existing business before you can add a new one."
      );
    }
  }
}
