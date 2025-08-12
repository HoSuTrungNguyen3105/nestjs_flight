import { PartialType } from '@nestjs/mapped-types';
import { CreateFlightMealDto } from './create-meal.dto';

export class UpdateFlightMealDto extends PartialType(CreateFlightMealDto) {}
