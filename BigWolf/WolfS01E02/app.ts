import fetch from 'node-fetch';
import { OpenAIService } from '../Services/OpenAIService';

let currentMsgId = 0;
const openAIService = new OpenAIService();
let currentQuestion = "";

async function processQuestion(question: string): Promise<string> {
    try {
        const year = await openAIService.getYearAnswer(question);
        return year.toString();
    } catch (error) {
        console.error("Error processing question:", error);
        throw error;
    }
}

async function sendJson(): Promise<void> {
    const data = {
        text: currentMsgId === 0 ? "READY" : await processQuestion(currentQuestion),
        msgID: currentMsgId
    };

    const response = await fetch('https://xyz.ag3nts.org/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log("Response message:", responseData);
    
    // Update msgID and question for next iteration
    if (responseData.msgID !== undefined) {
        currentMsgId = responseData.msgID;
    }
    if (responseData.text) {
        // Stop if we receive "ALARM!"
        if (responseData.text === "ALARM!") {
            console.log("Received ALARM! signal - stopping execution");
            return;
        }
        currentQuestion = responseData.text;
        // If there's more to process, call sendJson again
        await sendJson();
    }
}

async function main(): Promise<void> {
    await sendJson();
}

main().catch(error => {
    console.error("An error occurred:", error);
});
