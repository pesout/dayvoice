import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as fs from 'fs';

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);
  private client: OpenAI;
  private whisperModel: string;
  private gptModel: string;

  constructor(private configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    this.whisperModel = this.configService.get<string>(
      'WHISPER_MODEL',
      'whisper-1',
    );
    this.gptModel = this.configService.get<string>('GPT_MODEL', 'gpt-4o');
  }

  async transcribe(filePath: string): Promise<string> {
    const file = fs.createReadStream(filePath);
    const response = await this.client.audio.transcriptions.create({
      model: this.whisperModel,
      file,
      language: 'cs',
    });
    return response.text;
  }

  async generateSummary(
    transcript: string,
  ): Promise<{ summary: string; todos: { id: string; text: string }[] }> {
    const response = await this.client.chat.completions.create({
      model: this.gptModel,
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

    try {
      const content = response.choices[0].message.content || '{}';
      const parsed = JSON.parse(content);
      return {
        summary:
          parsed.summary ||
          'Z nahrávky se nepodařilo rozpoznat žádný smysluplný obsah.',
        todos: Array.isArray(parsed.todos) ? parsed.todos : [],
      };
    } catch {
      this.logger.error('Failed to parse GPT response');
      return { summary: 'Zpracování se nezdařilo.', todos: [] };
    }
  }

  async generateDailyDigest(
    transcripts: string[],
  ): Promise<{ summary: string; todos: { id: string; text: string }[] }> {
    const combined = transcripts
      .map((t, i) => `Nahrávka ${i + 1}:\n${t}`)
      .join('\n\n---\n\n');

    const response = await this.client.chat.completions.create({
      model: this.gptModel,
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

    try {
      const content = response.choices[0].message.content || '{}';
      const parsed = JSON.parse(content);
      return {
        summary: parsed.summary || '',
        todos: Array.isArray(parsed.todos) ? parsed.todos : [],
      };
    } catch {
      this.logger.error('Failed to parse GPT daily digest response');
      return {
        summary: 'Zpracování denního přehledu se nezdařilo.',
        todos: [],
      };
    }
  }
}
