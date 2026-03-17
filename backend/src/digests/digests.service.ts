import {
  Injectable,
  NotFoundException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { Digest } from '../entities/digest.entity';
import { Recording } from '../entities/recording.entity';
import { OpenaiService } from '../openai/openai.service';

const DAY_NAMES = [
  'Neděle',
  'Pondělí',
  'Úterý',
  'Středa',
  'Čtvrtek',
  'Pátek',
  'Sobota',
];

@Injectable()
export class DigestsService implements OnModuleInit {
  private readonly logger = new Logger(DigestsService.name);

  constructor(
    @InjectRepository(Digest)
    private digestsRepo: Repository<Digest>,
    @InjectRepository(Recording)
    private recordingsRepo: Repository<Recording>,
    private openaiService: OpenaiService,
    private configService: ConfigService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    const cronTime = this.configService.get<string>(
      'DAILY_DIGEST_CRON_HOUR',
      '04:00',
    );
    const [hour, minute] = cronTime.split(':').map(Number);
    const job = new CronJob(`${minute} ${hour} * * *`, () => {
      this.generateDailyDigests().catch((err: Error) =>
        this.logger.error(`Daily digest generation failed: ${err.message}`),
      );
    });
    this.schedulerRegistry.addCronJob('daily-digest', job);
    job.start();
    this.logger.log(`Daily digest cron scheduled at ${cronTime}`);
  }

  async generateDailyDigests(): Promise<void> {
    this.logger.log('Starting daily digest generation...');

    const now = new Date();
    const startOfYesterday = new Date(now);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);
    const endOfYesterday = new Date(startOfYesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const recordings = await this.recordingsRepo.find({
      where: { createdAt: Between(startOfYesterday, endOfYesterday) },
    });

    if (recordings.length === 0) {
      this.logger.log('No recordings found for yesterday, skipping.');
      return;
    }

    const byUser = new Map<string, Recording[]>();
    for (const rec of recordings) {
      if (!byUser.has(rec.userId)) byUser.set(rec.userId, []);
      byUser.get(rec.userId)!.push(rec);
    }

    const dateStr = startOfYesterday.toISOString().split('T')[0];
    const dayName = DAY_NAMES[startOfYesterday.getDay()];

    for (const [userId, userRecordings] of byUser) {
      const existing = await this.digestsRepo.findOne({
        where: { userId, date: dateStr },
      });
      if (existing) continue;

      const transcripts = userRecordings
        .map((r) => r.transcript)
        .filter(Boolean);
      if (transcripts.length === 0) continue;

      try {
        const { summary, todos } =
          await this.openaiService.generateDailyDigest(transcripts);
        const digest = this.digestsRepo.create({
          userId,
          date: dateStr,
          dayName,
          summary,
          todos,
          recordingIds: userRecordings.map((r) => r.id),
        });
        await this.digestsRepo.save(digest);
        this.logger.log(`Generated digest for user ${userId} on ${dateStr}`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `Failed to generate digest for user ${userId}: ${message}`,
        );
      }
    }
  }

  async findAllByUser(userId: string): Promise<Digest[]> {
    return this.digestsRepo.find({
      where: { userId },
      order: { date: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Digest> {
    const digest = await this.digestsRepo.findOne({ where: { id, userId } });
    if (!digest) throw new NotFoundException('Přehled nenalezen.');
    return digest;
  }
}
