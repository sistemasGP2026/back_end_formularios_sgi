import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AccessType, ConditionalAction, ConditionalOperator, DuplicateBy, FieldType, FormCategory } from 'src/common';
import { IFieldOption } from 'src/interfaces/field-option.interface';
import { ITableColumn } from 'src/interfaces/table-column.interface';
import { ITableRow } from 'src/interfaces/table-row.interface';

export type FormDocument = HydratedDocument<Form>;

@Schema({ _id: false })
export class FormSettings {
  @Prop({ default: false })
  allowDraft: boolean;

  @Prop({ default: false })
  requiresSede: boolean;

  @Prop({ default: false })
  requiresReviewSignature: boolean;

  @Prop({ default: false })
  requiresApproval: boolean;

  @Prop({ default: false })
  showCompliance: boolean;

  @Prop({ default: false })
  preventDuplicates: boolean;

  @Prop({ type: String, enum: DuplicateBy, default: null })
  duplicateBy: DuplicateBy | null;
}

@Schema({ _id: false })
export class UserPermission {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  email: string;
}

@Schema({ _id: false })
export class FormPermissions {
  @Prop({ type: [UserPermission], default: [] })
  users: UserPermission[];

  @Prop({ type: [UserPermission], default: [] })
  approvers: UserPermission[]; 
}

@Schema({ _id: false })
export class FormCreatedBy {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  email: string;
}

@Schema({ _id: false })
export class FormSection {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true, maxlength: 200 })
  title: string;

  @Prop({ default: 0 })
  order: number;
}

@Schema({ _id: false })
export class FieldValidationRule {
  @Prop({ required: true })
  type: string;

  @Prop({ type: String, default: null })
  value: string | null;

  @Prop({ required: true })
  errorMessage: string;
}

@Schema({ _id: false })
export class ConditionalRule {
  @Prop({ required: true })
  triggerFieldId: string;

  @Prop({ type: String, enum: ConditionalOperator, required: true })
  operator: ConditionalOperator;

  @Prop({ type: String, default: null })
  expectedValue: string | null;

  @Prop({ type: String, enum: ConditionalAction, required: true })
  action: ConditionalAction;
}

@Schema({ _id: false })
export class ThresholdRule {
  @Prop({ required: true, type: Number })
  min: number;

  @Prop({ required: true, type: Number })
  max: number;

  @Prop({ required: true })
  label: string;

  @Prop({ type: String, default: null })
  color: string | null;
}


@Schema({ _id: false })
export class FormField {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true, maxlength: 100 })
  name: string;

  @Prop({ required: true, maxlength: 300 })
  label: string;

  @Prop({ type: String, enum: FieldType, required: true })
  type: FieldType;

  @Prop({ required: true })
  sectionId: string;

  @Prop({ default: false })
  required: boolean;

  @Prop({ default: false })
  readOnly: boolean;

  @Prop({ default: false })
  hidden: boolean;

  @Prop({ type: String, default: null })
  placeholder: string | null;

  @Prop({ type: String, default: null })
  helpText: string | null;

  @Prop({ type: Number, default: null })
  minLength: number | null;

  @Prop({ type: Number, default: null })
  maxLength: number | null;

  @Prop({ type: String, default: null })
  pattern: string | null;

  @Prop({ type: Number, default: null })
  min: number | null;

  @Prop({ type: Number, default: null })
  max: number | null;

  @Prop({ type: [Object], default: [] })
  options: IFieldOption[];

  @Prop({ type: [Object], default: [] })
  rows: ITableRow[];

  @Prop({ type: [Object], default: [] })
  columns: ITableColumn[];

  @Prop({ type: [FieldValidationRule], default: [] })
  validations: FieldValidationRule[];

  @Prop({ type: [ConditionalRule], default: [] })
  conditionalRules: ConditionalRule[];

  @Prop({ type: String, default: null })
  dataSource: string | null;

  @Prop({ default: 0 })
  order: number;

  @Prop({ type: Number, default: null })
  weight: number | null;

  @Prop({ type: Number, default: null })
  maxScore: number | null;

  @Prop({ type: String, default: null })
  formula: string | null;

  @Prop({ type: String, default: null })
  sourceField: string | null;

  @Prop({ type: [Object], default: [] })
  thresholds: ThresholdRule[];
}

//  SCHEMA PRINCIPAL
@Schema({ timestamps: true, collection: 'forms' })
export class Form {
  @Prop({ required: true, unique: true, uppercase: true, trim: true, index: true })
  code: string;

  @Prop({ required: true, maxlength: 200, trim: true })
  name: string;

  @Prop({ type: String, default: null })
  description: string | null;

  @Prop({ type: String, enum: FormCategory, required: true, index: true })
  category: FormCategory;

  @Prop({ default: 1 })
  version: number;

  @Prop({ type: Date, default: null })
  documentDate: Date | null;

  @Prop({ type: String, enum: AccessType, default: AccessType.RESTRICTED, index: true })
  accessType: AccessType;

  @Prop({ type: FormSettings, default: () => ({}) })
  settings: FormSettings;

  @Prop({ type: FormPermissions, default: () => ({ users: [] }) })
  permissions: FormPermissions;

  @Prop({ type: FormCreatedBy, required: true })
  createdBy: FormCreatedBy;

  @Prop({ type: [FormSection], default: [] })
  sections: FormSection[];

  @Prop({ type: [FormField], default: [] })
  fields: FormField[];

  @Prop({ type: Boolean, default: false })
  deleted: boolean

  createdAt: Date;
  updatedAt: Date;
}

export const FormSchema = SchemaFactory.createForClass(Form);