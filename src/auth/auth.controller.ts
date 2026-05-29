import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SignInDto } from './dto/signIn.dto';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorators';
import { JwtGuard } from './guards/jwt.guard';

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
        const user =  req.user
        return this.authService.checkToken(user)
    }
}
