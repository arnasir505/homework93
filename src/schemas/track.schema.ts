import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Album } from './album.schema';

@Schema({ versionKey: false })
export class Track {
  @Prop({ required: true })
  title: string;

  @Prop({
    type: Types.ObjectId,
    ref: Album.name,
    required: true,
    validate: {
      validator: async function (id: Types.ObjectId) {
        const album = await this.model('Album').findById(id);
        return Boolean(album);
      },
      message: 'Album does not exist.',
    },
  })
  album: Types.ObjectId;

  @Prop({ required: true })
  duration: string;

  @Prop({ required: true })
  position: number;
}

export type TrackDocument = Track & Document;
export const TrackSchema = SchemaFactory.createForClass(Track);
