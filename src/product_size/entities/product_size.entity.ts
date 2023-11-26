import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';

import { Product } from 'src/product/entities/product.entity';
import { ProductVersion } from 'src/product-version/entities/product-version.entity';

@Entity()
export class ProductSize extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column()
  sizeName: string;

  @Column()
  quantity: number;

  @ManyToOne(() => ProductVersion, (version) => version.sizes)
  @JoinColumn({ name: 'version_id' })
  version: ProductVersion;

  @Column()
  version_id: number;
}
