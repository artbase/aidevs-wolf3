import { WebService } from '../Services/WebService';

async function main(): Promise<void> {
    const webService = new WebService();
    
    try {
        const url = process.env.JSON_URL_S01E03 || '';
        if (!url) {
            throw new Error('JSON_URL_S01E03 environment variable is not set');
        }

        const jsonContent = await webService.fetchPageContent(url);

        const jsonData = JSON.parse(jsonContent);
        const firstTestData = jsonData['test-data'][0];
        console.log('First test data:', firstTestData);
        
    } catch (error) {
        console.error('Error occurred:', error);
        process.exit(1);
    }
}

// Run the application
main().catch(console.error);
