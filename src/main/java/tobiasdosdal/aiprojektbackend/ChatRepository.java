package tobiasdosdal.aiprojektbackend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Conversation, Long> {

    // Find samtale ud fra sessionId
    Optional<Conversation> findBySessionId(String sessionId);

    // Find beskeder for en samtale (sorteret efter tid)
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId ORDER BY m.timestamp ASC")
    List<Message> findMessagesByConversationId(@Param("conversationId") Long conversationId);

    // Slet samtale ud fra sessionId
    void deleteBySessionId(String sessionId);

    // Tjek om samtale eksisterer
    boolean existsBySessionId(String sessionId);

    // Hent samtale med beskeder (for at undgå lazy loading problemer)
    @Query("SELECT c FROM Conversation c LEFT JOIN FETCH c.messages WHERE c.sessionId = :sessionId")
    Optional<Conversation> findConversationWithMessages(@Param("sessionId") String sessionId);
}