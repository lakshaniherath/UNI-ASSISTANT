package com.unibuddy.backend.controller;

import com.unibuddy.backend.model.TaskAssignment;
import com.unibuddy.backend.service.TaskAssignmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskAssignmentService taskAssignmentService;

    public TaskController(TaskAssignmentService taskAssignmentService) {
        this.taskAssignmentService = taskAssignmentService;
    }

    @PostMapping
    public ResponseEntity<TaskAssignment> create(
            @RequestParam String universityId,
            @RequestBody TaskAssignment task) {
        return ResponseEntity.ok(taskAssignmentService.create(universityId, task));
    }

    @GetMapping
    public ResponseEntity<List<TaskAssignment>> getAll(@RequestParam String universityId) {
        return ResponseEntity.ok(taskAssignmentService.getAll(universityId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskAssignment> update(
            @RequestParam String universityId,
            @PathVariable Long id,
            @RequestBody TaskAssignment task) {
        return ResponseEntity.ok(taskAssignmentService.update(universityId, id, task));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@RequestParam String universityId, @PathVariable Long id) {
        taskAssignmentService.delete(universityId, id);
        return ResponseEntity.noContent().build();
    }
}
