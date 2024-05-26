import { BadRequestException, Body, Controller, Get, Post, Req, UnprocessableEntityException, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { CreateUserDto } from './create-user.dto';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { TokenAuthGuard } from 'src/auth/token-auth.guard';

@Controller('users')
export class UsersController {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  @Post()
  async registerUser(@Body() createUserDto: CreateUserDto) {
    try {
      const user = new this.userModel({
        email: createUserDto.email,
        password: createUserDto.password,
        displayName: createUserDto.displayName,
      });
      user.generateToken();
      await user.save();
      return user;
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new BadRequestException(e);
      }
      if (e instanceof mongo.MongoServerError && e.code === 11000) {
        throw new UnprocessableEntityException('This email is already taken.');
      }
      return e;
    }
  }

  @UseGuards(AuthGuard('local'))
  @Post('sessions')
  async loginUser(@Req() req: Request) {
    return req.user;
  }

  @Get()
  async getAll() {
    return this.userModel.find();
  }

  @UseGuards(TokenAuthGuard)
  @Get('secret')
  async secret(@Req() req: Request) {
    return req.user;
  }
}
