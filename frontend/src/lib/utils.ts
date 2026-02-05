import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatEstimate(estimate?: string) {
  if (!estimate) return "-"
  const trimmed = estimate.trim()
  if (trimmed === "unknown") return "알 수 없음"
  if (/(시간|분)/.test(trimmed)) return trimmed
  if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}시간`
  return trimmed
}
