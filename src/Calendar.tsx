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
  office: "bg-amber-400 text-amber-950",
  remote: "bg-emerald-500 text-white",
  vacation: "bg-blue-500 text-white",
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

function getCarryOverBalance(
  year: number,
  month: number,
  limit: number
): number {
  let firstY = year;
  let firstM = month;
  let foundFirst = false;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    const m = key.match(/^office-days-(\d{4})-(\d{1,2})$/);
    if (!m) continue;
    const ky = Number(m[1]);
    const km = Number(m[2]);
    if (!foundFirst || ky < firstY || (ky === firstY && km < firstM)) {
      firstY = ky;
      firstM = km;
      foundFirst = true;
    }
  }

  if (!foundFirst) return 0;

  let totalUsed = 0;
  let totalMonths = 0;
  let curY = firstY;
  let curM = firstM;

  while (curY < year || (curY === year && curM < month)) {
    const stored = localStorage.getItem(`office-days-${curY}-${curM}`);
    if (stored) {
      const data: MonthData = JSON.parse(stored);
      for (const status of Object.values(data)) {
        if (status === "remote") totalUsed++;
      }
    }
    totalMonths++;
    curM++;
    if (curM > 11) { curM = 0; curY++; }
  }

  return totalMonths * limit - totalUsed;
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

  const [remoteLimit, setRemoteLimit] = useState(() => {
    const stored = localStorage.getItem("remote-limit");
    return stored ? Number(stored) : 10;
  });

  function handleLimitChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Math.max(0, Number(e.target.value) || 0);
    setRemoteLimit(val);
    localStorage.setItem("remote-limit", String(val));
  }

  const remoteUsed = counts.remote;
  const carryOver = getCarryOverBalance(year, month, remoteLimit);
  const totalAvailable = remoteLimit + carryOver;

  return (
    <div className="max-w-lg mx-auto p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrev}
          className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-700 dark:text-zinc-200"
        >
          ←
        </button>
        <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button
          onClick={handleNext}
          className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-700 dark:text-zinc-200"
        >
          →
        </button>
      </div>

      {/* Remote limit config */}
      <div className="flex items-center justify-end mb-4 text-sm">
        <label className="text-zinc-500 dark:text-zinc-400 mr-2">Remote limit</label>
        <input
          type="number"
          min={0}
          value={remoteLimit}
          onChange={handleLimitChange}
          className="w-12 text-center font-semibold text-white bg-zinc-800 rounded border border-zinc-600 focus:outline-none focus:border-blue-500"
        />
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
        <div className="flex justify-between items-center text-sm text-zinc-700 dark:text-zinc-300">
          <span>Remote days used</span>
          <span
            className={
              remoteUsed > totalAvailable
                ? "text-rose-500 font-bold"
                : "font-semibold"
            }
          >
            {remoteUsed} / {totalAvailable}
          </span>
        </div>
        <div className="mt-2 h-2 bg-zinc-300 dark:bg-zinc-600 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${remoteUsed > totalAvailable ? "bg-rose-500" : "bg-emerald-500"}`}
            style={{
              width: `${totalAvailable > 0 ? Math.min((remoteUsed / totalAvailable) * 100, 100) : 0}%`,
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
