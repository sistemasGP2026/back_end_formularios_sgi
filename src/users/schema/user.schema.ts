import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Transform } from 'class-transformer';
import { HydratedDocument } from 'mongoose';
import { UserRole } from "src/common";

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Transform(({ obj }) => obj._id.toString())
  _id?: string;

  @Prop({ required: true, trim: true, maxlength: 120 })
  fullName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  username: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({
    required: true,
    select: false
  })
  password: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  roles: UserRole;

  @Prop({ default: true, index: true })
  active?: boolean;

  @Prop({ type: Boolean, default: true, index: true })
  deleted: boolean;

  createdAt: Date;

  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);