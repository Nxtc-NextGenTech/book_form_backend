export type Role = "ADMIN" | "INSTITUTION" | "PARENT";

export interface AuthContext {
  sub: string;
  role: Role;
  institutionId?: string;
  parentId?: string;
}

export type InstitutionStatus = "PENDING" | "ACTIVE" | "INACTIVE";
export type OrderStatus = "PENDING" | "CONFIRMED" | "DISTRIBUTED";
export type PaymentStatus = "PENDING" | "PAID";
export type ItemCategory = "SUBJECT" | "NOTEBOOK" | "MUSHAF" | "CUSTOM";
