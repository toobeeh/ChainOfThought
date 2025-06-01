import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  PreconditionFailedException,
  UseGuards
} from '@nestjs/common';
import {PostContentService} from "./service/post-content.service";
import {FindPostsDto} from "./dto/findPosts.dto";
import {PostPreviewDto} from "./dto/postPreview.dto";
import {AuthGuard} from "./guard/auth.guard";
import {PostAccessService} from "./service/post-access.service";
import {PostDto} from "./dto/post.dto";
import {ApiBearerAuth, ApiResponse} from "@nestjs/swagger";

@Controller("posts")
@ApiBearerAuth()
export class PostsController {
  constructor(
      private readonly postService: PostContentService,
      private readonly postAccessService: PostAccessService
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async uploadPostContent(@Body() post: PostDto): Promise<PostDto> {

    if(!this.postAccessService.allowedToUpload(post)){
      throw new ForbiddenException(`Authenticated author is not allowed to upload provided post`)
    }

    const hash = await this.postAccessService.getIntegrousPostHash(post);
    const existing = await this.postService.findByHash(hash);

    if(existing !== null) {
      throw new PreconditionFailedException(`Post contents with hash ${hash} already exists`);
    }

    await this.postService.create(post);
    return post;
  }

  @Get(":hash")
  @UseGuards(AuthGuard)
  async getPostByHash(@Param("hash") hash: string): Promise<PostDto> {

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
  async findPosts(@Body() search: FindPostsDto): Promise<PostDto[]> {

    if(! await this.postAccessService.hasAccessTo(search.hashes)) {
      throw new ForbiddenException(`At least one of the requested posts is not present in the access list.`);
    }

    return this.postService.findAllHashes(search.hashes);
  }

  @Post("findPreviews")
  @ApiResponse({type: [PostPreviewDto]})
  async findPostPreviews(@Body() search: FindPostsDto): Promise<PostPreviewDto[]> {
    return this.postService.findAllHashesPreview(search.hashes);
  }
}
