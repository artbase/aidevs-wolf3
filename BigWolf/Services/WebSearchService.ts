import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export class WebSearchService {
    /**
     * Scrapes content from a given URL
     * @param url The URL to scrape
     * @returns Promise containing the scraped text content
     */
    async scrapePage(url: string): Promise<string> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const html = await response.text();
            const $ = cheerio.load(html);
            const content = $('body').text();
            return content.trim();
        } catch (error) {
            console.error(`Error scraping ${url}:`, error);
            throw error;
        }
    }

    /**
     * Extracts question from the specified section of a webpage
     * @param url The URL to scrape
     * @returns Promise containing the extracted question
     */
    async getQuestionFromSection(url: string): Promise<string> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const html = await response.text();
            const $ = cheerio.load(html);
            const question = $('#human-question').text();
            if (!question) {
                throw new Error('Question section not found on page');
            }
            return question.trim();
        } catch (error) {
            console.error(`Error extracting question from ${url}:`, error);
            throw error;
        }
    }
}
