import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { FormsService } from "../forms.service";

@Injectable()
export class FormAccessGuard implements CanActivate {
  constructor(private formService: FormsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { code } = request.params;
    const user = request.user;

    const form = await this.formService.getFormByCode(code);
    if (!form) throw new NotFoundException(`Formulario con codigo: ${code} no encontrado`);

    // Público — pasa cualquiera
    if (form.accessType === 'PUBLIC') {
      request.form = form;
      return true;
    }

    // Restringido — requiere autenticación
    if (!user) throw new UnauthorizedException('Debe iniciar sesión para acceder');

    // ADMIN o creador — acceso total
    if (
      user.roles?.includes('ADMIN') ||
      form.createdBy?.userId?.toString() === user.id
    ) {
      request.form = form;
      return true;
    }

    // Verificar si está en la lista
    const hasPermission = form.permissions?.users?.some(
      (u) => u.userId?.toString() === user.id,
    );

    if (!hasPermission) throw new ForbiddenException('No tiene acceso a este formulario');

    request.form = form;
    return true;
  }
}