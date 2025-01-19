import dotenv from 'dotenv';
dotenv.config();
import { GroqService } from '../Services/GroqService';
import fs from 'fs';
import { answerBasedOnAudioFilesPrompt } from '../Services/PromptService';
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { OpenAIService } from '../Services/OpenAIService';

async function main() {
    // 1. Creating transcription
    const audioFilePaths = [
        'WolfS02E01/przesluchania/adam.m4a',
        'WolfS02E01/przesluchania/agnieszka.m4a',
        'WolfS02E01/przesluchania/ardian.m4a',
        'WolfS02E01/przesluchania/michal.m4a',
        'WolfS02E01/przesluchania/monika.m4a',
        'WolfS02E01/przesluchania/rafal.m4a'
    ];

    const groqService = new GroqService();

    const transcriptionPromises = audioFilePaths.map(async (path) => {
        const audioFileBuffer = fs.readFileSync(path);
        const transcription = await groqService.transcribe(audioFileBuffer);
        return {
            audioFileName: path.split('/').pop() || 'unknown',
            content: transcription
        };
    });

    const transcriptions = await Promise.all(transcriptionPromises);
    console.debug(transcriptions);

    // Getting information from transcription
    const promptWithAdditionalKonwledge = answerBasedOnAudioFilesPrompt(transcriptions);
    console.debug(promptWithAdditionalKonwledge);

    const messages: ChatCompletionMessageParam[] = [
        { role: 'user', content: 'In which place Andrzej Maj works? Give me only a name of a place with name of university and city. I do not need any more information.' },
    ];
    const allMessages: ChatCompletionMessageParam[] = [
        { role: 'system', content: promptWithAdditionalKonwledge },
        ...messages as ChatCompletionMessageParam[]
    ];

    const openaiService = new OpenAIService();
    const completionFromExternalKnowledge = await openaiService.completion(allMessages, "gpt-4o", false);
    const informationAboutPlaceOfCompany = completionFromExternalKnowledge.choices[0].message.content
    console.debug(informationAboutPlaceOfCompany);

    // Getting information from model gpt-4o
    const completionFromModel = await openaiService.completion(
        [
            { role: 'user', content: 'What is address of ' +  informationAboutPlaceOfCompany + '. Give me only the name and specific address of building.'},
        ]
        , "gpt-4o", false);

    const addressBuildingOfCompany = completionFromModel.choices[0].message.content
    console.debug(addressBuildingOfCompany);

    // Sending answer to central of agents
    const requestMsg = {
        "answer": addressBuildingOfCompany,
        "apikey": process.env.AIDEVS_API_KEY,
        "task": "mp3"
    };
    const response = await fetch(process.env.AIDEVS_CENTRAL_REPORT_URL || "", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestMsg)
    });
    if (!response.ok) {
        const responseBody = await response.text();
        console.error(`Response was not ok: ${response.statusText}. Response body: ${responseBody}`);
    }
    else {
        const data = await response.json();
        console.log('Data received from centrala.ag3nts.org:', data);
    }

    console.log('Process completed successfully.');
}

(async () => {
    console.log("Application has started.");
    console.log("Starting the main function...");
    try {
        await main();
        console.log("Main function executed successfully.");
    } catch (error) {
        console.error('Application error:', error);
        process.exit(1);
    }
})();
