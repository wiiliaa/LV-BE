// image/image.service.ts
import { Injectable } from '@nestjs/common';
import { promisify } from 'util';
import * as fs from 'fs';
import { join } from 'path';
const readFileAsync = promisify(fs.readFile);

@Injectable()
export class ImageService {
  async getImage(imagePath: string): Promise<string | null> {
    const filePath = `public/uploads/${imagePath}`;
    try {
      const imageContent = await readFileAsync(filePath, 'utf-8');
      return imageContent;
    } catch (error) {
      console.error('Lỗi khi đọc nội dung tệp tin:', error.message);
      return null;
    }
  }
}
