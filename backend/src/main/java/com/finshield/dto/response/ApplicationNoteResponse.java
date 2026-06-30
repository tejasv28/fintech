package com.finshield.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ApplicationNoteResponse {
    private UUID id;
    private String authorName;
    private String content;
    private LocalDateTime createdAt;
}
