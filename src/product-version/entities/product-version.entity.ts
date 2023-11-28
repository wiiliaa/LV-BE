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
  BeforeUpdate,
  BeforeInsert,
} from 'typeorm';

@Entity()
export class ProductVersion extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  color: string;

  @Column()
  image: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ default: 0, nullable: true })
  total: number;

  @ManyToOne(() => Product, (product) => product.versions)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  product_id: number;

  @OneToMany(() => ProductSize, (productSize) => productSize.version)
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