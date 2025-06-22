import { WebService } from '../Services/WebService';
import { OpenAIService } from '../Services/OpenAIService';
import { AiDevsService } from '../Services/AiDevsService';
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import dotenv from 'dotenv';

dotenv.config();

async function getAIAnswer(openAIService: OpenAIService, question: string): Promise<string> {
    const messages: ChatCompletionMessageParam[] = [
        {
            role: 'system',
            content: 'You are a helpful assistant. Please provide concise, accurate answers to historical and factual questions.'
        },
        {
            role: 'user',
            content: question
        }
    ];

    const response = await openAIService.completion(messages);
    return response.choices[0].message.content.trim();
}

async function main(): Promise<void> {
    const webService = new WebService();
    const openAIService = new OpenAIService();
    const aiDevsService = new AiDevsService();
    
    try {
        const url = process.env.JSON_URL_S01E03 || '';
        if (!url) {
            throw new Error('JSON_URL_S01E03 environment variable is not set');
        }

        const jsonContent = await webService.fetchPageContent(url);
        const jsonData = JSON.parse(jsonContent);
        
        const correctedAnswers = await Promise.all(jsonData['test-data'].map(async item => {
            const calculatedAnswer = eval(item.question);
            const result = {
                ...item
            };

            // Handle math answer correction
            if (calculatedAnswer !== item.answer) {
                result.answer = calculatedAnswer;
            }

            // Handle test questions if present
            if (item.test && item.test.q && item.test.a === "???") {
                const aiAnswer = await getAIAnswer(openAIService, item.test.q);
                result.test = {
                    ...item.test,
                    a: aiAnswer,
                };
                console.log('AI answer:', aiAnswer);
            }

            return result;
        }));

        const finalJSON = {
            ...jsonData,
            'test-data': correctedAnswers,
            'apikey': process.env.AIDEVS_API_KEY
        };
        // Send the answer to AiDevs
        await aiDevsService.SendAnswerWithObject(finalJSON, 'JSON');
        
    } catch (error) {
        console.error('Error occurred:', error);
        process.exit(1);
    }
}

// Run the application
main().catch(console.error);
