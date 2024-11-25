import type { UserRole } from "@prisma/client";

export interface AuthUser {
  id: string;
  name: string;
  email?: string | null;
  role: UserRole;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}
