import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { Recording } from '../entities/recording.entity';
import { OpenaiService } from '../openai/openai.service';

@Injectable()
export class RecordingsService {
  private readonly logger = new Logger(RecordingsService.name);
  private uploadDir: string;

  constructor(
    @InjectRepository(Recording)
    private recordingsRepo: Repository<Recording>,
    private configService: ConfigService,
    private openaiService: OpenaiService,
  ) {
    this.uploadDir = this.configService.get<string>(
      'UPLOAD_DIR',
      './uploads',
    );
  }

  async create(
    userId: string,
    audioFile: Express.Multer.File,
    durationSeconds: number,
  ): Promise<Recording> {
    const userDir = path.join(this.uploadDir, userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    const fileName = `${Date.now()}.webm`;
    const filePath = path.join(userDir, fileName);
    fs.writeFileSync(filePath, audioFile.buffer);

    let transcript = '';
    let summary = 'Zpracování se nezdařilo.';
    let todos: { id: string; text: string }[] = [];

    try {
      transcript = await this.openaiService.transcribe(filePath);
      const result = await this.openaiService.generateSummary(transcript);
      summary = result.summary;
      todos = result.todos;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to process recording: ${message}`);
    }

    const recording = this.recordingsRepo.create({
      userId,
      audioPath: filePath,
      transcript,
      summary,
      todos,
      durationSeconds,
    });
    return this.recordingsRepo.save(recording);
  }

  async findAllByUser(userId: string): Promise<Recording[]> {
    return this.recordingsRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Recording> {
    const recording = await this.recordingsRepo.findOne({
      where: { id, userId },
    });
    if (!recording) throw new NotFoundException('Nahrávka nenalezena.');
    return recording;
  }

  async remove(id: string, userId: string): Promise<void> {
    const recording = await this.findOne(id, userId);
    if (fs.existsSync(recording.audioPath)) {
      fs.unlinkSync(recording.audioPath);
    }
    await this.recordingsRepo.remove(recording);
  }

  async getAudioPath(id: string): Promise<string> {
    const recording = await this.recordingsRepo.findOne({ where: { id } });
    if (!recording) throw new NotFoundException('Nahrávka nenalezena.');
    return recording.audioPath;
  }

  async findByUserAndDateRange(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<Recording[]> {
    return this.recordingsRepo.find({
      where: {
        userId,
        createdAt: Between(start, end),
      },
      order: { createdAt: 'ASC' },
    });
  }
}
