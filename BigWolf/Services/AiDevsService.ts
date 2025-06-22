export class AiDevsService {

  async GetMessage(): Promise<string> {
    const response = await fetch(`https://centrala.ag3nts.org/data/${process.env.AIDEVS_API_KEY}/robotid.json` || "", {
      method: 'GET',
    });
    if (!response.ok) {
      const responseBody = await response.text();
      console.error(`Response was not ok: ${response.statusText}. Response body: ${responseBody}`);
      return responseBody;
    }
    else {
      const data = await response.json();
      console.log('Data received from centrala.ag3nts.org:', data);
      return data;
    }
  }

  async GetMessageApidb(query: string): Promise<{ name: string; content: any }> {
    const requestMsg = {
        "task": 'database',
        "apikey": process.env.AIDEVS_API_KEY,
        "query": query
    };
    const response = await fetch(`https://centrala.ag3nts.org/apidb`, {
      method: 'POST',
      body: JSON.stringify(requestMsg),
    });
    if (!response.ok) {
      const responseBody = await response.text();
      console.error(`Response was not ok: ${response.statusText}. Response body: ${responseBody}`);
      throw new Error(responseBody);
    }
    else {
      const data = { name: query, content: await response.json() };
      console.log('Data received from centrala.ag3nts.org:', data);
      return data; 
    }
  }

  async SendAnswer(answer: string, task: string):  Promise<void> {
    // Sending answer to central of agents
    const requestMsg = {
      "answer": answer,
      "apikey": process.env.AIDEVS_API_KEY,
      "task": task
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
  }

  async SendAnswerWithObject(answer: object, task: string):  Promise<void> {
    // Sending answer to central of agents
    const requestMsg = {
      "answer": answer,
      "apikey": process.env.AIDEVS_API_KEY,
      "task": task
    };
    console.log('Sending answer to central of agents:', requestMsg);
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
  }
}