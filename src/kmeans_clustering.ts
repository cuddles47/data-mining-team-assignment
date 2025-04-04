/**
 * K-means clustering implementation
 */

export interface Point {
  [key: string]: number;
}

export class KMeans {
  private k: number;
  private maxIterations: number;
  private centroids: Point[] = [];
  private clusters: Point[][] = [];
  
  constructor(k: number, maxIterations: number = 100) {
    this.k = k;
    this.maxIterations = maxIterations;
  }
  
  /**
   * Calculate Euclidean distance between two points
   */
  private distance(pointA: Point, pointB: Point): number {
    let sum = 0;
    for (const key in pointA) {
      if (pointB.hasOwnProperty(key)) {
        sum += Math.pow(pointA[key] - pointB[key], 2);
      }
    }
    return Math.sqrt(sum);
  }
  
  /**
   * Initialize K centroids randomly from the dataset
   */
  private initCentroids(data: Point[]): void {
    // Create a copy of the data to avoid modifying the original
    const dataCopy = [...data];
    
    // Randomly shuffle the data
    for (let i = dataCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dataCopy[i], dataCopy[j]] = [dataCopy[j], dataCopy[i]];
    }
    
    // Take the first k points as initial centroids
    this.centroids = dataCopy.slice(0, this.k);
  }
  
  /**
   * Assign each data point to the closest centroid
   */
  private assignClusters(data: Point[]): void {
    // Initialize empty clusters
    this.clusters = Array(this.k).fill(null).map(() => []);
    
    // Assign each point to the closest centroid
    for (const point of data) {
      let minDistance = Infinity;
      let closestCentroidIndex = 0;
      
      // Find the closest centroid
      for (let i = 0; i < this.k; i++) {
        const distance = this.distance(point, this.centroids[i]);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroidIndex = i;
        }
      }
      
      // Add the point to the corresponding cluster
      this.clusters[closestCentroidIndex].push(point);
    }
  }
  
  /**
   * Update centroids based on the mean of points in each cluster
   */
  private updateCentroids(): boolean {
    let hasChanged = false;
    
    for (let i = 0; i < this.k; i++) {
      const cluster = this.clusters[i];
      
      // Skip empty clusters
      if (cluster.length === 0) continue;
      
      const newCentroid: Point = {};
      
      // Get all dimension keys from the first point
      const keys = Object.keys(cluster[0]);
      
      // Calculate sum for each dimension
      for (const key of keys) {
        newCentroid[key] = 0;
        for (const point of cluster) {
          newCentroid[key] += point[key];
        }
        newCentroid[key] /= cluster.length;
      }
      
      // Check if centroid has changed
      if (this.distance(newCentroid, this.centroids[i]) > 0.0001) {
        hasChanged = true;
      }
      
      // Update centroid
      this.centroids[i] = newCentroid;
    }
    
    return hasChanged;
  }
  
  /**
   * Fit the K-means model to the data
   */
  fit(data: Point[]): void {
    if (data.length < this.k) {
      throw new Error(`Cannot cluster ${data.length} points into ${this.k} clusters`);
    }
    
    // Initialize centroids
    this.initCentroids(data);
    
    // Iterative process
    let iteration = 0;
    let centroidsChanged = true;
    
    while (centroidsChanged && iteration < this.maxIterations) {
      // Assign points to clusters
      this.assignClusters(data);
      
      // Update centroids and check if they changed
      centroidsChanged = this.updateCentroids();
      
      iteration++;
    }
  }
  
  /**
   * Get the clusters
   */
  getClusters(): Point[][] {
    return this.clusters;
  }
  
  /**
   * Get the centroids
   */
  getCentroids(): Point[] {
    return this.centroids;
  }
  
  /**
   * Predict which cluster a new point belongs to
   */
  predict(point: Point): number {
    let minDistance = Infinity;
    let closestCentroidIndex = 0;
    
    for (let i = 0; i < this.k; i++) {
      const distance = this.distance(point, this.centroids[i]);
      if (distance < minDistance) {
        minDistance = distance;
        closestCentroidIndex = i;
      }
    }
    
    return closestCentroidIndex;
  }
}

// Example usage
/*
const data: Point[] = [
  { x: 1, y: 2 },
  { x: 1, y: 3 },
  { x: 2, y: 2 },
  { x: 8, y: 7 },
  { x: 9, y: 8 },
  { x: 9, y: 7 },
];

const kmeans = new KMeans(2); // 2 clusters
kmeans.fit(data);

const clusters = kmeans.getClusters();
const centroids = kmeans.getCentroids();

console.log('Clusters:', clusters);
console.log('Centroids:', centroids);
*/
