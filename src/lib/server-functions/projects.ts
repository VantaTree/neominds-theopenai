import { createServerFn } from "@tanstack/react-start";
import { adminMiddleware, businessOwnerMiddleware, requirePlanMiddleware, authenticatedMiddleware } from "./middleware";
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

export const clientGetOrCreateWebsiteDraftFn = createServerFn({ method: "POST" })
  .validator((businessId: any) => {
    if (typeof businessId !== "string" || !businessId.trim()) {
      throw new Error("BadRequest: businessId must be a non-empty string");
    }
    return businessId;
  })
  .middleware([authenticatedMiddleware])
  .handler(async ({ data: businessId }) => {
    const { WebsiteProjectService } = await import("../server/services/website-project.service");
    const websiteService = new WebsiteProjectService();
    return websiteService.createOrGetWebsiteDraft(businessId);
  });

export const clientSaveProjectFn = createServerFn({ method: "POST" })
  .validator((d: any) => SaveProjectSchema.parse(d))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data }) => {
    const { ProjectService } = await import("../server/services/project.service");
    const { requireBusinessOwner } = await import("../server/auth/ownership");

    const projectService = new ProjectService();

    const businessId = typeof data.businessId === "object" && data.businessId !== null
      ? (data.businessId as any).id
      : String(data.businessId);

    if (!businessId) {
      throw new Error("BadRequest: businessId is required.");
    }

    await requireBusinessOwner(businessId);

    const existingProject = await projectService.getProjectById(data.id);

    if (existingProject) {
      if (existingProject.status !== "User Draft") {
        throw new Error("Forbidden: Only projects with 'User Draft' status can be updated by the client.");
      }
    } else {
      if (data.status !== "User Draft" && data.status !== "Requested") {
        throw new Error("Forbidden: Clients can only create projects with 'User Draft' or 'Requested' status.");
      }
    }

    if (data.status !== "User Draft" && data.status !== "Requested") {
      throw new Error("Forbidden: Client users can only save projects with 'User Draft' or 'Requested' status.");
    }

    // Delegate Website Blueprint specific validation and compilation to WebsiteProjectService
    if (data.domain === "Website") {
      const { WebsiteProjectService } = await import("../server/services/website-project.service");
      const websiteService = new WebsiteProjectService();
      await websiteService.validateAndSaveWebsiteDraft(data, businessId);
    } else {
      // General project save for other domains
      await projectService.saveProject(data);
    }

    return { success: true };
  });
