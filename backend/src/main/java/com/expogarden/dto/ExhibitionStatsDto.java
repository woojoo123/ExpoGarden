package com.expogarden.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExhibitionStatsDto {
    private Long exhibitionId;
    private String exhibitionTitle;
    private Long totalViews;
    private Long uniqueVisitors;
    private Long totalBooths;
    private List<BoothStatsDto> topBooths;
}

