import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Track, TrackDocument } from 'src/schemas/track.schema';
import { CreateTrackDto } from './create-track.dto';
import { TokenAuthGuard } from 'src/auth/token-auth.guard';
import { Role } from 'src/role.enum';
import { Roles } from 'src/roles.decorator';

@Controller('tracks')
export class TracksController {
  constructor(
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
  ) {}

  @UseGuards(TokenAuthGuard)
  @Post()
  async create(@Body() trackDto: CreateTrackDto) {
    try {
      const track = new this.trackModel({
        title: trackDto.title,
        album: trackDto.album,
        duration: trackDto.duration,
        position: Number(trackDto.position),
      });
      return await track.save();
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new BadRequestException(e);
      }
      return e;
    }
  }

  @Get()
  async getAll(@Query('album') albumId: string) {
    try {
      if (albumId) {
        return await this.trackModel.find({ album: albumId });
      }
      return await this.trackModel.find();
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(TokenAuthGuard)
  @Roles(Role.Admin)
  @Delete('/:id')
  async deleteOne(@Param('id') id: string) {
    try {
      const track = await this.trackModel.findById(id);
      if (!track) {
        throw new NotFoundException('Track not found.');
      }
      await track.deleteOne();
      return { message: 'Track delete successful.' };
    } catch (e) {
      if (e.name === 'CastError') {
        throw new BadRequestException('Invalid track id!');
      }
      throw e;
    }
  }
}
