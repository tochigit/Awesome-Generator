const SYSTEM_PROMPT = 'You are a senior prompt engineer with more than seven years of professional experience designing reliable prompts for writing, research, analysis, coding, education, planning, and creative work. You have advanced training in instructional design, human-computer interaction, language models, and structured communication. Your job is to turn rough or incomplete ideas into precise, useful, model-agnostic prompts that work across providers and model families. Never invent user-specific facts; use clearly stated assumptions when needed. Return only the final paste-ready prompt. Never include a preamble, greeting, explanation, credentials, quotation marks, markdown fence, or closing commentary. The first character of your response must be the beginning of the prompt itself.';

function sendJson(response, status, body) {
    response.status(status).json(body);
}

module.exports = async function handler(request, response) {
    if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST');
        return sendJson(response, 405, { error: 'Method not allowed.' });
    }

    try {
        const { category, mood, topic, length } = request.body || {};
        if (!topic || !process.env.API_KEY || !process.env.API_BASE_URL || !process.env.API_MODEL) {
            return sendJson(response, 400, { error: 'A topic, API_KEY, API_BASE_URL, and API_MODEL are required.' });
        }

        const userInput = `Category: ${category}\nMood: ${mood}\nUser's topic or idea: ${topic}\nRequested prompt length: ${length}\n\nTransform this into one exceptional, model-agnostic prompt that works well with any capable AI system, regardless of provider, model, or interface. The user may have provided incomplete information. Infer sensible missing details and include practical assumptions, while keeping the prompt easy for the eventual user to customize. Build the prompt around a clear objective, relevant context, intended audience, constraints, required inputs, step-by-step expectations where useful, output format, quality criteria, and a request for clarification only when a missing detail would materially change the result. Match the requested mood and length. Return only the finished prompt text. Do not say hello, introduce the prompt, explain your choices, add labels such as "Here is your prompt", wrap it in quotation marks, or add a closing note.`;
        const extraHeaders = process.env.API_EXTRA_HEADERS ? JSON.parse(process.env.API_EXTRA_HEADERS) : {};
        const providerResponse = await fetch(process.env.API_BASE_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.API_KEY}`,
                'Content-Type': 'application/json',
                ...extraHeaders
            },
            body: JSON.stringify({
                model: process.env.API_MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userInput }
                ],
                temperature: 0.7,
                max_tokens: 1024,
                stream: false
            })
        });

        const data = await providerResponse.json();
        if (!providerResponse.ok) {
            throw new Error(data.error?.message || data.message || `Provider API error: ${providerResponse.status}`);
        }

        return sendJson(response, 200, { prompt: data.choices[0].message.content.trim() });
    } catch (error) {
        return sendJson(response, 500, { error: error.message });
    }
};
