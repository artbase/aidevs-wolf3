import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export class WebService {
  async fetchPageContent(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const html = await response.text();
      return html.trim();
    } catch (error) {
      console.error(`Error fetching content from ${url}:`, error);
      throw error;
    }
  }

  async getContentFromSection(url: string, selector: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const html = await response.text();
      const $ = cheerio.load(html);
      const content = $(selector).text();
      if (!content) {
        throw new Error(`Content not found for selector: ${selector}`);
      }
      return content.trim();
    } catch (error) {
      console.error(`Error extracting content from ${url}:`, error);
      throw error;
    }
  }

  async submitForm(url: string, formData: Record<string, string>): Promise<string> {
    try {
      const formParams = new URLSearchParams(formData);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formParams.toString(),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const responseBody = await response.text();
      return responseBody;
    } catch (error) {
      console.error(`Error submitting form to ${url}:`, error);
      throw error;
    }
  }
}
