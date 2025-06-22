import { WebService } from '../Services/WebService';

async function main(): Promise<void> {
    const webService = new WebService();
    
    try {
        const url = process.env.JSON_URL || '';
        if (!url) {
            throw new Error('JSON_URL environment variable is not set');
        }

        const jsonContent = await webService.fetchPageContent(url);
        console.log('Downloaded JSON content:', jsonContent);
        
    } catch (error) {
        console.error('Error occurred:', error);
        process.exit(1);
    }
}

// Run the application
main().catch(console.error);
