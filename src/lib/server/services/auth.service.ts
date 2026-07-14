import { adminAuth } from "@/lib/firebase-admin.server";
import { UserRepository } from "../repositories/user.repository";
import { UnauthorizedError } from "../../errors";

export class AuthService {
  private userRepo = new UserRepository();

  async setAdminClaim(actor: any, uid: string, isAdmin: boolean): Promise<void> {
    if (!adminAuth) {
      throw new Error("Firebase Admin SDK is not initialized.");
    }

    if (actor.admin !== true) {
      const allUsers = await this.userRepo.getUsers();
      const hasAdmins = allUsers.some((u) => u.role === "admin");
      if (hasAdmins) {
        throw new UnauthorizedError("Unauthorized: Only existing admins can assign admin claims.");
      }
    }

    await adminAuth.setCustomUserClaims(uid, { admin: isAdmin });

    const userDoc = await this.userRepo.getUser(uid);
    if (userDoc) {
      userDoc.role = isAdmin ? "admin" : "client";
      userDoc.updatedAt = new Date();
      await this.userRepo.saveUser(userDoc);
    }
  }

  async ensureUserDocument(user: any): Promise<any> {
    return this.userRepo.ensureUserDocument(user);
  }

  async checkUserExists(uid: string): Promise<boolean> {
    const user = await this.userRepo.getUser(uid);
    return !!user;
  }
}
