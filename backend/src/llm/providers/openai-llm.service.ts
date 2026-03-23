import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as fs from 'fs';
import { LlmService, SummaryResult } from '../llm.service';

@Injectable()
export class OpenaiLlmService extends LlmService {
  private readonly logger = new Logger(OpenaiLlmService.name);
  private client: OpenAI;
  private whisperModel: string;
  private gptModel: string;
  private temperature: number;
  private maxTokens: number;

  constructor(private configService: ConfigService) {
    super();
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    this.whisperModel = this.configService.get<string>(
      'WHISPER_MODEL',
      'whisper-1',
    );
    this.gptModel = this.configService.get<string>('GPT_MODEL', 'gpt-4o');
    this.temperature = Number(
      this.configService.get<string>('LLM_TEMPERATURE', '0.3'),
    );
    this.maxTokens = Number(
      this.configService.get<string>('LLM_MAX_TOKENS', '1024'),
    );
  }

  async transcribe(filePath: string): Promise<string> {
    try {
      const file = fs.createReadStream(filePath);
      const response = await this.client.audio.transcriptions.create({
        model: this.whisperModel,
        file,
        language: 'cs',
      });
      return response.text;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Transcription failed: ${message}`);
      throw new Error(`Transcription failed: ${message}`);
    }
  }

  async generateSummary(transcript: string): Promise<SummaryResult> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.gptModel,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Jsi asistent pro zpracování hlasových poznámek v češtině. Z přepisu hlasové poznámky vytvoř:
1. Strukturované shrnutí (stručné, srozumitelné body)
2. Seznam úkolů/TODO položek (pokud v textu zazněly)

Pokud přepis neobsahuje smysluplný obsah, napiš to do shrnutí.

Odpověz POUZE platným JSON objektem v tomto formátu:
{
  "summary": "Shrnutí v bodech oddělených tečkou nebo pomlčkou",
  "todos": [
    { "id": "todo-1", "text": "Popis úkolu" }
  ]
}

Pokud nejsou žádné úkoly, vrať prázdné pole todos. Každé todo musí mít unikátní id ve formátu "todo-X".`,
          },
          { role: 'user', content: transcript || '(prázdný přepis)' },
        ],
      });

      return this.parseSummaryResponse(response.choices[0].message.content);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Summary generation failed: ${message}`);
      throw new Error(`Summary generation failed: ${message}`);
    }
  }

  async generateDailyDigest(transcripts: string[]): Promise<SummaryResult> {
    const combined = transcripts
      .map((t, i) => `Nahrávka ${i + 1}:\n${t}`)
      .join('\n\n---\n\n');

    try {
      const response = await this.client.chat.completions.create({
        model: this.gptModel,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Jsi asistent pro vytváření denních přehledů z hlasových poznámek v češtině. Z přepisů všech nahrávek za den vytvoř:
1. Souhrnné shrnutí celého dne (klíčové body, témata, rozhodnutí)
2. Souhrnný seznam všech úkolů/TODO ze všech nahrávek

Odpověz POUZE platným JSON objektem:
{
  "summary": "Shrnutí dne ve strukturovaném formátu s odrážkami (• bod)",
  "todos": [
    { "id": "dtodo-1", "text": "Popis úkolu" }
  ]
}

Každé todo musí mít unikátní id ve formátu "dtodo-X".`,
          },
          { role: 'user', content: combined },
        ],
      });

      return this.parseSummaryResponse(response.choices[0].message.content);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Daily digest generation failed: ${message}`);
      throw new Error(`Daily digest generation failed: ${message}`);
    }
  }

  private parseSummaryResponse(content: string | null): SummaryResult {
    try {
      const parsed = JSON.parse(content || '{}');
      return {
        summary:
          parsed.summary ||
          'Z nahrávky se nepodařilo rozpoznat žádný smysluplný obsah.',
        todos: Array.isArray(parsed.todos) ? parsed.todos : [],
      };
    } catch {
      this.logger.error('Failed to parse LLM JSON response');
      return { summary: 'Zpracování se nezdařilo.', todos: [] };
    }
  }
}
