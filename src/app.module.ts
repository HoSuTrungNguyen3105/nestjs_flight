import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FlightsModule } from './flights/flights.module';
import { AuthModule } from './auth/auth.module';
import { FlightMealModule } from './flightMeal/flightMeal.module';
import { MealsModule } from './meals/meals.module';
import { PassengerModule } from './passenger/passenger.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot(),
    FlightsModule,
    AuthModule,
    UsersModule,
    FlightMealModule,
    MealsModule,
    PassengerModule,
  ],
})
export class AppModule {}
