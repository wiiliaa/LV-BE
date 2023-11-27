import { Module } from '@nestjs/common';
import { ProductVersionService } from './product-version.service';
import { ProductVersionController } from './product-version.controller';
import { ProductVersion } from './entities/product-version.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from 'src/product/product.module';
import { ImageModule } from 'src/image/image.module';

@Module({
  controllers: [ProductVersionController],
  providers: [ProductVersionService],
  imports: [
    TypeOrmModule.forFeature([ProductVersion]),
    ProductModule,
    ImageModule,
  ],
  exports: [ProductVersionService],
})
export class ProductVersionModule {}
