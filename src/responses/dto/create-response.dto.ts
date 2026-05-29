import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class FilledByDto {
  @IsString() @IsOptional() userId?: string;
  @IsString() @IsOptional() fullName?: string; 
  @IsEmail()  @IsOptional() email?: string; 
}

export class CreateResponseDto {
  @ValidateNested()
  @Type(() => FilledByDto)
  filledBy: FilledByDto;

  data: Record<string, unknown>
}