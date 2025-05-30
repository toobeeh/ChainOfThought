import {Body, Controller, Get, NotFoundException, Param, Post, UseGuards} from '@nestjs/common';
import { AppService } from './app.service';
import {PostsService} from "./service/post.service";
import {PostEntity} from "./entities/post.entity";
import {FindPostsDto} from "./dto/findPosts.dto";
import {PostPreview} from "./dto/postPreview.dto";
import {AuthGuard} from "./guard/auth.guard";
import {ApiBearerAuth} from "@nestjs/swagger";

@Controller("posts")
@ApiBearerAuth()
export class PostsController {
  constructor(private readonly appService: AppService, private readonly postService: PostsService) {}

  @Post()
  async createPost(@Body() post: PostEntity): Promise<PostEntity> {
      return this.postService.create(post);
  }

  @Get(":hash")
  async getPostByHash(@Param("hash") hash: string): Promise<PostEntity> {
    const post =  await this.postService.findByHash(hash);
    if(post === null){
      throw new NotFoundException(`Post with hash ${hash} not found`);
    }
    return post;
  }

  @Post("find")
  async findPosts(@Body() search: FindPostsDto): Promise<PostEntity[]> {
    return this.postService.findAllHashes(search.hashes);
  }

  @Post("findPreviews")
  @UseGuards(AuthGuard)
  async findPostPreviews(@Body() search: FindPostsDto): Promise<PostPreview[]> {
    return this.postService.findAllHashesPreview(search.hashes);
  }
}
