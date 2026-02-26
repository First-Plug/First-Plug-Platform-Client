import React from "react";

export interface ProductSnapshotLike {
  category?: string;
  name?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
}

/**
 * Format Brand + Model + Name without dash (as requested: Brand Model Name)
 */
export function formatBrandModelName(snapshot: ProductSnapshotLike): React.ReactNode {
  const parts: string[] = [];
  if (snapshot.brand) parts.push(snapshot.brand);
  if (snapshot.model) parts.push(snapshot.model);
  if (snapshot.name) parts.push(snapshot.name);
  if (parts.length === 0) return null;
  return <span className="text-gray-700">{parts.join(" ")}</span>;
}
