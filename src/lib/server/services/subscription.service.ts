import { SubscriptionRepository } from "../repositories/subscription.repository";
import { type Subscription } from "@/lib/schemas";

export class SubscriptionService {
  private subscriptionRepo = new SubscriptionRepository();

  async getSubscriptions(): Promise<Subscription[]> {
    return this.subscriptionRepo.getSubscriptions();
  }

  async getUserSubscription(uid: string): Promise<Subscription | null> {
    return this.subscriptionRepo.getUserSubscription(uid);
  }

  async saveSubscription(sub: Subscription): Promise<void> {
    await this.subscriptionRepo.saveSubscription(sub);
  }
}
