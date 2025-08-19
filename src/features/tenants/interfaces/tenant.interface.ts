export interface Tenant {
  id: string;
  name: string;
  numberOfActiveUsers: number;
  users: TenantUser[];
}

export interface TenantUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}
