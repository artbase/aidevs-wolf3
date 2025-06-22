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
        const incorrectAnswers = jsonData['test-data'].filter(item => {
            // Safely evaluate the mathematical expression
            const calculatedAnswer = eval(item.question);
            return calculatedAnswer !== item.answer;
        });

        console.log('Incorrect answers:', incorrectAnswers);
        console.log('Number of incorrect answers:', incorrectAnswers.length);
        
    } catch (error) {
        console.error('Error occurred:', error);
        process.exit(1);
    }
}

// Run the application
main().catch(console.error);
