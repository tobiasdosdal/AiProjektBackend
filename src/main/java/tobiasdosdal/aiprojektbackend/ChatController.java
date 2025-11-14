package tobiasdosdal.aiprojektbackend;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import tobiasdosdal.aiprojektbackend.dto.MessageDto;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    // Send besked og få AI svar
    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody ChatService.ChatRequest request) {
        try {
            // Valider besked
            if (request.getMessage() == null || request.getMessage().isBlank()) {
                return badRequest("Besked kan ikke være tom");
            }

            if (request.getSessionId() == null || request.getSessionId().isBlank()) {
                return badRequest("Session ID mangler");
            }

            // Behandl beskeden
            ChatService.ChatResponse response = chatService.processMessage(request);

            return ok(Map.of(
                    "response", response.getResponse(),
                    "conversationId", response.getConversationId()
            ));

        } catch (Exception e) {
            log.error("Fejl ved chat besked: {}", e.getMessage(), e);
            return error("Kunne ikke behandle besked: " + e.getMessage());
        }
    }

    // Hent samtale historik
    @GetMapping("/{sessionId}")
    public ResponseEntity<?> getConversationHistory(@PathVariable String sessionId) {
        try {
            // Valider sessionId
            if (sessionId == null || sessionId.isBlank()) {
                return badRequest("Session ID kan ikke være tom");
            }

            // Hent beskeder
            List<Message> messages = chatService.getConversationHistory(sessionId);

            log.info("Hentet {} beskeder for sessionId: {}", messages.size(), sessionId);

            // Konverter til DTO for at undgå problemer
            List<MessageDto> messageDtos = messages.stream()
                    .map(msg -> new MessageDto(msg.getId(), msg.getContent(), msg.getRole(), msg.getTimestamp()))
                    .toList();

            return ok(Map.of(
                    "sessionId", sessionId,
                    "messages", messageDtos,
                    "messageCount", messageDtos.size()
            ));

        } catch (Exception e) {
            log.error("Fejl ved hentning af historik: {}", e.getMessage(), e);
            return error("Kunne ikke hente historik: " + e.getMessage());
        }
    }

    // Health check
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ok(Map.of(
                "status", "healthy",
                "service", "OpenRouter Chat Backend"
        ));
    }

    // Helper metoder
    private ResponseEntity<Map<String, String>> badRequest(String message) {
        Map<String, String> errorBody = Map.of("error", message, "timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.badRequest().body(errorBody);
    }

    private <T> ResponseEntity<T> ok(T data) {
        return ResponseEntity.ok(data);
    }

    private ResponseEntity<Map<String, String>> error(String message) {
        Map<String, String> errorBody = Map.of("error", message, "timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorBody);
    }
}