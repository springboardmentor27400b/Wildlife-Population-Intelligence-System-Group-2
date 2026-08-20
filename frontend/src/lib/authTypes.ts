export type Role =
  | "researcher"
  | "conservation"
  | "forest"
  | "admin";

export const ROLE_LABEL: Record<Role, string> = {
  researcher: "Wildlife Researcher",
  conservation: "Conservation Officer",
  forest: "Forest Department Officer",
  admin: "Administrator",
};

export interface AuthUser {
  id: number;
  full_name: string;
  username: string;
  email: string;
  role: Role;
  organization?: string;
}