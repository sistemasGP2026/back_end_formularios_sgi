import { Module } from '@nestjs/common';
import { FormsService } from './forms.service';
import { FormsController } from './forms.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Form, FormSchema } from './schema/form.schema';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/schema/user.schema';
import { JwtokenModule } from 'src/jwt/jwtoken.module';
import { Reflector } from '@nestjs/core';
import { FormAccessGuard } from './guards/form-access.guard';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name: Form.name, schema: FormSchema}
    ]),
    UsersModule,
    JwtokenModule,
    Reflector,
    EmailModule
  ],
  controllers: [FormsController],
  providers: [FormsService,],
  exports:[FormsService]
})
export class FormsModule {}
