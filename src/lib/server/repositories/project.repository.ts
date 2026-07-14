import { adminDb } from "@/lib/firebase-admin.server";
import { createZodConverter } from "@/lib/firestore-converter.server";
import { ProjectSchema, type Project } from "@/lib/schemas";

const projectConverter = createZodConverter(ProjectSchema);

export class ProjectRepository {
  private get db() {
    if (!adminDb) {
      throw new Error("Firebase Admin Firestore is not initialized.");
    }
    return adminDb;
  }

  private get collection() {
    return this.db.collection("projects").withConverter(projectConverter);
  }

  async getProjects(): Promise<Project[]> {
    const snap = await this.collection.get();
    return snap.docs.map((d) => d.data());
  }

  async saveProject(project: Project): Promise<void> {
    await this.collection.doc(project.id).set(project, { merge: true });
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.collection.doc(projectId).delete();
  }

  async getProjectsByBusiness(businessId: string): Promise<Project[]> {
    const businessRef = this.db.collection("businesses").doc(businessId);
    
    const snapRef = await this.collection.where("businessId", "==", businessRef).get();
    const snapStr = await this.collection.where("businessId", "==", businessId).get();

    const map = new Map<string, Project>();
    snapRef.docs.forEach((d) => map.set(d.id, d.data()));
    snapStr.docs.forEach((d) => map.set(d.id, d.data()));

    return Array.from(map.values());
  }
}
