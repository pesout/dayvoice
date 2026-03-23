import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { OpenaiLlmService } from './providers/openai-llm.service';

@Module({
  providers: [{ provide: LlmService, useClass: OpenaiLlmService }],
  exports: [LlmService],
})
export class LlmModule {}
