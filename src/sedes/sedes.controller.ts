import { Controller, Get } from '@nestjs/common';
import { SedesService } from './sedes.service';
import { Public } from 'src/auth/decorators/public.decorators';
import { get } from 'mongoose';

@Public()
@Controller('sedes')
export class SedesController {
  constructor(private readonly sedesService: SedesService) { }

  @Get()
  findAll() {
    return this.sedesService.findAll();
  }

  @Get("fill")
  fillDataBase(){
    return this.sedesService.create()
  }
}
