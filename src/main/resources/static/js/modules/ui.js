// UI Utilities Modul

// Kopier tekst til clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
    showNotification('Besked kopieret');
}

// Vis notifikation
function showNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// Vis fejlbesked
function showError(message) {
    const messagesDiv = document.getElementById('messages');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    messagesDiv.appendChild(errorDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Vis skriv-indikator
function showTypingIndicator() {
    const messagesDiv = document.getElementById('messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = '<div class="typing-text">AI skriver</div><div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
    messagesDiv.appendChild(typingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Fjern skriv-indikator
function removeTypingIndicator() {
    document.getElementById('typing-indicator')?.remove();
}

// Ryd samtale
function clearConversation() {
    document.getElementById('messages').innerHTML = '';
    showNotification('Samtale slettet');
}

// Automatisk tilpas textarea størrelse
function autoResizeTextarea() {
    const textarea = document.getElementById('messageInput');
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

// Opdater tegntæller
function updateCharacterCount() {
    const messageInput = document.getElementById('messageInput');
    const charCount = document.getElementById('charCount');
    const currentLength = messageInput.value.length;
    
    charCount.textContent = currentLength;
    
    if (currentLength > 1800) {
        charCount.style.color = '#ff3b30';
    } else if (currentLength > 1500) {
        charCount.style.color = '#ff9f0a';
    } else {
        charCount.style.color = '#86868b';
    }
}

export {
    copyToClipboard,
    showNotification,
    showError,
    showTypingIndicator,
    removeTypingIndicator,
    clearConversation,
    autoResizeTextarea,
    updateCharacterCount
};
