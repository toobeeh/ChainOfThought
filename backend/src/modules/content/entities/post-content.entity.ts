import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity()
export class PostContentEntity {

    @PrimaryColumn()
    hash: string

    @Column()
    authorAddress: string

    @Column()
    timestamp: number;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column()
    icon: string;

    @Column()
    psHash: string;
}