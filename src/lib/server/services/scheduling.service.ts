import { findEligibleTasks, findSchedulingConfiguration, saveSchedulingConfiguration, getBusinesses } from "@/lib/db.server";
import { type Project, type SchedulingConfiguration, type ProjectStatus, type ProjectPriority } from "@/lib/schemas";

export interface CalendarDayOutput {
  day: string; // Day of the week, e.g. "Monday"
  date: string; // ISO date string YYYY-MM-DD
  capacity: number; // Available capacity in work units
  bookedUnits: number; // Booked capacity in work units
  remainingUnits: number; // Remaining capacity in work units
  tasks: Array<{
    projectId: string;
    projectName: string;
    client: string; // Business name
    taskType: "REEL" | "POST";
    remainingWork: number; // remaining work units after revisionMultiplier
    status: ProjectStatus;
    predictedStart: string; // YYYY-MM-DD
    predictedCompletion: string; // YYYY-MM-DD
  }>;
}

interface SimTask {
  id: string;
  name: string;
  businessId: any;
  priority: ProjectPriority;
  createdAt: Date;
  taskType: "REEL" | "POST";
  remainingWorkUnits: number;
  progress: number;
  status: ProjectStatus;
  predictedStart?: Date;
  predictedCompletion?: Date;
}

export class SchedulingService {
  /**
   * Fetch the persistent scheduling configuration.
   * If none exists in Firestore, the repository returns a default config.
   */
  async getSchedulingConfiguration(): Promise<SchedulingConfiguration> {
    return findSchedulingConfiguration();
  }

  /**
   * Save/update the scheduling configuration.
   */
  async saveSchedulingConfiguration(config: SchedulingConfiguration): Promise<void> {
    await saveSchedulingConfiguration(config);
  }

  /**
   * Helper: Formats a JS Date object into a timezone-agnostic key of format YYYY-MM-DD.
   */
  formatDateKey(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  /**
   * Helper: Checks if a given date is a working business day based on scheduling configuration.
   * It skips weekends and checks if the date is in the holiday list.
   */
  isWorkingDay(date: Date, config: SchedulingConfiguration): boolean {
    const dateStr = this.formatDateKey(date);

    // 1. Check holidays list
    if (config.holidays && config.holidays.includes(dateStr)) {
      return false;
    }

    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    // 2. Check if skipWeekends is enabled
    if (config.skipWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
      if (!config.workingDays || !config.workingDays.includes(dayOfWeek)) {
        return false;
      }
    }

    // 3. Check custom working days array if defined
    if (config.workingDays && config.workingDays.length > 0) {
      if (!config.workingDays.includes(dayOfWeek)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Helper: Finds the next working day starting on or after a given date.
   */
  getNextWorkingDay(date: Date, config: SchedulingConfiguration): Date {
    const next = new Date(date);
    let attempts = 0;
    while (!this.isWorkingDay(next, config) && attempts < 365) {
      next.setDate(next.getDate() + 1);
      attempts++;
    }
    return next;
  }

  /**
   * Helper: Classify a project into REEL or POST based on case-insensitive service tags.
   * Ignores unrelated tags. Returns null if the project is neither a Reel nor a Post request.
   */
  getTaskType(services: string[]): "REEL" | "POST" | null {
    if (!services || !Array.isArray(services)) return null;
    for (const service of services) {
      const lower = service.toLowerCase();
      if (lower === "reel") return "REEL";
      if (lower === "post") return "POST";
    }
    return null;
  }

  /**
   * Helper: Resolves business name from business ID by using an in-memory cache map.
   */
  private resolveBusinessName(businessId: any, businessMap: Map<string, string>): string {
    if (!businessId) return "Unknown Client";
    if (typeof businessId === "object") {
      if (businessId.businessName) return businessId.businessName;
      if (businessId.id) return businessMap.get(businessId.id) || "Unknown Client";
    }
    if (typeof businessId === "string") {
      return businessMap.get(businessId) || "Unknown Client";
    }
    return "Unknown Client";
  }

  /**
   * Runs the deterministic scheduling simulation for all tasks in the queue.
   * It schedules each task day-by-day based on available daily capacity.
   * 
   * @param queue Array of tasks to be scheduled
   * @param config The scheduling configuration parameters
   * @param timelineStartDate The earliest day that capacity can be allocated
   */
  private runSimulation(
    queue: SimTask[],
    config: SchedulingConfiguration,
    timelineStartDate: Date
  ) {
    const dailyCapacityLimit = config.dailyCapacity * config.capacityUtilization;
    if (dailyCapacityLimit <= 0) {
      throw new Error("Daily capacity limit must be greater than zero. Please adjust your config.");
    }

    // Sort queue by production priority:
    // Primary: Creation Date (ascending)
    // Secondary: Priority (High > Medium > Low)
    const priorityMap: Record<ProjectPriority, number> = { High: 3, Medium: 2, Low: 1 };
    const sortedQueue = [...queue].sort((a, b) => {
      const timeA = a.createdAt.getTime();
      const timeB = b.createdAt.getTime();
      if (timeA !== timeB) {
        return timeA - timeB;
      }
      const prioA = priorityMap[a.priority] || 2;
      const prioB = priorityMap[b.priority] || 2;
      return prioB - prioA; // Higher priority scheduled first if created at the exact same time
    });

    // We maintain a map of YYYY-MM-DD to the day's booking details
    const dayBookings = new Map<string, {
      date: Date;
      capacity: number;
      bookedUnits: number;
      tasks: Array<{ task: SimTask; allocatedUnits: number }>;
    }>();

    let currentDate = new Date(timelineStartDate);
    let activeTaskIndex = 0;
    let safetyCounter = 0;
    const maxSimulationDays = 10000; // Safeguard against infinite loops

    while (activeTaskIndex < sortedQueue.length && safetyCounter < maxSimulationDays) {
      // 1. Advance to the next working day (skip weekends and holidays)
      while (!this.isWorkingDay(currentDate, config) && safetyCounter < maxSimulationDays) {
        const holidayKey = this.formatDateKey(currentDate);
        dayBookings.set(holidayKey, {
          date: new Date(currentDate),
          capacity: 0,
          bookedUnits: 0,
          tasks: [],
        });
        currentDate.setDate(currentDate.getDate() + 1);
        safetyCounter++;
      }

      if (safetyCounter >= maxSimulationDays) break;

      const dateKey = this.formatDateKey(currentDate);
      let dayCapacityLeft = dailyCapacityLimit;
      const dayAllocatedTasks: Array<{ task: SimTask; allocatedUnits: number }> = [];

      // 2. Allocate as many tasks to this day as possible until capacity is consumed
      while (dayCapacityLeft > 0 && activeTaskIndex < sortedQueue.length) {
        const currentTask = sortedQueue[activeTaskIndex];
        if (currentTask.remainingWorkUnits <= 0) {
          activeTaskIndex++;
          continue;
        }

        // Set the predicted start date when the task first receives capacity
        if (!currentTask.predictedStart) {
          currentTask.predictedStart = new Date(currentDate);
        }

        const allocateAmount = Math.min(currentTask.remainingWorkUnits, dayCapacityLeft);
        currentTask.remainingWorkUnits -= allocateAmount;
        dayCapacityLeft -= allocateAmount;

        dayAllocatedTasks.push({
          task: currentTask,
          allocatedUnits: allocateAmount,
        });

        // If the task is fully scheduled, set completion date and move to the next task
        if (currentTask.remainingWorkUnits <= 0) {
          currentTask.predictedCompletion = new Date(currentDate);
          activeTaskIndex++;
        }
      }

      // Record day details
      dayBookings.set(dateKey, {
        date: new Date(currentDate),
        capacity: dailyCapacityLimit,
        bookedUnits: dailyCapacityLimit - dayCapacityLeft,
        tasks: dayAllocatedTasks,
      });

      // Move to the next calendar day
      currentDate.setDate(currentDate.getDate() + 1);
      safetyCounter++;
    }

    return { sortedQueue, dayBookings };
  }

  /**
   * Prepares the raw list of eligible projects into task entries for scheduling.
   * Computes the base effort, applies progress deductions and the revision multiplier.
   * Optionally rounds up partial days.
   */
  private processEligibleTasks(
    projects: Project[],
    config: SchedulingConfiguration
  ): SimTask[] {
    const processed: SimTask[] = [];
    const dayCapacity = config.dailyCapacity * config.capacityUtilization;

    for (const project of projects) {
      const type = this.getTaskType(project.services);
      if (!type) continue; // Ignore unrelated tags

      // Base effort from configuration
      const baseEffort = type === "REEL" ? config.taskEffort.reel : config.taskEffort.post;

      // Deduct progress
      // Remaining Work = Base Effort * (1 - progress/100)
      const remainingWork = baseEffort * (1 - (project.progress || 0) / 100);

      // Apply revision multiplier
      let remainingWorkUnits = remainingWork * config.revisionMultiplier;

      // Optionally round up partial days
      if (config.roundUpPartialDays && dayCapacity > 0) {
        remainingWorkUnits = Math.ceil(remainingWorkUnits / dayCapacity) * dayCapacity;
      }

      processed.push({
        id: project.id,
        name: project.name,
        businessId: project.businessId,
        priority: project.priority || "Medium",
        createdAt: project.createdAt ? new Date(project.createdAt) : new Date(),
        taskType: type,
        remainingWorkUnits,
        progress: project.progress || 0,
        status: project.status,
      });
    }

    return processed;
  }

  /**
   * Get the production calendar suited for the admin dashboard view.
   * Schedules all active queue tasks and returns a timeline.
   */
  async getProductionCalendar(
    startDate?: Date,
    numDays = 30
  ): Promise<CalendarDayOutput[]> {
    const config = await this.getSchedulingConfiguration();

    // 1. Fetch eligible tasks and businesses
    const projects = await findEligibleTasks(config.includeOnHold);
    const businesses = await getBusinesses();
    const businessMap = new Map<string, string>();
    for (const b of businesses) {
      businessMap.set(b.id, b.businessName);
    }

    // 2. Prepare tasks for scheduling
    const processedTasks = this.processEligibleTasks(projects, config);

    // 3. Define scheduling start point
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timelineStart = new Date(today);
    timelineStart.setDate(timelineStart.getDate() + config.minimumLeadTime);

    // 4. Run global scheduling simulation
    const { sortedQueue, dayBookings } = this.runSimulation(processedTasks, config, timelineStart);

    // 5. Build output calendar for the requested window
    const outputStart = startDate ? new Date(startDate) : new Date(today);
    outputStart.setHours(0, 0, 0, 0);

    const result: CalendarDayOutput[] = [];
    const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dailyCapacityLimit = config.dailyCapacity * config.capacityUtilization;

    for (let i = 0; i < numDays; i++) {
      const targetDate = new Date(outputStart);
      targetDate.setDate(targetDate.getDate() + i);
      const dateKey = this.formatDateKey(targetDate);
      const dayName = weekdayNames[targetDate.getDay()];

      const booking = dayBookings.get(dateKey);
      if (booking) {
        result.push({
          day: dayName,
          date: dateKey,
          capacity: booking.capacity,
          bookedUnits: booking.bookedUnits,
          remainingUnits: Math.max(0, booking.capacity - booking.bookedUnits),
          tasks: booking.tasks.map((bt) => {
            // Find task in sortedQueue to fetch its final start/end dates
            const origTask = sortedQueue.find((q) => q.id === bt.task.id);
            return {
              projectId: bt.task.id,
              projectName: bt.task.name,
              client: this.resolveBusinessName(bt.task.businessId, businessMap),
              taskType: bt.task.taskType,
              remainingWork: bt.allocatedUnits,
              status: bt.task.status,
              predictedStart: origTask?.predictedStart ? this.formatDateKey(origTask.predictedStart) : dateKey,
              predictedCompletion: origTask?.predictedCompletion ? this.formatDateKey(origTask.predictedCompletion) : dateKey,
            };
          }),
        });
      } else {
        // If no booked events exist for this day (or it falls outside scheduling logic timeline)
        const working = this.isWorkingDay(targetDate, config);
        result.push({
          day: dayName,
          date: dateKey,
          capacity: working ? dailyCapacityLimit : 0,
          bookedUnits: 0,
          remainingUnits: working ? dailyCapacityLimit : 0,
          tasks: [],
        });
      }
    }

    return result;
  }

  /**
   * Calculates availability, blocked dates, and the earliest possible selectable production slot
   * for a client submitting a new Reel or Post project.
   */
  async calculateEarliestProductionDate(
    requestedType: "REEL" | "POST",
    priority: ProjectPriority = "Medium"
  ): Promise<{
    earliestDate: string;
    blockedDates: string[];
    availableDates: string[];
    reason?: string;
  }> {
    const config = await this.getSchedulingConfiguration();

    // 1. Fetch existing active tasks
    const projects = await findEligibleTasks(config.includeOnHold);
    const processedTasks = this.processEligibleTasks(projects, config);

    // 2. Insert the hypothetical new task into the queue
    const baseEffort = requestedType === "REEL" ? config.taskEffort.reel : config.taskEffort.post;
    let workUnits = baseEffort * config.revisionMultiplier;
    const dayCapacity = config.dailyCapacity * config.capacityUtilization;

    if (config.roundUpPartialDays && dayCapacity > 0) {
      workUnits = Math.ceil(workUnits / dayCapacity) * dayCapacity;
    }

    const hypotheticalTask: SimTask = {
      id: "hypothetical-new-request",
      name: "New Project Proposal",
      businessId: "client-pending",
      priority,
      createdAt: new Date(), // current time, placing it at the end of the queue
      taskType: requestedType,
      remainingWorkUnits: workUnits,
      progress: 0,
      status: "Pending",
    };

    processedTasks.push(hypotheticalTask);

    // 3. Define scheduling start point
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timelineStart = new Date(today);
    timelineStart.setDate(timelineStart.getDate() + config.minimumLeadTime);

    // 4. Run scheduling simulation with hypothetical task
    const { sortedQueue, dayBookings } = this.runSimulation(processedTasks, config, timelineStart);

    // 5. Find when the hypothetical task was scheduled
    const scheduledHypothetical = sortedQueue.find((t) => t.id === "hypothetical-new-request");
    let allocatedStart = scheduledHypothetical?.predictedStart;

    if (!allocatedStart) {
      // Fallback if simulation could not allocate (should not happen with infinite days)
      allocatedStart = this.getNextWorkingDay(timelineStart, config);
    }

    // 6. Apply confidence buffer
    // earliestSelectableDate = allocatedStart + confidenceBuffer calendar days
    const earliestSelectable = new Date(allocatedStart);
    earliestSelectable.setDate(earliestSelectable.getDate() + config.confidenceBuffer);

    // Ensure the earliest date is a valid working slot
    const finalEarliest = this.getNextWorkingDay(earliestSelectable, config);
    const finalEarliestKey = this.formatDateKey(finalEarliest);

    // 7. Generate Blocked and Available dates for a 90-day window
    const blockedDates: string[] = [];
    const availableDates: string[] = [];

    for (let i = 0; i < 90; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() + i);
      const dateKey = this.formatDateKey(checkDate);

      // Check if before earliest selectable slot
      if (checkDate < finalEarliest) {
        blockedDates.push(dateKey);
        continue;
      }

      // Check if it's weekend/holiday
      if (!this.isWorkingDay(checkDate, config)) {
        blockedDates.push(dateKey);
        continue;
      }

      // Check if fully booked by existing schedule
      const booking = dayBookings.get(dateKey);
      if (booking && booking.bookedUnits >= dayCapacity) {
        blockedDates.push(dateKey);
        continue;
      }

      availableDates.push(dateKey);
    }

    return {
      earliestDate: finalEarliestKey,
      blockedDates,
      availableDates,
      reason: `Earliest production date calculated by placing new ${requestedType} in queue. Capacity: ${config.dailyCapacity * config.capacityUtilization} units/day. Minimum lead time of ${config.minimumLeadTime} days and confidence buffer of ${config.confidenceBuffer} days applied.`,
    };
  }
}
