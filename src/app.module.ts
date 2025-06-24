import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FlightsModule } from './flights/flights.module';
import { AuthModule } from './auth/auth.module';

@Module({
  // imports: [UsersModule, ConfigModule.forRoot({isGlobal: true}),
  //   MongooseModule.forRootAsync({
  //     imports: [ConfigModule],
  //     useFactory: async (configService: ConfigService) => ({
  //       uri: configService.get<string>('MONGODB_URI'),
  //     }),
  //     inject: [ConfigService],
  //   });
  // ],
  controllers: [AppController],
  providers: [AppService],
  imports: [ConfigModule.forRoot(), FlightsModule, AuthModule],
})
export class AppModule {}
