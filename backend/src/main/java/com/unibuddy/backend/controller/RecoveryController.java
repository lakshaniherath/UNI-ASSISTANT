package com.unibuddy.backend.controller;

import com.unibuddy.backend.dto.RecoveryPlanDTO;
import com.unibuddy.backend.model.RecoveryPlan;
import com.unibuddy.backend.repository.RecoveryPlanRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recovery")
@CrossOrigin(origins = "*")
public class RecoveryController {

    private final RecoveryPlanRepository repository;

    public RecoveryController(RecoveryPlanRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<RecoveryPlanDTO> savePlan(@RequestBody RecoveryPlanDTO dto) {
        RecoveryPlan plan = new RecoveryPlan();
        BeanUtils.copyProperties(dto, plan);
        RecoveryPlan saved = repository.save(plan);
        RecoveryPlanDTO result = new RecoveryPlanDTO();
        BeanUtils.copyProperties(saved, result);
        return ResponseEntity.ok(result);
    }

    @GetMapping
    public ResponseEntity<List<RecoveryPlanDTO>> getPlans(@RequestParam String universityId) {
        List<RecoveryPlan> plans = repository.findByUniversityId(universityId);
        List<RecoveryPlanDTO> dtos = plans.stream().map(p -> {
            RecoveryPlanDTO dto = new RecoveryPlanDTO();
            BeanUtils.copyProperties(p, dto);
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
