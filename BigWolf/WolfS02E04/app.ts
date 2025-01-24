import dotenv from 'dotenv';
dotenv.config();
import { join } from 'path';
import fs from 'fs';
import { readdir, readFile } from 'fs/promises';
import { StorageService } from "../Services/StorageService";
import { GroqService } from '../Services/GroqService';
import type { ChatCompletion, ChatCompletionContentPartImage, ChatCompletionContentPartText, ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { OpenAIService } from "../Services/OpenAIService";
import { answerBasedOnFilesPrompt }  from "../Services/PromptService";
import { AiDevsService }  from "../Services/AiDevsService";

async function processFiles(files: string[]): Promise<{ response: string }> {
    var storageService = new StorageService();
    let listOfTextFiles = await storageService.getFiles(join(__dirname, 'pliki_z_fabryki'), '.txt');
    let listOfImageFiles = await storageService.getFiles(join(__dirname, 'pliki_z_fabryki'), '.png');
    let listOfAudioFiles = await storageService.getFiles(join(__dirname, 'pliki_z_fabryki'), '.mp3');
    //listOfImageFiles = listOfImageFiles.slice(0, 1); // Only keep the first image file
    //listOfAudioFiles = listOfAudioFiles.slice(0, 1); // Only keep the first audio file
    //listOfTextFiles = listOfTextFiles.slice(0, 1); // Only keep the first text file

    // 1. Creating transcriptions of audio files
    console.debug(listOfAudioFiles);
    const groqService = new GroqService();
    const transcriptionPromises = listOfAudioFiles.map(async (path) => {
        const audioFileBuffer = fs.readFileSync(join(__dirname, 'pliki_z_fabryki',path));
        const transcription = await groqService.transcribe(audioFileBuffer);
        return {
            textFileName: path.split('/').pop() || 'unknown',
            content: transcription
        };
    });

    const transcriptionAudio = await Promise.all(transcriptionPromises);
    console.debug(transcriptionAudio);
    // 2. Creating transcriptions of image files
    console.debug(listOfImageFiles);
    const openAIService = new OpenAIService();
    const transcriptionImagesPromises = listOfImageFiles.map(async (img) => {
        const filePath = join(__dirname, 'pliki_z_fabryki', img);
        const fileData = await readFile(filePath);
        const base64Image = fileData.toString('base64');

        const messages: ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: `As a system you try to recognize text from image. Put plain text in orginal words and name of file.`
            },
            {
                role: "user",
                content: [
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:image/png;base64,${base64Image}`,
                            detail: "high"
                        }
                    } as ChatCompletionContentPartImage
                ]
            }
        ];

        const chatCompletion = await openAIService.completion(messages, "gpt-4o", false, false, 1024) as ChatCompletion;
        return {
            'textFileName': img,
            'content': chatCompletion.choices[0].message.content
        };
    })
    const transcriptionImages = await Promise.all(transcriptionImagesPromises).then(results => results.flat());
    console.debug(transcriptionImages);
    // 3. Creating transcriptions of text files
    console.debug(listOfTextFiles);
    const transcriptionTextPromises = listOfTextFiles.map(async (file) => {
        const filePath = join(__dirname, 'pliki_z_fabryki', file);
        const fileData = await readFile(filePath, 'utf-8');
        return {
            'textFileName': file,
            'content': fileData
        };
    });
    const transcriptionTexts = await Promise.all(transcriptionTextPromises);
    console.debug(transcriptionTexts);
    // 4. Prepare result
    var dataKnowledge = [...transcriptionImages, ...transcriptionTexts, ...transcriptionAudio];
    console.debug(answerBasedOnFilesPrompt(dataKnowledge));
    const allMessages: ChatCompletionMessageParam[] = [
        { role: 'system', content: answerBasedOnFilesPrompt(dataKnowledge) },
        { role: 'user', content: 'Please only get for us notes containing information about captured people or traces of their presence and about fixed hardware faults (ignore those related to software)' }
    ];

    const openaiService = new OpenAIService();
    const completionFromExternalKnowledge = await openaiService.completion(allMessages, "gpt-4o", false);
    let informationWithResult = completionFromExternalKnowledge.choices[0].message.content;
    console.debug(informationWithResult);
    // example answer what I got
    //'{"people": ["2024-11-12_report-00-sektor_C4.txt","2024-11-12_report-07-sektor_C4.txt","2024-11-12_report-10-sektor-C1.mp3"],"hardware": ["2024-11-12_report-13.png","2024-11-12_report-15.png","2024-11-12_report-17.png"]}'
    informationWithResult = JSON.parse(informationWithResult);
    console.debug(informationWithResult);
    
    // 5. Send answer to centrala
    let aiDevsService = new AiDevsService();
    aiDevsService.SendAnswer(informationWithResult, 'kategorie');
}

await processFiles();