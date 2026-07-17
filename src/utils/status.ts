import type { Part, PartStatus } from "../types/part";

export function getStatus(part: Part): PartStatus {
  if (part.stock === 0) return "out";
  if (part.stock <= part.threshold * 0.5) return "critical";
  if (part.stock <= part.threshold) return "low";
  return "ok";
}
