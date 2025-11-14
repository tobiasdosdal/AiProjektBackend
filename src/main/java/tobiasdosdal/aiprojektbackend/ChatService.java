package tobiasdosdal.aiprojektbackend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatRepository chatRepository;
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.api.url}")
    private String apiUrl;

    @Value("${openrouter.model}")
    private String model;

    // Behandler en chat besked
    public ChatResponse processMessage(ChatRequest request) {
        try {
            // Find eller lav samtale
            Conversation conversation = findOrCreateConversation(request.getSessionId());

            // Lav bruger besked
            Message userMessage = new Message();
            userMessage.setConversation(conversation);
            userMessage.setContent(request.getMessage());
            userMessage.setRole("user");
            userMessage.setTimestamp(LocalDateTime.now(ZoneId.of("Europe/Copenhagen")));

            // Lav AI besked
            String aiResponse = callOpenRouter(request.getMessage());
            Message aiMessage = new Message();
            aiMessage.setConversation(conversation);
            aiMessage.setContent(aiResponse);
            aiMessage.setRole("assistant");
            aiMessage.setTimestamp(LocalDateTime.now(ZoneId.of("Europe/Copenhagen")));

            // Gem beskeder
            conversation.getMessages().add(userMessage);
            conversation.getMessages().add(aiMessage);
            chatRepository.save(conversation);

            return new ChatResponse(aiResponse, conversation.getId());

        } catch (Exception e) {
            throw new RuntimeException("Fejl ved behandling: " + e.getMessage());
        }
    }

    // Hent samtale historik
    public List<Message> getConversationHistory(String sessionId) {
        return chatRepository.findConversationWithMessages(sessionId)
                .map(Conversation::getMessages)
                .orElseGet(ArrayList::new);
    }

    // Find eller lav samtale
    private Conversation findOrCreateConversation(String sessionId) {
        return chatRepository.findBySessionId(sessionId)
                .orElseGet(() -> {
                    Conversation conv = new Conversation();
                    conv.setSessionId(sessionId);
                    conv.setCreatedAt(LocalDateTime.now(ZoneId.of("Europe/Copenhagen")));
                    conv.setMessages(new ArrayList<>());
                    return chatRepository.save(conv);
                });
    }

    // Kal AI API
    private String callOpenRouter(String userMessage) {
        try {
            if ("test-key-for-debugging".equals(apiKey)) {
                return "Mock svar (test mode)";
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", List.of(
                    Map.of("role", "user", "content", userMessage)
            ));

            WebClient client = webClientBuilder.build();
            String response = client.post()
                    .uri(apiUrl)
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (response == null || response.trim().isEmpty()) {
                throw new RuntimeException("Tomt svar fra API");
            }

            return extractContent(response);

        } catch (WebClientResponseException e) {
            throw new RuntimeException("API fejl: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            throw new RuntimeException("Fejl ved API kald: " + e.getMessage());
        }
    }

    // Udtræk besked tekst fra JSON svar
    private String extractContent(String response) throws Exception {
        JsonNode json = objectMapper.readTree(response);

        // Prøv standard format først
        if (json.has("choices") && json.get("choices").isArray()) {
            JsonNode content = json.get("choices").get(0)
                    .get("message").get("content");
            if (content != null) {
                return content.asText();
            }
        }

        // Prøv direkte content felt
        if (json.has("content")) {
            return json.get("content").asText();
        }

        throw new RuntimeException("Ukendt svar format");
    }

    // Simple request/response klasser
    public static class ChatRequest {
        private String message;
        private String sessionId;

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    }

    public static class ChatResponse {
        private String response;
        private Long conversationId;

        public ChatResponse(String response, Long conversationId) {
            this.response = response;
            this.conversationId = conversationId;
        }

        public String getResponse() { return response; }
        public Long getConversationId() { return conversationId; }
    }
}