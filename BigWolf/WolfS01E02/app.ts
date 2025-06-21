import fetch from 'node-fetch';
import { OpenAIService } from '../Services/OpenAIService';
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

let currentMsgId = 0;
const openAIService = new OpenAIService();
let currentQuestion = "";
const systemMessage = "You are a helpful assistant that specializes in identifying years from historical questions. Always respond with just the year number, nothing else.";

async function processQuestion(question: string): Promise<string> {
    try {
        const messages: ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: systemMessage
            },
            {
                role: 'user',
                content: question
            }
        ];

        const response = await openAIService.completion(
            messages,
            'gpt-4',
            false,
            false,
            10
        );

        const answer = response.choices[0].message.content.trim();
        return answer;
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

    // Log outgoing message
    console.log("\n=== SENDING MESSAGE ===");
    console.log("Message ID:", data.msgID);
    console.log("Text:", data.text);
    console.log("=====================\n");

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
    
    // Log incoming message
    console.log("\n=== RECEIVED MESSAGE ===");
    console.log("Response data:", responseData);
    console.log("======================\n");
    
    // Update msgID and question for next iteration
    if (responseData.msgID !== undefined) {
        currentMsgId = responseData.msgID;
    }
    if (responseData.text) {
        // Stop if we receive "ALARM!"
        if (responseData.text.includes("ALARM!")) {
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
