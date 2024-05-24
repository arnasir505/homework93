import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UnprocessableEntityException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo } from 'mongoose';
import { Artist, ArtistDocument } from 'src/schemas/artist.schema';
import { CreateArtistDto } from './create-artist.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname, resolve } from 'path';
import config from 'src/config';
import { promises as fs } from 'fs';
import { clearImage } from 'src/multer';

@Controller('artists')
export class ArtistsController {
  constructor(
    @InjectModel(Artist.name) private artistModel: Model<ArtistDocument>,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: async (_req, _file, callback) => {
          const destDir = resolve(config.publicPath, 'artists');
          await fs.mkdir(destDir, { recursive: true });
          callback(null, config.publicPath);
        },
        filename(_req, file, callback) {
          const ext = extname(file.originalname);
          callback(null, 'artists/' + randomUUID() + ext);
        },
      }),
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() artistDto: CreateArtistDto,
  ) {
    try {
      const artist = new this.artistModel({
        name: artistDto.name,
        information: artistDto.information,
        image: file ? file.filename : null,
      });
      return await artist.save();
    } catch (e) {
      if (file) {
        clearImage(file.filename);
      }
      if (e instanceof mongoose.Error.ValidationError) {
        throw new BadRequestException(e);
      }
      if (e instanceof mongo.MongoServerError && e.code === 11000) {
        throw new UnprocessableEntityException('This artist already exists!');
      }
      return e;
    }
  }

  @Get()
  async getAll() {
    try {
      return await this.artistModel.find();
    } catch (e) {
      throw e;
    }
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    try {
      const artist = await this.artistModel.findById(id);
      if (!artist) {
        throw new NotFoundException('Artist not found');
      }
      return artist;
    } catch (e) {
      if (e.name === 'CastError') {
        throw new BadRequestException('Invalid artist id!');
      }
      throw e;
    }
  }

  @Delete('/:id')
  async deleteOne(@Param('id') id: string) {
    try {
      const artist = await this.artistModel.findById(id);
      if (!artist) {
        throw new NotFoundException('Artist not found.');
      }
      await artist.deleteOne();
      if (artist.image) {
        void clearImage(artist.image);
      }
      return { message: 'Artist delete successful.' };
    } catch (e) {
      if (e.name === 'CastError') {
        throw new BadRequestException('Invalid artist id!');
      }
      throw e;
    }
  }
}
