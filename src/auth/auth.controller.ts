import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { SignInDto } from './dto/signIn.dto';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorators';
import { JwtGuard } from './guards/jwt.guard';
import { SkipPasswordCheck } from './decorators/skip-password-check.decorator';
import { MustChangePasswordGuard } from './guards/must-change-password.guard';
import { response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post("sign-in")
    async signIn(@Body() sigin: SignInDto) {
        return await this.authService.signIn(sigin);
    }

    @Get('check-token')
    @UseGuards(JwtGuard)
    checkToken(@Req() req: any) {
        const user = req.user
        return this.authService.checkToken(user)
    }

    @SkipPasswordCheck()
    @UseGuards(JwtGuard, MustChangePasswordGuard)
    @Post('change-first-password')
    @HttpCode(HttpStatus.OK)
    async changeFirstPassword(@Body('newPassword') newPassword: string, @Req() req: any) {
        return await this.authService.changeFirstPassword(newPassword, req.user.sub);
    }
}
