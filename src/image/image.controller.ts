// image/image.controller.ts
import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { ImageService } from './image.service';
import { join } from 'path';
@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get(':path')
  async getImageData(@Param('path') imagePath: string, @Res() res: Response) {
    const absolutePath = join(process.cwd(), 'src/public/uploads', imagePath);

    const imageData = await this.imageService.getImageDataFromPath(
      absolutePath,
    );

    if (imageData !== null) {
      res.setHeader('Content-Type', 'text/plain');
      res.send(imageData);
    } else {
      res.status(404).send('Image not found');
    }
  }
}
