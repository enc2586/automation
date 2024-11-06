import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DiscordModule } from './discord/discord.module';
import { GamesModule } from './games/games.module';
import { PrismaModule } from './prisma/prisma.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { validationSchema } from './config/validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema,
    }),
    ScheduleModule.forRoot(),
    HttpModule,
    GamesModule,
    PrismaModule,
    SchedulerModule,
    DiscordModule,
  ],
})
export class AppModule {}
