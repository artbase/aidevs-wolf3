import OpenAI, { toFile } from "openai";
import Groq from "groq-sdk";


export class GroqService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }

  async transcribe(audioBuffer: Buffer): Promise<string> {
    const transcription = await this.groq.audio.transcriptions.create({
      file: await toFile(audioBuffer, 'speech.mp3'),
      language: 'pl',
      model: 'whisper-large-v3',
    });
    return transcription.text;
  }
}