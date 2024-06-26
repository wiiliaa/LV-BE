import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
  BeforeUpdate,
  BeforeInsert,
  AfterUpdate,
  Unique,
} from 'typeorm';

import { Product } from 'src/product/entities/product.entity';
import { ProductVersion } from 'src/product-version/entities/product-version.entity';
@Unique(['version_id', 'sizeName'])
@Entity()
export class ProductSize extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sizeName: string;

  @Column()
  quantity: number;

  @ManyToOne(() => ProductVersion, (version) => version.sizes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'version_id' })
  version: ProductVersion;
  @Column({ nullable: true })
  version_id: number;

  @ManyToOne(() => Product, (product) => product.sizes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
  @Column({ nullable: true })
  product_id: number;
}
