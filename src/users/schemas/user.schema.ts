import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
type TypeRole = {
  User: 'user';
  Admin: 'admin';
  Guest: 'guest';
};
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

  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: false })
  isLocked: boolean;

  @Prop({ default: true })
  isEnabled: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
