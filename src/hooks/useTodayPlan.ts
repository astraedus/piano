"use client";
import { useMemo } from "react";
import { useAppState } from "./useAppState";
import { computeTodayPlan, TodayMode, TodayPlan } from "@/lib/todayPlan";

export function useTodayPlan(overrideMode?: TodayMode): TodayPlan | null {
  const { state, ready } = useAppState();
  return useMemo(() => {
    if (!ready) return null;
    return computeTodayPlan(state, new Date(), overrideMode);
  }, [state, ready, overrideMode]);
}
