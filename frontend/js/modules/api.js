// API Modul - Håndterer kommunikation med serveren
// Dette modul sørger for at sende beskeder til serveren og hente historik
// Version: 2.0 - Updated for containerized environments (no Vite)

// Konstanter for API konfiguration
const API_TIMEOUT = 30000; // 30 sekunder timeout

// Bestemmer API URL baseret på om det er development eller production
// For containerized environments, use relative path or same origin
// NOTE: This is plain HTML/JS - NO import.meta.env (Vite) support
// Can be overridden by setting window.API_BASE_URL before this script loads
let API_BASE_URL;
if (typeof window !== 'undefined' && window.API_BASE_URL) {
    API_BASE_URL = window.API_BASE_URL;
} else if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
        API_BASE_URL = 'http://localhost:8080/api';
    } 
    // Containerized/production - use same origin with /api path
    // This requires nginx reverse proxy to route /api to backend
    // This avoids CORS issues since requests stay on same origin
    else {
        // Use same origin - nginx reverse proxy should handle /api routing
        API_BASE_URL = `${window.location.protocol}//${window.location.host}/api`;
        console.log('Using same-origin API path (requires nginx proxy):', API_BASE_URL);
    }
} else {
    API_BASE_URL = '/api';
}

// Log API URL for debugging (remove in production if desired)
if (typeof window !== 'undefined') {
    console.log('API Base URL:', API_BASE_URL);
    console.log('Current hostname:', window.location.hostname);
    console.log('Full URL:', window.location.href);
}

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
    // Tjek først om vi har internetforbindelse
    if (!isOnline()) {
        throw new Error('Du ser ud til at være offline. Tjek din internetforbindelse.');
    }
    
    // Send POST request til serveren
    const response = await fetchWithTimeout(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId })
    });
    
    // Tjek om responsen er ok
    if (!response.ok) {
        // Håndter forskellige fejlkoder
        if (response.status === 400) {
            throw new Error('Bad request: Ugyldig beskedformat');
        } else if (response.status === 401) {
            throw new Error('Unauthorized: Ugyldig session');
        } else if (response.status === 405) {
            // Method Not Allowed - usually means hitting wrong endpoint or nginx config issue
            console.error('405 Method Not Allowed - API URL:', `${API_BASE_URL}/chat`);
            console.error('Request was sent to:', response.url);
            throw new Error(`Method Not Allowed (405): Endpoint accepterer ikke POST. Tjek API URL: ${API_BASE_URL}/chat`);
        } else if (response.status === 429) {
            throw new Error('Too many requests: Prøv igen senere');
        } else if (response.status >= 500) {
            throw new Error('Server error: Prøv igen senere');
        } else {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    }
    
    // Check content type before parsing JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        // Clone response to read text without consuming the body
        const clonedResponse = response.clone();
        const text = await clonedResponse.text();
        console.error('Expected JSON but got:', contentType, text.substring(0, 200));
        throw new Error(`Ugyldigt svarformat: Serveren returnerede ${contentType} i stedet for JSON`);
    }
    
    // Konverter JSON svar
    const data = await response.json();
    
    // Validér at vi får noget brugbart tilbage
    if (!data || typeof data !== 'object') {
        throw new Error('Ugyldigt svarformat');
    }
    
    return data;
}

// Hent historik
async function getHistory(sessionId) {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/${sessionId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            if (response.status === 404) return []; // Ny session, ingen historik
            throw new Error(response.status === 401 ? 'Unauthorized: Ugyldig session' : 'Server fejl');
        }
        
        // Check content type before parsing JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            // Clone response to read text without consuming the body
            const clonedResponse = response.clone();
            const text = await clonedResponse.text();
            console.error('getHistory: Expected JSON but got:', contentType, text.substring(0, 200));
            // Return empty array if we get HTML (likely 404 page)
            return [];
        }
        
        const data = await response.json();
        // Håndter både nyt format med messages property og gammelt format
        return Array.isArray(data.messages) ? data.messages : (Array.isArray(data) ? data : []);
    } catch (error) {
        // If it's a JSON parse error, likely got HTML instead
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
            console.error('Fejl ved indlæsning af historik: Fik HTML i stedet for JSON. Tjek API URL:', API_BASE_URL);
            return []; // Returner tom array så chatten kan fortsætte
        }
        console.error('Fejl ved indlæsning af historik:', error);
        return []; // Returner tom array så chatten kan fortsætte
    }
}

// Eksporter funktioner til brug i andre moduler
export {
    API_BASE_URL,
    sendMessage,
    getHistory
};