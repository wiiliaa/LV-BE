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
  versionName: string;

  @Column()
  image: string;

  @Column({ default: 0, nullable: true })
  total: number;

  @BeforeInsert()
  @BeforeUpdate()
  updateTotal() {
    // Tính toán tổng số lượng từ các size và cập nhật vào trường total
    this.total = this.calculateTotal();
  }

  private calculateTotal(): number {
    return this.sizes.reduce((total, size) => total + size.quantity, 0);
  }

  @ManyToOne(() => Product, (product) => product.versions)
  @JoinColumn({ name: 'product_id' })
  product: Product;

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
