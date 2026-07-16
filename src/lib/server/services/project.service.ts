import { ProjectRepository } from "../repositories/project.repository";
import { type Project } from "@/lib/schemas";

export class ProjectService {
  private projectRepo = new ProjectRepository();

  async getProjects(): Promise<Project[]> {
    return this.projectRepo.getProjects();
  }

  async getProjectById(projectId: string): Promise<Project | null> {
    return this.projectRepo.getProjectById(projectId);
  }

  async saveProject(project: Project): Promise<void> {
    project.updatedAt = new Date();
    await this.projectRepo.saveProject(project);
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.projectRepo.deleteProject(projectId);
  }

  async getProjectsByBusiness(businessId: string): Promise<Project[]> {
    return this.projectRepo.getProjectsByBusiness(businessId);
  }
}
