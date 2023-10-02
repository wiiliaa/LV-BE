// user-payment.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { UserPaymentsService } from './user_payments.service';
import { CreateUserPaymentDto } from './dto/create-user_payment.dto';
import { UpdateUserPaymentDto } from './dto/update-user_payment.dto';
import { UserPayment } from './entities/user_payment.entity';

@Controller('user-payments')
export class UserPaymentsController {
  constructor(private readonly userPaymentService: UserPaymentsService) {}

  @Post()
  create(
    @Body() createUserPaymentDto: CreateUserPaymentDto,
  ): Promise<UserPayment> {
    return this.userPaymentService.create(createUserPaymentDto);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateUserPaymentDto: UpdateUserPaymentDto,
  ): Promise<UserPayment> {
    return this.userPaymentService.update(id, updateUserPaymentDto);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<UserPayment> {
    return this.userPaymentService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.userPaymentService.remove(id);
  }
}
