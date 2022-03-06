import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
    constructor(private prisma: PrismaService) {}
    async getBookmarks(userId: number) {
        const bookmakrs = await this.prisma.bookmark.findMany({
            where: {
                id: userId
            }
        });
        return bookmakrs;
    }

    async createBookmark(userId: number, dto: CreateBookmarkDto) {
        const bookmark = await this.prisma.bookmark.create({
            data: {
                userId,
                ...dto
            }
        });
        return bookmark;
    }

   async getBookmarkById(userId: number, bookmarkId: number) {
       const bookmark = await this.prisma.bookmark.findFirst({
           where: {
               id: bookmarkId,
               userId
           }
       });

       return bookmark;
   }

   async editBookmarkById(userId: number, bookmarkId: number, dto: EditBookmarkDto) {
       // Get bookmark by id
       const bookmark = await this.prisma.bookmark.findUnique({
           where: {
               id: bookmarkId
           }
       });

       // Check if user owns the bookmark
       if (!bookmark || bookmark.userId !== userId) {
           throw new ForbiddenException(
                'Access to resources denied',
           );
       }

       
       return this.prisma.bookmark.update({
           where: {
               id: bookmarkId,
           },
           data: {
               ...dto
           }
       });
   }

   async deleteBookmarkById(userId: number, bookmarkId: number) {
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id: bookmarkId,
            },
            });

        // check if user owns the bookmark
        if (!bookmark || bookmark.userId !== userId) {
            throw new ForbiddenException(
            'Access to resources denied',
            );
        }

        await this.prisma.bookmark.delete({
            where: {
            id: bookmarkId,
            },
        });
   }
}
