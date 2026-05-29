import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtokenModule } from 'src/jwt/jwtoken.module';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from 'src/jwt/jwt.strategy';

@Module({
  imports:[
    JwtokenModule, UsersModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
