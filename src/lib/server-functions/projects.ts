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
    const { ProjectService } = await import("../server/services/project.service");
    const { requireBusinessOwner } = await import("../server/auth/ownership");
    const { adminDb } = await import("@/lib/firebase-admin.server");

    await requireBusinessOwner(businessId);

    const projectService = new ProjectService();
    const projects = await projectService.getProjectsByBusiness(businessId);

    // Find if there is an existing "User Draft" project with Website domain
    const existingDraft = projects.find(p => p.domain === "Website" && p.status === "User Draft");
    if (existingDraft) {
      return existingDraft;
    }

    // Otherwise, create a new website project draft
    if (!adminDb) {
      throw new Error("Firebase Admin is not initialized.");
    }
    const newProjectId = adminDb.collection("projects").doc().id;

    const newProject = {
      id: newProjectId,
      businessId: businessId,
      name: "Website Blueprint Draft",
      description: "Draft website blueprint project.",
      domain: "Website",
      services: ["Website Development"],
      progress: 0,
      assignee: "Unassigned",
      status: "User Draft",
      priority: "Medium",
      notes: "",
      updates: [],
      assets: [],
      completedAt: null,
      deadline: null,
      data: {
        primaryColor: "#0F172A",
        secondaryColor: "#3B82F6",
        logos: [],
        logoDescription: "",
        targetAudience: "",
        referenceLinks: "",
        generalNotes: "",
        blueprint: []
      },
      startDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;

    await projectService.saveProject(newProject);
    return newProject;
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

    // 1. Content & Plan limits validation when transitioning to "Requested" status
    if (data.status === "Requested" && data.domain === "Website") {
      const briefData = data.data || {};
      
      // Colors check
      if (!briefData.primaryColor || !briefData.secondaryColor) {
        throw new Error("ValidationFailed: Brand colors must be specified.");
      }

      // Logo/Description check
      const logosList = Array.isArray(briefData.logos) ? briefData.logos : [];
      const hasLogos = logosList.length > 0;
      const hasLogoDesc = briefData.logoDescription && briefData.logoDescription.trim().length > 0;
      if (!hasLogos && !hasLogoDesc) {
        throw new Error("ValidationFailed: Please upload at least one logo image or describe your logo concept.");
      }

      if (logosList.length > 2) {
        throw new Error("ValidationFailed: Maximum of 2 logo images allowed.");
      }

      // Sections existence check
      const blueprintList = Array.isArray(briefData.blueprint) ? briefData.blueprint : [];
      if (blueprintList.length === 0) {
        throw new Error("ValidationFailed: At least one website section must be added.");
      }

      // Fetch the plan of the business to validate limits
      const { BusinessService } = await import("../server/services/business.service");
      const businessService = new BusinessService();
      const business = await businessService.getBusiness(businessId);
      if (!business) {
        throw new Error("BadRequest: Business not found.");
      }

      const planName = business.plan || "None";
      const { PLAN_LIMITS } = await import("../../data/plans");
      const limits = PLAN_LIMITS[planName] || PLAN_LIMITS.Basic;

      // Enforce plan-based constraints
      if (blueprintList.length > limits.maxWebsiteSections) {
        throw new Error(`ValidationFailed: Section count (${blueprintList.length}) exceeds the maximum allowed sections (${limits.maxWebsiteSections}) for the ${planName} plan.`);
      }

      blueprintList.forEach((section: any, idx: number) => {
        const secNum = idx + 1;
        const displayTitle = section.type === "custom" && section.title ? `"${section.title}"` : `${section.title || "Section"} (#${secNum})`;
        
        if (section.type === "custom" && !limits.eligibilityForCustomSection) {
          throw new Error(`ValidationFailed: Custom sections are not allowed on the ${planName} plan.`);
        }
        if (section.type === "custom" && (!section.title || !section.title.trim())) {
          throw new Error(`ValidationFailed: Custom Section #${secNum} must have a title.`);
        }
        if (!section.description || !section.description.trim()) {
          throw new Error(`ValidationFailed: Please provide details/description for section: ${displayTitle}.`);
        }

        const imagesList = Array.isArray(section.referenceImages) ? section.referenceImages : [];
        if (imagesList.length > limits.maxImagesPerSection) {
          throw new Error(`ValidationFailed: Section ${displayTitle} has ${imagesList.length} images, exceeding the maximum allowed (${limits.maxImagesPerSection}) for the ${planName} plan.`);
        }
      });
    }

    // 2. Automatically compile notes and description if domain is Website
    if (data.domain === "Website" && data.data) {
      const briefData = data.data;

      // Compile Description
      const primaryCol = briefData.primaryColor || "Not specified";
      const secondaryCol = briefData.secondaryColor || "Not specified";
      const logosCount = Array.isArray(briefData.logos) ? briefData.logos.length : 0;
      const logoDesc = briefData.logoDescription ? `Concept: "${briefData.logoDescription}"` : "No logo concept description";
      const sectionsList = Array.isArray(briefData.blueprint) 
        ? briefData.blueprint.map((s: any, idx: number) => `${idx + 1}. ${s.title || "Section"} (${s.type || "unknown"})`).join("\n")
        : "No sections defined";

      data.description = `Website Brief Summary:
- Colors: ${primaryCol} / ${secondaryCol}
- Brand Logos: ${logosCount} file(s) uploaded / ${logoDesc}
- Sections Blueprint:
${sectionsList}`;

      // Compile Notes
      const sectionsDetail = Array.isArray(briefData.blueprint)
        ? briefData.blueprint.map((s: any, idx: number) => {
            const imgUrls = Array.isArray(s.referenceImages) ? s.referenceImages.map((img: any) => img.url).join(", ") : "None";
            return `Section ${idx + 1}: ${s.title || "Section"} [Type: ${s.type || "custom"}]
  Description: ${s.description || "No description provided."}
  Reference Images: ${imgUrls}`;
          }).join("\n\n")
        : "No sections defined";

      const audience = briefData.context?.targetAudience || "Not specified";
      const refs = briefData.context?.referenceLinks || "Not specified";
      const notesVal = briefData.context?.generalNotes || "Not specified";

      data.notes = `DEVELOPER PRODUCTION BRIEF (WEBSITE)
=====================================
Status: ${data.status}
Business ID: ${businessId}
Project ID: ${data.id}

BRANDING DETAILS
----------------
Primary Color: ${primaryCol}
Secondary Color: ${secondaryCol}
Logos Count: ${logosCount}
Logo Description: ${briefData.logoDescription || "None"}

TARGET AUDIENCE
---------------
${audience}

COMPETITOR & REFERENCE LINKS
----------------------------
${refs}

GENERAL INSTRUCTIONS
--------------------
${notesVal}

WEBSITE SECTIONS BLUEPRINT
--------------------------
${sectionsDetail}
`;
    }

    await projectService.saveProject(data);
    return { success: true };
  });
