/* eslint-disable prettier/prettier */

import { Order } from 'src/order/entities/order.entity';
import { Product } from 'src/product/entities/product.entity';
import { Shop } from 'src/shops/entities/shop.entity';

import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
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

  @Column({ default: 0 })
  percent: number;

  @Column()
  description: string;

  @Column({ default: false })
  active: boolean;

  @Column({ nullable: true })
  activeDay: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true, type: 'text' })
  image: string;

  @ManyToOne(() => Shop, (shop) => shop.discounts)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column()
  shop_id: number;

  @OneToMany(() => Order, (order) => order.discount)
  orders: Order[];

  @OneToOne(() => Product, (product) => product.discount)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ nullable: true })
  product_id: number;

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

  @BeforeInsert()
  initializeActiveDay() {
    if (this.active) {
      // Nếu active là true, thì khởi tạo activeDay bằng cách gọi hàm calculateActiveDay
      this.activeDay = this.calculateActiveDay();
    } else {
      // Nếu active là false, đặt activeDay về 0
      this.activeDay = 0;
    }
  }

  private calculateActiveDay(): number {
    const today = new Date();
    const endDate = new Date(
      today.getTime() + this.activeDay * 24 * 60 * 60 * 1000,
    ); // Thêm số ngày vào ngày hiện tại
    const remainingDays = Math.floor(
      (endDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
    ); // Đếm ngược số ngày còn lại
    return (this.activeDay = remainingDays);
  }
}
