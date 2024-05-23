import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Artist, ArtistDocument } from 'src/schemas/artist.schema';
import { CreateArtistDto } from './create-artist.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname, resolve } from 'path';
import config from 'src/config';
import { promises as fs } from 'fs';

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
    const artist = new this.artistModel({
      name: artistDto.name,
      information: artistDto.information,
      image: file ? file.filename : null,
    });
    return await artist.save();
  }

  @Get()
  async getAll() {
    return await this.artistModel.find({}, { information: 0 });
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    return await this.artistModel.findById(id);
  }

  @Delete('/:id')
  async deleteOne(@Param('id') id: string) {
    return await this.artistModel.findByIdAndDelete(id);
  }
}
