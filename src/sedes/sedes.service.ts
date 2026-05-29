import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Sede, SedeDocument } from './schema/sede.schema';
import { Model } from 'mongoose';

@Injectable()
export class SedesService {
    constructor(@InjectModel(Sede.name) private sedeModel: Model<SedeDocument>) { }

    async findAll() {
        return await this.sedeModel
            .find({ active: true })
            .select('name code')
            .sort({ name: 1 })
            .exec();
    }

    async findByCode(code: string): Promise<SedeDocument | null> {
        return await this.sedeModel.findOne({ code, active: true }).exec();
    }

    async create() {
        const count = await this.sedeModel.countDocuments();

        await this.sedeModel.insertMany([
            { name: 'San Fernando', code: 'SAN_FERNANDO' },
            { name: 'María Auxiliadora', code: 'MARIA_AUXILIADORA' },
            { name: 'Amberes', code: 'AMBERES' },
            { name: 'Santa Marta', code: 'SANTA_MARTA' },
        ]);
    }
}
