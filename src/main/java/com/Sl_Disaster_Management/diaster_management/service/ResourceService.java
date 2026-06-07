package com.Sl_Disaster_Management.diaster_management.service;



import com.Sl_Disaster_Management.diaster_management.dto.ResourceDTOs;
import com.Sl_Disaster_Management.diaster_management.model.ActionHistory;
import com.Sl_Disaster_Management.diaster_management.algorithms.ActionStack;
import com.Sl_Disaster_Management.diaster_management.model.Incident;
import com.Sl_Disaster_Management.diaster_management.model.Resource;
import com.Sl_Disaster_Management.diaster_management.repository.ActionHistoryRepository;
import com.Sl_Disaster_Management.diaster_management.repository.IncidentRepository;
import com.Sl_Disaster_Management.diaster_management.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    @Autowired private ResourceRepository resourceRepository;
    @Autowired private IncidentRepository incidentRepository;
    @Autowired private ActionHistoryRepository actionHistoryRepository;
    @Autowired private ActionStack actionStack;

    public List<ResourceDTOs.ResourceResponse> getAllResources() {
        return resourceRepository.findAll()
                .stream()
                .map(ResourceDTOs.ResourceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ResourceDTOs.ResourceResponse getById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found: " + id));
        return ResourceDTOs.ResourceResponse.fromEntity(resource);
    }

    @Transactional
    public ResourceDTOs.ResourceResponse createResource(ResourceDTOs.ResourceRequest request) {
        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .status(request.getStatus() != null ? request.getStatus() : Resource.ResourceStatus.AVAILABLE)
                .district(request.getDistrict())
                .quantity(request.getQuantity() != null ? request.getQuantity() : 1)
                .notes(request.getNotes())
                .build();

        Resource saved = resourceRepository.save(resource);
        logAction(ActionHistory.ActionType.RESOURCE_CREATE, saved.getId(),
                "Created resource: " + saved.getName() + " (" + saved.getType() + ")");
        return ResourceDTOs.ResourceResponse.fromEntity(saved);
    }

    @Transactional
    public ResourceDTOs.ResourceResponse updateResource(Long id, ResourceDTOs.ResourceRequest request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found: " + id));

        resource.setName(request.getName());
        resource.setType(request.getType());
        if (request.getStatus() != null) resource.setStatus(request.getStatus());
        resource.setDistrict(request.getDistrict());
        if (request.getQuantity() != null) resource.setQuantity(request.getQuantity());
        resource.setNotes(request.getNotes());

        Resource updated = resourceRepository.save(resource);
        logAction(ActionHistory.ActionType.RESOURCE_UPDATE, id,
                "Updated resource: " + updated.getName());
        return ResourceDTOs.ResourceResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteResource(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found: " + id));
        resourceRepository.deleteById(id);
        logAction(ActionHistory.ActionType.RESOURCE_DELETE, id,
                "Deleted resource: " + resource.getName());
    }

    @Transactional
    public ResourceDTOs.ResourceResponse assignToIncident(Long resourceId, Long incidentId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found: " + resourceId));
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found: " + incidentId));

        resource.setAssignedIncident(incident);
        resource.setStatus(Resource.ResourceStatus.ASSIGNED);
        Resource saved = resourceRepository.save(resource);

        logAction(ActionHistory.ActionType.RESOURCE_ASSIGN, resourceId,
                "Assigned resource " + resource.getName() + " to incident #" + incidentId);
        return ResourceDTOs.ResourceResponse.fromEntity(saved);
    }

    @Transactional
    public ResourceDTOs.ResourceResponse unassignFromIncident(Long resourceId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found: " + resourceId));
        resource.setAssignedIncident(null);
        resource.setStatus(Resource.ResourceStatus.AVAILABLE);
        return ResourceDTOs.ResourceResponse.fromEntity(resourceRepository.save(resource));
    }

    public List<ResourceDTOs.ResourceResponse> getByStatus(Resource.ResourceStatus status) {
        return resourceRepository.findByStatus(status)
                .stream().map(ResourceDTOs.ResourceResponse::fromEntity).collect(Collectors.toList());
    }

    public List<ResourceDTOs.ResourceResponse> getByType(Resource.ResourceType type) {
        return resourceRepository.findByType(type)
                .stream().map(ResourceDTOs.ResourceResponse::fromEntity).collect(Collectors.toList());
    }

    public List<ResourceDTOs.ResourceResponse> getByIncident(Long incidentId) {
        return resourceRepository.findByAssignedIncidentId(incidentId)
                .stream().map(ResourceDTOs.ResourceResponse::fromEntity).collect(Collectors.toList());
    }

    private void logAction(ActionHistory.ActionType type, Long entityId, String description) {
        String username = "system";
        try { username = SecurityContextHolder.getContext().getAuthentication().getName(); } catch (Exception ignored) {}
        ActionHistory action = ActionHistory.builder()
                .actionType(type).entityType("Resource").entityId(entityId)
                .description(description).performedBy(username).undone(false).build();
        actionHistoryRepository.save(action);
        actionStack.push(action);
    }
}