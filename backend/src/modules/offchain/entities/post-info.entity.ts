import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity()
export class PostInfoEntity {

    @PrimaryColumn()
    hash: string;

    @Column()
    author: string;

    @Column()
    hidden: boolean;

    @Column()
    referencedHash?: string;
}