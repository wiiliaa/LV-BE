/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BaseEntity,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Comment } from 'src/comments/entities/comment.entity';
import { Cart } from 'src/carts/entities/cart.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { UserPayment } from 'src/user_payments/entities/user_payment.entity';
import { Order } from 'src/order/entities/order.entity';
import { Exclude } from 'class-transformer';
import { SearchKeyword } from 'src/search_keyword/entities/search_keyword.entity';
@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;
  @Exclude()
  @Column()
  password: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: 'customer' })
  role: string;

  @Column({ nullable: true, type: 'text' })
  avatar: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  payment: string;

  @OneToMany(() => SearchKeyword, (searchKeyword) => searchKeyword.user)
  searchKeywords: SearchKeyword[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToOne(() => Cart, (cart) => cart.user)
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({ nullable: true })
  cart_id: number;

  @OneToMany(() => Order, (order) => order.user)
  order: Order[];

  @OneToOne(() => Shop, (shop) => shop.user)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column({ nullable: true })
  shop_id: number;

  @OneToMany(() => UserPayment, (user_payment) => user_payment.user)
  user_payments: UserPayment[];

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
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}
