import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResponsesModule } from './responses/responses.module';
import { FormsModule } from './forms/forms.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtokenModule } from './jwt/jwtoken.module';
import { AuthModule } from './auth/auth.module';
import { SedesModule } from './sedes/sedes.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI', 'SECRET_HASH'),
      }),
    }),
    MailerModule.forRoot({
        transport: {
          host: process.env.EMAIL_HOST,
          port: 587,
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
          },
        },
        defaults: {
          from: process.env.EMAIL_USERNAME
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true
          },
        },
      }),
    UsersModule,
    FormsModule,
    ResponsesModule,
    ResponsesModule, JwtokenModule, AuthModule, SedesModule
  ],
  controllers: [AppController],
  providers: [AppService, JwtokenModule],
})
export class AppModule { }
