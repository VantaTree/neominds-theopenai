import { createServerFn } from "@tanstack/react-start";
import { adminMiddleware, businessOwnerMiddleware, requirePlanMiddleware } from "./middleware";
import {
  SaveProjectSchema,
  DeleteProjectSchema,
  GetProjectsByBusinessSchema,
} from "../schemas/api/admin";

export const getProjectsFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const { ProjectService } = await import("../server/services/project.service");
    const projectService = new ProjectService();
    return projectService.getProjects();
  });

export const saveProjectFn = createServerFn({ method: "POST" })
  .validator((d: any) => SaveProjectSchema.parse(d))
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const { ProjectService } = await import("../server/services/project.service");
    const projectService = new ProjectService();
    await projectService.saveProject(data);
    return { success: true };
  });

export const deleteProjectFn = createServerFn({ method: "POST" })
  .validator((d: any) => DeleteProjectSchema.parse(d))
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const { ProjectService } = await import("../server/services/project.service");
    const projectService = new ProjectService();
    await projectService.deleteProject(data);
    return { success: true };
  });

export const getProjectsByBusinessFn = createServerFn({ method: "GET" })
  .validator((d: any) => GetProjectsByBusinessSchema.parse(d))
  .middleware([businessOwnerMiddleware, requirePlanMiddleware("Basic")])
  .handler(async ({ data: businessId }) => {
    const { ProjectService } = await import("../server/services/project.service");
    const projectService = new ProjectService();
    return projectService.getProjectsByBusiness(businessId);
  });
