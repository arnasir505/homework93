import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  Req,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { CreateUserDto } from './create-user.dto';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

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

  @Delete('sessions')
  async logoutUser(@Req() req: Request) {
    try {
      const headerValue = req.get('Authorization');
      const successMessage = { message: 'Successful log out' };

      if (!headerValue) {
        return successMessage;
      }

      const [_, token] = headerValue.split(' ');

      const user = await this.userModel.findOne({ token });

      if (!user) {
        return successMessage;
      }

      user.generateToken();
      await user.save();

      return successMessage;
    } catch (e) {
      throw e;
    }
  }
}
