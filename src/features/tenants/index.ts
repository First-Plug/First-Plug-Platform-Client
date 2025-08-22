// Hooks
export { useTenantsTable } from "./hooks/useTenantsTable";
export { useTenantsTableColumns } from "./hooks/useTenantsTableColumns";
export { useTenantsSubtableLogic } from "./hooks/useTenantsSubtableLogic";
export { useTenantUsersTableColumns } from "./hooks/useTenantUsersTableColumns";

// API Hooks
export {
  useFetchTenants,
  useFetchTenantById,
  useFetchTenantByTenantName,
  useFetchTenantStats,
} from "./hooks/useFetchTenants";
export { useCreateTenant } from "./hooks/useCreateTenant";
export {
  useUpdateTenant,
  useUpdateTenantOffice,
  useToggleTenantStatus,
  useDeleteTenant,
} from "./hooks/useUpdateTenant";
export { useFetchTenantUsers } from "./hooks/useFetchTenantUsers";

// Interfaces
export type {
  Tenant,
  TenantUser,
  TenantOffice,
  CreateTenantRequest,
  UpdateTenantRequest,
  UpdateTenantOfficeRequest,
  TenantStats,
} from "./interfaces/tenant.interface";

// Data
export { mockTenants, mockTenantStats } from "./data/mockData";

// Services
export { TenantsServices } from "./services/tenants.services";

// Components
export { TenantsTableActions } from "./components/TenantsTableActions";
export { EmptyTenants } from "./components/EmptyTenants";
export { TenantDetailsTable } from "./components/TenantDetailsTable";
export { TenantUsersTable } from "./components/TenantUsersTable";
