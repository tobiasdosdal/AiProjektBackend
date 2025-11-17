// Beskedadministration Modul
import { parseMarkdown } from './markdown.js';
import { copyToClipboard } from './ui.js';

// Formatér tidsstempel
function formatTimestamp(date) {
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    
    if (diffMins < 1) return 'Lige nu';
    if (diffMins < 60) return `${diffMins} min siden`;
    if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        return hours === 1 ? '1 time siden' : `${hours} timer siden`;
    }
    
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    return `${dateStr} ${timeStr}`;
}

// Status ikon for besked
function getStatusIcon(status) {
    const icons = { sending: '...', sent: 'OK', failed: 'X' };
    return icons[status] || '';
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

export { updateMessageStatus, addMessage };
