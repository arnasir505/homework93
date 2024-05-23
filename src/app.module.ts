import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ArtistsController } from './artists/artists.controller';
import { Artist, ArtistSchema } from './schemas/artist.schema';
import { AlbumsController } from './albums/albums.controller';
import { Album, AlbumSchema } from './schemas/album.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest-spotify'),
    MongooseModule.forFeature([
      { name: Artist.name, schema: ArtistSchema },
      { name: Album.name, schema: AlbumSchema },
    ]),
  ],
  controllers: [AppController, ArtistsController, AlbumsController],
  providers: [AppService],
})
export class AppModule {}
