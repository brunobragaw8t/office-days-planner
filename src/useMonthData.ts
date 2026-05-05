import { useState, useEffect } from "react";
import type { DayStatus, MonthData } from "./types";

function storageKey(year: number, month: number) {
  return `office-days-${year}-${month}`;
}

export function useMonthData(year: number, month: number) {
  const [data, setData] = useState<MonthData>(() => {
    const stored = localStorage.getItem(storageKey(year, month));
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    const stored = localStorage.getItem(storageKey(year, month));
    setData(stored ? JSON.parse(stored) : {});
  }, [year, month]);

  useEffect(() => {
    localStorage.setItem(storageKey(year, month), JSON.stringify(data));
  }, [data, year, month]);

  function setDay(day: number, status: DayStatus | null) {
    setData((prev: MonthData) => {
      const next = { ...prev };
      if (status === null) {
        delete next[day];
      } else {
        next[day] = status;
      }
      return next;
    });
  }

  return { data, setDay };
}
