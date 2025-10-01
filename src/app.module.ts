import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FlightsModule } from './flights/flights.module';
import { AuthModule } from './auth/auth.module';
import { FlightMealModule } from './flightMeal/flightMeal.module';
import { MealsModule } from './meals/meals.module';
// import { PassengerModule } from './passenger/passenger.module';
import { BookingModule } from './booking/booking.module';
import { SeatModule } from './seat/seat.module';
import { MessagesModule } from './chat/messages.module';
import { PayrollModule } from './payroll/payroll.module';
import { GatesModule } from './gate/gate.module';
import { EnumModule } from './enum/enum.module';
import { MailModule } from './common/nodemailer/nodemailer.module';

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
    BookingModule,
    SeatModule,
    MessagesModule,
    PayrollModule,
    MailModule,
    GatesModule,
    EnumModule,
  ],
})
export class AppModule {}
