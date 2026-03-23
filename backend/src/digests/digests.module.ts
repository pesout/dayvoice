import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Digest } from '../entities/digest.entity';
import { Recording } from '../entities/recording.entity';
import { DigestsController } from './digests.controller';
import { DigestsService } from './digests.service';
import { LlmModule } from '../llm/llm.module';

@Module({
  imports: [TypeOrmModule.forFeature([Digest, Recording]), LlmModule],
  controllers: [DigestsController],
  providers: [DigestsService],
})
export class DigestsModule {}
