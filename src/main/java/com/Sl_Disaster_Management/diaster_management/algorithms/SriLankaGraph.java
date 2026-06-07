package com.Sl_Disaster_Management.diaster_management.algorithms;



import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Sri Lanka Districts Graph with Adjacency List representation.
 * Implements Dijkstra's Shortest Path Algorithm for route planning.
 * This is a core DSA requirement for the coursework.
 */
@Component
public class SriLankaGraph {

    // ========== INNER CLASSES ==========

    public static class Edge {
        public String destination;
        public double distance; // in kilometers

        public Edge(String destination, double distance) {
            this.destination = destination;
            this.distance = distance;
        }
    }

    public static class RouteResult {
        private List<String> path;
        private double totalDistance;
        private boolean pathFound;
        private String message;

        public RouteResult(List<String> path, double totalDistance, boolean pathFound, String message) {
            this.path = path;
            this.totalDistance = totalDistance;
            this.pathFound = pathFound;
            this.message = message;
        }

        // Getters
        public List<String> getPath() { return path; }
        public double getTotalDistance() { return totalDistance; }
        public boolean isPathFound() { return pathFound; }
        public String getMessage() { return message; }
    }

    // Adjacency List: district -> list of edges
    private final Map<String, List<Edge>> adjacencyList;

    public SriLankaGraph() {
        this.adjacencyList = new HashMap<>();
        buildSriLankaGraph();
    }

    /**
     * Build the Sri Lanka district road network graph.
     * Distances are approximate road distances in km.
     */
    private void buildSriLankaGraph() {
        // Initialize all districts
        String[] districts = {
                "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale",
                "Nuwara Eliya", "Galle", "Matara", "Hambantota", "Jaffna",
                "Killinochchi", "Mannar", "Vavuniya", "Mullaitivu", "Trincomalee",
                "Batticaloa", "Ampara", "Kurunegala", "Puttalam", "Anuradhapura",
                "Polonnaruwa", "Badulla", "Moneragala", "Ratnapura", "Kegalle"
        };

        for (String d : districts) {
            adjacencyList.put(d, new ArrayList<>());
        }

        // Western Province connections
        addEdge("Colombo", "Gampaha", 35);
        addEdge("Colombo", "Kalutara", 45);
        addEdge("Colombo", "Kegalle", 85);
        addEdge("Gampaha", "Kurunegala", 95);
        addEdge("Gampaha", "Puttalam", 110);
        addEdge("Kalutara", "Ratnapura", 65);
        addEdge("Kalutara", "Galle", 90);

        // Central Province connections
        addEdge("Colombo", "Kandy", 115);
        addEdge("Kandy", "Matale", 26);
        addEdge("Kandy", "Nuwara Eliya", 75);
        addEdge("Kandy", "Kegalle", 45);
        addEdge("Kandy", "Kurunegala", 65);
        addEdge("Nuwara Eliya", "Badulla", 65);
        addEdge("Nuwara Eliya", "Ratnapura", 80);
        addEdge("Matale", "Dambulla", 25);
        addEdge("Matale", "Anuradhapura", 120);

        // Southern Province connections
        addEdge("Galle", "Matara", 45);
        addEdge("Matara", "Hambantota", 75);
        addEdge("Hambantota", "Moneragala", 95);
        addEdge("Ratnapura", "Galle", 110);
        addEdge("Ratnapura", "Moneragala", 95);
        addEdge("Ratnapura", "Kegalle", 50);
        addEdge("Badulla", "Moneragala", 55);
        addEdge("Badulla", "Ampara", 80);

        // North Central Province
        addEdge("Anuradhapura", "Kurunegala", 95);
        addEdge("Anuradhapura", "Puttalam", 90);
        addEdge("Anuradhapura", "Vavuniya", 100);
        addEdge("Anuradhapura", "Polonnaruwa", 95);
        addEdge("Anuradhapura", "Trincomalee", 175);
        addEdge("Polonnaruwa", "Trincomalee", 110);
        addEdge("Polonnaruwa", "Batticaloa", 100);
        addEdge("Polonnaruwa", "Matale", 80);

        // Northern Province connections
        addEdge("Jaffna", "Killinochchi", 60);
        addEdge("Killinochchi", "Mannar", 90);
        addEdge("Killinochchi", "Mullaitivu", 75);
        addEdge("Killinochchi", "Vavuniya", 90);
        addEdge("Vavuniya", "Mannar", 85);
        addEdge("Vavuniya", "Mullaitivu", 110);
        addEdge("Mullaitivu", "Trincomalee", 110);

        // Eastern Province
        addEdge("Trincomalee", "Batticaloa", 110);
        addEdge("Batticaloa", "Ampara", 55);
        addEdge("Ampara", "Moneragala", 110);

        // North Western
        addEdge("Kurunegala", "Puttalam", 60);
        addEdge("Kegalle", "Kurunegala", 65);
        addEdge("Kegalle", "Colombo", 85);
    }

    /**
     * Add bidirectional edge between two districts
     */
    public void addEdge(String from, String to, double distance) {
        adjacencyList.computeIfAbsent(from, k -> new ArrayList<>()).add(new Edge(to, distance));
        adjacencyList.computeIfAbsent(to, k -> new ArrayList<>()).add(new Edge(from, distance));
    }

    /**
     * Dijkstra's Shortest Path Algorithm
     * Time Complexity: O((V + E) log V) with priority queue
     *
     * @param source      Starting district
     * @param destination Destination district
     * @return RouteResult containing the path and total distance
     */
    public RouteResult dijkstra(String source, String destination) {
        if (!adjacencyList.containsKey(source)) {
            return new RouteResult(null, 0, false, "Source district not found: " + source);
        }
        if (!adjacencyList.containsKey(destination)) {
            return new RouteResult(null, 0, false, "Destination district not found: " + destination);
        }
        if (source.equals(destination)) {
            return new RouteResult(List.of(source), 0, true, "Already at destination");
        }

        // Distance map: district -> shortest known distance from source
        Map<String, Double> dist = new HashMap<>();
        // Previous node map for path reconstruction
        Map<String, String> prev = new HashMap<>();
        // Priority Queue: [distance, district]
        PriorityQueue<double[]> pq = new PriorityQueue<>(Comparator.comparingDouble(a -> a[0]));
        // Map district name to numeric index for PQ
        Map<String, Integer> indexMap = new HashMap<>();
        Map<Integer, String> reverseIndexMap = new HashMap<>();

        int idx = 0;
        for (String district : adjacencyList.keySet()) {
            dist.put(district, Double.MAX_VALUE);
            prev.put(district, null);
            indexMap.put(district, idx);
            reverseIndexMap.put(idx, district);
            idx++;
        }

        dist.put(source, 0.0);
        pq.offer(new double[]{0.0, indexMap.get(source)});

        Set<String> visited = new HashSet<>();

        while (!pq.isEmpty()) {
            double[] current = pq.poll();
            double currentDist = current[0];
            String currentDistrict = reverseIndexMap.get((int) current[1]);

            if (currentDistrict == null || visited.contains(currentDistrict)) continue;
            visited.add(currentDistrict);

            if (currentDistrict.equals(destination)) break;

            List<Edge> neighbors = adjacencyList.getOrDefault(currentDistrict, new ArrayList<>());
            for (Edge edge : neighbors) {
                if (visited.contains(edge.destination)) continue;
                double newDist = currentDist + edge.distance;
                if (newDist < dist.getOrDefault(edge.destination, Double.MAX_VALUE)) {
                    dist.put(edge.destination, newDist);
                    prev.put(edge.destination, currentDistrict);
                    if (indexMap.containsKey(edge.destination)) {
                        pq.offer(new double[]{newDist, indexMap.get(edge.destination)});
                    }
                }
            }
        }

        // Reconstruct path
        if (dist.get(destination) == Double.MAX_VALUE) {
            return new RouteResult(null, 0, false, "No path found between " + source + " and " + destination);
        }

        List<String> path = new ArrayList<>();
        String step = destination;
        while (step != null) {
            path.add(0, step);
            step = prev.get(step);
        }

        return new RouteResult(
                path,
                dist.get(destination),
                true,
                String.format("Shortest route from %s to %s: %.1f km via %d stops", source, destination, dist.get(destination), path.size())
        );
    }

    /**
     * Get all available districts
     */
    public List<String> getAllDistricts() {
        return new ArrayList<>(adjacencyList.keySet()).stream().sorted().toList();
    }

    /**
     * Get neighbors of a district
     */
    public List<Edge> getNeighbors(String district) {
        return adjacencyList.getOrDefault(district, new ArrayList<>());
    }
}