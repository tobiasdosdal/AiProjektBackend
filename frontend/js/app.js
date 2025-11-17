// Hovedapplikation Modul
// Dette er hovedfilen der styrer hele chat appen

import { sendMessage, getHistory } from './modules/api.js';
import { getSessionId, displaySessionId, createSessionManager } from './modules/session.js';
import { 
    showNotification, showError, showTypingIndicator, removeTypingIndicator, 
    clearConversation, autoResizeTextarea, updateCharacterCount
} from './modules/ui.js';
import { addMessage, updateMessageStatus } from './modules/messages.js';

// Funktionen der køres når brugeren sender en besked
async function handleSendMessage() {
    // Få input felterne
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    // Få teksten brugeren skrev
    const message = messageInput.value.trim();
    
    // Hvis der ikke er noget tekst, stop her
    if (!message) return;
    
    // Deaktivér input og knap mens vi sender
    messageInput.disabled = true;
    sendButton.disabled = true;
    
    // Tilføj brugerens besked til chatten
    const messageElements = addMessage(message, true, 'sending');
    
    // Tøm input feltet
    messageInput.value = '';
    
    // Vis at AI er ved at skrive
    showTypingIndicator();
    
    try {
        // Send beskeden til serveren
        const response = await sendMessage(message, getSessionId());
        
        // Opdater status fra "sendes" til "sendt"
        updateMessageStatus(messageElements, 'sent');
        
        // Fjern skriveindikatoren
        removeTypingIndicator();
        
        // Tjek om vi fik et svar tilbage
        if (response && response.response) {
            // Tilføj AI's svar til chatten (vis øjeblikkeligt)
            addMessage(response.response, false);
        } else {
            // Hvis vi ikke får et ordentligt svar, vis fejl
            showError('Ugyldigt svar fra serveren.');
        }
    } catch (error) {
        // Hvis der var en fejl, opdater status til "fejlet"
        updateMessageStatus(messageElements, 'failed');
        
        // Fjern skriveindikatoren
        removeTypingIndicator();
        
        // Bestem fejlbesked baseret på fejltypen
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
        
        // Vis fejlbesked
        showError(errorMessage);
        console.error('Fejl ved sending:', error);
    } finally {
        // Reaktivér input og knap
        messageInput.disabled = false;
        sendButton.disabled = false;
        
        // Fokus tilbage på input feltet
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

// Initialiser (start) chat brugerfladen
async function initializeChat() {
    // Vis session ID
    displaySessionId();
    
    // Opret session dropdown menu
    createSessionManager();
    
    // Hent og vis tidligere beskeder
    const sessionId = getSessionId();
    const history = await getHistory(sessionId);
    
    // Viser hver tidligere besked
    history.forEach(msg => {
        if (msg.isUser) {
            addMessage(msg.content, true);
        } else {
            addMessage(msg.content, false);
        }
    });
    
    // Hent alle knapperne og input felterne
    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('messageInput');
    const clearButton = document.getElementById('clearButton');
    const exportButton = document.getElementById('exportButton');
    
    // Tilføj event listeners til alle knapperne
    sendButton.addEventListener('click', handleSendMessage);
    clearButton.addEventListener('click', clearConversation);
    exportButton.addEventListener('click', exportConversation);
    
    // Update karakterantal og textarea størrelse når man skriver
    messageInput.addEventListener('input', () => {
        updateCharacterCount();
        autoResizeTextarea();
    });
    
    // Initialiser tegntæller og textarea høj første gang
    updateCharacterCount();
    autoResizeTextarea();
    
    // Fokus på input feltet så brugeren kan skrive med det samme
    messageInput.focus();
}

// Initialiser chat når DOM er indlæst
document.addEventListener('DOMContentLoaded', initializeChat);