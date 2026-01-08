package com.expogarden.service;

import com.expogarden.domain.Booth;
import com.expogarden.domain.ChatMessage;
import com.expogarden.domain.ChatMessageType;
import com.expogarden.dto.ChatMessageDto;
import com.expogarden.repository.BoothRepository;
import com.expogarden.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final BoothRepository boothRepository;

    @Transactional(readOnly = true)
    public Page<ChatMessageDto> getMessages(Long boothId, Pageable pageable) {
        return chatMessageRepository.findByBoothId(boothId, pageable)
            .map(this::mapToDto);
    }

    @Transactional
    public ChatMessageDto createChatMessage(Long boothId, ChatMessageDto message) {
        if (message.getMessage() == null || message.getMessage().trim().isEmpty()) {
            throw new RuntimeException("Chat message is empty");
        }

        String username = message.getUsername();
        if (username == null || username.trim().isEmpty()) {
            username = "게스트";
        }

        ChatMessage entity = ChatMessage.builder()
            .boothId(boothId)
            .userId(message.getUserId())
            .username(username)
            .message(message.getMessage().trim())
            .type(ChatMessageType.CHAT)
            .build();

        entity = chatMessageRepository.save(entity);

        return mapToDto(entity);
    }

    @Transactional(readOnly = true)
    public Long getBoothOwnerId(Long boothId) {
        Booth booth = boothRepository.findByIdAndNotDeleted(boothId)
            .orElseThrow(() -> new RuntimeException("Booth not found"));
        return booth.getOwnerUserId();
    }

    private ChatMessageDto mapToDto(ChatMessage message) {
        return ChatMessageDto.builder()
            .id(String.valueOf(message.getId()))
            .boothId(message.getBoothId())
            .userId(message.getUserId())
            .username(message.getUsername())
            .message(message.getMessage())
            .timestamp(message.getCreatedAt())
            .type(ChatMessageDto.MessageType.valueOf(message.getType().name()))
            .build();
    }
}
