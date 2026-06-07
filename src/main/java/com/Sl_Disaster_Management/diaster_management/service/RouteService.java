package com.Sl_Disaster_Management.diaster_management.service;



import com.Sl_Disaster_Management.diaster_management.dto.RouteDTOs;
import com.Sl_Disaster_Management.diaster_management.algorithms.SriLankaGraph;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RouteService {

    @Autowired
    private SriLankaGraph sriLankaGraph;

    /**
     * Calculate shortest path between two districts using Dijkstra's algorithm
     */
    public RouteDTOs.RouteResponse findShortestPath(String source, String destination) {
        SriLankaGraph.RouteResult result = sriLankaGraph.dijkstra(source, destination);

        RouteDTOs.RouteResponse response = new RouteDTOs.RouteResponse();
        response.setSource(source);
        response.setDestination(destination);
        response.setPathFound(result.isPathFound());
        response.setMessage(result.getMessage());

        if (result.isPathFound() && result.getPath() != null) {
            response.setPath(result.getPath());
            response.setTotalDistanceKm(result.getTotalDistance());
            response.setNumberOfStops(result.getPath().size());

            // Build segments (from → to with segment distances)
            List<RouteDTOs.RouteSegment> segments = buildSegments(result.getPath());
            response.setSegments(segments);
        }

        return response;
    }

    /**
     * Get all available districts
     */
    public List<String> getAllDistricts() {
        return sriLankaGraph.getAllDistricts();
    }

    /**
     * Get neighbors of a district (for graph visualization)
     */
    public List<RouteDTOs.RouteSegment> getNeighbors(String district) {
        List<RouteDTOs.RouteSegment> segments = new ArrayList<>();
        for (SriLankaGraph.Edge edge : sriLankaGraph.getNeighbors(district)) {
            RouteDTOs.RouteSegment seg = new RouteDTOs.RouteSegment();
            seg.setFrom(district);
            seg.setTo(edge.destination);
            seg.setDistanceKm(edge.distance);
            segments.add(seg);
        }
        return segments;
    }

    /**
     * Build route segments from path list
     * Approximates segment distances based on total / number of segments
     */
    private List<RouteDTOs.RouteSegment> buildSegments(List<String> path) {
        List<RouteDTOs.RouteSegment> segments = new ArrayList<>();
        for (int i = 0; i < path.size() - 1; i++) {
            String from = path.get(i);
            String to = path.get(i + 1);

            // Get actual distance for this segment
            double segmentDist = sriLankaGraph.getNeighbors(from).stream()
                    .filter(e -> e.destination.equals(to))
                    .mapToDouble(e -> e.distance)
                    .findFirst()
                    .orElse(0.0);

            RouteDTOs.RouteSegment seg = new RouteDTOs.RouteSegment();
            seg.setFrom(from);
            seg.setTo(to);
            seg.setDistanceKm(segmentDist);
            segments.add(seg);
        }
        return segments;
    }
}