import { Module } from '@nestjs/common';
import { PaymentDetailsService } from './payment_details.service';
import { PaymentDetailsController } from './payment_details.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentDetail } from './entities/payment_detail.entity';

@Module({
  controllers: [PaymentDetailsController],
  providers: [PaymentDetailsService],
  imports: [TypeOrmModule.forFeature([PaymentDetail])],
})
export class PaymentDetailsModule {}
