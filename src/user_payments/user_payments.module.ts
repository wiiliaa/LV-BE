import { Module } from '@nestjs/common';
import { UserPaymentsService } from './user_payments.service';
import { UserPaymentsController } from './user_payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPayment } from './entities/user_payment.entity';

@Module({
  controllers: [UserPaymentsController],
  providers: [UserPaymentsService],
  imports: [TypeOrmModule.forFeature([UserPayment])],
})
export class UserPaymentsModule {}
