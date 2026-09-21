# Awesome Prompt Generator

Turn half-formed ideas into useful prompts without making the user write an essay before the essay.

## Try It Online

<a href="https://awesomegenerator.vercel.app/">
   <img src="https://img.shields.io/badge/OPEN%20THE%20GENERATOR-111827?style=for-the-badge&logo=vercel&logoColor=white&labelColor=0f172a" alt="Open Awesome Prompt Generator">
</a>

Live deployment: [awesomegenerator.vercel.app](https://awesomegenerator.vercel.app/)

No installation required. Click the link, describe your idea, and let the prompt machinery do its suspiciously competent thing.

## What It Does

Awesome Prompt Generator takes a topic, category, mood, and desired length, then asks an AI model to turn that idea into a polished, model-agnostic prompt.

It works with Groq's OpenAI-compatible API format and can be adapted for other compatible providers.

## Requirements

- Node.js 18 or newer
- A Groq API key
- An internet connection, because computers still refuse to read minds offline

## Setup

1. Open a terminal in the project folder.

2. Install the dependencies:

   ```powershell
   npm install
   ```

3. Open `.env` and add your Groq settings:

   ```env
   API_BASE_URL=https://api.groq.com/openai/v1/chat/completions
   API_KEY=your_groq_api_key
   API_MODEL=openai/gpt-oss-120b
   PORT=3000
   ```

4. Start the app:

   ```powershell
   npm start
   ```

5. Open this address in your browser:

   ```text
   http://localhost:3000
   ```

## How To Use It

1. Choose a category.
2. Choose the mood.
3. Describe your idea in the topic box.
4. Include useful details such as your goal, audience, context, constraints, examples, and desired output.
5. Choose the prompt length.
6. Click **Generate Prompt**.
7. Copy the result and paste it into whichever AI model you prefer.

The more useful information you provide, the less the AI has to guess. Give it a real idea, not just “make it good” and a prayer.

## API Configuration

The server reads these values from `.env`:

- `API_BASE_URL`: The provider's chat-completions endpoint.
- `API_KEY`: Your private API key.
- `API_MODEL`: The model name available to your account.
- `PORT`: The local server port.

Never commit `.env` or expose your API key in browser JavaScript like i did :(. The key belongs on the server, where curious strangers and browser developer tools cannot casually adopt it.

## Project Structure

```text
index.html       Page structure
css/style.css    Visual styling
js/script.js     Browser interactions
server.js        Local server and AI API proxy
api/generate.js  Vercel serverless API function
.env             Private local configuration
package.json     Project scripts and dependencies
```

## Contributing

Contributions are welcome. If you have an improvement, bug fix, design idea, or a particularly strong opinion about button placement:

1. Fork the repository.
2. Create a branch:

   ```powershell
   git checkout -b improve-something
   ```

3. Make your changes.
4. Test the app locally with `npm start`.
5. Commit your work:

   ```powershell
   git commit -m "(your change summary)"
   ```

6. Push your branch and open a pull request.

Please keep changes focused, avoid committing secrets, and explain what your change improves. Future contributors will thank you, possibly by not opening an issue titled “it broke.”

## License

See [LICENSE](LICENSE).
