import { Cart } from 'src/carts/entities/cart.entity';
import { ProductVersion } from 'src/product-version/entities/product-version.entity';
import { Product } from 'src/product/entities/product.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity()
export class CartItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cart, (cart) => cart.cart_items)
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column()
  cart_id: number;

  @ManyToOne(() => ProductVersion, (version) => version.cart_items)
  @JoinColumn({ name: 'version_id' })
  version: ProductVersion;

  @Column()
  version_id: number;

  @ManyToOne(() => Shop, (shop) => shop.cart_items)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column()
  shop_id: number;

  @Column()
  quantity: number;

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
