import { adminDb } from "@/lib/firebase-admin.server";
import { createZodConverter } from "@/lib/firestore-converter.server";
import { UserSchema, type User } from "@/lib/schemas";

const userConverter = createZodConverter(UserSchema);

export class UserRepository {
  private get db() {
    if (!adminDb) {
      throw new Error("Firebase Admin Firestore is not initialized.");
    }
    return adminDb;
  }

  private get collection() {
    return this.db.collection("users").withConverter(userConverter);
  }

  async getUsers(): Promise<User[]> {
    const snap = await this.collection.get();
    return snap.docs.map((d) => d.data());
  }

  async getUser(userId: string): Promise<User | null> {
    const snap = await this.collection.doc(userId).get();
    return snap.exists ? snap.data()! : null;
  }

  async saveUser(user: User): Promise<void> {
    await this.collection.doc(user.id).set(user, { merge: true });
  }

  async deleteUser(userId: string): Promise<void> {
    await this.collection.doc(userId).delete();
  }

  async ensureUserDocument(user: {
    uid: string;
    displayName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
  }): Promise<User> {
    const existingUser = await this.getUser(user.uid);
    if (existingUser) {
      return existingUser;
    }

    const newUser: User = {
      id: user.uid,
      fullName: user.displayName || user.email?.split("@")[0] || "New User",
      email: user.email || "",
      phone: user.phoneNumber || "",
      role: "client",
      status: "Active",
      businessCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.saveUser(newUser);
    return newUser;
  }
}
