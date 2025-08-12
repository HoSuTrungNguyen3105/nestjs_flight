import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FlightsModule } from './flights/flights.module';
import { AuthModule } from './auth/auth.module';
import { FlightMealModule } from './flightMeal/flightMeal.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot(),
    FlightsModule,
    AuthModule,
    UsersModule,
    FlightMealModule,
  ],
})
export class AppModule {}
