import { Incident, ActionHistory, EmergencyReport } from './types';

// ============================================================
// 1. QUEUE MODULE (LINKED LIST SYSTEM FOR EMERGENCY REPORTS)
// ============================================================
export class QueueNode<T> {
  value: T;
  next: QueueNode<T> | null = null;
  constructor(value: T) {
    this.value = value;
  }
}

export class CustomQueue<T> {
  private head: QueueNode<T> | null = null;
  private tail: QueueNode<T> | null = null;
  private length: number = 0;

  enqueue(item: T): void {
    const newNode = new QueueNode(item);
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      if (this.tail) {
        this.tail.next = newNode;
      }
      this.tail = newNode;
    }
    this.length++;
  }

  dequeue(): T | null {
    if (!this.head) return null;
    const dequeuedValue = this.head.value;
    this.head = this.head.next;
    if (!this.head) {
      this.tail = null;
    }
    this.length--;
    return dequeuedValue;
  }

  peek(): T | null {
    return this.head ? this.head.value : null;
  }

  size(): number {
    return this.length;
  }

  isEmpty(): boolean {
    return this.length === 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
}

// ============================================================
// 2. STACK MODULE (UNDO / ACTION HISTORY)
// ============================================================
export class StackNode<T> {
  value: T;
  next: StackNode<T> | null = null;
  constructor(value: T) {
    this.value = value;
  }
}

export class CustomStack<T> {
  private top: StackNode<T> | null = null;
  private length: number = 0;

  push(item: T): void {
    const newNode = new StackNode(item);
    newNode.next = this.top;
    this.top = newNode;
    this.length++;
  }

  pop(): T | null {
    if (!this.top) return null;
    const poppedValue = this.top.value;
    this.top = this.top.next;
    this.length--;
    return poppedValue;
  }

  peek(): T | null {
    return this.top ? this.top.value : null;
  }

  size(): number {
    return this.length;
  }

  isEmpty(): boolean {
    return this.length === 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.top;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
}

// ============================================================
// 3. PRIORITY QUEUES MODULE (CUSTOM MAX HEAP FOR INCIDENTS)
// ============================================================
export class MaxHeap {
  private heap: Incident[] = [];

  constructor(initialItems: Incident[] = []) {
    for (const item of initialItems) {
      this.insert(item);
    }
  }

  private getParentIndex(i: number): number { return Math.floor((i - 1) / 2); }
  private getLeftChildIndex(i: number): number { return 2 * i + 1; }
  private getRightChildIndex(i: number): number { return 2 * i + 2; }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  insert(incident: Incident): void {
    // Priority is based on priorityScore = severity * affectedPeople
    const score = incident.severity * incident.affectedPeople;
    incident.priorityScore = score;
    this.heap.push(incident);
    this.heapifyUp(this.heap.length - 1);
  }

  private heapifyUp(index: number): void {
    let current = index;
    while (current > 0) {
      const parent = this.getParentIndex(current);
      if (this.heap[current].priorityScore > this.heap[parent].priorityScore) {
        this.swap(current, parent);
        current = parent;
      } else {
        break;
      }
    }
  }

  extractMax(): Incident | null {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop() || null;

    const max = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown(0);
    return max;
  }

  private heapifyDown(index: number): void {
    let current = index;
    const length = this.heap.length;

    while (this.getLeftChildIndex(current) < length) {
      let largerChild = this.getLeftChildIndex(current);
      const rightChild = this.getRightChildIndex(current);

      if (rightChild < length && this.heap[rightChild].priorityScore > this.heap[largerChild].priorityScore) {
        largerChild = rightChild;
      }

      if (this.heap[largerChild].priorityScore > this.heap[current].priorityScore) {
        this.swap(current, largerChild);
        current = largerChild;
      } else {
        break;
      }
    }
  }

  peek(): Incident | null {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  size(): number {
    return this.heap.length;
  }

  toArray(): Incident[] {
    // Return a clone of heap items, optionally sorted by actual heap extraction for true priority visual listing
    const tempHeap = new MaxHeap([...this.heap]);
    const sorted: Incident[] = [];
    while (tempHeap.size() > 0) {
      const max = tempHeap.extractMax();
      if (max) sorted.push(max);
    }
    return sorted;
  }

  getRawHeap(): Incident[] {
    return [...this.heap];
  }
}

// ============================================================
// 4. ROUTE PLANNING MODULE (GRAPH + DIJKSTRA)
// ============================================================
export interface Edge {
  node: string;
  weight: number; // Distance in kilometers
}

export class GeoGraph {
  private adjacencyList: Map<string, Edge[]> = new Map();

  addNode(district: string): void {
    if (!this.adjacencyList.has(district)) {
      this.adjacencyList.set(district, []);
    }
  }

  addEdge(source: string, destination: string, distance: number): void {
    this.addNode(source);
    this.addNode(destination);
    
    // Add undirected connections
    if (!this.adjacencyList.get(source)?.some(e => e.node === destination)) {
      this.adjacencyList.get(source)!.push({ node: destination, weight: distance });
    }
    if (!this.adjacencyList.get(destination)?.some(e => e.node === source)) {
      this.adjacencyList.get(destination)!.push({ node: source, weight: distance });
    }
  }

  getNeighbors(district: string): Edge[] {
    return this.adjacencyList.get(district) || [];
  }

  getNodes(): string[] {
    return Array.from(this.adjacencyList.keys());
  }

  // DIJKSTRA ALGORITHM
  findShortestPath(start: string, end: string): { path: string[]; distance: number } {
    if (!this.adjacencyList.has(start) || !this.adjacencyList.has(end)) {
      return { path: [], distance: Infinity };
    }

    const distances: Map<string, number> = new Map();
    const previous: Map<string, string | null> = new Map();
    const unvisited: Set<string> = new Set();

    // Initialize scores
    for (const node of this.adjacencyList.keys()) {
      distances.set(node, node === start ? 0 : Infinity);
      previous.set(node, null);
      unvisited.add(node);
    }

    while (unvisited.size > 0) {
      // Find node with minimum path distance from unvisited
      let currentNode: string | null = null;
      let minDistance = Infinity;

      for (const node of unvisited) {
        const dist = distances.get(node)!;
        if (dist < minDistance) {
          minDistance = dist;
          currentNode = node;
        }
      }

      if (currentNode === null || minDistance === Infinity) {
        break; // Either unreachable or completed
      }

      if (currentNode === end) {
        break; // Found destination shortest path
      }

      unvisited.delete(currentNode);

      // Relax candidate edges
      const neighbors = this.getNeighbors(currentNode);
      for (const neighbor of neighbors) {
        if (!unvisited.has(neighbor.node)) continue;

        const prospectiveDistance = distances.get(currentNode)! + neighbor.weight;
        if (prospectiveDistance < distances.get(neighbor.node)!) {
          distances.set(neighbor.node, prospectiveDistance);
          previous.set(neighbor.node, currentNode);
        }
      }
    }

    // Reconstruct the actual path sequence
    const path: string[] = [];
    let current: string | null = end;
    while (current !== null) {
      path.unshift(current);
      current = previous.get(current) || null;
    }

    if (path[0] !== start) {
      return { path: [], distance: Infinity };
    }

    return {
      path,
      distance: distances.get(end)!
    };
  }
}

// Establish standard Sri Lankan districts connectivity graph
export function buildSriLankaGraph(): GeoGraph {
  const g = new GeoGraph();
  
  // High fidelity travel distances in Sri Lanka map (approx network in km)
  // Major districts to map the network properly
  g.addEdge('Colombo', 'Gampaha', 30);
  g.addEdge('Colombo', 'Kalutara', 43);
  g.addEdge('Colombo', 'Ratnapura', 101);
  g.addEdge('Gampaha', 'Kurunegala', 78);
  g.addEdge('Gampaha', 'Kandy', 85);
  g.addEdge('Kurunegala', 'Anuradhapura', 110);
  g.addEdge('Kurunegala', 'Kandy', 42);
  g.addEdge('Kalutara', 'Galle', 75);
  g.addEdge('Galle', 'Matara', 45);
  g.addEdge('Matara', 'Ratnapura', 140);
  g.addEdge('Ratnapura', 'Badulla', 120);
  g.addEdge('Kandy', 'Badulla', 115);
  g.addEdge('Kandy', 'Anuradhapura', 138);
  g.addEdge('Anuradhapura', 'Jaffna', 196);
  g.addEdge('Anuradhapura', 'Trincomalee', 106);
  g.addEdge('Trincomalee', 'Batticaloa', 135);
  g.addEdge('Batticaloa', 'Badulla', 125);
  g.addEdge('Jaffna', 'Trincomalee', 230);

  return g;
}
