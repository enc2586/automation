import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { GamesService } from 'src/games/games.service';

@Injectable()
export class SchedulerService {
  constructor(private readonly gamesService: GamesService) {}

  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'checkNikkeCodes' })
  async checkNikkeCodes() {
    const codes = await this.gamesService.checkNikkeCodes();

    if (codes.length > 0) {
      console.log(`Found ${codes.length} new codes`);
    } else {
      console.log('No new codes found');
    }
  }
}
