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

                const userInput = `Category: ${category}\nMood: ${mood}\nTopic/idea: ${topic}\nLength: ${length}\n\nTurn this into a highly effective, detailed prompt ready to copy-paste into Grok, ChatGPT, or Claude. Make it structured, clear, and optimized for best results.`;
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
                            { role: 'system', content: 'You are an expert prompt engineer. Create optimized prompts that get the best output from Grok, ChatGPT, and Claude. Make responses complete and detailed without unnecessary truncation.' },
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
