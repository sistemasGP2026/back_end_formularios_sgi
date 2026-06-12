import { SetMetadata } from "@nestjs/common";
import { UserRole } from "src/common";

export const ROLES = 'AuthRole';
export const AuthRole = (...roles: UserRole[]) => SetMetadata(ROLES, roles);