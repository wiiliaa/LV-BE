/* eslint-disable prettier/prettier */

import { CartItem } from 'src/cart_items/entities/cart_item.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Discount } from 'src/discounts/entities/discount.entity';
import { OrderItem } from 'src/order_items/entities/order_item.entity';
import { ProductVersion } from 'src/product-version/entities/product-version.entity';
import { ProductCategory } from 'src/product_categories/entities/product_category.entity';
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
  OneToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  brand: string;

  @Column({ nullable: true })
  price: number;

  @Column({ nullable: true, type: 'float' })
  discountedPrice: number;

  @Column()
  description: string;

  @Column({ nullable: true, type: 'text' })
  image: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  origin: string;

  @Column({ default: 0, nullable: true })
  total: number;

  @OneToOne(() => Discount, (discount) => discount.product)
  @JoinColumn({ name: 'discount_id' })
  discount: Discount;

  @Column({ nullable: true })
  discount_id: number;

  @OneToMany(() => ProductSize, (size) => size.product)
  sizes: ProductSize[];

  @ManyToOne(() => Shop, (shop) => shop.products)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column({ nullable: true })
  shop_id: number;

  @OneToMany(() => Comment, (comment) => comment.product, {
    eager: true,
  })
  @JoinColumn({
    name: 'id',
    referencedColumnName: 'product_id',
  })
  comments: Comment[];

  @OneToMany(() => ProductVersion, (version) => version.product)
  versions: ProductVersion[];

  @ManyToMany(() => ProductCategory, (category) => category.products)
  @JoinTable()
  categories: ProductCategory[];

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
