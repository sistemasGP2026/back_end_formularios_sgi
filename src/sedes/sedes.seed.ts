// src/sedes/sedes.seed.ts
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Sede, SedeDocument } from './schema/sede.schema';

@Injectable()
export class SedesSeed implements OnApplicationBootstrap {
  constructor(
    @InjectModel(Sede.name)
    private readonly sedeModel: Model<SedeDocument>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const count = await this.sedeModel.countDocuments();
    if (count > 0) return; // ya están cargadas

    await this.sedeModel.insertMany([
      { name: 'San Fernando',      code: 'SAN_FERNANDO'      },
      { name: 'María Auxiliadora', code: 'MARIA_AUXILIADORA'  },
      { name: 'Amberes',           code: 'AMBERES'            },
      { name: 'Santa Marta',       code: 'SANTA_MARTA'        },
    ]);

    console.log('✅ Sedes inicializadas');
  }
}