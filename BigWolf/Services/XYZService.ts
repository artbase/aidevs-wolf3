import fetch from 'node-fetch';

export class XYZService {
  async sendForm(username: string, password: string, answer: string): Promise<string> {
    try {
      const url = 'https://xyz.ag3nts.org/';
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('answer', answer);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseBody = await response.text();
      return responseBody;
    } catch (error) {
      console.error('Error sending form:', error);
      throw error;
    }
  }
}
