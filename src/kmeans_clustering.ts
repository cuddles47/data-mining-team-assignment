/**
 * K-means clustering implementation with detailed iteration tracking
 */

export interface Diem {
    [key: string]: number;
}

// Define interfaces for detailed tracking
export interface KMeansLap {
    bangkhoangcach: number[][];
    tamcum: number[][];
    phancum: number[];
}

export interface KMeansKetqua {
    tamcum: number[][];
    nhomcum: number[][][];
    solap: number;
    chitietlap: KMeansLap[];
}

export class KMeans {
    private k: number;
    private solaptoida: number;
    
    // Track detailed information for each iteration
    private chitietlap: KMeansLap[] = [];
    
    constructor(k: number, solaptoida: number = 100) {
      this.k = k;
      this.solaptoida = solaptoida;
    }
    
    /**
     * Fit K-means model with detailed tracking for each iteration
     */
    dichuyenvoidulieu(dulieu: number[][]): KMeansKetqua {
      if (dulieu.length < this.k) {
        throw new Error(`Cannot cluster ${dulieu.length} points into ${this.k} clusters`);
      }
      
      // Initialize centroids randomly using basic K-means (random selection)
      let tamcum = this.khoitaotamcumngaunhien(dulieu);
      
      // Clear previous iteration details
      this.chitietlap = [];
      
      // Iterative process
      let lap = 0;
      let tamcumthaydoi = true;
      let phancum: number[] = [];
      let cumcuoicung: number[][][] = [];
      
      while (tamcumthaydoi && lap < this.solaptoida) {
        // Calculate distance matrix (D matrix)
        const bangkhoangcach: number[][] = [];
        
        for (let i = 0; i < dulieu.length; i++) {
          bangkhoangcach[i] = [];
          for (let j = 0; j < tamcum.length; j++) {
            bangkhoangcach[i][j] = this.khoangcacheuclidean(dulieu[i], tamcum[j]);
          }
        }
        
        // Assign each point to the closest centroid
        phancum = this.ganvaocum(bangkhoangcach);
        
        // Group points by cluster
        const diemtheocum: number[][][] = Array(this.k).fill(null).map(() => []);
        for (let i = 0; i < dulieu.length; i++) {
          diemtheocum[phancum[i]].push(dulieu[i]);
        }
        
        // Store current iteration details
        this.chitietlap.push({
          bangkhoangcach,
          tamcum: [...tamcum],
          phancum: [...phancum],
        });
        
        // Calculate new centroids (G matrix)
        const tamcummoi = this.tinhtamcummoi(diemtheocum);
        
        // Check if centroids have changed
        tamcumthaydoi = this.kiemtratamcumthaydoi(tamcum, tamcummoi);
        
        // Update centroids for next iteration
        tamcum = [...tamcummoi];
        
        // Save clusters for the last iteration
        cumcuoicung = [...diemtheocum];
        
        lap++;
      }
      
      return {
        tamcum,
        nhomcum: cumcuoicung,
        solap: lap,
        chitietlap: this.chitietlap
      };
    }
    
    /**
     * Initialize K centroids randomly from the dataset (basic K-means)
     */
    private khoitaotamcumngaunhien(dulieu: number[][]): number[][] {
      // Create a copy of the data to avoid modifying the original
      const dulieuban = [...dulieu];
      
      // Randomly shuffle the data
      for (let i = dulieuban.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dulieuban[i], dulieuban[j]] = [dulieuban[j], dulieuban[i]];
      }
      
      // Take the first k points as initial centroids
      return dulieuban.slice(0, this.k);
    }
    
    /**
     * Calculate Euclidean distance between two points
     */
    private khoangcacheuclidean(diema: number[], diemb: number[]): number {
      let tong = 0;
      for (let i = 0; i < diema.length; i++) {
        tong += Math.pow(diema[i] - diemb[i], 2);
      }
      return Math.sqrt(tong);
    }
    
    /**
     * Assign each data point to the closest centroid
     */
    private ganvaocum(bangkhoangcach: number[][]): number[] {
      const phanchia: number[] = [];
      
      for (let i = 0; i < bangkhoangcach.length; i++) {
        let khoangcachnhonhat = Infinity;
        let vitritamgannhat = 0;
        
        for (let j = 0; j < this.k; j++) {
          if (bangkhoangcach[i][j] < khoangcachnhonhat) {
            khoangcachnhonhat = bangkhoangcach[i][j];
            vitritamgannhat = j;
          }
        }
        
        phanchia.push(vitritamgannhat);
      }
      
      return phanchia;
    }
    
    /**
     * Update centroids based on the mean of points in each cluster (G matrix)
     */
    private tinhtamcummoi(cacnhom: number[][][]): number[][] {
      const tamcummoi: number[][] = [];
      
      for (let i = 0; i < this.k; i++) {
        const nhom = cacnhom[i];
        
        // Handle empty clusters
        if (nhom.length === 0) {
          // Keep the old centroid if cluster is empty
          tamcummoi.push(this.chitietlap.length > 0 ? 
            this.chitietlap[this.chitietlap.length - 1].tamcum[i] :
            [0, 0]); // Default for first iteration
          continue;
        }
        
        // Calculate centroid as average of all points in cluster
        const kichthuoc = nhom[0].length;
        const tamcum: number[] = new Array(kichthuoc).fill(0);
        
        for (const diem of nhom) {
          for (let d = 0; d < kichthuoc; d++) {
            tamcum[d] += diem[d];
          }
        }
        
        for (let d = 0; d < kichthuoc; d++) {
          tamcum[d] /= nhom.length;
        }
        
        tamcummoi.push(tamcum);
      }
      
      return tamcummoi;
    }
    
    /**
     * Check if centroids have changed significantly
     */
    private kiemtratamcumthaydoi(tamcumcu: number[][], tamcummoi: number[][]): boolean {
      const nguong = 0.0001;
      
      for (let i = 0; i < this.k; i++) {
        const khoangcach = this.khoangcacheuclidean(tamcumcu[i], tamcummoi[i]);
        if (khoangcach > nguong) {
          return true;
        }
      }
      
      return false;
    }
}
