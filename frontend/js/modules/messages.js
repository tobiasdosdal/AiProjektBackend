// Beskedadministration Modul
// Her håndteres alle beskeder - tilføjelse, visning, streaming osv.

import { parseMarkdown } from './markdown.js';
import { copyToClipboard } from './ui.js';

// Formatér tidsstempel på en pæn måde
function formatTimestamp(date) {
    // Beregn hvor mange minutter siden
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    // Vise "lige nu" hvis mindre end 1 minut
    if (diffMins < 1) {
        return 'Lige nu';
    } 
    // Vise minutter hvis mindre end 1 time
    else if (diffMins < 60) {
        return `${diffMins} min siden`;
    } 
    // Vise timer hvis mindre end 24 timer
    else if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        if (hours === 1) {
            return '1 time siden';
        } else {
            return `${hours} timer siden`;
        }
    } 
    // Vise dato og tid for gamle beskeder
    else {
        const dateStr = date.toLocaleDateString();
        const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        return dateStr + ' ' + timeStr;
    }
}

// Få det rigtige ikon for statusen på en besked
function getStatusIcon(status) {
    if (status === 'sending') {
        return '...'; // Sendes
    } else if (status === 'sent') {
        return 'OK'; // Sendt
    } else if (status === 'failed') {
        return 'X'; // Fejlede
    } else {
        return '';
    }
}

// Opdater beskedstatus
function updateMessageStatus(messageElements, status) {
    if (messageElements?.status) {
        messageElements.status.className = `message-status ${status}`;
        messageElements.status.innerHTML = getStatusIcon(status);
    }
}

// Tilføj besked til brugerfladen
function addMessage(content, isUser, status = 'sent') {
    const messagesDiv = document.getElementById('messages');
    const messageContainer = document.createElement('div');
    messageContainer.className = `message-container ${isUser ? 'user' : 'assistant'}`;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'assistant-message'}`;
    messageDiv.innerHTML = isUser ? content : parseMarkdown(content);
    
    const timestamp = document.createElement('div');
    timestamp.className = 'message-timestamp';
    timestamp.textContent = formatTimestamp(new Date());
    
    // Opret kopieringsknappe
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.textContent = 'Copy';
    copyButton.setAttribute('aria-label', 'Kopier besked');
    copyButton.addEventListener('click', () => copyToClipboard(content));
    
    messageContainer.appendChild(messageDiv);
    messageContainer.appendChild(timestamp);
    
    let statusIndicator = null;
    if (isUser) {
        statusIndicator = document.createElement('div');
        statusIndicator.className = `message-status ${status}`;
        statusIndicator.innerHTML = getStatusIcon(status);
        messageContainer.appendChild(statusIndicator);
    }
    
    messageContainer.appendChild(copyButton);
    messagesDiv.appendChild(messageContainer);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    return { container: messageContainer, message: messageDiv, status: statusIndicator, timestamp };
}


// Eksporter funktioner til brug i andre moduler
export {
    updateMessageStatus,
    addMessage
};