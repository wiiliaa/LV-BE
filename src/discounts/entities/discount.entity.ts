/* eslint-disable prettier/prettier */
import { join } from 'path';
import { DiscountUsage } from 'src/discounts_usage/entities/discounts_usage.entity';
import { Order } from 'src/order/entities/order.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/user/entities/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Discount extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  limit: number;

  @Column({ type: 'float', default: 0 })
  percent: number;

  @Column()
  description: string;

  @Column()
  active: Date;

  @Column({ default: 'pending' })
  status: string;

  @ManyToOne(() => Shop, (shop) => shop.discounts)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column()
  shop_id: number;

  @OneToMany(() => Order, (order) => order.discount)
  orders: Order[];

  @OneToMany(() => DiscountUsage, (discount_usages) => discount_usages.discount)
  discount_usages: DiscountUsage[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  public created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  public updated_at: Date;
}
