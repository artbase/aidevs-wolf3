import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import type { ChatCompletion, ChatCompletionContentPartImage, ChatCompletionContentPartText, ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { OpenAIService } from "../Services/OpenAIService";

const openAIService = new OpenAIService();

async function processMaps(files: string[], description: string): Promise<{ response: string }> {
    const mapFolder = join(__dirname, 'images');
    const messages: ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: `As a system you try to recognize what city it is.            
            </additionalInfo>${description}</additionalInfo>`
        },
        {
            role: "user",
            content: await Promise.all(files.map(async (img) => {
                const filePath = join(mapFolder, img);
                const fileData = await readFile(filePath);
                const base64Image = fileData.toString('base64');

                return [
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:image/png;base64,${base64Image}`,
                            detail: "high"
                        }
                    } as ChatCompletionContentPartImage,
                    {
                        type: "text",
                        text: "What city is it?"
                    } as ChatCompletionContentPartText,
                ];
            })).then(results => results.flat())
        }
    ];

    const chatCompletion = await openAIService.completion(messages, "gpt-4o", false, false, 1024) as ChatCompletion;
    
    return {
        response: chatCompletion.choices[0].message.content || ''
    };
}

async function processMapsAndRecognizeCity(): Promise<void> {
    console.debug("Starting of program");
    const mapFolder = join(__dirname, 'images');
    const files = await readdir(mapFolder);
    const jpgFiles = files.filter(file => file.endsWith('.jpg'));

    const mapDescription = `You have a list of map. 3 of them are one city. Please recognize which element does not fit to the rest. Base on the rest of city mark what city is it. The city has 3 garners.`;

    const results = await processMaps(jpgFiles, mapDescription);

    console.log(results);
}

await processMapsAndRecognizeCity();