import {Body, Controller, ForbiddenException, Get, NotFoundException, Param, Post, UseGuards} from '@nestjs/common';
import { AppService } from './app.service';
import {PostsService} from "./service/post.service";
import {PostEntity} from "./entities/post.entity";
import {FindPostsDto} from "./dto/findPosts.dto";
import {PostPreview} from "./dto/postPreview.dto";
import {AuthGuard} from "./guard/auth.guard";
import {ApiBearerAuth} from "@nestjs/swagger";
import {PostAccessService} from "./service/post-access.service";

@Controller("posts")
@ApiBearerAuth()
export class PostsController {
  constructor(
      private readonly appService: AppService,
      private readonly postService: PostsService,
      private readonly postAccessService: PostAccessService
  ) {}

  @Post()
  async createPost(@Body() post: PostEntity): Promise<PostEntity> {
      return this.postService.create(post);
  }

  @Get(":hash")
  @UseGuards(AuthGuard)
  async getPostByHash(@Param("hash") hash: string): Promise<PostEntity> {

    if(! await this.postAccessService.hasAccessTo([hash])) {
      throw new ForbiddenException(`The post is not present in the access list.`);
    }

    const post =  await this.postService.findByHash(hash);
    if(post === null){
      throw new NotFoundException(`Post with hash ${hash} not found`);
    }
    return post;
  }

  @Post("find")
  @UseGuards(AuthGuard)
  async findPosts(@Body() search: FindPostsDto): Promise<PostEntity[]> {

    if(! await this.postAccessService.hasAccessTo(search.hashes)) {
      throw new ForbiddenException(`At least one of the requested posts is not present in the access list.`);
    }

    return this.postService.findAllHashes(search.hashes);
  }

  @Post("findPreviews")
  async findPostPreviews(@Body() search: FindPostsDto): Promise<PostPreview[]> {
    return this.postService.findAllHashesPreview(search.hashes);
  }
}
