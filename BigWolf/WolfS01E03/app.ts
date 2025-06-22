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
        
        const correctedAnswers = jsonData['test-data'].map(item => {
            const calculatedAnswer = eval(item.question);
            if (calculatedAnswer !== item.answer) {
                return {
                    ...item,
                    originalAnswer: item.answer,  // keep track of original incorrect answer
                    //answer: calculatedAnswer,     // provide correct answer
                    //wasFixed: true               // flag to indicate this was corrected
                };
            }
            return item;
        });

        const incorrectAnswers = correctedAnswers.filter(item => item.wasFixed);
        
        console.log('Found and corrected these answers:', incorrectAnswers);
        console.log('Number of corrections made:', incorrectAnswers.length);
        
    } catch (error) {
        console.error('Error occurred:', error);
        process.exit(1);
    }
}

// Run the application
main().catch(console.error);
