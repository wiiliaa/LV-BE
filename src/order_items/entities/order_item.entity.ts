/* eslint-disable prettier/prettier */
import { Order } from 'src/order/entities/order.entity';
import { ProductVersion } from 'src/product-version/entities/product-version.entity';

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class OrderItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column({ nullable: true, type: 'float' })
  discountedPrice: number;

  @ManyToOne(() => Order, (order) => order.order_items, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'order_id',
  })
  order: Order;

  @Column()
  order_id: number;

  @ManyToOne(() => ProductVersion, (version) => version.cart_items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'version_id' })
  version: ProductVersion;

  @Column()
  version_id: number;

  @Column({ nullable: true })
  shopId: number;

  @Column({ nullable: true })
  sizeId: number;

  @Column({ nullable: true })
  sizeName: string;

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
