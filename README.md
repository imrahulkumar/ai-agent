# AI Weather Agentrf

A small AI agent built from scratch in Node.js, made for learning. It uses no agent framework and no built-in tool calling: the model is taught to work in steps (**PLAN → ACTION → OBSERVATION → OUTPUT**) through the system prompt alone, and a loop in the code runs the tools it asks for.

It uses the free tier of Google Gemini through Gemini's OpenAI-compatible endpoint, so it runs on the standard `openai` npm package.

## How it works

1. You type a question, for example `what is the weather of new delhi`.
2. The model replies with one JSON step at a time:
   ```json
   { "type": "plan", "plan": "I will call getWeatherDetails for New Delhi." }
   { "type": "action", "function": "getWeatherDetails", "input": "New Delhi" }
   ```
3. When the model sends an `action`, the code looks up the function in the `tools` map, runs it, and sends back the result:
   ```json
   { "type": "observation", "observation": "10°C" }
   ```
4. This repeats until the model sends an `output` step, which the code prints as the final answer:
   ```
   🤖 The weather of New Delhi is 10°C.
   ```

The model can't run code or wait for results by itself. The `while` loop in `index.js` does that part, and the loop is what turns a chatbot into an agent.

## Setup

**Requirements:** Node.js 18 or newer.

1. Install the dependencies:
   ```bash
   npm install
   ```
2. Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey).
3. Put your key in `OPEN_API_KEY` at the top of `index.js`. Don't commit a real key. Moving it to an environment variable is safer:
   ```js
   const OPEN_API_KEY = process.env.GEMINI_API_KEY;
   ```
   ```bash
   GEMINI_API_KEY=your-key node index.js
   ```
4. Run the agent:
   ```bash
   node index.js
   ```
   Type a question at the `>>` prompt. Press `Ctrl+C` to quit.

## Tools

| Tool | Input | Returns |
| --- | --- | --- |
| `getWeatherDetails(city)` | City name | Hard-coded temperature as a string |

The weather data is fake. Only these cities are supported: New Delhi, Los Angeles, Chicago and San Francisco. Any other city returns `undefined`.

To add a tool:
1. Write the function.
2. Add it to the `tools` object.
3. Describe it under `Available Tools` in `SYSTEM_PROMPT`.

## Configuration

| Setting | Where | Default |
| --- | --- | --- |
| Model | `OPENAI_MODEL` in `index.js` | `gemini-3.5-flash-lite` |
| API endpoint | `baseURL` in the client | Gemini's OpenAI-compatible URL |

Because the code uses the `openai` package, you can point it at any OpenAI-compatible API by changing `baseURL` and the model name. For example, use `http://localhost:11434/v1` to run a local model with [Ollama](https://ollama.com).

## Troubleshooting

| Error | Cause | Fix |
| --- | --- | --- |
| `429` | You hit the free-tier limit (about 20 requests per model per day). Each question uses 2–3 requests. | Wait for the reset, or switch `OPENAI_MODEL` to another model. Each model has its own limit. |
| `503` | The model is overloaded on Google's side. | Try again later, or use a different model. |
| `400` | The request is invalid. Gemini rejects any request whose last message has the `assistant` role. | Send the model's replies and observations with `role: 'user'`, as the loop does now. |
| `SyntaxError` in `JSON.parse` | The model returned more than one JSON object, or text that isn't JSON. | Keep `response_format: { type: 'json_object' }` and the "Strictly follow the JSON output format" line in the prompt. |

## Project structure

```
index.js       The agent: tools, system prompt and the chat loop
package.json   Dependencies (openai, readline-sync)
```
