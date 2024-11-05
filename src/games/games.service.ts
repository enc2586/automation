import { firstValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from 'src/prisma/prisma.service';
import * as cheerio from 'cheerio';

import type { NikkeCodePost } from './types/nikke';

@Injectable()
export class GamesService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async checkNikkeCodes() {
    const COUPON_CATEGORY_FRAGMENT = 'category=%EC%BF%A0%ED%8F%B0';
    const COUPON_BOARD = `https://arca.live/b/nikketgv?${COUPON_CATEGORY_FRAGMENT}&p=1`;
    const POST_REGEX = new RegExp(
      `\\/b\\/nikketgv\\/\\d+\\?${COUPON_CATEGORY_FRAGMENT}*`,
    );
    const CODE_REGEX = /[a-zA-Z0-9]{5,}/g;

    // 1. Fetch coupon board and parse
    const { status, data: html } = await firstValueFrom(
      this.httpService.get(COUPON_BOARD),
    );
    if (status !== 200) throw new Error('Failed to fetch data');

    const $ = cheerio.load(html);

    const posts: NikkeCodePost[] = [];
    $('a').each((_, element) => {
      const href = $(element).attr('href');
      const title = $(element).find('span.title').text().trim();

      if (href && POST_REGEX.test(href) && title.length > 0) {
        const id = parseInt(href.split('/')[3]);
        posts.push({ id, title, url: href });
      }
    });

    // 2. Check if there are new posts
    const lastPostId = await this.prisma.nikkeCode.findFirst({
      orderBy: { id: 'desc' },
    });

    const candidates = posts.reduce(
      (acc, x) => (x.id > lastPostId?.id ? [...acc, x] : acc),
      [] as NikkeCodePost[],
    );

    if (candidates.length === 0) return [];

    // 3. Fetch each post and extract code
    const codes: { id: number; code: string | null }[] = [];
    for (const x of candidates) {
      const { id, title, url } = x;

      const code = title.match(CODE_REGEX)?.[0];
      if (code) {
        codes.push({ id, code });
        continue;
      }

      const SECOND = 1000;
      const delay = SECOND * 3;

      await new Promise((resolve) => setTimeout(resolve, delay));

      const { status, data: postHtml } = await firstValueFrom(
        this.httpService.get(`https://arca.live${url}`),
      );
      if (status !== 200) {
        codes.push({ id, code: null });
        continue;
      }

      const $post = cheerio.load(postHtml);
      const content = $post('div.article-content')
        .contents()
        .map((_, el) => $(el).text().trim())
        .get()
        .join(' ')
        .trim();

      const codeList = content.match(CODE_REGEX);
      if (codeList && codeList.length == 1) {
        codes.push({ id, code: codeList[0] });
      } else {
        codes.push({ id, code: null });
      }
    }

    await this.prisma.nikkeCode.createMany({ data: codes });
    return codes;
  }
}
