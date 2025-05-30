import {Injectable, InternalServerErrorException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {In, Repository} from 'typeorm';
import {PostEntity} from "../entities/post.entity";
import {PostPreviewDto} from "../dto/postPreview.dto";
import {PostDto} from "../dto/post.dto";

@Injectable()
export class PostContentService {
    constructor(
        @InjectRepository(PostEntity)
        private postsRepository: Repository<PostEntity>,
    ) {}

    findAll(): Promise<PostDto[]> {
        return this.postsRepository.find();
    }

    async findByHash(hash: string): Promise<PostDto | null> {
        const entity = await this.postsRepository.findOneBy({ hash });
        if(entity === null) return null;
        return this.entityToDto(entity);
    }

    async create(post: PostDto): Promise<PostDto> {
        const entity = this.dtoToEntity(post);
        if(await this.findByHash(post.hash) !== null) {
            throw new InternalServerErrorException(`Post with hash ${post.hash} already exists`);
        }
        await this.postsRepository.save(entity);
        return post;
    }

    async findAllHashes(hashes: string[]): Promise<PostDto[]> {
        return (await this.postsRepository.findBy({ hash: In(hashes) }))
            .map(post => this.entityToDto(post));
    }

    async findAllHashesPreview(hashes: string[]): Promise<PostPreviewDto[]> {
        const posts = await this.findAllHashes(hashes);
        return posts.map(post => {
            const preview = new PostPreviewDto();
            preview.hash = post.hash;
            preview.title = post.title;
            preview.authorAddress = post.authorAddress;
            preview.timestamp = post.timestamp;
            preview.icon = post.icon;
            return preview;
        });
    }

    private entityToDto(entity: PostEntity): PostDto {
        const dto = new PostDto();
        dto.hash = entity.hash;
        dto.authorAddress = entity.authorAddress;
        dto.timestamp = entity.timestamp;
        dto.title = entity.title;
        dto.content = entity.content;
        dto.icon = entity.icon;
        dto.psHash = entity.psHash;
        return dto;
    }

    private dtoToEntity(dto: PostDto): PostEntity {
        const entity = new PostDto();
        entity.hash = dto.hash;
        entity.authorAddress = dto.authorAddress;
        entity.timestamp = dto.timestamp;
        entity.title = dto.title;
        entity.content = dto.content;
        entity.icon = dto.icon;
        entity.psHash = dto.psHash;
        return dto;
    }
}