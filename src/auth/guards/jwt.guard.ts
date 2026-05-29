import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtokenService } from 'src/jwt/jwtoken.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorators';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private jwtokenService:JwtokenService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext):  Promise<boolean>{
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if(isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extraerToken(request);

    const payload = this.jwtokenService.verifyToken(token);
    request.user = payload;

    return true;
  }

  private extraerToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return null;
    return authHeader.split(' ')[1];
  }
}
