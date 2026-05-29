import {
  IsArray, IsEmail, IsEnum,
  IsNotEmpty, IsString, MaxLength, MinLength,
  Validate,
} from 'class-validator';
import { UserRole } from 'src/common';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({message: 'fullName is required'})
  @MaxLength(120)
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username:string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(64)
  password: string;

  @IsArray()
  @IsEnum(UserRole, { each: true, message: 'El rol no existe' })
  roles: UserRole;
}