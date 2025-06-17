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
    const xyzService = new XYZService();
    
    try {
        const question = await webSearchService.getQuestionFromSection('https://xyz.ag3nts.org');
        console.log('Extracted question:', question);
        
        const year = await openAIService.getYearAnswer(question);
        console.log(`The answer is: ${year}`);

        const page = await xyzService.sendForm(process.env.XYZ_USERNAME, process.env.XYZ_PASSWORD, year.toString());
        console.log('Page:', page);
    } catch (error) {
        console.error('Failed to get answer:', error);
    }
}

// Execute the main function
main().catch(error => console.error('Application error:', error));
