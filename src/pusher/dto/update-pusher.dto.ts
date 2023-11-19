import { PartialType } from '@nestjs/swagger';
import { CreatePusherDto } from './create-pusher.dto';

export class UpdatePusherDto extends PartialType(CreatePusherDto) {}
