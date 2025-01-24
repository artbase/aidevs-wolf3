export class AiDevsService {

  async GetMessage(): Promise<string> {
    // https://centrala.ag3nts.org/data/KLUCZ-API/robotid.json
    // const requestMsg = {
    //     "answer": addressBuildingOfCompany,
    //     "apikey": process.env.AIDEVS_API_KEY,
    //     "task": "mp3"
    // };
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

  async SendAnswer(url: string, task: string):  Promise<void> {
    // Sending answer to central of agents
    const requestMsg = {
      "answer": url,
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
}