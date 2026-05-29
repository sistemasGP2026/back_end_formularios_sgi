import { UserRole } from "src/common";

export class UserResponse{
    fullName: string;
    username: string;
    email: string;
    rol: UserRole;
    createdAt: Date;
    updatedAt?: Date;
    active: boolean
}