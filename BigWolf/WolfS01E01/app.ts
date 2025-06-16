import { WebSearchService } from '../Services/WebSearchService';

/**
 * Main application entry point
 */
async function main(): Promise<void> {
    const webSearchService = new WebSearchService();
    try {
        const content = await webSearchService.scrapePage('https://example.com');
        console.log('Scraped content:', content);
    } catch (error) {
        console.error('Failed to scrape page:', error);
    }
}

// Execute the main function
main().catch(error => console.error('Application error:', error));
