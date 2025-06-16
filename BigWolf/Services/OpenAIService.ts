import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export class OpenAIService {
  private openai: OpenAI;
  private readonly JINA_API_KEY = process.env.JINA_API_KEY;

  constructor() {
    this.openai = new OpenAI();
  }

  async completion(
    messages: ChatCompletionMessageParam[],
    model: string = "gpt-4",
    stream: boolean = false,
    jsonMode: boolean = false,
    maxTokens: number = 1024
  ): Promise<OpenAI.Chat.Completions.ChatCompletion | AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>> {
    try {
      const chatCompletion = await this.openai.chat.completions.create({
        messages,
        model,
        stream,
        max_tokens: maxTokens,
        response_format: jsonMode ? { type: "json_object" } : { type: "text" }
      });

      if (stream) {
        return chatCompletion as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;
      } else {
        return chatCompletion as OpenAI.Chat.Completions.ChatCompletion;
      }
    } catch (error) {
      console.error("Error in OpenAI completion:", error);
      throw error;
    }
  }

  async getYearAnswer(question: string): Promise<number> {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: 'You are to provide answers that are only a single number representing a year.'
      },
      {
        role: 'user',
        content: question
      }
    ];

    try {
      // Call the existing completion method
      const response = await this.completion(
        messages,
        'gpt-4',
        false,   // stream
        false,   // jsonMode
        10       // maxTokens (set low since the answer is short)
      );

      // Extract the assistant's reply
      const answerText = response.choices[0].message.content.trim();

      // Parse the answer to an integer
      const year = parseInt(answerText, 10);

      // Check if the parsed year is a valid number
      if (isNaN(year)) {
        throw new Error(`The assistant's response is not a valid number: "${answerText}"`);
      }

      return year;
    } catch (error) {
      console.error('Error in getYearAnswer:', error);
      throw error;
    }
  }

  async createJinaEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch('https://api.jina.ai/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.JINA_API_KEY}`
        },
        body: JSON.stringify({
          model: 'jina-embeddings-v3',
          task: 'text-matching',
          dimensions: 1024,
          late_chunking: false,
          embedding_type: 'float',
          input: [text]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error("Error creating Jina embedding:", error);
      throw error;
    }
  }
}
