import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  Body,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecordingsService } from './recordings.service';
import { Recording } from '../entities/recording.entity';

@Controller('recordings')
export class RecordingsController {
  constructor(private recordingsService: RecordingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('audio'))
  async create(
    @Request() req: { user: { id: string } },
    @UploadedFile() audio: Express.Multer.File,
    @Body('durationSeconds') durationSeconds: string,
  ) {
    const recording = await this.recordingsService.create(
      req.user.id,
      audio,
      parseInt(durationSeconds, 10) || 0,
    );
    return this.formatRecording(recording);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req: { user: { id: string } }) {
    const recordings = await this.recordingsService.findAllByUser(req.user.id);
    return recordings.map((r) => this.formatRecording(r));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    const recording = await this.recordingsService.findOne(id, req.user.id);
    return this.formatRecording(recording);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    await this.recordingsService.remove(id, req.user.id);
  }

  @Get(':id/audio')
  async streamAudio(@Param('id') id: string, @Res() res: Response) {
    const audioPath = await this.recordingsService.getAudioPath(id);
    if (!fs.existsSync(audioPath)) {
      res.status(404).json({ message: 'Audio soubor nenalezen.' });
      return;
    }
    res.setHeader('Content-Type', 'audio/webm');
    fs.createReadStream(audioPath).pipe(res);
  }

  private formatRecording(recording: Recording) {
    return {
      id: recording.id,
      createdAt: recording.createdAt,
      durationSeconds: recording.durationSeconds,
      audioUrl: `/api/recordings/${recording.id}/audio`,
      transcript: recording.transcript,
      summary: recording.summary,
      todos: recording.todos,
    };
  }
}
