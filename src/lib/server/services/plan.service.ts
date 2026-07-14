import { PlanRepository } from "../repositories/plan.repository";
import { type Plan } from "@/lib/schemas";

export class PlanService {
  private planRepo = new PlanRepository();

  async getPlans(): Promise<Plan[]> {
    return this.planRepo.getPlans();
  }

  async savePlan(plan: Plan): Promise<void> {
    await this.planRepo.savePlan(plan);
  }

  async deletePlan(planId: string): Promise<void> {
    await this.planRepo.deletePlan(planId);
  }
}
