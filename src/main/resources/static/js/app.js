// Hovedapplikation Modul
import { sendMessage, getHistory } from './modules/api.js';
import { getSessionId, displaySessionId, createSessionManager } from './modules/session.js';
import { 
    showNotification, showError, showTypingIndicator, removeTypingIndicator, 
    clearConversation, autoResizeTextarea, updateCharacterCount
} from './modules/ui.js';
import { addMessage, updateMessageStatus } from './modules/messages.js';

// Håndter afsendelse af besked
async function handleSendMessage() {
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    messageInput.disabled = true;
    sendButton.disabled = true;
    
    const messageElements = addMessage(message, true, 'sending');
    messageInput.value = '';
    showTypingIndicator();
    
    try {
        const response = await sendMessage(message, getSessionId());
        updateMessageStatus(messageElements, 'sent');
        removeTypingIndicator();
        
        if (response && response.response) {
            addMessage(response.response, false);
        } else {
            showError('Ugyldigt svar fra serveren.');
        }
    } catch (error) {
        updateMessageStatus(messageElements, 'failed');
        removeTypingIndicator();
        
        let errorMessage = 'Fejl ved afsendelse. Prøv igen senere.';
        
        if (error.message.includes('Network error')) {
            errorMessage = 'Netværksfejl: Kan ikke forbinde til serveren. Tjek din forbindelse.';
        } else if (error.message.includes('Bad request')) {
            errorMessage = 'Ugyldigt beskedformat. Prøv igen.';
        } else if (error.message.includes('Unauthorized')) {
            errorMessage = 'Session udløbet. Opdater siden.';
        } else if (error.message.includes('Too many requests')) {
            errorMessage = 'For mange forsøg. Vent og prøv igen.';
        } else if (error.message.includes('Server error')) {
            errorMessage = 'Serverfejl. Prøv igen senere.';
        }
        
        showError(errorMessage);
        console.error('Fejl ved sending:', error);
    } finally {
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
    }
}

// Eksporter samtale
function exportConversation() {
    let text = `AI Chat Samtale - ${new Date().toLocaleString()}\n${'='.repeat(50)}\n\n`;
    
    document.querySelectorAll('.message-container').forEach(container => {
        const message = container.querySelector('.message');
        const timestamp = container.querySelector('.message-timestamp')?.textContent || 'Ukendt tid';
        const isUser = container.classList.contains('user');
        if (message) text += `[${timestamp}] ${isUser ? 'Du: ' : 'AI: '}${message.textContent}\n\n`;
    });
    
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    
    showNotification('Samtale eksporteret');
}

// Initialiser chat
async function initializeChat() {
    displaySessionId();
    createSessionManager();
    
    const sessionId = getSessionId();
    const history = await getHistory(sessionId);
    
    history.forEach(msg => {
        addMessage(msg.content, msg.isUser);
    });
    
    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('messageInput');
    const clearButton = document.getElementById('clearButton');
    const exportButton = document.getElementById('exportButton');
    
    sendButton.addEventListener('click', handleSendMessage);
    clearButton.addEventListener('click', clearConversation);
    exportButton.addEventListener('click', exportConversation);
    
    messageInput.addEventListener('input', () => {
        updateCharacterCount();
        autoResizeTextarea();
    });
    
    updateCharacterCount();
    autoResizeTextarea();
    messageInput.focus();
}

document.addEventListener('DOMContentLoaded', initializeChat);
