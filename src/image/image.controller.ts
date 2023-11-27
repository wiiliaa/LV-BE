// image/image.controller.ts
import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { ImageService } from './image.service';
import { join } from 'path';
@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get(':path')
  async getImage(@Param('path') imagePath: string, @Res() res: Response) {
    const absolutePath = await join(
      // process.cwd(),
      'src/public/userAvatar',
      imagePath,
    );
    console.log('tets', absolutePath);
    const imageData = await this.imageService.getImage(absolutePath);

    if (imageData !== null) {
      res.setHeader('Content-Type', 'text/plain');
      res.send(imageData);
    } else {
      res.status(404).send('Image not found');
    }
  }
}
