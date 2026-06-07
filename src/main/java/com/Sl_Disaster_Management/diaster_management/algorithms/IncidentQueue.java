package com.Sl_Disaster_Management.diaster_management.algorithms;



import com.Sl_Disaster_Management.diaster_management.model.Incident;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Custom FIFO Queue implemented using a Linked List.
 * Used for incoming emergency request handling.
 * This is a core DSA requirement for the coursework.
 */
@Component
public class IncidentQueue {

    /**
     * Inner Node class for linked list structure
     */
    private static class Node {
        Incident data;
        Node next;

        Node(Incident data) {
            this.data = data;
            this.next = null;
        }
    }

    private Node front;  // Points to front (dequeue from here)
    private Node rear;   // Points to rear (enqueue here)
    private int size;

    public IncidentQueue() {
        this.front = null;
        this.rear = null;
        this.size = 0;
    }

    /**
     * Enqueue: Add incident to the back of the queue
     * Time Complexity: O(1)
     */
    public void enqueue(Incident incident) {
        Node newNode = new Node(incident);
        if (rear == null) {
            front = newNode;
            rear = newNode;
        } else {
            rear.next = newNode;
            rear = newNode;
        }
        size++;
    }

    /**
     * Dequeue: Remove and return the front incident (FIFO)
     * Time Complexity: O(1)
     */
    public Incident dequeue() {
        if (isEmpty()) return null;
        Incident data = front.data;
        front = front.next;
        if (front == null) rear = null;
        size--;
        return data;
    }

    /**
     * Peek: View front incident without removing
     * Time Complexity: O(1)
     */
    public Incident peek() {
        if (isEmpty()) return null;
        return front.data;
    }

    /**
     * Get all incidents in queue order (front to back)
     * Time Complexity: O(n)
     */
    public List<Incident> getAllInQueue() {
        List<Incident> result = new ArrayList<>();
        Node current = front;
        while (current != null) {
            result.add(current.data);
            current = current.next;
        }
        return result;
    }

    /**
     * Remove a specific incident by ID
     * Time Complexity: O(n)
     */
    public boolean remove(Long incidentId) {
        if (isEmpty()) return false;

        if (front.data.getId().equals(incidentId)) {
            dequeue();
            return true;
        }

        Node current = front;
        while (current.next != null) {
            if (current.next.data.getId().equals(incidentId)) {
                if (current.next == rear) {
                    rear = current;
                }
                current.next = current.next.next;
                size--;
                return true;
            }
            current = current.next;
        }
        return false;
    }

    public boolean isEmpty() {
        return front == null;
    }

    public int size() {
        return size;
    }

    public void clear() {
        front = null;
        rear = null;
        size = 0;
    }
}