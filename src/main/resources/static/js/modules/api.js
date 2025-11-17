// API Modul - Håndterer kommunikation med serveren
const API_TIMEOUT = 30000; // 30 sekunder timeout

// API Base URL - frontend kører på samme origin som backend
let API_BASE_URL = window.API_BASE_URL || '/api/chat';

console.log('API Base URL:', API_BASE_URL);

// Fetch med timeout
async function fetchWithTimeout(url, options = {}, timeout = API_TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout: Serveren tog for lang tid om at svare');
        }
        throw error;
    }
}

// Tjek om vi er online
function isOnline() {
    return navigator.onLine;
}

// Send besked til serveren
async function sendMessage(message, sessionId) {
    if (!isOnline()) {
        throw new Error('Du ser ud til at være offline. Tjek din internetforbindelse.');
    }
    
    const response = await fetchWithTimeout(`${API_BASE_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId })
    });
    
    if (!response.ok) {
        if (response.status === 400) {
            throw new Error('Bad request: Ugyldig beskedformat');
        } else if (response.status === 401) {
            throw new Error('Unauthorized: Ugyldig session');
        } else if (response.status === 405) {
            throw new Error(`Method Not Allowed (405): Endpoint accepterer ikke POST. Tjek API URL: ${API_BASE_URL}`);
        } else if (response.status === 429) {
            throw new Error('Too many requests: Prøv igen senere');
        } else if (response.status >= 500) {
            throw new Error('Server error: Prøv igen senere');
        } else {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Ugyldigt svarformat: Serveren returnerede ${contentType} i stedet for JSON`);
    }
    
    const data = await response.json();
    
    if (!data || typeof data !== 'object') {
        throw new Error('Ugyldigt svarformat');
    }
    
    return data;
}

// Hent historik
async function getHistory(sessionId) {
    try {
        const response = await fetch(`${API_BASE_URL}/${sessionId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            if (response.status === 404) return [];
            throw new Error(response.status === 401 ? 'Unauthorized: Ugyldig session' : 'Server fejl');
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return [];
        }
        
        const data = await response.json();
        return Array.isArray(data.messages) ? data.messages : (Array.isArray(data) ? data : []);
    } catch (error) {
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
            console.error('Fejl ved indlæsning af historik: Fik HTML i stedet for JSON');
            return [];
        }
        console.error('Fejl ved indlæsning af historik:', error);
        return [];
    }
}

// Eksporter funktioner
export {
    API_BASE_URL,
    sendMessage,
    getHistory
};
