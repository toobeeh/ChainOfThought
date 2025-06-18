import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity()
export class FavoriteEntity {

    @PrimaryColumn()
    author: string;

    @PrimaryColumn()
    hash: string;
}