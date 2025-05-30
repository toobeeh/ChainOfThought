import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { AppService } from './app.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {PostEntity} from "./entities/post.entity";
import {PostsService} from "./service/post.service";
import {AuthService} from "./service/auth.service";
import {APP_GUARD} from "@nestjs/core";
import {AuthGuard} from "./guard/auth.guard";

@Module({
  imports: [
      TypeOrmModule.forRoot({
        type: "sqlite",
        database: "thoughtcloud.db",
        entities: [PostEntity],
        synchronize: true
      }),
      TypeOrmModule.forFeature([PostEntity])
  ],
  controllers: [PostsController],
  providers: [
      AppService,
      PostsService,
      AuthService,
      {
          provide: APP_GUARD,
          useClass: AuthGuard,
      }
  ],
})
export class AppModule {}
