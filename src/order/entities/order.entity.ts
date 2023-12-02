/* eslint-disable prettier/prettier */

import { CartItem } from 'src/cart_items/entities/cart_item.entity';
import { Discount } from 'src/discounts/entities/discount.entity';
import { OrderItem } from 'src/order_items/entities/order_item.entity';
import { PaymentDetail } from 'src/payment_details/entities/payment_detail.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.order)
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @Column()
  user_id: number;

  @ManyToOne(() => Shop, (shop) => shop.orders)
  @JoinColumn({
    name: 'shop_id',
  })
  shop: Shop;
  @Column({ nullable: true })
  shopId: number;

  @Column({ default: 'pending' })
  status: string;

  // @Column()
  // price: number;

  // @Column()
  // discountPrice: number;

  @OneToOne(() => PaymentDetail, (payment_detail) => payment_detail.order)
  payment_detail: PaymentDetail;

  @OneToMany(() => OrderItem, (order_items) => order_items.order)
  order_items: OrderItem[];

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
