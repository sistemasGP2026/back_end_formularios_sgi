import { IsNotEmpty } from "class-validator";

export class AssignPermissionDto {
  @IsNotEmpty()
  formCode: string;
  @IsNotEmpty()
  usernames: string[];
}