import { Module } from '@nestjs/common';
import { GamesService } from './games/games.service';
import { GamesModule } from './games/games.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from './prisma/prisma.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
    GamesModule,
    PrismaModule,
    SchedulerModule,
  ],
  providers: [GamesService],
})
export class AppModule {}
