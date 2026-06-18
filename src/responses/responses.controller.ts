import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { OptionalJwtGuard } from 'src/auth/guards/optional-jwt.guard';
import { FormAccessGuard } from 'src/forms/guards/form-access.guard';
import { CreateResponseDto } from './dto/create-response.dto';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { UserRole } from 'src/common';
import { IUserRequest } from './dto/user.request';
import { FormDocument } from 'src/forms/schema/form.schema';
import { AuthRole } from 'src/auth/decorators/auth-role.decorator';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ApproveResponseDto } from './dto/approve-response.dto';

@Controller('responses')
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) { }

  @UseGuards(JwtGuard, RolesGuard)
  @AuthRole(UserRole.ADMIN, UserRole.APPROVER)
  @Get('pending')
  async getPending(@Req() req: any) {
    const isAdmin = req.user.roles.includes(UserRole.ADMIN);
    return isAdmin
      ? this.responsesService.getAllPending()
      : this.responsesService.getPendingByApprover(req.user.sub);
  }

  @UseGuards(JwtGuard)
  @Get('my/history')
  async getMyResponses(@Req() req: any) {
    return this.responsesService.getMyResponses(req.user.id);
  }

  @AuthRole(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Delete('bulk')
  async deleteManyResponses(@Body() body: { ids: string[] }) {
    await this.responsesService.deleteResponsesByIds(body.ids);
    return { message: 'Respuestas eliminadas correctamente' };
  }
  
  @UseGuards(JwtGuard, RolesGuard)
  @AuthRole(UserRole.ADMIN)
  @Get('detail/:id')
  async getResponseDetail(@Param('id') id: string) {
    return await this.responsesService.getResponseDetailsById(id);
  }

  @AuthRole(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Get('pending/:formCode')
  async getPendingUsers(@Param('formCode') formCode: string) {
    return this.responsesService.getPendingUsers(formCode);
  }

  @AuthRole(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Delete('form/:formCode')
  async deleteResponsesByForm(@Param('formCode') formCode: string) {
    await this.responsesService.deleteResponsesByForm(formCode);
    return { message: `Respuestas del formulario ${formCode} eliminadas` };
  }


  @Post(':code')
  @UseGuards(OptionalJwtGuard, FormAccessGuard, RolesGuard)
  async responseForm(
    @Body() dto: CreateResponseDto,
    @Param('code') code: string,
    @Req() req: any
  ) {
    const user: IUserRequest = req.user;
    const form: FormDocument = req.form;
    return this.responsesService.createResponse(dto, user, form);
  }

  @AuthRole(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Delete(':id')
  async deleteResponse(@Param('id') id: string) {
    await this.responsesService.deleteResponse(id);
    return { message: 'Respuesta eliminada correctamente' };
  }

  @UseGuards(JwtGuard, RolesGuard)
  @AuthRole(UserRole.ADMIN, UserRole.APPROVER)
  @Patch(':id/approve')
  async approveResponse(
    @Param('id') id: string,
    @Body() dto: ApproveResponseDto,
    @Req() req: any,
  ) {
    return this.responsesService.approveResponse(
      id, dto, req.user.sub, req.user.fullname, req.user.username,
    );
  }

  // ── Ruta dinámica más genérica, siempre al final ────────

  @AuthRole(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Get(':codeForm')
  async getResponsesByFormCode(@Param('codeForm') codeForm: string) {
    return await this.responsesService.getResponsesByFormCode(codeForm);
  }
}