import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
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

@Controller('responses')
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) { }

  @AuthRole(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Get('/:codeForm')
  async getResponsesByFormCode(
    @Param('codeForm') codeForm: string
  ) {
    return await this.responsesService.getResponsesByFormCode(codeForm);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @AuthRole(UserRole.ADMIN)
  @Get("detail/:id")
  async getResponseDetail(
    @Param('id') id: string
  ) {
    return await this.responsesService.getResponseDetailsById(id);
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

  @Get('pending/:formCode')
  @UseGuards(JwtGuard, RolesGuard)
  @AuthRole(UserRole.ADMIN)
  async getPendingUsers(@Param('formCode') formCode: string) {
    return this.responsesService.getPendingUsers(formCode);
  }

  @UseGuards(JwtGuard)
  @Get('my/history')
  async getMyResponses(@Req() req: any) {
    return this.responsesService.getMyResponses(req.user.id);
  }
}
