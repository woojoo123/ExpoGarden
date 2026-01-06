package com.expogarden.service;

import com.expogarden.domain.Booth;
import com.expogarden.domain.ContentStatus;
import com.expogarden.domain.Question;
import com.expogarden.domain.User;
import com.expogarden.dto.QuestionCreateRequest;
import com.expogarden.dto.QuestionDto;
import com.expogarden.repository.BoothRepository;
import com.expogarden.repository.QuestionRepository;
import com.expogarden.repository.UserRepository;
import com.expogarden.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class QuestionService {
    
    private final QuestionRepository questionRepository;
    private final BoothRepository boothRepository;
    private final UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public Page<QuestionDto> getQuestions(Long boothId, Pageable pageable) {
        Page<Question> questions = questionRepository.findByBoothIdAndStatus(
            boothId, ContentStatus.VISIBLE, pageable
        );
        
        return questions.map(this::mapToDto);
    }
    
    @Transactional
    public QuestionDto createQuestion(
        Long boothId,
        QuestionCreateRequest request,
        UserPrincipal principal
    ) {
        Booth booth = boothRepository.findByIdAndNotDeleted(boothId)
            .orElseThrow(() -> new RuntimeException("Booth not found"));
        
        // 권한 체크: 로그인 또는 게스트 허용 여부
        if (principal == null && !booth.getAllowGuestQuestions()) {
            throw new RuntimeException("Guest questions are not allowed for this booth");
        }
        
        Question question = Question.builder()
            .boothId(boothId)
            .userId(principal != null ? principal.getId() : null)
            .guestSessionId(principal == null ? request.getGuestSessionId() : null)
            .content(request.getContent())
            .status(ContentStatus.VISIBLE)
            .build();
        
        question = questionRepository.save(question);
        
        return mapToDto(question);
    }
    
    private QuestionDto mapToDto(Question question) {
        User user = question.getUserId() != null 
            ? userRepository.findById(question.getUserId()).orElse(null)
            : null;
        
        return QuestionDto.builder()
            .id(question.getId())
            .boothId(question.getBoothId())
            .userId(question.getUserId())
            .userNickname(user != null ? user.getNickname() : "게스트")
            .guestSessionId(question.getGuestSessionId())
            .content(question.getContent())
            .status(question.getStatus().name())
            .createdAt(question.getCreatedAt())
            .build();
    }
}

