/* eslint-disable prettier/prettier */

import { CartItem } from 'src/cart_items/entities/cart_item.entity';
import { Discount } from 'src/discounts/entities/discount.entity';
import { OrderItem } from 'src/order_items/entities/order_item.entity';
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

  @ManyToOne(() => User, (user) => user.order, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @Column({ nullable: true, type: 'float' })
  total: number;

  @Column({ nullable: true })
  user_id: number;

  @Column({ nullable: true })
  username: string;
  @ManyToOne(() => Shop, (shop) => shop.orders, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'shopId',
  })
  shop: Shop;
  @Column({ nullable: true })
  shopId: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  address: string;

  // @Column()
  // price: number;

  // @Column()
  // discountPrice: number;

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
