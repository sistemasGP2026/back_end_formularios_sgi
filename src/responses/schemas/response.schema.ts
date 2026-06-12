import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export enum ResponseStatus {
  PENDING   = 'PENDING',
  APPROVED  = 'APPROVED',
  REJECTED  = 'REJECTED',
}

export type ResponseDocument = HydratedDocument<FormResponse>;
@Schema({ _id: false })
export class ApprovalInfo {
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  approvedBy: Types.ObjectId | null;

  @Prop({ default: null })
  approverName: string | null;

  @Prop({ default: null })
  approverUsername: string | null;

  @Prop({ type: Date, default: null })
  approvedAt: Date | null;

  @Prop({ type: String, default: null })
  rejectionReason: string | null;
}
@Schema({ _id: false })
export class FilledBy {
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  userId: Types.ObjectId | null;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  email: string;
}

//Schema principal
@Schema({ timestamps: true, collection: 'responses' })
export class FormResponse {
  @Prop({ type: Types.ObjectId, ref: 'Form', required: true, index: true })
  formId: Types.ObjectId;

  @Prop({ required: true, index: true })
  formCode: string;

  @Prop({ type: FilledBy, required: true })
  filledBy: FilledBy;

  @Prop({ required: true })
  submittedAt: Date;

  @Prop({ type: String, enum: ResponseStatus, default: ResponseStatus.PENDING })
  status: ResponseStatus;

  @Prop({ type: ApprovalInfo, default: () => ({}) })
  approval: ApprovalInfo;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  data: Record<string, unknown>;

  @Prop({ default: false })
  deleted: boolean;
}

export const FormResponseSchema = SchemaFactory.createForClass(FormResponse);

FormResponseSchema.index({ formId: 1, deleted: 1 });
FormResponseSchema.index({ formId: 1, 'filledBy.userId': 1 });