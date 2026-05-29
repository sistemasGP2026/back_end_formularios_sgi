import { Module } from '@nestjs/common';
import { JwtokenService } from './jwtoken.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule as jwtModule} from '@nestjs/jwt';
@Module({
  imports:[
    ConfigModule,
    jwtModule.registerAsync({
      imports:[ConfigModule],
      inject:[ConfigService],

      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),

        signOptions: {
          expiresIn: configService.getOrThrow<string>('JWT_EXPIRES') as any
        }
      }),
    })
  ],
  controllers: [],
  providers: [JwtokenService, jwtModule],
  exports:[JwtokenService]
})
export class JwtokenModule {}
