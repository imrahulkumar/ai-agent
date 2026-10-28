import OpenAI from 'openai';
import readlineSync from 'readline-sync';
const OPEN_API_KEY = 'AQ.Ab8RN6JyKAQKIIP0-oJSaofmRNysnm9secN_anpB_6HeU9wDOw';

const client = new OpenAI({
    apiKey: OPEN_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});



// Tools
const OPENAI_MODEL = 'gemini-3.5-flash-lite';
function getWeatherDetails(city = '') {
    if (city.toLocaleLowerCase() === 'new delhi') {
        return '10°C'
    }
    if (city.toLocaleLowerCase() === 'los angeles') {
        return '25°C'
    }
    if (city.toLocaleLowerCase() === 'chicago') {
        return '5°C'
    }
    if (city.toLocaleLowerCase() === 'san francisco') {
        return '15°C'
    }
}

const tools = {
    getWeatherDetails: getWeatherDetails
};

const SYSTEM_PROMPT = `You are an AI Assistant with START, PLAN, ACTION, OBSERVATION and Output State.
Wait for the user prompt and first PLAN using available tools.
After Planning, Take the action with appropriate tools and wait for Observation based on Action.
Once you get the observations, Return the AI response based on START prompt and observations.

Strictly follow the JSON output format as in the example.

Available Tools: 
- function getWeatherDetails(city: string): string
getWeatherDetails is function that accept city name as tring and return the weather details as string.

Example:
START
{ "type": "user", "user": "Hey, what is the sum of weather of New Delhi and Los angeles?"}
{ "type": "plan", "plan": "I will call the getWeatherDetails for New Delhi."}
{ "type": "action", "function": "getWeatherDetails",  "input": "New Delhi" }
{ "type": "observation", "observation": "10°C" }
{ "type": "plan", "plan": "I will call the getWeatherDetails for Los Angeles."}
{ "type": "action", "function": "getWeatherDetails",  "input": "Los Angeles" }
{ "type": "observation", "observation": "25°C" }
{ "type": "output", "output": "The sum of weather of New Delhi and Los Angeles is 35°C" }
`;


async function chat() {
    const user = 'Hey, what is the weather of New Delhi?';
    const response = await client.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: user },
        ]
    });
    return response.choices[0].message.content;
}

// chat();



const message = [
    { role: 'system', content: SYSTEM_PROMPT }
];

while (true) {

    const query = readlineSync.question('>>');
    message.push({ role: 'user', content: query });


    while (true) {
        const chat = await client.chat.completions.create({
            model: OPENAI_MODEL,
            messages: message,
            response_format: { type: 'json_object' }
        });

        const result = chat.choices[0].message.content;
        console.log('->', result);
        message.push({ role: 'user', content: result });
        const call = JSON.parse(result);

        if (call.type === 'output') {
            console.log('🤖', call.output);
            break;
        } else if (call.type === 'action') {
            const fn = tools[call.function];
            const observation = fn(call.input);
            message.push({ role: 'user', content: JSON.stringify({ type: 'observation', observation }) });
        } 
        // else {
        //     // Gemini rejects requests that end with an assistant message, so nudge it to the next step
        //     message.push({ role: 'user', content: 'continue' });
        // }
    }
} 