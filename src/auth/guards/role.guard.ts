import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/common';
import { ROLES } from '../decorators/auth-role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  
 canActivate(context: ExecutionContext): boolean {
    // 1. Extraer los roles definidos en el decorador @AuthRole
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles definidos en el decorador, la ruta es pública o no requiere rol específico
    if (!requiredRoles) {
      return true;
    }

    // 2. Obtener el usuario desde la petición (inyectado previamente por tu AuthGuard de JWT)
    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.roles) {
      throw new ForbiddenException('No se encontraron roles para este usuario');
    }

    // 3. Verificar si el usuario tiene al menos uno de los roles requeridos
    const hasRole = () =>
      user.roles.some((role: string) => requiredRoles.includes(role as UserRole));

    if (!hasRole()) {
      throw new ForbiddenException('No tienes permisos suficientes para acceder a esta ruta');
    }

    return true;
  }

}
