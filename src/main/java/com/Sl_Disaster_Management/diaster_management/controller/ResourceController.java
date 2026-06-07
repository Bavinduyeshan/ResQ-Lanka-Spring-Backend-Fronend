package com.Sl_Disaster_Management.diaster_management.controller;



import com.Sl_Disaster_Management.diaster_management.dto.ResourceDTOs;
import com.Sl_Disaster_Management.diaster_management.model.Resource;
import com.Sl_Disaster_Management.diaster_management.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<ResourceDTOs.ResourceResponse>> getAll() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceDTOs.ResourceResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ResourceDTOs.ResourceResponse> create(
            @Valid @RequestBody ResourceDTOs.ResourceRequest request) {
        return ResponseEntity.ok(resourceService.createResource(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceDTOs.ResourceResponse> update(
            @PathVariable Long id, @Valid @RequestBody ResourceDTOs.ResourceRequest request) {
        return ResponseEntity.ok(resourceService.updateResource(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok(Map.of("message", "Resource deleted successfully"));
    }

    @PostMapping("/assign")
    public ResponseEntity<ResourceDTOs.ResourceResponse> assignToIncident(
            @Valid @RequestBody ResourceDTOs.ResourceAssignRequest request) {
        return ResponseEntity.ok(resourceService.assignToIncident(request.getResourceId(), request.getIncidentId()));
    }

    @PostMapping("/{id}/unassign")
    public ResponseEntity<ResourceDTOs.ResourceResponse> unassign(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.unassignFromIncident(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ResourceDTOs.ResourceResponse>> getByStatus(
            @PathVariable Resource.ResourceStatus status) {
        return ResponseEntity.ok(resourceService.getByStatus(status));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<ResourceDTOs.ResourceResponse>> getByType(
            @PathVariable Resource.ResourceType type) {
        return ResponseEntity.ok(resourceService.getByType(type));
    }

    @GetMapping("/incident/{incidentId}")
    public ResponseEntity<List<ResourceDTOs.ResourceResponse>> getByIncident(@PathVariable Long incidentId) {
        return ResponseEntity.ok(resourceService.getByIncident(incidentId));
    }
}