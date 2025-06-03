import {Module} from '@nestjs/common';
import { PostsController } from './posts.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {PostEntity} from "./entities/post.entity";
import {PostContentService} from "./service/post-content.service";
import {AuthService} from "./service/auth.service";
import {PostAccessService} from "./service/post-access.service";
import {ChainOfThoughtService} from "./service/chain-of-thought.service";

@Module({
  imports: [
      TypeOrmModule.forRoot({
        type: "sqlite",
        database: "/data/thoughtcloud.db",
        entities: [PostEntity],
        synchronize: true
      }),
      TypeOrmModule.forFeature([PostEntity])
  ],
  controllers: [PostsController],
  providers: [
      PostContentService,
      AuthService,
      ChainOfThoughtService,
      PostAccessService
  ],
})
export class AppModule {}

