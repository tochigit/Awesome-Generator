const topicInput = document.getElementById('topic');
const topicMessage = document.getElementById('topicMessage');

async function generatePrompt() {
    const topic = topicInput.value.trim();
    if (!topic) {
        topicMessage.hidden = false;
        topicInput.focus();
        return;
    }
    topicMessage.hidden = true;

    const output = document.getElementById('output');
    output.textContent = 'Generating smart prompt...';
    document.getElementById('copyBtn').style.display = 'none';

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                category: document.getElementById('category').value,
                mood: document.getElementById('mood').value,
                topic,
                length: document.getElementById('length').value
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `API error: ${response.status}`);
        output.textContent = data.prompt;
        output.classList.remove('typewriter');
        void output.offsetWidth;
        output.classList.add('typewriter');
        document.getElementById('copyBtn').style.display = 'block';
    } catch (error) {
        output.textContent = `Error: ${error.message}`;
        console.error(error);
    }
}

function copyToClipboard() {
    const text = document.getElementById('output').innerText;
    navigator.clipboard.writeText(text).catch((error) => console.error('Copy failed:', error));
}

