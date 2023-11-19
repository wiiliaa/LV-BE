import { Test, TestingModule } from '@nestjs/testing';
import { SearchKeywordController } from './search_keyword.controller';
import { SearchKeywordService } from './search_keyword.service';

describe('SearchKeywordController', () => {
  let controller: SearchKeywordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchKeywordController],
      providers: [SearchKeywordService],
    }).compile();

    controller = module.get<SearchKeywordController>(SearchKeywordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
