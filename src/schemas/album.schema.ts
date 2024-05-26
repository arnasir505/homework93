import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Artist } from './artist.schema';

@Schema({ versionKey: false })
export class Album {
  @Prop({ required: true })
  title: string;

  @Prop({
    type: Types.ObjectId,
    ref: Artist.name,
    required: true,
    validate: {
      validator: async function (id: Types.ObjectId) {
        const artist = await this.model('Artist').findById(id);
        return Boolean(artist);
      },
      message: 'Artist does not exist.',
    },
  })
  artist: Types.ObjectId;

  @Prop({ required: true })
  year: number;

  @Prop()
  image: string;
}

export type AlbumDocument = Album & Document;
export const AlbumSchema = SchemaFactory.createForClass(Album);
