import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
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

    const [_, token] = headerValue.split(' ');

    if (!token) {
      return false;
    }

    const user = await this.userModel.findOne({ token: token });

    if (!user) {
      return false;
    }

    request.user = user;
    return true;
  }
}
