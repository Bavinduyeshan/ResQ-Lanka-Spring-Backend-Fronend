package com.Sl_Disaster_Management.diaster_management.service;


import com.Sl_Disaster_Management.diaster_management.model.ActionHistory;
import com.Sl_Disaster_Management.diaster_management.algorithms.ActionStack;
import com.Sl_Disaster_Management.diaster_management.repository.ActionHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class ActionHistoryService {

    @Autowired private ActionHistoryRepository actionHistoryRepository;
    @Autowired private ActionStack actionStack;

    public List<ActionHistory> getRecentActions(int limit) {
        return actionHistoryRepository.findRecentActions(PageRequest.of(0, limit));
    }

    public List<ActionHistory> getStackHistory() {
        return actionStack.getHistory();
    }

    public ActionHistory peekLastAction() {
        return actionStack.peek();
    }

    @Transactional
    public ActionHistory undoLastAction() {
        ActionHistory last = actionStack.pop();
        if (last == null) return null;

        last.setUndone(true);
        actionHistoryRepository.save(last);
        return last;
    }

    public int getStackSize() {
        return actionStack.size();
    }

    public List<ActionHistory> getUndoableActions() {
        return actionHistoryRepository.findUndoableActions(PageRequest.of(0, 20));
    }

    public Map<String, Object> getStackInfo() {
        return Map.of(
                "stackSize", actionStack.size(),
                "topAction", actionStack.peek() != null ? actionStack.peek().getDescription() : "empty",
                "history", actionStack.getLastN(10)
        );
    }
}