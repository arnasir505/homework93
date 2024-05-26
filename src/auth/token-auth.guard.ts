import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class TokenAuthGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const headerValue = request.get('Authorization');

    if (!headerValue) {
      throw new BadRequestException('Token not provided!');
    }

    const [_, token] = headerValue.split(' ');

    const user = await this.userModel.findOne({ token: token });

    if (!user) {
      throw new UnauthorizedException('Invalid token!');
    }

    request.user = user;
    return true;
  }
}
