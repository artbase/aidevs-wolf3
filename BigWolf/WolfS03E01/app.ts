import dotenv from 'dotenv';
dotenv.config();

import { join } from 'path';
import fs from 'fs';
import { readFile } from 'fs/promises';
import type { ChatCompletion, ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { OpenAIService } from "./OpenAIService";
const openaiService = new OpenAIService();

class WolfS03E01Static {
    static MainFolderWithData = "pliki_z_fabryki";
    static FolderWithFacts = "facts";
}

// main function to orchestrate the process
async function main() {
  try {
    console.log("Current directory: ", __dirname);
    const factsFiles = fs.readdirSync(join(__dirname, WolfS03E01Static.MainFolderWithData, WolfS03E01Static.FolderWithFacts)).filter(file => file.endsWith('.txt'));
    const factsTags = [];
    for (const file of factsFiles) {
        const content = await readFile(join(__dirname,WolfS03E01Static.MainFolderWithData, WolfS03E01Static.FolderWithFacts, file), 'utf-8');
        if (!content.includes('entry deleted')) {
            const extractedTags = await extractTagsOnlyWithNames(content);
            factsTags.push({
                [file]: extractedTags
            });
        }
    }
    console.debug("List of fact tags",  factsTags);
    
    // read content of files with reports for tagging
    const directoryPath = join(__dirname, WolfS03E01Static.MainFolderWithData);
    const files = fs.readdirSync(directoryPath).filter(file => file.endsWith('.txt'));

    const reportsTags = Object.create(null);
    for (const file of files) {
        const sourceContent = await readFile(join(directoryPath, file), 'utf-8');
        const extractedTags = await extractTagsOnlyWithNames(sourceContent);
        // find matches between factsTags and reportsTags
        const matches = findMatches(factsTags, extractedTags);
        const tags = await extractTags(file, sourceContent, matches);
        reportsTags[file] = tags || []; // Ensure tags is an array to avoid potential issues
    }

    console.debug("List of reports tags", reportsTags);
    
    const requestMsg = { 
      "answer" : reportsTags,
      "apikey" : process.env.AIDEVS_API_KEY,
      "task" : "dokumenty"
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
    const data = await response.json();
    console.log('Data received from centrala.ag3nts.org:', data);
    
    console.log('Process completed successfully.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

async function extractTagsOnlyWithNames(fileContent: string): Promise<string> {
  const userMessage: ChatCompletionMessageParam = {
    role: 'user',
    content: [{
      type: "text",
      text: `<document>${fileContent}</document>
      Please create a list tags base on content of the document.
      Ensure the list items are unique and include only first name and surname. 
      Respond only with the concise content and nothing else. 
      The tag has to be nominative.
      The list has to be in one line separated by commas.
      Give me maximum 3 tags`
    }]
  };

  const response = await openaiService.completion([userMessage], 'o1-mini', false) as ChatCompletion;
  const content = response.choices[0].message.content || '';

  return content;
}

async function extractTags(sourceName: string, fileContent: string, listOfMatches: string[]): Promise<string> {
  let factsContent = '';
  for (const filename of listOfMatches) {
    const content = await readFile(join(__dirname,"pliki_z_fabryki", "facts", filename), "utf-8");
    factsContent += content + ',';
  }

  const userMessage: ChatCompletionMessageParam = {
    role: 'user',
    content: [{
      type: "text",
      text: `
      <source>${sourceName}</source>
      <document>${fileContent}</document>
      <facts>${factsContent}</facts>
      Please create a list tags base on content of the document.
      Ensure the list tags are unique. 
      Respond only with the concise content and nothing else. 
      The tag has to be nominative in original language.
      The list has to be in one line separated by commas.
      Tags have to include first name and surname of the person. Occupation of the person is optional. Sector name from source.`
    }]
  };

  const response = await openaiService.completion([userMessage], 'o1-mini', false) as ChatCompletion;
  const content = response.choices[0].message.content || '';

  return content;
}

function findMatches(factsTags: { [x: string]: string; }[], reportTags: string) {
  let listOfMatches = [];
  // check if any tag from reportsTags is in factsTags
    for (const factTag of factsTags) {
      // check if factsTags cointains the same tag as reportTag, but the tags are in one line separated by commas 
      const reportTagsArray = reportTags.split(',').map(t => t.trim()); // Accessing the string value
      const factTagsArray = Object.values(factTag).flatMap(tag => tag.split(',').map(t => t.trim())); // Accessing the string value
      if (factTagsArray.some(tag => reportTagsArray.includes(tag))) {
        const key = Object.keys(factTag)[0]; // Get the key from the factTag
        listOfMatches.push(key);
      }
  }
  return listOfMatches;
}

main();