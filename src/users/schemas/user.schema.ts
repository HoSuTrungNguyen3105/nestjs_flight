import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from 'generated/prisma';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Role.USER })
  role: Role;

  @Prop({ default: false })
  isLocked: boolean;

  @Prop({ default: true })
  isEnabled: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
