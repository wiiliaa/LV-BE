import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Discount } from 'src/discounts/entities/discount.entity';

@Entity()
export class DiscountUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.discount_usages)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Discount, (discount) => discount.discount_usages)
  @JoinColumn({ name: 'discount_id' })
  discount: Discount;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  usedAt: Date;
}
