import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { AuthModule } from 'src/auth/auth.module';
import { JwtokenModule } from 'src/jwt/jwtoken.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
    // AuthModule,
    JwtokenModule
  ],
  controllers: [UsersController],
  providers:   [UsersService],
  exports:[UsersService]
})
export class UsersModule {}
