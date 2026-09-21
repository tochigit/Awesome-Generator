const fs = require('fs');
const path = require('path');
const http = require('http');
const dotenv = require('dotenv');

dotenv.config();
const port = process.env.PORT || 3000;
const root = __dirname;
const contentTypes = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };

function sendJson(response, status, body) {
    response.writeHead(status, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(body));
}

const server = http.createServer((request, response) => {
    if (request.method === 'POST' && request.url === '/api/generate') {
        let rawBody = '';
        request.on('data', (chunk) => { rawBody += chunk; });
        request.on('end', async () => {
            try {
                const { category, mood, topic, length } = JSON.parse(rawBody);
                if (!topic || !process.env.API_KEY || !process.env.API_BASE_URL || !process.env.API_MODEL) {
                    sendJson(response, 400, { error: 'A topic, API_KEY, API_BASE_URL, and API_MODEL are required.' });
                    return;
                }

                const userInput = `Category: ${category}\nMood: ${mood}\nUser's topic or idea: ${topic}\nRequested prompt length: ${length}\n\nTransform this into one exceptional, model-agnostic prompt that works well with any capable AI system, regardless of provider, model, or interface. The user may have provided incomplete information. Infer sensible missing details and include practical assumptions, while keeping the prompt easy for the eventual user to customize. Build the prompt around a clear objective, relevant context, intended audience, constraints, required inputs, step-by-step expectations where useful, output format, quality criteria, and a request for clarification only when a missing detail would materially change the result. Match the requested mood and length. Return only the finished prompt text. Do not say hello, introduce the prompt, explain your choices, add labels such as "Here is your prompt", wrap it in quotation marks, or add a closing note.`;
                const providerResponse = await fetch(process.env.API_BASE_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.API_KEY}`,
                        'Content-Type': 'application/json',
                        ...(process.env.API_EXTRA_HEADERS ? JSON.parse(process.env.API_EXTRA_HEADERS) : {})
                    },
                    body: JSON.stringify({
                        model: process.env.API_MODEL,
                        messages: [
                            { role: 'system', content: 'You are a senior prompt engineer with more than seven years of professional experience designing reliable prompts for writing, research, analysis, coding, education, planning, and creative work. You have advanced training in instructional design, human-computer interaction, language models, and structured communication. Your job is to turn rough or incomplete ideas into precise, useful, model-agnostic prompts that work across providers and model families. Never invent user-specific facts; use clearly stated assumptions when needed. Return only the final paste-ready prompt. Never include a preamble, greeting, explanation, credentials, quotation marks, markdown fence, or closing commentary. The first character of your response must be the beginning of the prompt itself.' },
                            { role: 'user', content: userInput }
                        ],
                        temperature: 0.7,
                        max_tokens: 1024,
                        stream: false
                    })
                });
                const data = await providerResponse.json();
                if (!providerResponse.ok) throw new Error(data.error?.message || data.message || `Provider API error: ${providerResponse.status}`);
                sendJson(response, 200, { prompt: data.choices[0].message.content.trim() });
            } catch (error) {
                sendJson(response, 500, { error: error.message });
            }
        });
        return;
    }

    const requestedPath = request.url === '/' ? '/index.html' : request.url;
    const filePath = path.join(root, requestedPath);
    if (!filePath.startsWith(root) || !fs.existsSync(filePath)) {
        response.writeHead(404);
        response.end('Not found');
        return;
    }
    response.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(response);
});

server.listen(port, () => console.log(`Prompt generator running at http://localhost:${port}`));
