package com.unibuddy.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimetableRecoveryResponseDTO {
    private TimetableEventDTO originalEvent;
    private List<TimetableEventDTO> alternatives;
}
