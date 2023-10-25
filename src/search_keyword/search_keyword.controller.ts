// search-keyword.controller.ts
import { Controller, Post, Body, Param } from '@nestjs/common';
import { SearchKeywordService } from './search_keyword.service';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { SearchKeyword } from './entities/search_keyword.entity';

@Controller('search-keyword')
export class SearchKeywordController {
  constructor(private readonly searchKeywordService: SearchKeywordService) {}
}
