// image/image.service.ts
import { Injectable } from '@nestjs/common';
import { promisify } from 'util';
import * as fs from 'fs';
import { join } from 'path';
const readFileAsync = promisify(fs.readFile);

@Injectable()
export class ImageService {
  async getImage(imagePath: string): Promise<string | null> {
    if (!imagePath) {
      console.error('Đường dẫn hình ảnh không hợp lệ.');
      return null;
    }

    const absolutePath = await join('public/uploads', imagePath);

    try {
      const imageContent = await readFileAsync(absolutePath, 'utf-8');
      return imageContent;
    } catch (error) {
      return null;
    }
  }
}
