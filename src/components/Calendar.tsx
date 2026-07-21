import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Calendar as CalendarIcon,
  Clock,
  Globe,
  X,
  ArrowLeft,
  Check,
} from "lucide-react";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  time?: string;
  category?: "post" | "meeting" | "event" | "task";
  status?: "synced" | "pending" | "confirmed" | "cancelled";
  description?: string;
}

export interface CalendarProps {
  role?: "admin" | "client";
  events?: CalendarEvent[];
  initialDate?: Date;
  minDate?: Date;
  onSelectDate?: (date: Date) => void;
  onAddEvent?: (event: Partial<CalendarEvent>) => void;
  onConfirmSchedule?: (selectedDate: Date, time: string, title: string) => void;
  onClose?: () => void;
  className?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const formatLocalDateStr = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const Calendar: React.FC<CalendarProps> = ({
  role = "client",
  events: propEvents,
  initialDate = new Date(),
  minDate = new Date(),
  onSelectDate,
  onAddEvent,
  onConfirmSchedule,
  onClose,
  className = "",
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [selectedTime, setSelectedTime] = useState<string>("10:00 AM");

  const sampleEvents: CalendarEvent[] = useMemo(() => {
    return [];
  }, []);

  const [eventsList, setEventsList] = useState<CalendarEvent[]>(propEvents || sampleEvents);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = useMemo(() => {
    const days: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = [];

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        dateStr: formatLocalDateStr(prevDate),
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currDate = new Date(year, month, day);
      days.push({
        date: currDate,
        isCurrentMonth: true,
        dateStr: formatLocalDateStr(currDate),
      });
    }

    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        dateStr: formatLocalDateStr(nextDate),
      });
    }

    return days;
  }, [year, month, firstDayOfMonth, daysInMonth, daysInPrevMonth]);

  const selectedDateStr = formatLocalDateStr(selectedDate);
  const todayStr = formatLocalDateStr(new Date());
  const minDateStr = formatLocalDateStr(minDate);

  const selectedDayEvents = useMemo(() => {
    return eventsList.filter((evt) => evt.date === selectedDateStr);
  }, [eventsList, selectedDateStr]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (onSelectDate) onSelectDate(date);
  };

  const handleConfirm = () => {
    const newEvt: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: "Scheduled Reel",
      date: selectedDateStr,
      time: selectedTime,
      description: "Post design scheduled & ready for publishing",
      status: "confirmed",
      category: "post",
    };
    setEventsList((prev) => [...prev, newEvt]);
    if (onConfirmSchedule) {
      onConfirmSchedule(selectedDate, selectedTime, "Scheduled Post");
    }
  };

  return (
    <div
      className={`bg-white w-full h-full flex flex-col justify-between text-zinc-900 font-sans ${className}`}
    >
      {/* iOS Style White Top Navigation Header */}
      <div className="relative px-4 py-2 flex items-center justify-between border-b border-zinc-100 shrink-0">
        <div className="flex items-center gap-2 z-10">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-zinc-800 hover:text-black transition-colors rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
              <span className="text-xs font-semibold text-zinc-700">Back</span>
            </button>
          )}
        </div>

        {/* Month & Year Title Centered */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
          <span className="text-sm font-bold text-zinc-900 tracking-tight">
            {MONTH_NAMES[month]} {year}
          </span>
        </div>
      </div>

      {/* Main Body Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Weekday Row */}
        <div className="grid grid-cols-7 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className={`py-0.5 ${day === "SUN" ? "text-blue-600 font-bold" : ""}`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day Grid Cells (Apple iOS Style Circle Badges) */}
        <div className="grid grid-cols-7 gap-y-4 gap-x-1 justify-items-center">
          {calendarDays.map((item, idx) => {
            const isToday = item.dateStr === todayStr;
            const isSelected = item.dateStr === selectedDateStr;
            const isSunday = item.date.getDay() === 0;
            const isPastDate = item.isCurrentMonth && item.dateStr < minDateStr;
            const dayEvents = eventsList.filter((e) => e.date === item.dateStr);

            return (
              <button
                key={idx}
                type="button"
                disabled={!item.isCurrentMonth || isPastDate}
                onClick={() =>
                  item.isCurrentMonth && !isPastDate && handleDateClick(item.date)
                }
                className={`w-7.5 h-7.5 rounded-full flex flex-col items-center justify-center relative transition-all text-[14px] ${
                  !item.isCurrentMonth
                    ? "text-zinc-300 font-normal cursor-default pointer-events-none opacity-60"
                    : isPastDate
                    ? isSunday
                      ? "text-blue-600 font-semibold opacity-65 rounded-full cursor-not-allowed pointer-events-none select-none"
                      : "text-zinc-700 font-semibold opacity-65 rounded-full cursor-not-allowed pointer-events-none select-none"
                    : isToday && isSelected
                    ? "bg-zinc-900 text-white font-bold rounded-full underline decoration-2 underline-offset-4 decoration-red-500 scale-105 shadow-md cursor-pointer"
                    : isToday
                    ? isSunday
                      ? "underline decoration-2 underline-offset-4 decoration-red-500 font-extrabold text-blue-600 cursor-pointer"
                      : "underline decoration-2 underline-offset-4 decoration-red-500 font-extrabold text-zinc-900 cursor-pointer"
                    : isSelected
                    ? "bg-zinc-900 text-white font-bold rounded-full shadow-md scale-105 cursor-pointer"
                    : isSunday
                    ? "text-blue-600 font-bold hover:bg-blue-50 cursor-pointer"
                    : "text-zinc-800 font-semibold hover:bg-zinc-100 cursor-pointer"
                }`}
              >
                <span>{item.date.getDate()}</span>

                {/* Diagonal Red Slash for Past Days of Current Month */}
                {isPastDate && (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                    viewBox="0 0 30 30"
                    fill="none"
                  >
                    <line
                      x1="6"
                      y1="24"
                      x2="24"
                      y2="6"
                      stroke="#ef4444"
                      strokeWidth="1"
                      strokeLinecap="round"
                    />
                  </svg>
                )}

                {/* Red Dot Indicator for Scheduled / Confirmed Reels */}
                {!isPastDate && dayEvents.length > 0 && (
                  <span
                    className={`size-1 rounded-full absolute bottom-0.5 ${
                      isSelected ? "bg-red-400" : "bg-red-500 shadow-xs shadow-red-500/50"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Card for Selected Date Event */}
        <div className="mt-3 space-y-2">
          {selectedDayEvents.length > 0 ? (
            selectedDayEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-2xl flex items-start gap-2.5 shadow-xs"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0 shadow-xs shadow-red-500/50" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-zinc-900 truncate">
                      {evt.title}
                    </h4>
                  </div>
                  {evt.description && (
                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug line-clamp-2">
                      {evt.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 bg-zinc-50/60 border border-dashed border-zinc-200 rounded-2xl text-center">
              <p className="text-[11px] text-zinc-400 font-medium">
                Nothing is scheduled for {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Fixed Action Footer */}
      <div className="px-4 pt-3 pb-2 bg-white border-t border-zinc-100 flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-1/4 py-2.5 bg-gray-100 hover:bg-gray-200 text-zinc-800 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 px-3 bg-mm-orange hover:bg-mm-orange/95 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>Confirm & Schedule Post</span>
          </button>
        </div>

        {/* iOS Bottom Home Swipe Bar */}
        <div className="w-full bg-white pt-1 pb-1 flex justify-center shrink-0">
          <div className="w-28 h-1 bg-zinc-900/40 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
