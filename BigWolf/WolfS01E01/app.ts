import { WebSearchService } from '../Services/WebSearchService';
import { OpenAIService } from '../Services/OpenAIService';

/**
 * Main application entry point
 */
async function main(): Promise<void> {
    const webSearchService = new WebSearchService();
    const openAIService = new OpenAIService();
    try {
        const question = await webSearchService.getQuestionFromSection('https://xyz.ag3nts.org');
        console.log('Extracted question:', question);
        
        const year = await openAIService.getYearAnswer(question);
        console.log(`The answer is: ${year}`);
    } catch (error) {
        console.error('Failed to get answer:', error);
    }
}

// Execute the main function
main().catch(error => console.error('Application error:', error));
