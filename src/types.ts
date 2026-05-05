export type DayStatus = "office" | "remote" | "vacation" | "holiday";

export type MonthData = Record<string, DayStatus>;

export interface MonthCounts {
  office: number;
  remote: number;
  vacation: number;
  holiday: number;
}
