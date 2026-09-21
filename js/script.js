const topicModal = document.getElementById('topicModal');
const modalConfirm = document.getElementById('modalConfirm');
const modalCountdown = document.getElementById('modalCountdown');
const topicInput = document.getElementById('topic');
let countdownTimer;

function showTopicModal() {
    clearInterval(countdownTimer);
    topicModal.hidden = false;
    modalConfirm.classList.remove('is-breaking');
    let secondsLeft = 5;
    modalCountdown.textContent = secondsLeft;
    modalConfirm.focus();
    countdownTimer = setInterval(() => {
        secondsLeft -= 1;
        modalCountdown.textContent = secondsLeft;
        if (secondsLeft <= 0) clearInterval(countdownTimer);
    }, 1000);
}

function closeTopicModal() {
    clearInterval(countdownTimer);
    modalConfirm.classList.add('is-breaking');
    setTimeout(() => {
        topicModal.hidden = true;
        modalConfirm.classList.remove('is-breaking');
        topicInput.focus();
    }, 450);
}

async function generatePrompt() {
    const topic = topicInput.value.trim();
    if (!topic) {
        showTopicModal();
        return;
    }

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

modalConfirm.addEventListener('click', closeTopicModal);
topicModal.addEventListener('click', (event) => {
    if (event.target === topicModal) closeTopicModal();
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !topicModal.hidden) closeTopicModal();
});
