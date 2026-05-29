import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import { TokenPayload } from './dto/token.payload.interface';

@Injectable()
export class JwtokenService {
    constructor(private jwtService: JwtService) { }

    generateToken(payload: TokenPayload): string {
        return this.jwtService.sign(payload);
    }

    verifyToken(token: string): TokenPayload {
        try {
            return this.jwtService.verify<TokenPayload>(token);
        } catch (error) {
            throw new UnauthorizedException('Token inválido o expirado');
        }
    }
}
