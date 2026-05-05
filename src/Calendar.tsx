import { useState } from "react";
import type { DayStatus, MonthData, MonthCounts } from "./types";
import { useMonthData } from "./useMonthData";

const STATUS_CYCLE: (DayStatus | null)[] = [
  "office",
  "remote",
  "vacation",
  "holiday",
  null,
];

const STATUS_STYLES: Record<DayStatus, string> = {
  office: "bg-blue-500 text-white",
  remote: "bg-amber-400 text-amber-950",
  vacation: "bg-emerald-500 text-white",
  holiday: "bg-rose-400 text-white",
};

const STATUS_LABELS: Record<DayStatus, string> = {
  office: "Office",
  remote: "Remote",
  vacation: "Vacation",
  holiday: "Holiday",
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function computeCounts(data: MonthData): MonthCounts {
  const counts: MonthCounts = { office: 0, remote: 0, vacation: 0, holiday: 0 };
  for (const status of Object.values(data)) {
    counts[status]++;
  }
  return counts;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const { data, setDay } = useMonthData(year, month);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const counts = computeCounts(data);

  function handlePrev() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else setMonth(month - 1);
  }

  function handleNext() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else setMonth(month + 1);
  }

  function handleDayClick(day: number) {
    const current = data[day] ?? null;
    const idx = STATUS_CYCLE.indexOf(current);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    setDay(day, next);
  }

  const HOME_OFFICE_LIMIT = 10;
  const remoteUsed = counts.remote;

  return (
    <div className="max-w-lg mx-auto p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrev}
          className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          ←
        </button>
        <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button
          onClick={handleNext}
          className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          →
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-zinc-500 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const status = data[day] as DayStatus | undefined;
          const base =
            "aspect-square flex items-center justify-center rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 hover:scale-105";
          const style = status
            ? STATUS_STYLES[status]
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700";
          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`${base} ${style}`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend & Counts */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {(Object.keys(STATUS_LABELS) as DayStatus[]).map((status) => (
          <div
            key={status}
            className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
          >
            <span
              className={`w-3 h-3 rounded-sm ${STATUS_STYLES[status].split(" ")[0]}`}
            />
            <span>{STATUS_LABELS[status]}</span>
            <span className="ml-auto font-semibold">{counts[status]}</span>
          </div>
        ))}
      </div>

      {/* Remote budget */}
      <div className="mt-4 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
        <div className="flex justify-between text-sm text-zinc-700 dark:text-zinc-300">
          <span>Home-office days used</span>
          <span
            className={
              remoteUsed > HOME_OFFICE_LIMIT
                ? "text-rose-500 font-bold"
                : "font-semibold"
            }
          >
            {remoteUsed} / {HOME_OFFICE_LIMIT}
          </span>
        </div>
        <div className="mt-2 h-2 bg-zinc-300 dark:bg-zinc-600 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${remoteUsed > HOME_OFFICE_LIMIT ? "bg-rose-500" : "bg-amber-400"}`}
            style={{
              width: `${Math.min((remoteUsed / HOME_OFFICE_LIMIT) * 100, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Instructions */}
      <p className="mt-4 text-xs text-center text-zinc-400">
        Click a day to cycle: Office → Remote → Vacation → Holiday → Clear
      </p>
    </div>
  );
}
