import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserPaymentDto } from './dto/create-user_payment.dto';
import { UpdateUserPaymentDto } from './dto/update-user_payment.dto';
import { UserPayment } from './entities/user_payment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserPaymentsService {
  constructor(
    @InjectRepository(UserPayment)
    private readonly userPaymentRepository: Repository<UserPayment>,
  ) {}
  async create(
    createUserPaymentDto: CreateUserPaymentDto,
  ): Promise<UserPayment> {
    const userPayment = this.userPaymentRepository.create(createUserPaymentDto);
    return await this.userPaymentRepository.save(userPayment);
  }

  async update(
    id: number,
    updateUserPaymentDto: UpdateUserPaymentDto,
  ): Promise<UserPayment> {
    const userPayment = await this.userPaymentRepository.findOne({
      where: { id },
    });
    if (!userPayment) {
      throw new NotFoundException(`User payment with id ${id} not found.`);
    }

    this.userPaymentRepository.merge(userPayment, updateUserPaymentDto);
    return await this.userPaymentRepository.save(userPayment);
  }

  async findOne(id: number): Promise<UserPayment> {
    const userPayment = await this.userPaymentRepository.findOne({
      where: { id },
    });
    if (!userPayment) {
      throw new NotFoundException(`User payment with id ${id} not found.`);
    }
    return userPayment;
  }

  async remove(id: number): Promise<void> {
    const userPayment = await this.userPaymentRepository.findOne({
      where: { id },
    });
    if (!userPayment) {
      throw new NotFoundException(`User payment with id ${id} not found.`);
    }
    await this.userPaymentRepository.remove(userPayment);
  }
}
