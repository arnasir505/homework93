import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Artist {
  @Prop({ required: true, unique: true })
  name: string;
  @Prop()
  information: string;
  @Prop()
  image: string;
}

export type ArtistDocument = Artist & Document;
export const ArtistSchema = SchemaFactory.createForClass(Artist);
