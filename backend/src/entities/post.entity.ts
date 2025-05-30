import {Column, Entity, PrimaryColumn} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";

@Entity()
export class PostEntity {

    @PrimaryColumn()
    @ApiProperty()
    hash: string

    @Column()
    @ApiProperty()
    authorAddress: string

    @Column()
    @ApiProperty()
    timestamp: number;

    @Column()
    @ApiProperty()
    title: string;

    @Column()
    @ApiProperty()
    content: string;

    @Column()
    @ApiProperty()
    icon: string;

    @Column()
    @ApiProperty()
    psHash: string;
}