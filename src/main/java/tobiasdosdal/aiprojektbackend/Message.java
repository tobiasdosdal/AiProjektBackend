package tobiasdosdal.aiprojektbackend;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Reference til samtalen. LAZY = hent kun når nødvendigt.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    @JsonIgnore
    private Conversation conversation;

    // Selve beskedens tekstindhold
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // "user" eller "assistant"
    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime timestamp;

    // Når objektet gemmes første gang, sæt tidspunkt i dansk tid
    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now(ZoneId.of("Europe/Copenhagen"));
        }
    }
}