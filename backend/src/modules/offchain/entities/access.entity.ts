import {Entity, PrimaryColumn} from "typeorm";

@Entity()
export class AccessEntity {

    @PrimaryColumn()
    author: string;

    @PrimaryColumn()
    hash: string;
}