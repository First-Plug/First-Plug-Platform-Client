export const ASIDE_TYPES = [
  "EditTeam",
  "EditMember",
  "LoadStock",
  "LoadMembers",
  "NewTeam",
  "MemberDetails",
  "OrderDetails",
  "AssignProduct",
  "ReassignProduct",
  "EditProduct",
  "RelocateProducts",
  "ChangePassword",
  "UpdateShipment",
  "EditLogisticsShipment",
] as const;

export type AsideType = (typeof ASIDE_TYPES)[number];
