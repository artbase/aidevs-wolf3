import { WebSearchService } from '../Services/WebSearchService';
import { OpenAIService } from '../Services/OpenAIService';
import { XYZService } from '../Services/XYZService';
import dotenv from 'dotenv';

dotenv.config();

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
        
        // Send the answer to the form
        const xyzService = new XYZService();
        const response = await xyzService.sendForm('tester', '574e112a', year.toString());
        console.log('Form submission response:', response);
    } catch (error) {
        console.error('Failed to get answer:', error);
    }
}

// Execute the main function
main().catch(error => console.error('Application error:', error));
