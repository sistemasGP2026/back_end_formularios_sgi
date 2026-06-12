import { Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsDate, IsEnum, IsInt, IsNotEmpty, IsNumber,
  IsOptional, IsString, Matches, MaxLength, Min,
  ValidateIf, ValidateNested,
} from 'class-validator';
import {
  AccessType, ConditionalAction, ConditionalOperator,
  DuplicateBy, FieldType, FormCategory,
} from 'src/common';

export class FormSettingsDto {
  @IsBoolean() @IsOptional() allowDraft?: boolean;
  @IsBoolean() @IsOptional() requiresApproval?: boolean;
  @IsBoolean() @IsOptional() showCompliance?: boolean;
  @IsBoolean() @IsOptional() preventDuplicates?: boolean;
  @IsEnum(DuplicateBy) @IsOptional()
  @ValidateIf((o) => o.preventDuplicates === true)
  duplicateBy?: DuplicateBy;
  @IsBoolean() @IsOptional() requiresSede?: boolean;
  @IsBoolean() @IsOptional() requiresReviewSignature?: boolean;
}

export class UserPermissionDto {
  @IsString() @IsNotEmpty() username: string;
  @IsBoolean() @IsOptional() canView?: boolean;
  @IsBoolean() @IsOptional() canSubmit?: boolean;
  @IsBoolean() @IsOptional() canEdit?: boolean;
  @IsBoolean() @IsOptional() canApprove?: boolean;
  @IsBoolean() @IsOptional() canExport?: boolean;
}

export class FormPermissionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserPermissionDto)
  @IsOptional()
  users?: UserPermissionDto[];
}

export class FormSectionDto {
  @IsString() @IsNotEmpty() id: string;
  @IsString() @IsNotEmpty() @MaxLength(20) code: string;
  @IsString() @IsNotEmpty() @MaxLength(200) title: string;
  @IsNumber() @Min(0) @IsOptional() order?: number;
}

export class FieldOptionDto {
  @IsString() @IsNotEmpty() @MaxLength(300) label: string;
  @IsString() @IsNotEmpty() @MaxLength(200) value: string;
  @IsBoolean() @IsOptional() isDefault?: boolean;
  @IsNumber() @Min(0) @IsOptional() order?: number;
}

export class TableColumnDto {
  @IsString() @IsNotEmpty() key: string;
  @IsString() @IsNotEmpty() @MaxLength(200) label: string;
  @IsEnum(FieldType) inputType: FieldType;
  @IsBoolean() @IsOptional() required?: boolean;
  @IsNumber() @Min(0) @IsOptional() order?: number;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldOptionDto)
  @IsOptional()
  options?: FieldOptionDto[];
  @IsString() @IsOptional() width?: string;
}

export class TableRowDto {
  @IsString() @IsNotEmpty() id: string;
  @IsString() @IsNotEmpty() @MaxLength(300) label: string;
  @IsNumber() @Min(0) @IsOptional() order?: number;
  @IsString() @IsOptional() unitLabel?: string;
  @IsNumber() @Min(0) @IsOptional() minQuantity?: number;
}

export class FieldValidationRuleDto {
  @IsString() @IsNotEmpty() type: string;
  @IsString() @IsOptional() value?: string;
  @IsString() @IsNotEmpty() errorMessage: string;
}

export class ConditionalRuleDto {
  @IsString() @IsNotEmpty() triggerFieldId: string;
  @IsEnum(ConditionalOperator) operator: ConditionalOperator;
  @IsString() @IsOptional() expectedValue?: string;
  @IsEnum(ConditionalAction) action: ConditionalAction;
}

export class ThresholdRuleDto {
  @IsNumber() min: number;
  @IsNumber() max: number;
  @IsString() @IsNotEmpty() label: string;
  @IsString() @IsOptional() color?: string | null;
}

export class FormFieldDto {
  @IsString() @IsNotEmpty() id: string;

  @IsString() @IsNotEmpty() @MaxLength(100)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Solo letras, números y guión bajo' })
  name: string;

  @IsString() @IsNotEmpty() @MaxLength(300) label: string;
  @IsEnum(FieldType) type: FieldType;
  @IsString() @IsNotEmpty() sectionId: string;
  @IsBoolean() @IsOptional() required?: boolean;
  @IsBoolean() @IsOptional() readOnly?: boolean;
  @IsBoolean() @IsOptional() hidden?: boolean;
  @IsString() @IsOptional() placeholder?: string;
  @IsString() @IsOptional() helpText?: string;
  @IsNumber() @Min(0) @IsOptional() minLength?: number;
  @IsNumber() @Min(0) @IsOptional() maxLength?: number;
  @IsString() @IsOptional() pattern?: string;
  @IsNumber() @IsOptional() min?: number;
  @IsNumber() @IsOptional() max?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldOptionDto)
  @IsOptional()
  options?: FieldOptionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TableRowDto)
  @IsOptional()
  rows?: TableRowDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TableColumnDto)
  @IsOptional()
  columns?: TableColumnDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldValidationRuleDto)
  @IsOptional()
  validations?: FieldValidationRuleDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionalRuleDto)
  @IsOptional()
  conditionalRules?: ConditionalRuleDto[];

  @IsNumber() @Min(0) @IsOptional() order?: number;
  @IsString() @IsOptional() dataSource?: string | null;

  // ─── campos calculados ───────────────────────────────────────────────────
  @IsNumber() @Min(0) @IsOptional() weight?: number | null;
  @IsNumber() @Min(0) @IsOptional() maxScore?: number | null;
  @IsString() @IsOptional() formula?: string | null;
  @IsString() @IsOptional() sourceField?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ThresholdRuleDto)
  @IsOptional()
  thresholds?: ThresholdRuleDto[];
}

export class CreateFormDto {
  @IsString() @IsNotEmpty() @MaxLength(20)
  @Matches(/^[A-Z0-9-]+$/, { message: 'Solo mayúsculas, números y guiones' })
  code: string;

  @IsString() @IsNotEmpty() @MaxLength(200) name: string;
  @IsString() @IsOptional() description?: string;
  @IsEnum(FormCategory, {
    message: 'La categoría seleccionada no es válida'
  })
  category: FormCategory;

  // ─── versión y fecha del documento ───────────────────────────────────────
  @IsInt() @Min(1) @IsOptional() version?: number;
  @IsOptional() documentDate?: Date | null;

  @IsEnum(AccessType) @IsOptional() accessType?: AccessType;

  @ValidateNested()
  @Type(() => FormSettingsDto)
  @IsOptional()
  settings?: FormSettingsDto;

  @ValidateNested()
  @Type(() => FormPermissionsDto)
  @IsOptional()
  permissions?: FormPermissionsDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormSectionDto)
  @IsOptional()
  sections?: FormSectionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  @IsOptional()
  fields?: FormFieldDto[];
}