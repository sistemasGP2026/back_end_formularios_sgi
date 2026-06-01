import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { AuthRole } from 'src/auth/decorators/auth-role.decorator';
import { UserRole } from 'src/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from 'src/auth/decorators/public.decorators';



@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {

  constructor(
    private readonly usersService: UsersService
  ) { }

  @AuthRole(UserRole.ADMIN)
  @UseGuards(JwtGuard)
  @Get()
  async getAllUser() {
    return await this.usersService.getAllUsers();
  }

  @AuthRole(UserRole.ADMIN)
  @UseGuards(JwtGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return await this.usersService.findActiveByUsername(id);
  }

  @AuthRole(UserRole.ADMIN)
  @UseGuards(JwtGuard)
  @Get('username/:email')
  async getUserByUsername(@Param('email') email: string) {
    return await this.usersService.getUserByEmail(email);
  }

  // @AuthRole(UserRole.ADMIN)
  // @UseGuards(JwtGuard)
  @Public()
  @Post()
  async createUser(@Body() user: CreateUserDto) {
    return await this.usersService.createUser(user);
  }

  @AuthRole(UserRole.ADMIN)
  @UseGuards(JwtGuard)
  @Patch(':id')
  async updateUSer(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return await this.usersService.editUser(id, user);
  }

  @AuthRole(UserRole.ADMIN)
  @UseGuards(JwtGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return await this.usersService.deleteUserById(id);
  }

  @Patch(':id/reset-password')
  @UseGuards(JwtGuard, RolesGuard)
  @AuthRole(UserRole.ADMIN)
  async resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto
  ) {
    return this.usersService.resetPassword(id, dto);
  }
}
