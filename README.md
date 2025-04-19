# **Data Mining Team Assignment**  

## **Mô tả**  
Dự án này triển khai ba thuật toán khai phá dữ liệu phổ biến: **Apriori**, **FP-Growth** và **K-means Clustering**. Hai thuật toán đầu tiên dùng để khai thác các tập mục phổ biến và tạo ra các luật kết hợp từ dữ liệu giao dịch, trong khi K-means được sử dụng cho phân cụm dữ liệu. Ứng dụng được xây dựng bằng **TypeScript** và có giao diện người dùng đơn giản để nhập dữ liệu và xem kết quả.  

## **Chức năng chính**  
- Nhập dữ liệu giao dịch hoặc dữ liệu để phân cụm dưới dạng danh sách.  
- Thiết lập các tham số thuật toán như **Minimum Support**, **Minimum Confidence** cho Apriori và FP-Growth, hoặc số lượng cụm **K** cho K-means.  
- Thực thi các thuật toán khai phá dữ liệu để tìm các tập mục phổ biến hoặc phân cụm dữ liệu.  
- Hiển thị kết quả phù hợp với từng thuật toán (bảng tần suất, luật kết hợp hoặc phân cụm).  
- Nút **"Reset"** để xóa dữ liệu đầu vào và kết quả.
- Hỗ trợ nhập dữ liệu từ file CSV mẫu.
- Trực quan hóa kết quả qua từng bước thực hiện thuật toán.

## **Công nghệ sử dụng**  
- **TypeScript**: Ngôn ngữ chính để phát triển ứng dụng.  
- **HTML/CSS**: Xây dựng giao diện người dùng.  
- **Node.js**: Chạy ứng dụng.  
- **Webpack**: Đóng gói mã nguồn.
- **HTML Canvas**: Trực quan hóa kết quả.
- **Docker**: Container hóa ứng dụng (nếu cần).  

## **Cách sử dụng**  

### **1. Cài đặt**  
Clone repository về máy:  
```bash
git clone <repository-url>
cd data-mining-team-assignment
```

Cài đặt các dependencies:  
```bash
npm install
```

### **2. Chạy chương trình**  
```bash
npm start
```
Sau đó mở trình duyệt và truy cập:  
👉 [http://localhost:9000](http://localhost:9000)  

### **3. Sử dụng giao diện**  
- Chọn thuật toán muốn sử dụng: **Apriori**, **FP-Growth** hoặc **K-means**.
- Nhập dữ liệu vào ô nhập liệu hoặc tải dữ liệu mẫu từ thư mục **/data**.
- Thiết lập tham số phù hợp với thuật toán đã chọn:
  - **Apriori** và **FP-Growth**: Thiết lập ngưỡng **Minimum Support** và **Minimum Confidence**.
  - **K-means**: Thiết lập số lượng cụm (**K**) và **max iteration**.
- Nhấn nút **"Execute"** để thực thi thuật toán và xem kết quả.
- Nhấn nút **"Reset"** để xóa dữ liệu và kết quả.

### **4. Dữ liệu mẫu**
Bạn có thể sử dụng các dữ liệu mẫu có sẵn trong thư mục **/data**:
- **data_apriori.csv**, **data_apriori_2.csv**: Dữ liệu mẫu cho thuật toán Apriori và FP-Growth.
- **data_kmeans.csv**, **data_kmeans_2.csv**: Dữ liệu mẫu cho thuật toán K-means.
- **dataTestFpGrowth.csv**: Dữ liệu mẫu thêm cho thuật toán FP-Growth.

### **5. Cấu trúc thư mục**  
```
data-mining-team-assignment/
├── src/                # Mã nguồn triển khai các thuật toán
│   ├── apriori.ts      # Triển khai thuật toán Apriori
│   ├── fpGrowth.ts     # Triển khai thuật toán FP-Growth
│   ├── kmeans_clustering.ts # Triển khai thuật toán K-means
├── web/                # Giao diện người dùng web
│   ├── app.ts          # Logic xử lý giao diện và tương tác
│   ├── index.html      # Cấu trúc HTML của ứng dụng
│   ├── styles.css      # Định dạng CSS cho ứng dụng
│   ├── data/           # Thư mục dữ liệu web
├── data/               # Dữ liệu mẫu cho kiểm thử
│   ├── data_apriori.csv        # Dữ liệu mẫu cho Apriori
│   ├── data_apriori_2.csv      # Dữ liệu mẫu thứ hai cho Apriori
│   ├── data_kmeans.csv         # Dữ liệu mẫu cho K-means
│   ├── data_kmeans_2.csv       # Dữ liệu mẫu thứ hai cho K-means
│   ├── dataTestFpGrowth.csv    # Dữ liệu mẫu cho FP-Growth
│   ├── visualize_*.txt         # Tài liệu mô tả bộ dữ liệu
├── demo/               # Tài liệu demo và báo cáo
│   ├── repo_diagram/   # Sơ đồ và hình ảnh minh họa dự án
│   ├── report/         # Báo cáo chi tiết dự án
├── dist/               # Thư mục chứa mã nguồn đã được biên dịch
│   ├── bundle.js       # JavaScript đã được đóng gói
│   ├── index.html      # Trang HTML chính cho production
├── public/             # Tài nguyên công khai
├── docs/               # Tài liệu và hình ảnh minh họa
├── package.json        # Thông tin dự án và dependencies
├── tsconfig.json       # Cấu hình TypeScript
└── webpack.config.js   # Cấu hình webpack để đóng gói mã nguồn
```

## **Kiến trúc và tương tác giữa các thành phần**

### **Mối quan hệ giữa index.html và app.ts**

Ứng dụng web cần cả file `web/app.ts` và `web/index.html` vì chúng đóng vai trò khác nhau trong kiến trúc ứng dụng:

1. **Vai trò của index.html**:
   - Cung cấp cấu trúc HTML cho giao diện người dùng
   - Là điểm khởi đầu khi trình duyệt tải ứng dụng
   - Định nghĩa các phần tử DOM mà JavaScript sẽ thao tác
   - Liên kết các tài nguyên như CSS và JavaScript

2. **Vai trò của app.ts**:
   - Chứa toàn bộ logic xử lý sự kiện và thuật toán
   - Tạo tương tác với DOM thông qua các API
   - Triển khai xử lý dữ liệu và gọi các thuật toán khai phá
   - Tạo động các bảng, biểu đồ và trực quan hóa kết quả

Quy trình hoạt động:
1. Trình duyệt tải `index.html`
2. `index.html` chứa thẻ `<script>` liên kết đến JavaScript (biên dịch từ `app.ts`)
3. TypeScript compiler chuyển đổi `app.ts` thành JavaScript
4. JavaScript thực thi và tương tác với cấu trúc HTML

## **Chi tiết thuật toán**

### **1. Thuật toán Apriori**

Apriori là thuật toán khai phá các tập mục phổ biến và luật kết hợp từ cơ sở dữ liệu giao dịch, hoạt động dựa trên nguyên tắc "bất kỳ tập con nào của một tập phổ biến đều phải phổ biến".

**Các tham số chính**:
- **Minimum Support**: Xác định tập mục xuất hiện với tần suất tối thiểu
- **Minimum Confidence**: Dùng để tạo luật kết hợp

**Triển khai chính**:

```typescript
// Hàm thực thi chính của thuật toán
public thucthi(giaodich: T[][], cb?: (result: IKetQuaApriori<T>) => any): Promise<IKetQuaApriori<T>> {
    this._giaodich = giaodich;
    // Chuyển đổi ngưỡng hỗ trợ tương đối thành tuyệt đối
    this._hotro = Math.ceil(this._hotro * giaodich.length);

    return new Promise<IKetQuaApriori<T>>((resolve, reject) => {
        let thoigianbatdau = performance.now();

        // Tạo tập mục phổ biến 1-itemsets
        let tapmathangphobien: TapMatHang<T>[][] = [this.layTapMatHangMotPhoBien(this._giaodich)];

        let i: number = 0;
        // Tạo tập mục phổ biến (i+1)-itemsets cho đến khi không thể tìm thêm
        while (tapmathangphobien[i].length > 0) {
            tapmathangphobien.push(this.layTapMatHangKPhoBien(tapmathangphobien[i]));
            i++;
        }

        let thoigianketthuc = performance.now();

        // Định dạng kết quả
        let ketqua: IKetQuaApriori<T> = {
            tapmathang: tapmathangphobien.reduce((acc, val) => acc.concat(val), []),
            thoigianthaotac: Math.round(thoigianketthuc - thoigianbatdau)
        };

        if(cb) cb(ketqua);
        resolve(ketqua);
    });
}
```

### **2. Thuật toán FP-Growth**

FP-Growth là thuật toán khai thác tập mục phổ biến không sử dụng phương pháp tạo ứng viên, thay vào đó nó sử dụng cấu trúc dữ liệu FP-Tree để lưu trữ thông tin tần suất theo cách nén.

**Cấu trúc dữ liệu chính**:
- **FPTreeNode**: Đại diện cho nút trong cây FP-Tree
- **FPTree**: Cấu trúc cây với gốc và bảng header

**Triển khai chính**:

```typescript
// Hàm chính của thuật toán FP-Growth
export function fpgrowth(
    transactions: string[][],
    minSupport: number
): {
    frequentItemsets: { items: string[]; support: number }[],
    logs: string[],
    frequentItemsetsData: Array<{
        x: string;
        conditionalBase: string[];
        fpTree: string[];
        frequentPatterns: string[];
        support: number;
    }>,
    treeNodes: { label: string, depth: number }[]
} {
    // Bước 1: Đếm tần suất các mục
    const itemSupport: Map<string, number> = new Map();
    for (const transaction of transactions) {
        for (const item of transaction) {
            itemSupport.set(item, (itemSupport.get(item) || 0) + 1);
        }
    }

    // Bước 2: Lọc và sắp xếp các mục phổ biến theo tần suất giảm dần
    const frequentItems = Array.from(itemSupport.entries())
        .filter(([_, count]) => count >= minSupport)
        .sort((a, b) => {
            if (b[1] !== a[1]) return b[1] - a[1];
            return a[0].localeCompare(b[0]);
        })
        .map(([item]) => item);

    // Bước 3: Xây dựng FP-Tree từ các giao dịch đã lọc
    const tree = new FPTree();
    for (const transaction of transactions) {
        const filteredTransaction = transaction
            .filter(item => frequentItems.includes(item))
            .sort((a, b) => frequentItems.indexOf(a) - frequentItems.indexOf(b));
        tree.addTransaction(filteredTransaction);
    }

    // Bước 4: Khai thác các tập mục phổ biến từ FP-Tree
    // Hàm mineTree đệ quy để khai thác các tập phổ biến
    function mineTree(tree: FPTree, suffix: string[] = []) {
        // Lấy các mục trong bảng header theo thứ tự tăng dần tần suất
        const itemsInTree = frequentItems.filter(item => tree.headerTable.has(item)).reverse();

        for (const item of itemsInTree) {
            // Tính tổng support
            let support = 0;
            let node: FPTreeNode | undefined = tree.headerTable.get(item);
            while (node) {
                support += node.count;
                node = node.next;
            }

            if (support >= minSupport) {
                // Tạo tập mục phổ biến mới bằng cách kết hợp item và suffix
                const newItemset = [item, ...suffix];
                frequentItemsets.push({ items: newItemset, support });

                // Tạo cơ sở mẫu điều kiện
                const conditionalPatternBase = tree.getConditionalPatternBase(item);

                // Tạo FP-Tree điều kiện
                const conditionalTree = new FPTree();
                for (const { pattern, count } of conditionalPatternBase) {
                    conditionalTree.addTransaction(pattern, count);
                }

                // Đệ quy khai thác FP-Tree điều kiện nếu không rỗng
                if (conditionalTree.root.children.size > 0) {
                    mineTree(conditionalTree, newItemset);
                }
            }
        }
    }
}
```

### **3. Thuật toán K-means**

K-means là thuật toán phân cụm dữ liệu theo khoảng cách Euclidean giữa các điểm và tâm cụm.

**Tham số chính**:
- **K**: Số lượng cụm
- **Số lần lặp tối đa**: Giới hạn số vòng lặp của thuật toán

**Triển khai chính**:

```typescript
// Hàm chính của thuật toán K-means
dichuyenvoidulieu(dulieu: number[][]): KMeansKetqua {
    if (dulieu.length < this.k) {
        throw new Error(`Cannot cluster ${dulieu.length} points into ${this.k} clusters`);
    }
    
    // Khởi tạo tâm cụm ngẫu nhiên
    let tamcum = this.khoitaotamcumngaunhien(dulieu);
    
    // Xóa thông tin chi tiết các lần lặp trước
    this.chitietlap = [];
    
    // Quá trình lặp
    let lap = 0;
    let tamcumthaydoi = true;
    let phancum: number[] = [];
    let cumcuoicung: number[][][] = [];
    
    while (tamcumthaydoi && lap < this.solaptoida) {
        // Tính ma trận khoảng cách (ma trận D)
        const bangkhoangcach: number[][] = [];
        for (let i = 0; i < dulieu.length; i++) {
            bangkhoangcach[i] = [];
            for (let j = 0; j < tamcum.length; j++) {
                bangkhoangcach[i][j] = this.khoangcacheuclidean(dulieu[i], tamcum[j]);
            }
        }
        
        // Gán mỗi điểm vào cụm gần nhất
        phancum = this.ganvaocum(bangkhoangcach);
        
        // Nhóm các điểm theo cụm
        const diemtheocum: number[][][] = Array(this.k).fill(null).map(() => []);
        for (let i = 0; i < dulieu.length; i++) {
            diemtheocum[phancum[i]].push(dulieu[i]);
        }
        
        // Lưu thông tin chi tiết của lần lặp hiện tại
        this.chitietlap.push({
            bangkhoangcach,
            tamcum: [...tamcum],
            phancum: [...phancum],
        });
        
        // Tính tâm cụm mới (ma trận G)
        const tamcummoi = this.tinhtamcummoi(diemtheocum);
        
        // Kiểm tra xem tâm cụm có thay đổi không
        tamcumthaydoi = this.kiemtratamcumthaydoi(tamcum, tamcummoi);
        
        // Cập nhật tâm cụm cho lần lặp tiếp theo
        tamcum = [...tamcummoi];
        
        // Lưu cụm cho lần lặp cuối cùng
        cumcuoicung = [...diemtheocum];
        
        lap++;
    }
}
```

## **Nội dung thuyết trình**

### **1. Giới thiệu tổng quan**

Ứng dụng triển khai ba thuật toán quan trọng trong lĩnh vực khai phá dữ liệu:
- **Apriori**: Tìm tập phổ biến và luật kết hợp
- **FP-Growth**: Thuật toán tìm tập phổ biến hiệu quả hơn Apriori
- **K-means**: Phân cụm dữ liệu

### **2. Giao diện người dùng**

- **Chọn thuật toán**: Chuyển đổi giữa 3 thuật toán
- **Nhập dữ liệu**: Nhập thủ công hoặc từ file CSV
- **Tham số**: Điều chỉnh support, confidence hoặc số lượng cụm
- **Kết quả**: Hiển thị chi tiết và trực quan
- **Các nút chức năng**: Execute, Import, Reset, Sample data

### **3. Trực quan hóa**

- Hiển thị kết quả dưới dạng bảng và biểu đồ
- Biểu diễn quá trình thực thi từng bước
- Hỗ trợ dữ liệu đa chiều với khả năng chọn chiều để hiển thị

### **4. Xử lý dữ liệu**

- Hỗ trợ nhiều định dạng dữ liệu (CSV, TSV)
- Tự động phát hiện dấu phân cách
- Chuyển đổi dữ liệu phù hợp với từng thuật toán





