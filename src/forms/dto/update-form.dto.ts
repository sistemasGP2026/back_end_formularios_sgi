import { Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsDate, IsEnum, IsInt,
  IsOptional, IsString, Min, ValidateNested,
} from 'class-validator';
import {
  AccessType, DuplicateBy, FormCategory,
} from 'src/common';

export class UpdateFormSettingsDto {
  @IsBoolean() @IsOptional() allowDraft?: boolean;
  @IsBoolean() @IsOptional() requiresApproval?: boolean;
  @IsBoolean() @IsOptional() showCompliance?: boolean;
  @IsBoolean() @IsOptional() preventDuplicates?: boolean;
  @IsEnum(DuplicateBy) @IsOptional() duplicateBy?: DuplicateBy;
  @IsBoolean() @IsOptional() requiresSede?: boolean;
  @IsBoolean() @IsOptional() requiresReviewSignature?: boolean;
}

export class UpdateFormDto {
  @IsString()   @IsOptional() name?: string;
  @IsString()   @IsOptional() description?: string;
  @IsEnum(FormCategory) @IsOptional() category?: FormCategory;
  @IsEnum(AccessType)   @IsOptional() accessType?: AccessType;
  @IsInt() @Min(1)      @IsOptional() version?: number;
  @IsOptional()                       documentDate?: Date | null;

  @ValidateNested()
  @Type(() => UpdateFormSettingsDto)
  @IsOptional()
  settings?: UpdateFormSettingsDto;

  @IsArray() @IsOptional() sections?: any[];
  @IsArray() @IsOptional() fields?: any[];
  @IsOptional()            permissions?: any;
}