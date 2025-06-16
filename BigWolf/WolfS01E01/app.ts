import { WebSearchService } from '../Services/WebSearchService';

/**
 * Main application entry point
 */
async function main(): Promise<void> {
    const webSearchService = new WebSearchService();
    try {
        const question = await webSearchService.getQuestionFromSection('https://xyz.ag3nts.org');
        console.log('Extracted question:', question);
    } catch (error) {
        console.error('Failed to get question:', error);
    }
}

// Execute the main function
main().catch(error => console.error('Application error:', error));
