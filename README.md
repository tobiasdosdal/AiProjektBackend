# AiProjekt Backend

Spring Boot backend applikation med integreret vanilla JavaScript frontend.

## Funktioner

- AI chat via OpenRouter API
- Session management
- Samtale historik
- Markdown support i beskeder
- Responsiv brugerflade

## Teknologier

- **Backend**: Spring Boot, Java 21
- **Frontend**: Vanilla JavaScript
- **Database**: H2 
- **Container**: Docker

## Krav

- Java 21+
- Maven 3.6+
- Docker (valgfrit)

## Konfiguration

Opret en `.env` fil i projektets rod med:

```env
OPENROUTER_API_KEY=din_api_nøgle_her
```

## Kørsel

### Lokalt med Maven

```bash
./mvnw spring-boot:run
```

Applikationen kører på `http://localhost:8080`

### Med Docker Compose

```bash
docker-compose up -d
```

Backend kører på `http://localhost:8080`

## Struktur

```
src/main/resources/static/  # Frontend filer (HTML, CSS, JS)
src/main/java/               # Backend Java kode
```

## API Endpoints

- `POST /api/chat` - Send besked og få AI svar
- `GET /api/chat/{sessionId}` - Hent samtale historik
- `GET /api/chat/health` - Health check

## CI/CD

Projektet bruger GitHub Actions til automatisk build og deployment til GitHub Container Registry (GHCR).

