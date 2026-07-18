import { ProjectService } from "./project.service";
import { type Project } from "@/lib/schemas";
import { adminDb } from "@/lib/firebase-admin.server";
import { requireBusinessOwner } from "../auth/ownership";
import { BusinessService } from "./business.service";
import { PLAN_LIMITS } from "@/data/plans";

export class WebsiteProjectService {
  private projectService = new ProjectService();
  private businessService = new BusinessService();

  async createOrGetWebsiteDraft(businessId: string): Promise<Project> {
    await requireBusinessOwner(businessId);

    const db = adminDb;
    if (!db) {
      throw new Error("Firebase Admin is not initialized.");
    }

    const { createZodConverter } = await import("@/lib/firestore-converter.server");
    const { ProjectSchema } = await import("@/lib/schemas");
    const projectConverter = createZodConverter(ProjectSchema);

    return await db.runTransaction(async (transaction) => {
      const collection = db.collection("projects").withConverter(projectConverter);
      const businessRef = db.collection("businesses").doc(businessId);

      const qRef = collection
        .where("businessId", "==", businessRef)
        .where("domain", "==", "Website")
        .where("status", "==", "User Draft");

      const qStr = collection
        .where("businessId", "==", businessId)
        .where("domain", "==", "Website")
        .where("status", "==", "User Draft");

      const [snapRef, snapStr] = await Promise.all([
        transaction.get(qRef),
        transaction.get(qStr)
      ]);

      if (!snapRef.empty) {
        return snapRef.docs[0].data();
      }
      if (!snapStr.empty) {
        return snapStr.docs[0].data();
      }

      // Otherwise, create a new website project draft
      const newProjectId = collection.doc().id;

      const newProject: Project = {
        id: newProjectId,
        businessId: businessId,
        name: "Website Blueprint Draft",
        description: "Draft website blueprint project.",
        domain: "Website",
        services: ["Website Development"],
        progress: 0,
        assignee: "Admin Reviewer",
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
          blueprint: [],
        },
        startDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = collection.doc(newProjectId);
      transaction.set(docRef, newProject);
      return newProject;
    });
  }

  async validateAndSaveWebsiteDraft(data: any, businessId: string): Promise<void> {
    // 1. Content & Plan limits validation when transitioning to "Requested" status
    if (data.status === "Requested") {
      const briefData = data.data || {};

      // Colors check
      if (!briefData.primaryColor || !briefData.secondaryColor) {
        throw new Error("ValidationFailed: Brand colors must be specified.");
      }

      // Logo/Description check
      const logosList = Array.isArray(briefData.logos) ? briefData.logos : [];
      const hasLogos = logosList.length > 0;
      const hasLogoDesc =
        briefData.logoDescription && briefData.logoDescription.trim().length > 0;
      if (!hasLogos && !hasLogoDesc) {
        throw new Error(
          "ValidationFailed: Please upload at least one logo image or describe your logo concept."
        );
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
      const business = await this.businessService.getBusiness(businessId);
      if (!business) {
        throw new Error("BadRequest: Business not found.");
      }

      const planName = business.plan || "None";
      const limits = PLAN_LIMITS[planName] || PLAN_LIMITS.Basic;

      // Enforce plan-based constraints
      if (blueprintList.length > limits.maxWebsiteSections) {
        throw new Error(
          `ValidationFailed: Section count (${blueprintList.length}) exceeds the maximum allowed sections (${limits.maxWebsiteSections}) for the ${planName} plan.`
        );
      }

      blueprintList.forEach((section: any, idx: number) => {
        const secNum = idx + 1;
        const displayTitle =
          section.type === "custom" && section.title
            ? `"${section.title}"`
            : `${section.title || "Section"} (#${secNum})`;

        if (section.type === "custom" && !limits.eligibilityForCustomSection) {
          throw new Error(`ValidationFailed: Custom sections are not allowed on the ${planName} plan.`);
        }
        if (section.type === "custom" && (!section.title || !section.title.trim())) {
          throw new Error(`ValidationFailed: Custom Section #${secNum} must have a title.`);
        }
        if (!section.description || !section.description.trim()) {
          throw new Error(`ValidationFailed: Please provide details/description for section: ${displayTitle}.`);
        }

        const imagesList = Array.isArray(section.images) ? section.images : [];
        if (imagesList.length > limits.maxImagesPerSection) {
          throw new Error(
            `ValidationFailed: Section ${displayTitle} has ${imagesList.length} images, exceeding the maximum allowed (${limits.maxImagesPerSection}) for the ${planName} plan.`
          );
        }
      });
    }

    // 2. Automatically compile notes and description if domain is Website
    if (data.data) {
      const briefData = data.data;

      // Compile Description
      const primaryCol = briefData.primaryColor || "Not specified";
      const secondaryCol = briefData.secondaryColor || "Not specified";
      const logosCount = Array.isArray(briefData.logos) ? briefData.logos.length : 0;
      const logoDesc = briefData.logoDescription
        ? `Concept: "${briefData.logoDescription}"`
        : "No logo concept description";
      const sectionsList = Array.isArray(briefData.blueprint)
        ? briefData.blueprint
            .map(
              (s: any, idx: number) =>
                `${idx + 1}. ${s.title || "Section"} (${s.type || "unknown"})`
            )
            .join("\n")
        : "No sections defined";

      data.description = `Website Brief Summary:
- Colors: ${primaryCol} / ${secondaryCol}
- Brand Logos: ${logosCount} file(s) uploaded / ${logoDesc}
- Sections Blueprint:
${sectionsList}`;

      // Compile Notes
      const sectionsDetail = Array.isArray(briefData.blueprint)
        ? briefData.blueprint
            .map((s: any, idx: number) => {
              const imgUrls = Array.isArray(s.images)
                ? s.images.map((img: any) => img.url).join(", ")
                : "None";
              return `Section ${idx + 1}: ${s.title || "Section"} [Type: ${s.type || "custom"}]
  Description: ${s.description || "No description provided."}
  Reference Images: ${imgUrls}`;
            })
            .join("\n\n")
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

    await this.projectService.saveProject(data);
  }
}
