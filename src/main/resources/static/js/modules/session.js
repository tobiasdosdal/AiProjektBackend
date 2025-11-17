// Session Modul - Håndterer brugersessioner

import { copyToClipboard } from './ui.js';

// Generer unikt session ID
function generateSessionId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

// Hent eller opret session ID
function getSessionId() {
    let sessionId = localStorage.getItem('chatSessionId');
    if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem('chatSessionId', sessionId);
    }
    return sessionId;
}

// Vis session ID i brugerfladen
function displaySessionId() {
    const sessionIdElement = document.getElementById('sessionId');
    sessionIdElement.textContent = `Session: ${getSessionId().substring(0, 8)}...`;
}

// Opret ny session
async function createNewSession() {
    document.getElementById('messages').innerHTML = '';
    localStorage.setItem('chatSessionId', generateSessionId());
    displaySessionId();
    document.getElementById('messageInput').focus();
    const { showNotification } = await import('./ui.js');
    showNotification('Ny session oprettet');
}

// Opret session manager brugerfladen
function createSessionManager() {
    const headerRight = document.querySelector('.header-right');
    const sessionDropdown = document.createElement('div');
    sessionDropdown.className = 'session-dropdown';
    
    const sessionButton = document.createElement('button');
    sessionButton.className = 'session-button';
    sessionButton.textContent = 'Session';
    sessionButton.setAttribute('aria-label', 'Sessionsmuligheder');
    sessionButton.id = 'sessionButton';
    
    const sessionMenu = document.createElement('div');
    sessionMenu.className = 'session-menu';
    sessionMenu.id = 'sessionMenu';
    
    // Menupunkter
    const menuItems = [
        { text: 'Ny Session', action: () => { createNewSession(); toggleSessionMenu(); } },
        { text: 'Kopier Session ID', action: () => { copyToClipboard(getSessionId()); toggleSessionMenu(); } }
    ];
    
    menuItems.forEach(item => {
        const option = document.createElement('button');
        option.className = 'session-option';
        option.textContent = item.text;
        option.addEventListener('click', item.action);
        sessionMenu.appendChild(option);
    });
    
    sessionDropdown.appendChild(sessionButton);
    sessionDropdown.appendChild(sessionMenu);
    headerRight.insertBefore(sessionDropdown, headerRight.firstChild);
    
    sessionButton.addEventListener('click', toggleSessionMenu);
    
    // Luk menu når der klikkes udenfor
    document.addEventListener('click', e => {
        if (!sessionDropdown.contains(e.target)) sessionMenu.style.display = 'none';
    });
}

// Skift sessionsmenu synlighed
function toggleSessionMenu() {
    const sessionMenu = document.getElementById('sessionMenu');
    sessionMenu.style.display = sessionMenu.style.display === 'block' ? 'none' : 'block';
}

// Eksporter funktioner til brug i andre moduler
export {
    generateSessionId,
    getSessionId,
    displaySessionId,
    createNewSession,
    createSessionManager,
    toggleSessionMenu
};