// image/image.service.ts
import { Injectable } from '@nestjs/common';
import { promisify } from 'util';
import * as fs from 'fs';

const readFileAsync = promisify(fs.readFile);

@Injectable()
export class ImageService {
  async getImageDataFromPath(imagePath: string): Promise<string | null> {
    try {
      const imageContent = await readFileAsync(imagePath, 'utf-8');
      return imageContent;
    } catch (error) {
      console.error('Lỗi khi đọc nội dung tệp tin:', error.message);
      return null;
    }
  }
}
