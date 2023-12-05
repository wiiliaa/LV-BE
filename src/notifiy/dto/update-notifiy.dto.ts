import { PartialType } from '@nestjs/swagger';
import { CreateNotifiyDto } from './create-notifiy.dto';

export class UpdateNotifiyDto extends PartialType(CreateNotifiyDto) {}
