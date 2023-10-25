import { Module } from '@nestjs/common';
import { SearchKeywordService } from './search_keyword.service';
import { SearchKeywordController } from './search_keyword.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchKeyword } from './entities/search_keyword.entity';

@Module({
  controllers: [SearchKeywordController],
  providers: [SearchKeywordService],
  imports: [TypeOrmModule.forFeature([SearchKeyword])],
  exports: [SearchKeywordService],
})
export class SearchKeywordModule {}
