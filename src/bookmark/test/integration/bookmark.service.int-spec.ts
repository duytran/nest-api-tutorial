import { Test } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { PrismaService } from '../../../prisma/prisma.service';
import { BookmarkService } from '../../bookmark.service';
import { CreateBookmarkDto } from '../../dto';

describe('BookmarkService Int', () => {
  let prisma: PrismaService;
  let bookmarkService: BookmarkService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    prisma = moduleRef.get(PrismaService);
    bookmarkService = moduleRef.get(BookmarkService);
    await prisma.cleanDB();
  });

  describe('createBookmark()', () => {
    let userId: number;
    it('should create user', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'john@skynet.com',
          hash: '12345',
          firstName: 'john',
          lastName: 'Connor',
        },
      });
      userId = user.id;
    });
    it('should create bookmark', async () => {
      const dto: CreateBookmarkDto = {
        title: 'First Bookmark',
        link: 'https://www.youtube.com/watch?v=d6WC5n9G_sM',
      };
      const bookmark = await bookmarkService.createBookmark(userId, dto);
      expect(bookmark.title).toBe(dto.title);
      expect(bookmark.link).toBe(dto.link);
      expect(bookmark.userId).toBe(userId);
    });
  });

  describe('updateBookmak()', () => {});
});
