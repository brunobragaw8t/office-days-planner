import { useState, useEffect } from "react";
import type { DayStatus, MonthData } from "./types";

function storageKey(year: number, month: number) {
  return `office-days-${year}-${month}`;
}

function load(year: number, month: number): MonthData {
  const stored = localStorage.getItem(storageKey(year, month));
  return stored ? JSON.parse(stored) : {};
}

export function useMonthData(year: number, month: number) {
  const [state, setState] = useState(() => ({
    year,
    month,
    data: load(year, month),
  }));

  if (state.year !== year || state.month !== month) {
    setState({ year, month, data: load(year, month) });
  }

  useEffect(() => {
    if (Object.keys(state.data).length === 0) {
      localStorage.removeItem(storageKey(state.year, state.month));
    } else {
      localStorage.setItem(storageKey(state.year, state.month), JSON.stringify(state.data));
    }
  }, [state]);

  function setDay(day: number, status: DayStatus | null) {
    setState((prev) => {
      const data = { ...prev.data };
      if (status === null) {
        delete data[day];
      } else {
        data[day] = status;
      }
      return { ...prev, data };
    });
  }

  return { data: state.data, setDay };
}
