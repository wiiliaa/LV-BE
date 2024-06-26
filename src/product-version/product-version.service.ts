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
    const { color, image, price } = createProductVersionDto;
    const productVersion = new ProductVersion();
    productVersion.color = color;
    productVersion.price = price;
    productVersion.image = image;
    productVersion.product_id = productId;
    if (image) {
      try {
        // Tạo đường dẫn và tên file cho mã base64
        const randomSuffix = Math.floor(Math.random() * 100000000)
          .toString()
          .padStart(8, '0');
        const fileName = `${randomSuffix}-image.txt`;
        const filePath = `public/uploads/${fileName}`;

        // Lưu mã base64 vào tệp văn bản
        await writeFileAsync(filePath, image);
        // Lưu đường dẫn tệp vào trường image của phiên bản sản phẩm
        productVersion.image = fileName;
      } catch (error) {
        throw new InternalServerErrorException('Lỗi khi lưu mã base64 vào tệp');
      }
    }
    await this.productVersionRepository.save(productVersion);
    await this.productService.updateTotal(productId);
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
  async findById(id: number) {
    const res = await this.productVersionRepository.findOne({
      where: { id },
      relations: ['sizes'], // Thêm 'size' vào relations để load thông tin size
    });

    if (res) {
      const image1 = await this.imageService.getImage(res.image);

      // Kiểm tra xem có thông tin về size không
      if (res.sizes) {
        return { ...res, image: image1 };
      } else {
        // Nếu không có thông tin về size, trả về một đối tượng không có trường size
        return { ...res, image: image1, size: null };
      }
    }

    return null;
  }

  async update(
    id: number,
    updateProductVersionDto: UpdateProductVersionDto,
  ): Promise<ProductVersion | null> {
    const productVersion = await this.productVersionRepository.findOne({
      where: { id },
    });
    const writeFileAsync = promisify(fs.writeFile);
    if (!productVersion) {
      throw new NotFoundException(`ProductVersion with ID ${id} not found`);
    }

    const { color, image, price } = updateProductVersionDto;

    productVersion.color = color;
    productVersion.price = price;

    if (image) {
      try {
        // Tạo đường dẫn và tên file cho mã base64
        const randomSuffix = Math.floor(Math.random() * 100000000)
          .toString()
          .padStart(8, '0');
        const fileName = `${randomSuffix}-image.txt`;
        const filePath = `public/uploads/${fileName}`;

        // Lưu mã base64 vào tệp văn bản
        await writeFileAsync(filePath, image);
        // Lưu đường dẫn tệp vào trường image của phiên bản sản phẩm
        productVersion.image = fileName;
      } catch (error) {
        throw new InternalServerErrorException('Lỗi khi lưu mã base64 vào tệp');
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

  async updateTotalVer(versionId: number, sizeId: number): Promise<number> {
    const productVersion = await this.productVersionRepository.findOne({
      where: { id: versionId },

      relations: ['sizes'],
    });

    if (!productVersion) {
      throw new Error('Không tìm thấy phiên bản sản phẩm');
    }
    const size = productVersion.sizes.find((s) => s.id === sizeId);

    if (!size) {
      throw new Error('Không tìm thấy kích thước trong phiên bản sản phẩm');
    }
    productVersion.total = productVersion.sizes.reduce(
      (total, s) => total + (s.quantity || 0),
      0,
    );

    await this.productVersionRepository.save(productVersion);
    await this.productService.updateTotal(productVersion.product_id);
    return size.quantity;
  }

  async findShopByVersionId(versionId: number) {
    const productVersion = await this.productVersionRepository.findOne({
      where: { id: versionId },
      relations: ['product', 'product.shop'], // Assuming relationships are defined in the entities
    });

    if (!productVersion) {
      throw new NotFoundException(
        `ProductVersion with ID ${versionId} not found`,
      );
    }

    const product = productVersion.product;

    if (!product) {
      throw new InternalServerErrorException(
        'Product not found for the given version',
      );
    }

    const shop = product.shop;

    if (!shop) {
      throw new InternalServerErrorException(
        'Shop not found for the given product',
      );
    }

    return shop.id;
  }
}
