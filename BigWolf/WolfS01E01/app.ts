import { WebService } from '../Services/WebService';
import { OpenAIService } from '../Services/OpenAIService';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Main application entry point
 */
async function main(): Promise<void> {
    const webService = new WebService();
    const openAIService = new OpenAIService();
    
    try {
        const question = await webService.getContentFromSection(process.env.XYZ_PAGE, '#human-question');
        console.log('Extracted question:', question);
        
        const year = await openAIService.getYearAnswer(question);
        console.log(`The answer is: ${year}`);

        const formData = {
            username: process.env.XYZ_USERNAME,
            password: process.env.XYZ_PASSWORD,
            answer: year.toString(),
        };
        const page = await webService.submitForm(process.env.XYZ_PAGE, formData);
        console.log('Page:', page);
    } catch (error) {
        console.error('Failed to get answer:', error);
    }
}

// Execute the main function
main().catch(error => console.error('Application error:', error));
