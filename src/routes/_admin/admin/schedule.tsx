import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
  Info,
  ExternalLink,
  MoreVertical,
} from "lucide-react";
import {
  getSchedulingConfigurationFn,
  updateSchedulingConfigurationFn,
  getProductionCalendarFn,
} from "@/lib/server-functions";
import { type CalendarDayOutput } from "@/lib/server/services/scheduling.service";
import { type SchedulingConfiguration, type ProjectPriority, type ProjectStatus } from "@/lib/schemas";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_admin/admin/schedule")({
  head: () => ({ meta: [{ title: "Production Schedule — Admin Dashboard" }] }),
  component: ScheduleAdminPage,
});

interface ScheduledTask {
  projectId: string;
  projectName: string;
  client: string;
  taskType: "REEL" | "POST";
  remainingWork: number;
  status: ProjectStatus;
  predictedStart: string;
  predictedCompletion: string;
}

function ScheduleAdminPage() {
  const [activeTab, setActiveTab] = useState<"Calendar" | "Configuration">("Calendar");
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Calendar State
  const [calendarData, setCalendarData] = useState<CalendarDayOutput[]>([]);
  const [calendarStartDate, setCalendarStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedTask, setSelectedTask] = useState<ScheduledTask | null>(null);

  // Configuration State
  const [config, setConfig] = useState<SchedulingConfiguration | null>(null);
  const [newHoliday, setNewHoliday] = useState("");

  // Helpers for toast messages
  const showToast = (message: string) => {
    setToast(message);
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Load configuration and initial calendar data
  const loadData = async () => {
    setLoading(true);
    try {
      const currentConfig = await getSchedulingConfigurationFn();
      setConfig(currentConfig);

      const calendar = await getProductionCalendarFn({
        data: {
          startDate: calendarStartDate.toISOString(),
          numDays: 30,
        },
      });
      setCalendarData(calendar);
    } catch (e: any) {
      console.error("Failed to load scheduling data:", e);
      showToast("✗ Failed to load scheduling details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [calendarStartDate]);

  // Handle configuration updates
  const handleSaveConfig = async () => {
    if (!config) return;
    setLoading(true);
    try {
      const res = await updateSchedulingConfigurationFn({ data: config });
      if (res.success) {
        showToast("✓ Production configuration updated successfully!");
        // Refresh calendar view
        const calendar = await getProductionCalendarFn({
          data: {
            startDate: calendarStartDate.toISOString(),
            numDays: 30,
          },
        });
        setCalendarData(calendar);
      }
    } catch (e: any) {
      console.error("Failed to save config:", e);
      showToast("✗ Failed to save scheduling configuration.");
    } finally {
      setLoading(false);
    }
  };

  // Navigate calendar start date
  const adjustDate = (days: number) => {
    const nextDate = new Date(calendarStartDate);
    nextDate.setDate(nextDate.getDate() + days);
    setCalendarStartDate(nextDate);
  };

  const resetDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setCalendarStartDate(today);
  };

  // Toggle working days inside config
  const toggleWorkingDay = (day: number) => {
    if (!config) return;
    const current = config.workingDays || [];
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort();
    setConfig({ ...config, workingDays: next });
  };

  // Manage Holidays
  const addHoliday = () => {
    if (!config || !newHoliday) return;
    const current = config.holidays || [];
    if (current.includes(newHoliday)) {
      showToast("ⓘ Date is already added as a holiday.");
      return;
    }
    setConfig({
      ...config,
      holidays: [...current, newHoliday].sort(),
    });
    setNewHoliday("");
  };

  const removeHoliday = (dateStr: string) => {
    if (!config) return;
    const current = config.holidays || [];
    setConfig({
      ...config,
      holidays: current.filter((d) => d !== dateStr),
    });
  };

  // Formats a date string for display (e.g., "Jul 23, 2026")
  const formatDisplayDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isToday = (dateStr: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    return dateStr === todayStr;
  };

  return (
    <div className="space-y-6 font-sans text-mm-dark select-none pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-mm-orange/10">
            <Calendar size={20} className="text-mm-orange" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-mm-dark">
              Production Schedule
            </h1>
            <p className="text-xs text-mm-gray font-bold">
              Monitor queue health and configure deterministic capacity thresholds.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-white border border-mm-border rounded-xl p-1 shrink-0 self-start sm:self-auto shadow-sm">
          <button
            onClick={() => setActiveTab("Calendar")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "Calendar"
                ? "bg-mm-orange/10 text-mm-orange font-extrabold"
                : "text-mm-gray hover:bg-mm-subtle/50"
            }`}
          >
            <Layers size={14} /> Schedule Timeline
          </button>
          <button
            onClick={() => setActiveTab("Configuration")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "Configuration"
                ? "bg-mm-orange/10 text-mm-orange font-extrabold"
                : "text-mm-gray hover:bg-mm-subtle/50"
            }`}
          >
            <Settings size={14} /> Queue Parameters
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="animate-spin text-mm-orange mr-2" size={18} />
          <span className="text-xs text-mm-gray font-bold">Updating scheduling simulation...</span>
        </div>
      )}

      {/* Main Content */}
      {!loading && activeTab === "Calendar" && (
        <div className="space-y-6">
          {/* Timeline navigation */}
          <div className="bg-white border border-mm-border rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => adjustDate(-30)}
                className="w-9 h-9 rounded-xl border border-mm-border flex items-center justify-center hover:bg-mm-subtle transition-all cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={resetDate}
                className="px-4 py-2 text-xs font-bold border border-mm-border rounded-xl hover:bg-mm-subtle transition-all cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={() => adjustDate(30)}
                className="w-9 h-9 rounded-xl border border-mm-border flex items-center justify-center hover:bg-mm-subtle transition-all cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="text-xs font-black tracking-widest text-mm-gray uppercase">
              Viewing 30 Days From {calendarStartDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>

            <button
              onClick={loadData}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-mm-dark text-white rounded-xl hover:bg-mm-dark/95 transition-all cursor-pointer"
            >
              <RefreshCw size={12} /> Sync Simulation
            </button>
          </div>

          {/* Linear Calendar Timeline Grid */}
          <div className="bg-white border border-mm-border rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
            <div className="divide-y divide-mm-border/60">
              {calendarData.map((day) => {
                const isDayToday = isToday(day.date);
                const capacityPercent = day.capacity > 0 ? (day.bookedUnits / day.capacity) * 100 : 0;
                
                // Keep colors clean and light
                const utilizationClass = capacityPercent >= 100 
                  ? "bg-mm-orange/20 text-mm-orange" 
                  : capacityPercent >= 75 
                    ? "bg-amber-100 text-amber-700" 
                    : "bg-slate-100 text-slate-600";

                return (
                  <div
                    key={day.date}
                    className={`flex flex-col md:flex-row items-stretch transition-all hover:bg-mm-subtle/20 ${
                      isDayToday ? "bg-mm-orange/5" : ""
                    }`}
                  >
                    {/* Left Column: Date & Day Info */}
                    <div className="w-full md:w-56 p-5 flex md:flex-col justify-between md:justify-center border-b md:border-b-0 md:border-r border-mm-border/60 shrink-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-mm-dark">
                            {formatDisplayDate(day.date)}
                          </span>
                          {isDayToday && (
                            <span className="bg-mm-orange text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0">
                              Today
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-mm-gray font-bold mt-0.5">
                          {day.day}
                        </div>
                      </div>

                      {/* Micro capacity status bar */}
                      <div className="flex items-center md:items-start flex-col gap-1.5 mt-0 md:mt-4">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${utilizationClass}`}>
                          {day.capacity > 0 ? `${day.bookedUnits.toFixed(1)} / ${day.capacity.toFixed(1)} units` : "No Capacity"}
                        </span>
                        {day.capacity > 0 && (
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden md:block">
                            <div
                              className="h-full bg-mm-orange rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, capacityPercent)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Scheduled tasks for the day */}
                    <div className="flex-1 p-5 flex flex-col justify-center">
                      {day.tasks.length === 0 ? (
                        <div className="text-xs text-mm-gray/60 italic font-bold">
                          {day.capacity === 0 
                            ? "Non-working day (Weekend or Holiday)" 
                            : "Idle capacity available — no tasks queued."}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2.5">
                          {day.tasks.map((task) => (
                            <div
                              key={task.projectId}
                              onClick={() => setSelectedTask(task)}
                              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-mm-border/60 bg-white hover:border-mm-orange/50 hover:shadow-sm transition-all cursor-pointer"
                            >
                              <div className="flex items-start sm:items-center gap-3">
                                <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded shrink-0 ${
                                  task.taskType === "REEL" 
                                    ? "bg-violet-50 text-violet-600 border border-violet-100" 
                                    : "bg-teal-50 text-teal-600 border border-teal-100"
                                }`}>
                                  {task.taskType}
                                </span>
                                <div>
                                  <h4 className="font-extrabold text-xs text-mm-dark group-hover:text-mm-orange transition-colors">
                                    {task.projectName}
                                  </h4>
                                  <p className="text-[10px] text-mm-gray font-bold mt-0.5">
                                    Client: {task.client}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 self-end sm:self-auto">
                                <span className="text-[10px] text-mm-gray font-black tracking-wider uppercase bg-mm-subtle/80 px-2 py-0.5 rounded">
                                  Allocated: {task.remainingWork.toFixed(1)} units
                                </span>
                                <div className="text-right text-[10px] text-mm-gray font-bold hidden sm:block">
                                  <div>Est. Start: {formatDisplayDate(task.predictedStart)}</div>
                                  <div>Completion: {formatDisplayDate(task.predictedCompletion)}</div>
                                </div>

                                <DropdownMenu modal={false}>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                      className="p-1 hover:bg-slate-100 rounded-lg text-mm-gray hover:text-mm-dark transition-all cursor-pointer"
                                    >
                                      <MoreVertical size={16} />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-white border border-mm-border text-xs text-mm-dark w-40 p-1 shadow-md rounded-xl">
                                    <DropdownMenuItem
                                      onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        setSelectedTask(task);
                                      }}
                                      className="cursor-pointer font-bold py-2 px-3 hover:bg-slate-50 flex items-center gap-2 rounded-lg"
                                    >
                                      <Layers size={14} className="text-mm-gray" /> Quick View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                      <Link
                                        to="/admin/projects/$id"
                                        params={{ id: task.projectId }}
                                        search={{ edit: false }}
                                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                        className="cursor-pointer font-bold py-2 px-3 hover:bg-slate-50 flex items-center gap-2 rounded-lg w-full text-left"
                                      >
                                        <ExternalLink size={14} className="text-mm-gray" /> View Project
                                      </Link>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Configuration Panel */}
      {!loading && activeTab === "Configuration" && config && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main settings form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
              <h3 className="font-extrabold text-sm text-mm-dark mb-1">Capacity Settings</h3>
              <p className="text-xs text-mm-gray mb-6 font-bold">
                Configure basic output metrics and utilization thresholds.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-extrabold text-mm-dark mb-2">
                    Daily Base Capacity (hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={config.dailyCapacity}
                    onChange={(e) => setConfig({ ...config, dailyCapacity: Number(e.target.value) })}
                    className="w-full border border-mm-border rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-mm-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-mm-dark mb-2">
                    Capacity Utilization Factor (ratio)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    max="1.0"
                    min="0.1"
                    value={config.capacityUtilization}
                    onChange={(e) => setConfig({ ...config, capacityUtilization: Number(e.target.value) })}
                    className="w-full border border-mm-border rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-mm-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-mm-dark mb-2">
                    Minimum Project Lead Time (days)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={config.minimumLeadTime}
                    onChange={(e) => setConfig({ ...config, minimumLeadTime: Number(e.target.value) })}
                    className="w-full border border-mm-border rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-mm-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-mm-dark mb-2">
                    Post-Production Confidence Buffer (days)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={config.confidenceBuffer}
                    onChange={(e) => setConfig({ ...config, confidenceBuffer: Number(e.target.value) })}
                    className="w-full border border-mm-border rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-mm-orange"
                  />
                </div>
              </div>
            </div>

            {/* Effort & Buffer calculations */}
            <div className="bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
              <h3 className="font-extrabold text-sm text-mm-dark mb-1">Effort & Buffer Weights</h3>
              <p className="text-xs text-mm-gray mb-6 font-bold">
                Assign effort weights to specific production tags.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-xs font-extrabold text-mm-dark mb-2">
                    Reel Production Effort (units)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.taskEffort.reel}
                    onChange={(e) => setConfig({
                      ...config,
                      taskEffort: { ...config.taskEffort, reel: Number(e.target.value) },
                    })}
                    className="w-full border border-mm-border rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-mm-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-mm-dark mb-2">
                    Post Production Effort (units)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.taskEffort.post}
                    onChange={(e) => setConfig({
                      ...config,
                      taskEffort: { ...config.taskEffort, post: Number(e.target.value) },
                    })}
                    className="w-full border border-mm-border rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-mm-orange"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-mm-dark mb-2">
                    Revision/Feedback Multiplier (ratio)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={config.revisionMultiplier}
                    onChange={(e) => setConfig({ ...config, revisionMultiplier: Number(e.target.value) })}
                    className="w-full border border-mm-border rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-mm-orange"
                  />
                </div>
              </div>

              {/* Behavior switches */}
              <div className="space-y-4 pt-4 border-t border-mm-border/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs text-mm-dark">Round Up Partial Days</h4>
                    <p className="text-[10px] text-mm-gray font-bold">
                      Force tasks to occupy full daily capacity blocks.
                    </p>
                  </div>
                  <button
                    onClick={() => setConfig({ ...config, roundUpPartialDays: !config.roundUpPartialDays })}
                    className={`w-11 h-6 rounded-full cursor-pointer relative transition-all ${
                      config.roundUpPartialDays ? "bg-mm-orange" : "bg-mm-gray/30"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${
                        config.roundUpPartialDays ? "left-5.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs text-mm-dark">Include "On Hold" Projects</h4>
                    <p className="text-[10px] text-mm-gray font-bold">
                      Consume daily capacity for paused requests.
                    </p>
                  </div>
                  <button
                    onClick={() => setConfig({ ...config, includeOnHold: !config.includeOnHold })}
                    className={`w-11 h-6 rounded-full cursor-pointer relative transition-all ${
                      config.includeOnHold ? "bg-mm-orange" : "bg-mm-gray/30"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${
                        config.includeOnHold ? "left-5.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs text-mm-dark">Skip Weekends</h4>
                    <p className="text-[10px] text-mm-gray font-bold">
                      Exclude Saturdays and Sundays from scheduling calculations.
                    </p>
                  </div>
                  <button
                    onClick={() => setConfig({ ...config, skipWeekends: !config.skipWeekends })}
                    className={`w-11 h-6 rounded-full cursor-pointer relative transition-all ${
                      config.skipWeekends ? "bg-mm-orange" : "bg-mm-gray/30"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${
                        config.skipWeekends ? "left-5.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Working Days and Holidays sidebar */}
          <div className="space-y-6">
            {/* Working days checkboxes */}
            <div className="bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
              <h3 className="font-extrabold text-sm text-mm-dark mb-1">Working Days</h3>
              <p className="text-xs text-mm-gray mb-4 font-bold">
                Select days available for queue allocation.
              </p>

              <div className="space-y-2">
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                  (dayName, index) => {
                    const active = (config.workingDays || []).includes(index);
                    return (
                      <div
                        key={dayName}
                        onClick={() => toggleWorkingDay(index)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                          active
                            ? "bg-mm-orange/5 border-mm-orange/30 text-mm-dark"
                            : "bg-white border-mm-border text-mm-gray hover:bg-mm-subtle/50"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            active
                              ? "bg-mm-orange border-mm-orange text-white"
                              : "border-mm-border bg-white"
                          }`}
                        >
                          {active && <span className="text-[9px]">✓</span>}
                        </div>
                        {dayName}
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Holiday list management */}
            <div className="bg-white border border-mm-border rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
              <h3 className="font-extrabold text-sm text-mm-dark mb-1">Company Holidays</h3>
              <p className="text-xs text-mm-gray mb-4 font-bold">
                Define dates skipped in queue allocation.
              </p>

              <div className="flex gap-2 mb-4">
                <input
                  type="date"
                  value={newHoliday}
                  onChange={(e) => setNewHoliday(e.target.value)}
                  className="flex-1 border border-mm-border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-mm-orange"
                />
                <button
                  onClick={addHoliday}
                  className="w-9 h-9 bg-mm-dark text-white rounded-xl flex items-center justify-center hover:bg-mm-dark/95 cursor-pointer shrink-0"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {(config.holidays || []).length === 0 ? (
                  <div className="text-xs text-mm-gray/60 italic font-bold text-center py-4">
                    No holidays registered.
                  </div>
                ) : (
                  (config.holidays || []).map((h) => (
                    <div
                      key={h}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-mm-border/60 text-xs font-bold text-mm-dark bg-mm-subtle/30"
                    >
                      <span>{formatDisplayDate(h)}</span>
                      <button
                        onClick={() => removeHoliday(h)}
                        className="text-mm-gray hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Save Config Widget */}
            <div className="pt-2">
              <button
                onClick={handleSaveConfig}
                className="w-full py-3 bg-mm-orange hover:bg-mm-orange/95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer text-center"
              >
                Save Production Parameters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Context Details overlay drawer */}
      <Sheet open={selectedTask !== null} onOpenChange={(open) => !open && setSelectedTask(null)}>
        {selectedTask && (
          <SheetContent className="bg-white border-l border-mm-border p-6 sm:max-w-md text-mm-dark">
            <SheetHeader className="pb-4 border-b border-mm-border/60">
              <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded self-start ${
                selectedTask.taskType === "REEL" 
                  ? "bg-violet-50 text-violet-600 border border-violet-100" 
                  : "bg-teal-50 text-teal-600 border border-teal-100"
              }`}>
                {selectedTask.taskType} Request
              </span>
              <SheetTitle className="font-extrabold text-sm text-mm-dark mt-2">
                {selectedTask.projectName}
              </SheetTitle>
              <SheetDescription className="text-xs font-bold text-mm-gray">
                Predicted schedule allocation details from the queue simulation.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 py-6 text-xs">
              {/* Client and project metadata */}
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2.5 border-b border-mm-border/40">
                  <div className="flex items-center gap-2 text-mm-gray font-bold">
                    <Briefcase size={14} /> Client Account
                  </div>
                  <span className="font-extrabold text-mm-dark">{selectedTask.client}</span>
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-mm-border/40">
                  <div className="flex items-center gap-2 text-mm-gray font-bold">
                    <Clock size={14} /> Allocated Work Units
                  </div>
                  <span className="font-extrabold text-mm-dark">
                    {selectedTask.remainingWork.toFixed(1)} units
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-mm-border/40">
                  <div className="flex items-center gap-2 text-mm-gray font-bold">
                    <Layers size={14} /> Project Status
                  </div>
                  <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded ${
                    selectedTask.status === "In Progress"
                      ? "bg-mm-orange/10 text-mm-orange"
                      : "bg-mm-subtle text-mm-gray"
                  }`}>
                    {selectedTask.status}
                  </span>
                </div>
              </div>

              {/* Schedule Dates */}
              <div className="bg-mm-subtle/40 rounded-2xl p-4 space-y-3.5 border border-mm-border/40">
                <h4 className="font-black text-[10px] uppercase tracking-wider text-mm-gray flex items-center gap-1.5">
                  <Sparkles size={11} className="text-mm-orange" /> Predicted Timeline
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-mm-gray font-bold block">Start Date</span>
                    <span className="font-extrabold text-xs text-mm-dark">
                      {formatDisplayDate(selectedTask.predictedStart)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-mm-gray font-bold block">Completion Date</span>
                    <span className="font-extrabold text-xs text-mm-dark">
                      {formatDisplayDate(selectedTask.predictedCompletion)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notice info */}
              <div className="flex gap-2 p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-blue-800 text-[10px] font-bold leading-relaxed">
                <Info size={14} className="shrink-0 mt-0.5" />
                <span>
                  The timeline dates represent the deterministic queue output based on date created, priority ranking, and current resource constraints.
                </span>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-mm-border/60">
                <Link
                  to="/admin/projects/$id"
                  params={{ id: selectedTask.projectId }}
                  search={{ edit: false }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-mm-dark hover:bg-mm-dark/95 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer text-center"
                >
                  <ExternalLink size={14} /> View Project Details
                </Link>
              </div>
            </div>
          </SheetContent>
        )}
      </Sheet>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg font-bold text-xs bg-mm-green/10 border border-mm-green text-mm-green">
          {toast}
        </div>
      )}
    </div>
  );
}
