import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/common';
import { ROLES } from '../decorators/auth-role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.roles) {
      throw new ForbiddenException('No se encontraron roles para este usuario');
    }

    // Normaliza a array sin importar si viene string o array
    const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];

    const hasRole = userRoles.some((role: string) => requiredRoles.includes(role as UserRole));

    if (!hasRole) {
      throw new ForbiddenException('No tienes permisos suficientes para acceder a esta ruta');
    }

    return true;
  }
}