import { createServerFn } from "@tanstack/react-start";
import {
  SaveProjectSchema,
  DeleteProjectSchema,
  GetProjectsByBusinessSchema,
} from "../schemas/api/admin";

export const getProjectsFn = createServerFn({ method: "GET" })
  .handler(async () => {
    const { requireAdmin } = await import("../server/auth/permissions");
    const { ProjectService } = await import("../server/services/project.service");
    
    await requireAdmin();
    const projectService = new ProjectService();
    return projectService.getProjects();
  });

export const saveProjectFn = createServerFn({ method: "POST" })
  .validator((d: any) => SaveProjectSchema.parse(d))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("../server/auth/permissions");
    const { ProjectService } = await import("../server/services/project.service");
    
    await requireAdmin();
    const projectService = new ProjectService();
    await projectService.saveProject(data);
    return { success: true };
  });

export const deleteProjectFn = createServerFn({ method: "POST" })
  .validator((d: any) => DeleteProjectSchema.parse(d))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("../server/auth/permissions");
    const { ProjectService } = await import("../server/services/project.service");
    
    await requireAdmin();
    const projectService = new ProjectService();
    await projectService.deleteProject(data);
    return { success: true };
  });

export const getProjectsByBusinessFn = createServerFn({ method: "GET" })
  .validator((d: any) => GetProjectsByBusinessSchema.parse(d))
  .handler(async ({ data: businessId }) => {
    const { requireBusinessOwner } = await import("../server/auth/ownership");
    const { ProjectService } = await import("../server/services/project.service");
    
    await requireBusinessOwner(businessId);
    const projectService = new ProjectService();
    return projectService.getProjectsByBusiness(businessId);
  });
