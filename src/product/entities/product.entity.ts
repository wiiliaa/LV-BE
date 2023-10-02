/* eslint-disable prettier/prettier */

import { CartItem } from 'src/cart_items/entities/cart_item.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { OrderItem } from 'src/order_items/entities/order_item.entity';
import { ProductSize } from 'src/product_size/entities/product_size.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  brand: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  description: string;

  @ManyToOne(() => Shop, (shop) => shop.products)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column()
  shop_id: number;

  @OneToMany(() => Comment, (comment) => comment.product, {
    eager: true,
  })
  @JoinColumn({
    name: 'id',
    referencedColumnName: 'product_id',
  })
  comments: Comment[];

  @OneToMany(() => ProductSize, (productSize) => productSize.product)
  productSizes: ProductSize[];

  @OneToMany(() => CartItem, (cart_item) => cart_item.product)
  cart_items: CartItem[];

  @OneToMany(() => OrderItem, (order_item) => order_item.product)
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
