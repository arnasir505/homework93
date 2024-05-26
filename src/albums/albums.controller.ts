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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import mongoose, { Model } from 'mongoose';
import { Album, AlbumDocument } from 'src/schemas/album.schema';
import { CreateAlbumDto } from './create-album.dto';
import { diskStorage } from 'multer';
import { extname, resolve } from 'path';
import { randomUUID } from 'crypto';
import config from 'src/config';
import { promises as fs } from 'fs';
import { clearImage } from 'src/multer';
import { TokenAuthGuard } from 'src/auth/token-auth.guard';

@Controller('albums')
export class AlbumsController {
  constructor(
    @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
  ) {}

  @UseGuards(TokenAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: async (_req, _file, callback) => {
          const destDir = resolve(config.publicPath, 'albums');
          await fs.mkdir(destDir, { recursive: true });
          callback(null, config.publicPath);
        },
        filename(_req, file, callback) {
          const ext = extname(file.originalname);
          callback(null, 'albums/' + randomUUID() + ext);
        },
      }),
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() albumDto: CreateAlbumDto,
  ) {
    try {
      const album = new this.albumModel({
        title: albumDto.title,
        artist: albumDto.artist,
        year: Number(albumDto.year),
        image: file ? file.filename : null,
      });
      return await album.save();
    } catch (e) {
      if (file) {
        clearImage(file.filename);
      }
      if (e instanceof mongoose.Error.ValidationError) {
        throw new BadRequestException(e);
      }
      return e;
    }
  }

  @Get()
  async getAll(@Query('artist') artistId: string) {
    try {
      if (artistId) {
        return await this.albumModel.find({ artist: artistId });
      }
      return await this.albumModel.find();
    } catch (e) {
      throw e;
    }
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    try {
      const album = await this.albumModel.findById(id);
      if (!album) {
        throw new NotFoundException('Album not found.');
      }
      return album;
    } catch (e) {
      if (e.name === 'CastError') {
        throw new BadRequestException('Invalid album id!');
      }
      throw e;
    }
  }

  @Delete('/:id')
  async deleteOne(@Param('id') id: string) {
    try {
      const album = await this.albumModel.findById(id);
      if (!album) {
        throw new NotFoundException('Album not found.');
      }
      await album.deleteOne();
      if (album.image) {
        void clearImage(album.image);
      }
      return { message: 'Album delete successful.' };
    } catch (e) {
      if (e.name === 'CastError') {
        throw new BadRequestException('Invalid album id!');
      }
      throw e;
    }
  }
}
