package com.Sl_Disaster_Management.diaster_management.algorithms;



import com.Sl_Disaster_Management.diaster_management.model.Incident;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Custom Max Heap implementation for Incident Priority Queue.
 * Priority is determined by: severity × affectedPeople
 * This is a core DSA requirement for the coursework.
 */
@Component
public class IncidentMaxHeap {

    private final List<Incident> heap;

    public IncidentMaxHeap() {
        this.heap = new ArrayList<>();
    }

    // ========== HEAP OPERATIONS ==========

    /**
     * Insert incident into the max heap
     * Time Complexity: O(log n)
     */
    public void insert(Incident incident) {
        heap.add(incident);
        heapifyUp(heap.size() - 1);
    }

    /**
     * Extract (remove & return) the highest priority incident
     * Time Complexity: O(log n)
     */
    public Incident extractMax() {
        if (heap.isEmpty()) return null;
        if (heap.size() == 1) return heap.remove(0);

        Incident max = heap.get(0);
        heap.set(0, heap.remove(heap.size() - 1));
        heapifyDown(0);
        return max;
    }

    /**
     * Peek at highest priority incident without removing
     * Time Complexity: O(1)
     */
    public Incident peekMax() {
        if (heap.isEmpty()) return null;
        return heap.get(0);
    }

    /**
     * Remove a specific incident by ID
     * Time Complexity: O(n)
     */
    public boolean remove(Long incidentId) {
        int index = findIndex(incidentId);
        if (index == -1) return false;

        if (index == heap.size() - 1) {
            heap.remove(index);
            return true;
        }

        heap.set(index, heap.remove(heap.size() - 1));
        heapifyDown(index);
        heapifyUp(index);
        return true;
    }

    /**
     * Update an incident's priority (remove + re-insert)
     */
    public void update(Incident incident) {
        remove(incident.getId());
        insert(incident);
    }

    /**
     * Get all incidents in heap order (not sorted)
     */
    public List<Incident> getAllIncidents() {
        return new ArrayList<>(heap);
    }

    /**
     * Get all incidents sorted by priority (highest first)
     * Time Complexity: O(n log n)
     */
    public List<Incident> getSortedByPriority() {
        IncidentMaxHeap tempHeap = new IncidentMaxHeap();
        for (Incident inc : heap) {
            tempHeap.insert(inc);
        }
        List<Incident> sorted = new ArrayList<>();
        Incident inc;
        while ((inc = tempHeap.extractMax()) != null) {
            sorted.add(inc);
        }
        return sorted;
    }

    public int size() {
        return heap.size();
    }

    public boolean isEmpty() {
        return heap.isEmpty();
    }

    public void clear() {
        heap.clear();
    }

    public boolean contains(Long incidentId) {
        return findIndex(incidentId) != -1;
    }

    // ========== PRIVATE HELPERS ==========

    private double getPriority(Incident incident) {
        if (incident.getPriorityScore() != null) return incident.getPriorityScore();
        int sev = incident.getSeverity() != null ? incident.getSeverity() : 0;
        int aff = incident.getAffectedPeople() != null ? incident.getAffectedPeople() : 0;
        return (double) (sev * aff);
    }

    private void heapifyUp(int index) {
        while (index > 0) {
            int parent = (index - 1) / 2;
            if (getPriority(heap.get(index)) > getPriority(heap.get(parent))) {
                swap(index, parent);
                index = parent;
            } else {
                break;
            }
        }
    }

    private void heapifyDown(int index) {
        int size = heap.size();
        while (true) {
            int largest = index;
            int left = 2 * index + 1;
            int right = 2 * index + 2;

            if (left < size && getPriority(heap.get(left)) > getPriority(heap.get(largest))) {
                largest = left;
            }
            if (right < size && getPriority(heap.get(right)) > getPriority(heap.get(largest))) {
                largest = right;
            }

            if (largest != index) {
                swap(index, largest);
                index = largest;
            } else {
                break;
            }
        }
    }

    private void swap(int i, int j) {
        Incident temp = heap.get(i);
        heap.set(i, heap.get(j));
        heap.set(j, temp);
    }

    private int findIndex(Long incidentId) {
        for (int i = 0; i < heap.size(); i++) {
            if (heap.get(i).getId().equals(incidentId)) return i;
        }
        return -1;
    }
}