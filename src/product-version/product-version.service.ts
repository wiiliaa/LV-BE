import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductVersionDto } from './dto/create-product-version.dto';
import { UpdateProductVersionDto } from './dto/update-product-version.dto';
import { ProductVersion } from './entities/product-version.entity';
import { ProductService } from 'src/product/product.service';
import { promisify } from 'util';
import * as fs from 'fs';

import { ImageService } from 'src/image/image.service';
@Injectable()
export class ProductVersionService {
  constructor(
    @InjectRepository(ProductVersion)
    private readonly productVersionRepository: Repository<ProductVersion>,
    private imageService: ImageService,
    private productService: ProductService,
  ) {}

  async create(
    productId: number,
    createProductVersionDto: CreateProductVersionDto,
  ): Promise<ProductVersion> {
    const product = await this.productService.findById(productId);

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const writeFileAsync = promisify(fs.writeFile);
    const { name, image } = createProductVersionDto;
    const productVersion = new ProductVersion();
    product.hasVersion = true;
    productVersion.name = name;
    productVersion.product_id = productId;

    if (Array.isArray(image) && image.length > 0) {
      try {
        const imageArray = image.map((ima, index) => ({
          [index + 1]: ima.data,
        }));

        const filePath = `public/uploads/${productId}-images.json`; // Sử dụng đường dẫn và tên file cho toàn bộ tệp JSON

        // Lưu thông tin về ảnh vào tệp JSON
        await writeFileAsync(filePath, JSON.stringify(imageArray), {
          flag: 'a',
        });

        // Lưu đường dẫn tệp JSON vào trường image của phiên bản sản phẩm
        productVersion.image = filePath;
      } catch (error) {
        throw new InternalServerErrorException(
          'Lỗi khi lưu thông tin ảnh vào tệp JSON',
        );
      }
    }

    await this.productVersionRepository.save(productVersion);

    return productVersion;
  }

  async findAll(): Promise<ProductVersion[]> {
    const productVersions = await this.productVersionRepository.find();

    // Duyệt qua từng phiên bản sản phẩm và thêm thông tin ảnh nếu có
    const productVersionsWithImages: (ProductVersion | null)[] =
      await Promise.all(
        productVersions.map(async (productVersion) => {
          // Lấy thông tin ảnh từ imageService
          if (productVersion.image) {
            const image = await this.imageService.getImage(
              productVersion.image,
            );

            // Tạo một đối tượng mới chỉ với thông tin ảnh được thêm vào
            return {
              ...productVersion,
              image,
            } as ProductVersion;
          } else {
            // Nếu không có ảnh, trả về phiên bản sản phẩm với image là null
            return {
              ...productVersion,
              image: null,
            } as ProductVersion;
          }
        }),
      );

    // Lọc ra những phiên bản sản phẩm không có ảnh (null) và trả về danh sách
    return productVersionsWithImages.filter(
      (productVersion) => productVersion !== null,
    ) as ProductVersion[];
  }
  async findById(id: number): Promise<{
    productVersion: ProductVersion | null;
    found: boolean;
  }> {
    const res = await this.productVersionRepository.findOne({
      where: { id },
    });

    const image1 = await this.imageService.getImage(res.image);
    res.image = image1;
    return { productVersion: res, found: true };
  }

  async update(
    id: number,
    updateProductVersionDto: UpdateProductVersionDto,
  ): Promise<ProductVersion> {
    const productVersion = await this.productVersionRepository.findOne({
      where: { id },
    });

    if (!productVersion) {
      throw new NotFoundException(
        `Phiên bản sản phẩm với ID ${id} không tồn tại`,
      );
    }

    const writeFile = promisify(fs.writeFile);
    const { name, image } = updateProductVersionDto;

    if (name) {
      productVersion.name = name;
    }

    if (image) {
      try {
        console.log('Dữ liệu đầu vào trước khi parse:', image);

        // Kiểm tra xem image có phải là mảng không
        const imageArray = Array.isArray(image)
          ? image.map((img: any, index: number) => ({ [index + 1]: img.data }))
          : [];

        const filePath = `public/uploads/${productVersion.product_id}-images.json`;

        // Tìm vị trí của ảnh hiện tại trong mảng và xóa thông tin về ảnh cũ
        const imageIndex = imageArray.findIndex(
          (img: any) => Object.values(img)[0] === productVersion.image,
        );
        if (imageIndex !== -1) {
          imageArray.splice(imageIndex, 1);
        }

        // Lưu thông tin mới về ảnh vào tệp JSON
        await writeFile(filePath, JSON.stringify(imageArray), {
          flag: 'w', // Sử dụng 'w' để ghi đè nội dung tệp
        });

        // Lưu đường dẫn tệp JSON vào trường image của phiên bản sản phẩm
        productVersion.image = filePath;
      } catch (error) {
        console.error('Lỗi khi lưu thông tin ảnh vào tệp JSON:', error);
        throw new InternalServerErrorException(
          'Lỗi khi lưu thông tin ảnh vào tệp JSON',
        );
      }
    }

    await this.productVersionRepository.save(productVersion);

    return productVersion;
  }

  async delete(id: number): Promise<void> {
    const productVersion = await this.productVersionRepository.findOne({
      where: { id },
    });

    if (!productVersion) {
      throw new NotFoundException(`Không tìm thấy ProductVersion với ID ${id}`);
    }

    // Nếu có ảnh, thì xóa ảnh trước khi xóa phiên bản sản phẩm
    if (productVersion.image) {
      try {
        const imagePath = `public/uploads/${productVersion.image}`;

        // Xóa tệp ảnh
        await promisify(fs.unlink)(imagePath);
      } catch (error) {
        throw new InternalServerErrorException('Lỗi khi xóa ảnh');
      }
    }

    // Xóa phiên bản sản phẩm từ cơ sở dữ liệu
    await this.productVersionRepository.remove(productVersion);
  }
}
