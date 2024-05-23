import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { Model } from 'mongoose';
import { Album, AlbumDocument } from 'src/schemas/album.schema';
import { CreateAlbumDto } from './create-album.dto';
import { diskStorage } from 'multer';
import { extname, resolve } from 'path';
import { randomUUID } from 'crypto';
import config from 'src/config';
import { promises as fs } from 'fs';

@Controller('albums')
export class AlbumsController {
  constructor(
    @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
  ) {}

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
    const album = new this.albumModel({
      title: albumDto.title,
      artist: albumDto.artist,
      year: albumDto.year,
      image: file ? file.filename : null,
    });
    return await album.save();
  }

  @Get()
  async getAll(@Query('artist') artistId: string) {
    if (artistId) {
      return await this.albumModel.find({ artist: artistId });
    }
    return await this.albumModel.find();
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    return await this.albumModel.findById(id);
  }

  @Delete('/:id')
  async deleteOne(@Param('id') id: string) {
    return await this.albumModel.findByIdAndDelete(id);
  }
}
