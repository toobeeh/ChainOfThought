import {
  Body,
  Controller,
  ForbiddenException,
  Get, Inject,
  NotFoundException,
  Param,
  Post,
  PreconditionFailedException,
  UseGuards
} from '@nestjs/common';
import {ApiBearerAuth, ApiResponse} from "@nestjs/swagger";
import {AuthGuard} from "../../guard/auth.guard";
import {IContentService} from "../../service/content.service.interface";
import {IAccessService} from "../../service/access.service.interface";
import {PostDto} from "../../dto/post.dto";
import {FindPostsDto} from "../../dto/findPosts.dto";
import {PostPreviewDto} from "../../dto/postPreview.dto";

@Controller("content")
@ApiBearerAuth()
export class ContentController {
  constructor(
      @Inject(IContentService) private readonly postService: IContentService,
      @Inject(IAccessService) private readonly postAccessService: IAccessService
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiResponse({type: PostDto})
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
  @ApiResponse({type: PostDto})
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
  @ApiResponse({type: [PostDto]})
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
