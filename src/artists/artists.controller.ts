import { Controller, Get } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Artist, ArtistDocument } from 'src/schemas/artist.schema';

@Controller('artists')
export class ArtistsController {
  constructor(
    @InjectModel(Artist.name) private artistModel: Model<ArtistDocument>,
  ) {}

  @Get()
  async getAll() {
    return await this.artistModel.find();
  }
}
