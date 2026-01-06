package com.expogarden.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoothStatsDto {
    private Long boothId;
    private String boothTitle;
    private Long totalViews;
    private Long uniqueVisitors;
    private Long clickEvents;
    private Long videoPlays;
}

