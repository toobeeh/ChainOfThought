import {PostDto} from "../modules/content/dto/post.dto";
import {PostPreviewDto} from "../modules/content/dto/postPreview.dto";

export const IContentService = Symbol("IContentService");

/**
 * Service to retrieve content for posts
 */
export interface IContentService {
    findAll(): Promise<PostDto[]>;

    findByHash(hash: string): Promise<PostDto | null>;

    create(post: PostDto): Promise<PostDto>;

    findAllHashes(hashes: string[]): Promise<PostDto[]>;

    findAllHashesPreview(hashes: string[]): Promise<PostPreviewDto[]>;
}