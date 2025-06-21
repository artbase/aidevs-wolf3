import fetch from 'node-fetch';

async function sendJson(): Promise<void> {
    const data = {
        text: "komunikat",
        msgID: 0123456789
    };

    const response = await fetch('https://xyz.ag3nts.org/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log("Response message:", responseData);
    console.log("JSON data sent successfully.");
    console.log(response);
}

async function main(): Promise<void> {
    await sendJson();
}

main().catch(error => {
    console.error("An error occurred:", error);
});
