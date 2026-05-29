// src/sedes/schemas/sede.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SedeDocument = HydratedDocument<Sede>;

@Schema({ timestamps: true, collection: 'sedes' })
export class Sede {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ default: true })
  active: boolean;
}

export const SedeSchema = SchemaFactory.createForClass(Sede);
SedeSchema.index({ active: 1 });