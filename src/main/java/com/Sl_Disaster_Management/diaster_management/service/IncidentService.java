package com.Sl_Disaster_Management.diaster_management.service;



import com.Sl_Disaster_Management.diaster_management.algorithms.ActionStack;
import com.Sl_Disaster_Management.diaster_management.algorithms.IncidentMaxHeap;
import com.Sl_Disaster_Management.diaster_management.algorithms.IncidentQueue;
import com.Sl_Disaster_Management.diaster_management.dto.IncidentDTOs;
import com.Sl_Disaster_Management.diaster_management.model.*;
import com.Sl_Disaster_Management.diaster_management.repository.ActionHistoryRepository;
import com.Sl_Disaster_Management.diaster_management.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class IncidentService {

    @Autowired private IncidentRepository incidentRepository;
    @Autowired private ActionHistoryRepository actionHistoryRepository;
    @Autowired private IncidentMaxHeap incidentMaxHeap;
    @Autowired private IncidentQueue incidentQueue;
    @Autowired private ActionStack actionStack;

    /**
     * Create a new incident.
     * Also inserts into the Priority Heap and FIFO Queue.
     */
    @Transactional
    public IncidentDTOs.IncidentResponse createIncident(IncidentDTOs.IncidentRequest request) {
        Incident incident = Incident.builder()
                .disasterType(request.getDisasterType())
                .district(request.getDistrict())
                .severity(request.getSeverity())
                .affectedPeople(request.getAffectedPeople())
                .description(request.getDescription())
                .location(request.getLocation())
                .status(request.getStatus() != null ? request.getStatus() : Incident.Status.ACTIVE)
                .build();

        Incident saved = incidentRepository.save(incident);

        // Insert into DSA structures
        incidentMaxHeap.insert(saved);
        incidentQueue.enqueue(saved);

        // Log to action stack and DB
        logAction(ActionHistory.ActionType.INCIDENT_CREATE, "Incident", saved.getId(),
                "Created incident: " + saved.getDisasterType() + " in " + saved.getDistrict(), null, saved.toString());

        return IncidentDTOs.IncidentResponse.fromEntity(saved);
    }

    public List<IncidentDTOs.IncidentResponse> getAllIncidents() {
        return incidentRepository.findAll()
                .stream()
                .map(IncidentDTOs.IncidentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public IncidentDTOs.IncidentResponse getIncidentById(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found with id: " + id));
        return IncidentDTOs.IncidentResponse.fromEntity(incident);
    }

    @Transactional
    public IncidentDTOs.IncidentResponse updateIncident(Long id, IncidentDTOs.IncidentRequest request) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found with id: " + id));

        String previousState = incident.toString();

        incident.setDisasterType(request.getDisasterType());
        incident.setDistrict(request.getDistrict());
        incident.setSeverity(request.getSeverity());
        incident.setAffectedPeople(request.getAffectedPeople());
        incident.setDescription(request.getDescription());
        incident.setLocation(request.getLocation());
        if (request.getStatus() != null) incident.setStatus(request.getStatus());

        Incident updated = incidentRepository.save(incident);

        // Update in heap (remove old, insert updated)
        incidentMaxHeap.update(updated);

        logAction(ActionHistory.ActionType.INCIDENT_UPDATE, "Incident", id,
                "Updated incident: " + updated.getDisasterType(), previousState, updated.toString());

        return IncidentDTOs.IncidentResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteIncident(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found with id: " + id));

        String previousState = incident.toString();

        incidentMaxHeap.remove(id);
        incidentQueue.remove(id);
        incidentRepository.deleteById(id);

        logAction(ActionHistory.ActionType.INCIDENT_DELETE, "Incident", id,
                "Deleted incident: " + incident.getDisasterType() + " from " + incident.getDistrict(),
                previousState, null);
    }

    public List<IncidentDTOs.IncidentResponse> filterIncidents(String district, Incident.Status status, Integer minSeverity) {
        return incidentRepository.filterIncidents(district, status, minSeverity)
                .stream()
                .map(IncidentDTOs.IncidentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<IncidentDTOs.IncidentResponse> searchByDisasterType(String type) {
        return incidentRepository.findByDisasterTypeContainingIgnoreCase(type)
                .stream()
                .map(IncidentDTOs.IncidentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // ========== PRIORITY QUEUE (HEAP) OPERATIONS ==========

    public List<IncidentDTOs.IncidentResponse> getPriorityQueue() {
        return incidentMaxHeap.getSortedByPriority()
                .stream()
                .map(IncidentDTOs.IncidentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public IncidentDTOs.IncidentResponse peekHighestPriority() {
        Incident top = incidentMaxHeap.peekMax();
        return top != null ? IncidentDTOs.IncidentResponse.fromEntity(top) : null;
    }

    public IncidentDTOs.IncidentResponse extractHighestPriority() {
        Incident top = incidentMaxHeap.extractMax();
        return top != null ? IncidentDTOs.IncidentResponse.fromEntity(top) : null;
    }

    public int getPriorityQueueSize() {
        return incidentMaxHeap.size();
    }

    // ========== QUEUE (FIFO) OPERATIONS ==========

    public List<IncidentDTOs.IncidentResponse> getIncidentQueue() {
        return incidentQueue.getAllInQueue()
                .stream()
                .map(IncidentDTOs.IncidentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public IncidentDTOs.IncidentResponse dequeueIncident() {
        Incident dequeued = incidentQueue.dequeue();
        return dequeued != null ? IncidentDTOs.IncidentResponse.fromEntity(dequeued) : null;
    }

    public IncidentDTOs.IncidentResponse peekQueue() {
        Incident front = incidentQueue.peek();
        return front != null ? IncidentDTOs.IncidentResponse.fromEntity(front) : null;
    }

    // ========== REFRESH HEAP FROM DB ==========

    @Transactional(readOnly = true)
    public void refreshHeapFromDatabase() {
        incidentMaxHeap.clear();
        incidentQueue.clear();
        List<Incident> activeIncidents = incidentRepository.findByStatus(Incident.Status.ACTIVE);
        for (Incident incident : activeIncidents) {
            incidentMaxHeap.insert(incident);
            incidentQueue.enqueue(incident);
        }
    }

    // ========== PRIVATE HELPERS ==========

    private void logAction(ActionHistory.ActionType type, String entityType, Long entityId,
                           String description, String previousState, String newState) {
        String username = "system";
        try {
            username = SecurityContextHolder.getContext().getAuthentication().getName();
        } catch (Exception ignored) {}

        ActionHistory action = ActionHistory.builder()
                .actionType(type)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .performedBy(username)
                .previousState(previousState)
                .newState(newState)
                .undone(false)
                .build();

        actionHistoryRepository.save(action);
        actionStack.push(action);
    }
}
