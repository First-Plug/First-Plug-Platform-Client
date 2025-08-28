import type { Tenant } from "../interfaces/tenant.interface";

export function sortTenants(list: Tenant[]) {
  return [...list].sort((a, b) => {
    const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (db !== da) return db - da; // createdAt DESC (nuevos arriba)
    // desempate estable:
    const na = (a.name ?? a.tenantName ?? "").toLowerCase();
    const nb = (b.name ?? b.tenantName ?? "").toLowerCase();
    return na.localeCompare(nb);
  });
}
