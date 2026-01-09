package com.expogarden.controller;

import com.expogarden.dto.HallChatMessageDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.Instant;

@Controller
@RequiredArgsConstructor
@Slf4j
public class HallChatController {

    @MessageMapping("/chat.hall.{hallId}")
    @SendTo("/topic/hall.chat.{hallId}")
    public HallChatMessageDto sendHallMessage(
        @DestinationVariable Long hallId,
        @Payload HallChatMessageDto message
    ) {
        String text = message.getMessage() != null ? message.getMessage().trim() : "";
        if (text.isEmpty()) {
            throw new RuntimeException("Hall chat message is empty");
        }

        if (message.getNickname() == null || message.getNickname().isBlank()) {
            message.setNickname("게스트");
        }

        message.setHallId(hallId);
        message.setMessage(text);
        message.setTimestamp(Instant.now());
        message.setType(HallChatMessageDto.MessageType.CHAT);

        log.info("Hall chat in hall {}: {} - {}", hallId, message.getNickname(), text);

        return message;
    }
}
