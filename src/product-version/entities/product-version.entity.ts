import { Product } from 'src/product/entities/product.entity';
import { ProductSize } from 'src/product_size/entities/product_size.entity';
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
export class ProductVersion extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  versionName: string;

  @Column()
  image: string;

  @ManyToOne(() => Product, (product) => product.versions)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @OneToMany(() => ProductSize, (productSize) => productSize.productVersion)
  sizes: ProductSize[];

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
