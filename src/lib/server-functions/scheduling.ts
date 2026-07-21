import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { adminMiddleware, authenticatedMiddleware } from "./middleware";
import { SchedulingConfigurationSchema } from "../schemas";

// Schema for production calendar input validation
const GetProductionCalendarInputSchema = z.object({
  startDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  numDays: z.number().optional().default(30),
}).optional();

// Schema for client API input validation
const CalculateEarliestProductionDateInputSchema = z.object({
  taskType: z.enum(["Reel", "Post", "REEL", "POST", "reel", "post"]),
  priority: z.enum(["Low", "Medium", "High"]).optional().default("Medium"),
});

export const getSchedulingConfigurationFn = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const { SchedulingService } = await import("../server/services/scheduling.service");
    const service = new SchedulingService();
    return service.getSchedulingConfiguration();
  });

export const updateSchedulingConfigurationFn = createServerFn({ method: "POST" })
  .validator((d: any) => SchedulingConfigurationSchema.parse(d))
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const { SchedulingService } = await import("../server/services/scheduling.service");
    const service = new SchedulingService();
    await service.saveSchedulingConfiguration(data);
    return { success: true };
  });

export const getProductionCalendarFn = createServerFn({ method: "GET" })
  .validator((d: any) => GetProductionCalendarInputSchema.parse(d))
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const { SchedulingService } = await import("../server/services/scheduling.service");
    const service = new SchedulingService();
    const startDate = data?.startDate;
    const numDays = data?.numDays ?? 30;
    return service.getProductionCalendar(startDate, numDays);
  });

export const calculateEarliestProductionDateFn = createServerFn({ method: "GET" })
  .validator((d: any) => CalculateEarliestProductionDateInputSchema.parse(d))
  .middleware([authenticatedMiddleware])
  .handler(async ({ data }) => {
    const { SchedulingService } = await import("../server/services/scheduling.service");
    const service = new SchedulingService();
    
    // Normalize task type to uppercase
    const normalizedType = data.taskType.toUpperCase() as "REEL" | "POST";
    
    return service.calculateEarliestProductionDate(normalizedType, data.priority);
  });
