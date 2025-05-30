import {Injectable, InternalServerErrorException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {In, Repository} from 'typeorm';
import {PostEntity} from "../entities/post.entity";
import {PostPreview} from "../dto/postPreview.dto";

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(PostEntity)
        private postsRepository: Repository<PostEntity>,
    ) {}

    findAll(): Promise<PostEntity[]> {
        return this.postsRepository.find();
    }

    findByHash(hash: string): Promise<PostEntity | null> {
        return this.postsRepository.findOneBy({ hash });
    }

    async create(post: PostEntity): Promise<PostEntity> {
        if(await this.findByHash(post.hash) !== null) {
            throw new InternalServerErrorException(`Post with hash ${post.hash} already exists`);
        }
        return this.postsRepository.save(post);
    }

    findAllHashes(hashes: string[]): Promise<PostEntity[]> {
        return this.postsRepository.findBy({ hash: In(hashes) });
    }

    async findAllHashesPreview(hashes: string[]): Promise<PostPreview[]> {
        const posts = await this.findAllHashes(hashes);
        return posts.map(post => {
            const preview = new PostPreview();
            preview.hash = post.hash;
            preview.title = post.title;
            preview.authorAddress = post.authorAddress;
            preview.timestamp = post.timestamp;
            preview.icon = post.icon;
            return preview;
        });
    }
}