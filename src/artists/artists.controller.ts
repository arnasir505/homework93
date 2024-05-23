import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Artist, ArtistDocument } from 'src/schemas/artist.schema';
import { CreateArtistDto } from './create-artist.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('artists')
export class ArtistsController {
  constructor(
    @InjectModel(Artist.name) private artistModel: Model<ArtistDocument>,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', { dest: './public/images' }))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() artistDto: CreateArtistDto,
  ) {
    const artist = new this.artistModel({
      name: artistDto.name,
      information: artistDto.information,
      image: file ? '/images/' + file.filename : null,
    });
    return await artist.save();
  }
  @Get()
  async getAll() {
    return await this.artistModel.find();
  }
}
