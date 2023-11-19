import { Injectable } from '@nestjs/common';
import { CreateSearchKeywordDto } from './dto/create-search_keyword.dto';
import { UpdateSearchKeywordDto } from './dto/update-search_keyword.dto';
import { SearchKeyword } from './entities/search_keyword.entity';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SearchKeywordService {
  constructor(
    @InjectRepository(SearchKeyword)
    private searchKeywordRepository: Repository<SearchKeyword>,
  ) {}

  async createKeyword(user: User, keyword): Promise<SearchKeyword> {
    const existingKeyword = await this.searchKeywordRepository.findOne({
      where: { keyword, user: { id: user.id } },
    });

    if (existingKeyword) {
      return existingKeyword;
    }

    const newKeyword = new SearchKeyword();
    newKeyword.keyword = keyword;
    newKeyword.user_id = user.id;

    return await this.searchKeywordRepository.save(newKeyword);
  }

  async getRecentKeywords(user: User): Promise<string[]> {
    // Lấy danh sách từ khóa của người dùng và sắp xếp chúng theo thời gian tạo giảm dần
    const userKeywords = await this.searchKeywordRepository.find({
      where: { user: { id: user.id } },
      order: { created_at: 'DESC' },
      take: 3, // Lấy 3 từ khóa đầu tiên
    });

    // Trích xuất các từ khóa thành một mảng
    const keywords = userKeywords.map((keyword) => keyword.keyword);

    return keywords;
  }
}
