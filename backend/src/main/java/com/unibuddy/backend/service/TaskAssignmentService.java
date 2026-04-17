package com.unibuddy.backend.service;

import com.unibuddy.backend.model.TaskAssignment;
import com.unibuddy.backend.repository.TaskAssignmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskAssignmentService {

    private final TaskAssignmentRepository taskAssignmentRepository;

    public TaskAssignmentService(TaskAssignmentRepository taskAssignmentRepository) {
        this.taskAssignmentRepository = taskAssignmentRepository;
    }

    public TaskAssignment create(String universityId, TaskAssignment task) {
        task.setId(null);
        task.setUniversityId(universityId);
        return taskAssignmentRepository.save(task);
    }

    public List<TaskAssignment> getAll(String universityId) {
        return taskAssignmentRepository.findByUniversityIdOrderByDueDateTimeAsc(universityId);
    }

    public TaskAssignment update(String universityId, Long id, TaskAssignment incoming) {
        TaskAssignment existing = taskAssignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found: " + id));
        if (!existing.getUniversityId().trim().equalsIgnoreCase(universityId.trim())) {
            throw new RuntimeException("Unauthorized Access: You are only permitted to update your own tasks.");
        }

        existing.setTitle(incoming.getTitle());
        existing.setModuleCode(incoming.getModuleCode());
        existing.setDueDateTime(incoming.getDueDateTime());
        existing.setStatus(incoming.getStatus());
        existing.setNotes(incoming.getNotes());
        return taskAssignmentRepository.save(existing);
    }

    public void delete(String universityId, Long id) {
        TaskAssignment existing = taskAssignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found: " + id));
        if (!existing.getUniversityId().trim().equalsIgnoreCase(universityId.trim())) {
            throw new RuntimeException("Unauthorized Access: You are only permitted to delete your own tasks.");
        }
        taskAssignmentRepository.deleteById(id);
    }
}
