import { Product } from 'src/product/entities/product.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  BaseEntity,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';

@Entity()
export class CategoryItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Product, (product) => product.categoryItem)
  @JoinColumn({ name: 'product_id' })
  products: Product[];

  @Column({ nullable: true })
  product_id: number;
}
