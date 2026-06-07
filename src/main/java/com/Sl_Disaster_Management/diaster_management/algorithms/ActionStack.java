package com.Sl_Disaster_Management.diaster_management.algorithms;



import com.Sl_Disaster_Management.diaster_management.model.ActionHistory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Custom Stack implementation using an array-backed list.
 * Used for the Undo (LIFO) action history system.
 * This is a core DSA requirement for the coursework.
 */
@Component
public class ActionStack {

    private static final int DEFAULT_CAPACITY = 100;

    private final List<ActionHistory> stack;
    private final int maxCapacity;

    public ActionStack() {
        this.stack = new ArrayList<>();
        this.maxCapacity = DEFAULT_CAPACITY;
    }

    public ActionStack(int maxCapacity) {
        this.stack = new ArrayList<>();
        this.maxCapacity = maxCapacity;
    }

    /**
     * Push: Add action to the top of the stack
     * Time Complexity: O(1) amortized
     */
    public void push(ActionHistory action) {
        if (stack.size() >= maxCapacity) {
            // Remove oldest entry (bottom) when at capacity
            stack.remove(0);
        }
        stack.add(action);
    }

    /**
     * Pop: Remove and return the most recent action (LIFO)
     * Time Complexity: O(1)
     */
    public ActionHistory pop() {
        if (isEmpty()) return null;
        return stack.remove(stack.size() - 1);
    }

    /**
     * Peek: View the most recent action without removing
     * Time Complexity: O(1)
     */
    public ActionHistory peek() {
        if (isEmpty()) return null;
        return stack.get(stack.size() - 1);
    }

    /**
     * Get all actions from top to bottom (most recent first)
     * Time Complexity: O(n)
     */
    public List<ActionHistory> getHistory() {
        List<ActionHistory> history = new ArrayList<>();
        for (int i = stack.size() - 1; i >= 0; i--) {
            history.add(stack.get(i));
        }
        return history;
    }

    /**
     * Get last N actions from top
     */
    public List<ActionHistory> getLastN(int n) {
        List<ActionHistory> result = new ArrayList<>();
        int start = Math.max(0, stack.size() - n);
        for (int i = stack.size() - 1; i >= start; i--) {
            result.add(stack.get(i));
        }
        return result;
    }

    public boolean isEmpty() {
        return stack.isEmpty();
    }

    public int size() {
        return stack.size();
    }

    public void clear() {
        stack.clear();
    }
}
