import { Module } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { ResponsesController } from './responses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FormResponse, FormResponseSchema } from './schemas/response.schema';
import { FormsModule } from 'src/forms/forms.module';
import { SedesModule } from 'src/sedes/sedes.module';
import { UsersModule } from 'src/users/users.module';
import { JwtokenModule } from 'src/jwt/jwtoken.module';
import { Form, FormSchema } from 'src/forms/schema/form.schema';
import { User, UserSchema } from 'src/users/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FormResponse.name, schema: FormResponseSchema },
      { name: Form.name, schema: FormSchema },
      { name: User.name, schema: UserSchema },
    ]),
    FormsModule,
    SedesModule,
    UsersModule,
    JwtokenModule,
  ],
  controllers: [ResponsesController],
  providers: [ResponsesService],
})
export class ResponsesModule {}