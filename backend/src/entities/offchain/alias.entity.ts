import {Column, Entity, PrimaryColumn} from "typeorm";

@Entity()
export class AliasEntity {

    @PrimaryColumn()
    alias: string;

    @Column()
    author: string;
}