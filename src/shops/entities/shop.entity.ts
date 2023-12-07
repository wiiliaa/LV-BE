/* eslint-disable prettier/prettier */

import { CartItem } from 'src/cart_items/entities/cart_item.entity';
import { Discount } from 'src/discounts/entities/discount.entity';
import { Order } from 'src/order/entities/order.entity';
import { Product } from 'src/product/entities/product.entity';

import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class Shop extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true, default: null })
  avatar: string;

  @OneToOne(() => User, (user) => user.shop, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true, default: null })
  user_id: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  shop_payment: string;

  @OneToMany(() => Discount, (discount) => discount.shop, {
    onDelete: 'CASCADE',
  })
  discounts: Discount[];

  @OneToMany(() => Order, (order) => order.shop, { onDelete: 'CASCADE' })
  orders: Order[];

  @OneToMany(() => Product, (product) => product.shop, { onDelete: 'CASCADE' })
  products: Product[];

  @OneToMany(() => CartItem, (cart_items) => cart_items.shop, {
    onDelete: 'CASCADE',
  })
  cart_items: CartItem[];

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
