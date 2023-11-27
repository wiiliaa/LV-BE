// image/image.service.ts
import { Injectable } from '@nestjs/common';
import { promisify } from 'util';
import * as fs from 'fs';
import { join } from 'path';
const readFileAsync = promisify(fs.readFile);

@Injectable()
export class ImageService {
  async getImage(imagePath: string): Promise<string | null> {
    const absolutePath = await join(
      process.cwd(),
<<<<<<< HEAD
      'public/uploads',
=======
      '/public/uploads',
>>>>>>> 87d371b5e04526143acfa48aa43cd4848f4316c6
      imagePath,
    );
    try {
      const imageContent = await readFileAsync(absolutePath, 'utf-8');
      return imageContent;
    } catch (error) {
      console.error('Lỗi khi đọc nội dung tệp tin:', error.message);
      return null;
    }
  }
}
