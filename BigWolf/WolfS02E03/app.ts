import { AiDevsService } from '../Services/AiDevsService';
import OpenAI from "openai";

const aiDevsService = new AiDevsService();
const openai = new OpenAI();

async function generateImage(): Promise<void> {
    console.debug("Starting of program");

    let message = await aiDevsService.GetMessage();

    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Generate image of robot base on the description. Description: ${message.description}`,
        n: 1,
        size: "1024x1024",
    });

    console.debug(response.data[0].url);

    aiDevsService.SendAnswer(response.data[0].url, 'robotid');
}

await generateImage();