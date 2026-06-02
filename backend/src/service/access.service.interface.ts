import {PostDto} from "../modules/content/dto/post.dto";

export const IAccessService = Symbol("IAccessService");

/**
 * Service to authorize access to posts
 */
export interface IAccessService {
    hasAccessTo(postHashes: string[]): Promise<boolean>;

    allowedToUpload(post: PostDto): boolean;

    getIntegrousPostHash(post: PostDto): Promise<string>;
}