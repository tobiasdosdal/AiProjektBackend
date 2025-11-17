// UI Utilities Modul
// Her er funktioner for at vise ting på skærmen

// Kopier tekst til clipboard
async function copyToClipboard(text) {
    try {
        // Prøv at bruge moderne clipboard API
        await navigator.clipboard.writeText(text);
    } catch (err) {
        // Hvis det ikke virker, brug den gamle måde
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
    showNotification('Besked kopieret');
}

// Vis en notifikation på skærmen
function showNotification(message, duration = 3000) {
    // Opret en ny div for notifikationen
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Tilføj den til siden
    document.body.appendChild(notification);
    
    // Lidt senere, gøre den synlig (fade in)
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Efter duration milliskunder, gør den usynlig (fade out)
    setTimeout(() => {
        notification.classList.remove('show');
        
        // Vent til fade out animation er færdig, så fjern den fra siden
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

// Opdater tegntæller under beskedindtastning
function updateCharacterCount() {
    const messageInput = document.getElementById('messageInput');
    const charCount = document.getElementById('charCount');
    
    // Få længden af teksten
    const currentLength = messageInput.value.length;
    
    // Opdater tallet
    charCount.textContent = currentLength;
    
    // Skift farve baseret på hvor tæt vi er på grænsen
    if (currentLength > 1800) {
        charCount.style.color = '#ff3b30'; // Rød - meget nær grænse!
    } else if (currentLength > 1500) {
        charCount.style.color = '#ff9f0a'; // Orange - nærmere os
    } else {
        charCount.style.color = '#86868b'; // Grå - alt er OK
    }
}

// Eksporter funktioner til brug i andre moduler
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