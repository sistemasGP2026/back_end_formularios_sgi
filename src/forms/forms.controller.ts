import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { AuthRole } from 'src/auth/decorators/auth-role.decorator';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { UserRole } from 'src/common';
import { FormAccessGuard } from './guards/form-access.guard';
import { UpdateFormDto } from './dto/update-form.dto';
import { OptionalJwtGuard } from 'src/auth/guards/optional-jwt.guard';
import { AssignPermissionDto } from './dto/assign-permission.dto';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) { }

  @AuthRole(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Get()
  async getAllForms() {
    return await this.formsService.getAllForms();
  }

  @Get('/category/:category')
  async getFormByCategory(@Param('category') category: string) {
    return await this.formsService.getFormsByCategory(category);
  }

  @UseGuards(JwtGuard)
  @Get('myform/assigned')
  async getMyAssignedForms(
    @Req() req: any
  ) {

    return this.formsService.getMyFormsAssigned(
      req.user.username
    );
  }
  
  @UseGuards(OptionalJwtGuard, FormAccessGuard)
  @Get(':code')
  async getFormByCode(@Param('code') code: string) {
    return await this.formsService.getFormByCode(code)
  }


  @AuthRole(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Post()
  async generateForm(
    @Body() dto: CreateFormDto,
    @Req() req: any) {
    const user = req.user.sub
    return await this.formsService.createForm(dto, user)
  }

  @AuthRole(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Put(':code')
  async updateForm(
    @Req() req: any,
    @Param('code') code: string,
    @Body() dto: UpdateFormDto,
  ) {
    const user = req.user;
    return await this.formsService.updateForm(code, dto, user.id);
  }

  @AuthRole(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard)
  @Patch('')
  async assignPermissionToUser(@Body() assignPermission: AssignPermissionDto) {
    return await this.formsService.assignUserPermissionToForm(assignPermission);
  }
  

  @AuthRole(UserRole.ADMIN)
  @UseGuards(JwtGuard, RolesGuard, FormAccessGuard)
  @Delete('/:code/:username')
  async removePermissionToUser(@Param('code') code: string, @Param('username') username: string) {
    return await this.formsService.deleteUserPermission(code, username);
  }

  
}
