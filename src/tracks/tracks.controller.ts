import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Track, TrackDocument } from 'src/schemas/track.schema';
import { CreateTrackDto } from './create-track.dto';

@Controller('tracks')
export class TracksController {
  constructor(
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
  ) {}

  @Post()
  async create(@Body() trackDto: CreateTrackDto) {
    const track = new this.trackModel({
      title: trackDto.title,
      album: trackDto.album,
      duration: trackDto.duration,
      position: trackDto.position,
    });

    return await track.save();
  }

  @Get()
  async getAll(@Query('album') albumId: string) {
    if (albumId) {
      return await this.trackModel.find({ album: albumId });
    }
    return await this.trackModel.find();
  }

  @Delete('/:id')
  async deleteOne(@Param('id') id: string) {
    return await this.trackModel.findByIdAndDelete(id);
  }
}
