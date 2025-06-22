import { WebService } from '../Services/WebService';
import { OpenAIService } from '../Services/OpenAIService';
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

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
                ...item,
                originalAnswer: item.answer
            };

            // Handle math answer correction
            if (calculatedAnswer !== item.answer) {
                result.answer = calculatedAnswer;
                result.wasFixed = true;
            }

            // Handle test questions if present
            if (item.test && item.test.q && item.test.a === "???") {
                const aiAnswer = await getAIAnswer(openAIService, item.test.q);
                result.test = {
                    ...item.test,
                    a: aiAnswer,
                    wasAnswered: true
                };
            }

            return result;
        }));

        const incorrectMathAnswers = correctedAnswers.filter(item => item.wasFixed);
        const answeredTests = correctedAnswers.filter(item => item.test?.wasAnswered);
        
        console.log('Found and corrected these math answers:', incorrectMathAnswers);
        console.log('Number of math corrections made:', incorrectMathAnswers.length);
        
        console.log('\nAnswered these test questions:', answeredTests.map(item => ({
            question: item.test.q,
            answer: item.test.a
        })));
        console.log('Number of test questions answered:', answeredTests.length);
        
    } catch (error) {
        console.error('Error occurred:', error);
        process.exit(1);
    }
}

// Run the application
main().catch(console.error);
