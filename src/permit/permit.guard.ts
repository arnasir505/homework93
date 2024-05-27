import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from 'src/role.enum';
import { ROLES_KEY } from 'src/roles.decorator';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class PermitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

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

    if (!Object.values(requiredRoles).includes(user.role as Role)) {
      throw new ForbiddenException('Permission denied.');
    }

    return true;
  }
}
