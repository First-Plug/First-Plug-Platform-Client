export interface UnassignedUser {
  id: string;
  creationDate: string;
  name: string;
  email: string;
  tenant: string;
  role: "Admin" | "User" | "Super Admin" | "";
}
