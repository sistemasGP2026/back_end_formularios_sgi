import { Module } from '@nestjs/common';
import { SedesService } from './sedes.service';
import { SedesController } from './sedes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sede, SedeSchema } from './schema/sede.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sede.name, schema: SedeSchema }
    ]),
  ],
  controllers: [SedesController],
  providers: [SedesService],
  exports:[SedesService]
})
export class SedesModule { }
