import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Digest } from '../entities/digest.entity';
import { Recording } from '../entities/recording.entity';
import { DigestsController } from './digests.controller';
import { DigestsService } from './digests.service';
import { OpenaiModule } from '../openai/openai.module';

@Module({
  imports: [TypeOrmModule.forFeature([Digest, Recording]), OpenaiModule],
  controllers: [DigestsController],
  providers: [DigestsService],
})
export class DigestsModule {}
