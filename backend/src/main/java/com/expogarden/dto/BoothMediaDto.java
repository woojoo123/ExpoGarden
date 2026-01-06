package com.expogarden.dto;

import com.expogarden.domain.MediaType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoothMediaDto {
    private Long id;
    private MediaType type;
    private String url;
    private String title;
    private Integer sortOrder;
}

