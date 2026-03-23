export interface SummaryResult {
  summary: string;
  todos: { id: string; text: string }[];
}

export abstract class LlmService {
  abstract transcribe(filePath: string): Promise<string>;

  abstract generateSummary(transcript: string): Promise<SummaryResult>;

  abstract generateDailyDigest(transcripts: string[]): Promise<SummaryResult>;
}
