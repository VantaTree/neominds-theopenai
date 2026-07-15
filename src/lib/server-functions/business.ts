import { createServerFn } from "@tanstack/react-start";
import { authenticatedMiddleware, adminMiddleware, businessOwnerMiddleware } from "./middleware";
import {
  GetBusinessSchema,
  GetBusinessesByUserSchema,
  DeleteBusinessSchema,
  SaveBusinessSchema,
} from "../schemas/api/business";

export const getMyBusinessesFn = createServerFn({ method: "GET" })
  .middleware([authenticatedMiddleware])
  .handler(async ({ context }) => {
    const { BusinessService } = await import("../server/services/business.service");
    
    const decoded = context.user;
    const businessService = new BusinessService();
    return businessService.getBusinessesByUser(decoded.uid);
  });

export const getBusinessesFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const { BusinessService } = await import("../server/services/business.service");
    
    const businessService = new BusinessService();
    return businessService.getBusinesses();
  });

export const getBusinessFn = createServerFn({ method: "GET" })
  .validator((d: any) => GetBusinessSchema.parse(d))
  .middleware([businessOwnerMiddleware])
  .handler(async ({ context }) => {
    return context!.business;
  });

export const getBusinessesByUserFn = createServerFn({ method: "GET" })
  .validator((d: any) => GetBusinessesByUserSchema.parse(d))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const { BusinessService } = await import("../server/services/business.service");
    
    const decoded = context.user;
    if (decoded.uid !== data && decoded.admin !== true) {
      throw new Error("Unauthorized: Cannot retrieve businesses for another user.");
    }
    const businessService = new BusinessService();
    return businessService.getBusinessesByUser(data);
  });

export const saveBusinessFn = createServerFn({ method: "POST" })
  .validator((d: any) => SaveBusinessSchema.parse(d))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const { BusinessService } = await import("../server/services/business.service");
    
    const decoded = context.user;
    const bizUserId = typeof data.userId === "string" ? data.userId : (data.userId as any)?.id;
    if (bizUserId !== decoded.uid && decoded.admin !== true) {
      throw new Error("Unauthorized: You do not own this business.");
    }
    const businessService = new BusinessService();
    await businessService.saveBusiness(data);
    return { success: true };
  });

export const deleteBusinessFn = createServerFn({ method: "POST" })
  .validator((d: any) => DeleteBusinessSchema.parse(d))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data, context }) => {
    const { BusinessService } = await import("../server/services/business.service");
    
    const businessService = new BusinessService();
    const existingBiz = await businessService.getBusiness(data);
    if (existingBiz) {
      const decoded = context.user;
      const bizUserId = typeof existingBiz.userId === "string" ? existingBiz.userId : (existingBiz.userId as any)?.id;
      if (bizUserId !== decoded.uid && decoded.admin !== true) {
        throw new Error("Unauthorized: You do not own this business.");
      }
    }
    await businessService.deleteBusiness(data);
    return { success: true };
  });
