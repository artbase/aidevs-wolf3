import dotenv from 'dotenv';
dotenv.config();
import { StorageService } from "../Services/StorageService";
import { join } from 'path';
import { readFile } from 'fs/promises';
import { TextSplitter } from "../Services/TextService";
import { VectorService } from '../Services/VectorService';
import { OpenAIService } from '../Services/OpenAIService';
import { AiDevsService } from '../Services/AiDevsService';

const queries = [ 'Kradziez prototypu broni.'];

const COLLECTION_NAME = "aidevs";
const openai = new OpenAIService();
const vectorService = new VectorService(openai);

async function initializeData() {
    // read list of files
    let storageService = new StorageService();
    let listOfFiles = await storageService.getFiles(join(__dirname, 'pliki_z_fabryki/weapons_tests/do-not-share'), '.txt');
    //console.debug(listOfFiles);

    // read content of files
    const transcriptionTextPromises = listOfFiles.map(async (file) => {
        const filePath = join(__dirname, 'pliki_z_fabryki/weapons_tests/do-not-share', file);
        const fileData = await readFile(filePath, 'utf-8');
        return {
            'textFileName': file,
            'content': fileData
        };
    });
    const transcriptionTexts = await Promise.all(transcriptionTextPromises);
    //console.debug(transcriptionTexts);

    // emebding 
    const textSplitter = new TextSplitter();
    const points = await Promise.all(transcriptionTexts.map(async ({ textFileName, content }) => {
        const doc = await textSplitter.document(content, 'gpt-4', { role: 'embedding-test', fileName: textFileName });
        return doc;
    }));
    //console.debug(points);
    
    await vectorService.initializeCollectionWithData(COLLECTION_NAME, points);
}

async function main() {
    await initializeData();

    const searchResults = await Promise.all(queries.map(query => 
        vectorService.performSearch(COLLECTION_NAME, query, 1)
    ));

    const tableData = queries.map((query, index) => ({
        Query: query,
        Tool: searchResults[index][0]?.payload?.fileName || 'N/A',
        Score: searchResults[index][0]?.score?.toFixed(4) || 'N/A'
    }));

    console.table(tableData);

    let aiDevsService = new AiDevsService();
    const fileName = searchResults[0][0]?.payload?.fileName;
    const formattedFileName = fileName ? fileName.replace(/(\d{4})_(\d{2})_(\d{2})\.txt/, '$1-$2-$3') : 'N/A';
    aiDevsService.SendAnswer(formattedFileName, 'wektory');
}

main().catch(console.error);