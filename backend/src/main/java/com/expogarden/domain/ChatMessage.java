package com.expogarden.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "chat_messages")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booth_id", nullable = false)
    private Long boothId;

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, length = 100)
    private String username;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ChatMessageType type;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
