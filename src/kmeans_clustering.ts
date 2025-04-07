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
     * Initialize K centroids using K-means++ algorithm
     */
    private initCentroidsKMeansPlusPlus(data: Point[]): void {
      // Select first centroid randomly
      const randomIndex = Math.floor(Math.random() * data.length);
      this.centroids = [{ ...data[randomIndex] }];
      
      // Select the rest of the centroids
      for (let i = 1; i < this.k; i++) {
        // Calculate distances to the nearest centroid for each point
        const distances = data.map(point => {
          let minDistance = Infinity;
          for (const centroid of this.centroids) {
            const dist = this.distance(point, centroid);
            minDistance = Math.min(minDistance, dist);
          }
          return minDistance * minDistance; // Squared distance
        });
        
        // Calculate the sum of distances
        const distanceSum = distances.reduce((a, b) => a + b, 0);
        
        // Choose the next centroid with probability proportional to distance
        let random = Math.random() * distanceSum;
        let index = 0;
        while (random > 0 && index < data.length) {
          random -= distances[index];
          index++;
        }
        index = Math.max(0, index - 1);
        
        this.centroids.push({ ...data[index] });
      }
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
    fit(data: Point[], useKMeansPlusPlus: boolean = false): void {
      if (data.length < this.k) {
        throw new Error(`Cannot cluster ${data.length} points into ${this.k} clusters`);
      }
      
      // Initialize centroids
      if (useKMeansPlusPlus) {
        this.initCentroidsKMeansPlusPlus(data);
      } else {
        this.initCentroids(data);
      }
      
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
    
    /**
     * Calculate Within-Cluster Sum of Squares (WCSS)
     */
    calculateWCSS(): number {
      let wcss = 0;
      for (let i = 0; i < this.clusters.length; i++) {
        const cluster = this.clusters[i];
        const centroid = this.centroids[i];
        
        for (const point of cluster) {
          wcss += Math.pow(this.distance(point, centroid), 2);
        }
      }
      return wcss;
    }
    
    /**
     * Find optimal K using the Elbow Method
     * Returns WCSS values for different K values
     */
    static findOptimalK(data: Point[], maxK: number, maxIterations: number = 100): number[] {
      const wcssValues: number[] = [];
      
      for (let k = 1; k <= maxK; k++) {
        const kmeans = new KMeans(k, maxIterations);
        kmeans.fit(data);
        wcssValues.push(kmeans.calculateWCSS());
      }
      
      return wcssValues;
    }
    
    /**
     * Normalizes data to have zero mean and unit variance
     */
    static normalizeData(data: Point[]): Point[] {
      if (data.length === 0) return [];
      
      // Calculate mean and standard deviation for each dimension
      const stats: {[key: string]: {mean: number, std: number}} = {};
      const keys = Object.keys(data[0]);
      
      for (const key of keys) {
        let sum = 0;
        for (const point of data) {
          sum += point[key];
        }
        const mean = sum / data.length;
        
        let sumSquaredDiff = 0;
        for (const point of data) {
          sumSquaredDiff += Math.pow(point[key] - mean, 2);
        }
        const std = Math.sqrt(sumSquaredDiff / data.length);
        
        stats[key] = { mean, std };
      }
      
      // Normalize data
      return data.map(point => {
        const normalizedPoint: Point = {};
        for (const key of keys) {
          const { mean, std } = stats[key];
          normalizedPoint[key] = std === 0 ? 0 : (point[key] - mean) / std;
        }
        return normalizedPoint;
      });
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
  
  // Normalize data (recommended for K-means)
  const normalizedData = KMeans.normalizeData(data);
  
  // Find optimal K
  const wcssValues = KMeans.findOptimalK(normalizedData, 5);
  console.log('WCSS values:', wcssValues);
  // You would typically plot these values and look for an "elbow" point
  
  // Run with K-means++
  const kmeans = new KMeans(2);
  kmeans.fit(normalizedData, true); // true enables K-means++
  
  const clusters = kmeans.getClusters();
  const centroids = kmeans.getCentroids();
  const quality = kmeans.calculateWCSS();
  
  console.log('Clusters:', clusters);
  console.log('Centroids:', centroids);
  console.log('WCSS (lower is better):', quality);
  */
  