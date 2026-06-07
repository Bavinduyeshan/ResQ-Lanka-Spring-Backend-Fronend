package com.Sl_Disaster_Management.diaster_management.controller;



import com.Sl_Disaster_Management.diaster_management.dto.IncidentDTOs;
import com.Sl_Disaster_Management.diaster_management.model.Incident;
import com.Sl_Disaster_Management.diaster_management.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = "*", maxAge = 3600)
public class IncidentController {

    @Autowired
    private IncidentService incidentService;

    // ===== CRUD =====

    @GetMapping
    public ResponseEntity<List<IncidentDTOs.IncidentResponse>> getAllIncidents() {
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentDTOs.IncidentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getIncidentById(id));
    }

    @PostMapping
    public ResponseEntity<IncidentDTOs.IncidentResponse> create(
            @Valid @RequestBody IncidentDTOs.IncidentRequest request) {
        return ResponseEntity.ok(incidentService.createIncident(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncidentDTOs.IncidentResponse> update(
            @PathVariable Long id, @Valid @RequestBody IncidentDTOs.IncidentRequest request) {
        return ResponseEntity.ok(incidentService.updateIncident(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        incidentService.deleteIncident(id);
        return ResponseEntity.ok(Map.of("message", "Incident deleted successfully"));
    }

    // ===== FILTER & SEARCH =====

    @GetMapping("/filter")
    public ResponseEntity<List<IncidentDTOs.IncidentResponse>> filter(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) Incident.Status status,
            @RequestParam(required = false) Integer minSeverity) {
        return ResponseEntity.ok(incidentService.filterIncidents(district, status, minSeverity));
    }

    @GetMapping("/search")
    public ResponseEntity<List<IncidentDTOs.IncidentResponse>> search(
            @RequestParam String type) {
        return ResponseEntity.ok(incidentService.searchByDisasterType(type));
    }

    // ===== PRIORITY QUEUE (MAX HEAP) =====

    @GetMapping("/priority-queue")
    public ResponseEntity<List<IncidentDTOs.IncidentResponse>> getPriorityQueue() {
        return ResponseEntity.ok(incidentService.getPriorityQueue());
    }

    @GetMapping("/priority-queue/peek")
    public ResponseEntity<?> peekHighestPriority() {
        IncidentDTOs.IncidentResponse top = incidentService.peekHighestPriority();
        if (top == null) return ResponseEntity.ok(Map.of("message", "Priority queue is empty"));
        return ResponseEntity.ok(top);
    }

    @PostMapping("/priority-queue/extract")
    public ResponseEntity<?> extractHighestPriority() {
        IncidentDTOs.IncidentResponse top = incidentService.extractHighestPriority();
        if (top == null) return ResponseEntity.ok(Map.of("message", "Priority queue is empty"));
        return ResponseEntity.ok(top);
    }

    @GetMapping("/priority-queue/size")
    public ResponseEntity<Map<String, Integer>> getPriorityQueueSize() {
        return ResponseEntity.ok(Map.of("size", incidentService.getPriorityQueueSize()));
    }

    // ===== FIFO QUEUE =====

    @GetMapping("/queue")
    public ResponseEntity<List<IncidentDTOs.IncidentResponse>> getQueue() {
        return ResponseEntity.ok(incidentService.getIncidentQueue());
    }

    @PostMapping("/queue/dequeue")
    public ResponseEntity<?> dequeue() {
        IncidentDTOs.IncidentResponse dequeued = incidentService.dequeueIncident();
        if (dequeued == null) return ResponseEntity.ok(Map.of("message", "Queue is empty"));
        return ResponseEntity.ok(dequeued);
    }

    @GetMapping("/queue/peek")
    public ResponseEntity<?> peekQueue() {
        IncidentDTOs.IncidentResponse front = incidentService.peekQueue();
        if (front == null) return ResponseEntity.ok(Map.of("message", "Queue is empty"));
        return ResponseEntity.ok(front);
    }

    // ===== UTILITY =====

    @PostMapping("/refresh-heap")
    public ResponseEntity<Map<String, String>> refreshHeap() {
        incidentService.refreshHeapFromDatabase();
        return ResponseEntity.ok(Map.of("message", "Heap and queue refreshed from database"));
    }
}