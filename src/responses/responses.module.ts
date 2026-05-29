import { Module } from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { ResponsesController } from './responses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FormResponse, FormResponseSchema } from './schemas/response.schema';
import { FormsModule } from 'src/forms/forms.module';
import { SedesModule } from 'src/sedes/sedes.module';
import { UsersModule } from 'src/users/users.module';
import { JwtokenModule } from 'src/jwt/jwtoken.module';

@Module({
  imports:[MongooseModule.forFeature([
    {name: FormResponse.name, schema: FormResponseSchema}
    ]),
    FormsModule,
    SedesModule,
    UsersModule,
    JwtokenModule
  ],
  controllers: [ResponsesController],
  providers: [ResponsesService],
})
export class ResponsesModule {}
