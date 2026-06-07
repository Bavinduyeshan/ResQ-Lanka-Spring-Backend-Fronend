package com.Sl_Disaster_Management.diaster_management.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

public class RouteDTOs {

    @Data
    public static class RouteRequest {
        @NotBlank(message = "Source district is required")
        private String source;

        @NotBlank(message = "Destination district is required")
        private String destination;
    }

    @Data
    public static class RouteResponse {
        private String source;
        private String destination;
        private List<String> path;
        private double totalDistanceKm;
        private int numberOfStops;
        private boolean pathFound;
        private String message;
        private List<RouteSegment> segments;
    }

    @Data
    public static class RouteSegment {
        private String from;
        private String to;
        private double distanceKm;
    }
}