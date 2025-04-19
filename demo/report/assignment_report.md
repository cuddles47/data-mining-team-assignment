## I. Mục Tiêu Dự Án

Dự án "Data Mining Team Assignment" là một ứng dụng web cung cấp các công cụ khai phá dữ liệu với 3 thuật toán phổ biến:

1. **Thuật toán Apriori**: Dùng để tìm các tập mục phổ biến và luật kết hợp từ dữ liệu giao dịch.
2. **Thuật toán FP-Growth**: Một phương pháp hiệu quả hơn so với Apriori để tìm các tập mục phổ biến.
3. **Thuật toán K-means**: Dùng để phân cụm dữ liệu theo khoảng cách.

Mục tiêu chính của dự án là xây dựng một ứng dụng web cho phép:
- Nhập dữ liệu và cấu hình các tham số thuật toán
- Thực thi các thuật toán khai phá dữ liệu
- Hiển thị kết quả dưới dạng trực quan
- Cung cấp giao diện tương tác thân thiện với người dùng
- Trực quan hóa từng bước thực hiện của thuật toán

## II. Cấu Trúc Dự Án

Dự án được tổ chức với cấu trúc thư mục rõ ràng và đầy đủ:

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
│   ├── data/           # Tài nguyên web cần thiết
├── data/               # Dữ liệu mẫu cho kiểm thử
│   ├── data_apriori.csv        # Dữ liệu mẫu cho Apriori
│   ├── data_apriori_2.csv      # Bộ dữ liệu mẫu thứ hai cho Apriori
│   ├── data_kmeans.csv         # Dữ liệu mẫu cho K-means
│   ├── data_kmeans_2.csv       # Bộ dữ liệu mẫu thứ hai cho K-means
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
├── .github/            # Cấu hình CI/CD và workflow cho GitHub
│   ├── workflows/      # Các workflow tự động cho kiểm thử và triển khai
├── node_modules/       # Các thư viện phụ thuộc (không được commit lên git)
├── package.json        # Thông tin dự án và dependencies
├── tsconfig.json       # Cấu hình TypeScript
└── webpack.config.js   # Cấu hình webpack để đóng gói mã nguồn
```

### Kiến trúc Ứng Dụng

Ứng dụng được xây dựng theo mô hình kiến trúc module, với sự phân tách rõ ràng giữa giao diện người dùng và logic của thuật toán:

1. **Tầng Thuật Toán (src/)**: Chứa triển khai thuần túy của các thuật toán khai phá dữ liệu
   - Mỗi thuật toán được đóng gói trong module riêng biệt
   - Các module này không phụ thuộc vào giao diện người dùng

2. **Tầng UI (web/)**: Giao diện người dùng web
   - Cấu trúc HTML được định nghĩa trong index.html
   - Logic tương tác UI được triển khai trong app.ts
   - Định dạng và kiểu hiển thị được quản lý trong styles.css

3. **Tầng Đóng Gói (webpack.config.js)**: 
   - Cấu hình webpack để đóng gói mã nguồn TypeScript thành JavaScript
   - Tối ưu hóa kích thước và hiệu suất của ứng dụng

#### Mối Quan Hệ Giữa index.html và app.ts

Hai file này có mối quan hệ quan trọng trong kiến trúc ứng dụng:

1. **index.html**:
   - Xác định cấu trúc DOM của ứng dụng
   - Chứa các phần tử UI như buttons, dropdowns, text areas
   - Cung cấp các container để hiển thị kết quả và trực quan hóa
   - Liên kết đến các tài nguyên CSS và script JavaScript
   - Là điểm khởi đầu khi người dùng truy cập ứng dụng

2. **app.ts**:
   - Chứa logic xử lý tương tác người dùng
   - Khởi tạo và gọi các thuật toán khai phá
   - Xử lý sự kiện như nhấn nút, thay đổi dropdown, nhập dữ liệu
   - Cập nhật DOM để hiển thị kết quả sau khi thực thi thuật toán
   - Triển khai logic trực quan hóa kết quả

3. **Quy trình hoạt động**:
   - Khi người dùng truy cập ứng dụng, trình duyệt tải file index.html
   - TypeScript compiler biên dịch file app.ts thành JavaScript
   - File JavaScript được liên kết trong index.html thông qua thẻ script
   - JavaScript thiết lập các trình xử lý sự kiện cho các phần tử UI
   - Khi người dùng tương tác, các hàm xử lý trong app.ts được kích hoạt
   - Các thuật toán trong src/ được gọi để xử lý dữ liệu
   - Kết quả được hiển thị bằng cách cập nhật DOM

## III. Chi Tiết Các Thuật Toán

### 1. Thuật Toán Apriori

#### Khái niệm cơ bản
Apriori là thuật toán khai phá các tập mục phổ biến và luật kết hợp từ cơ sở dữ liệu giao dịch. Thuật toán hoạt động dựa trên nguyên tắc chính là "bất kỳ tập con nào của một tập phổ biến đều phải phổ biến".

#### Các tham số chính
- **Minimum Support (ngưỡng hỗ trợ tối thiểu)**: Xác định tập mục xuất hiện với tần suất tối thiểu nào đó.
- **Minimum Confidence (ngưỡng tin cậy tối thiểu)**: Dùng cho việc tạo luật kết hợp.

#### Luồng thực thi trong mã nguồn
```
Pseudo code Apriori:
1. Quét cơ sở dữ liệu để đếm sự xuất hiện của mỗi mục và xác định tập phổ biến 1-itemsets (L1)
2. Lặp lại cho k từ 2 cho đến khi không còn tập phổ biến mới
   a. Tạo tập ứng viên Ck từ tập phổ biến Lk-1
   b. Loại bỏ các ứng viên không phổ biến dựa trên tập con
   c. Quét cơ sở dữ liệu để đếm sự xuất hiện của mỗi ứng viên trong Ck
   d. Chỉ giữ lại các ứng viên có support >= ngưỡng hỗ trợ tối thiểu để tạo Lk
3. Trả về tất cả các tập phổ biến L = ∪k Lk
```

Trong mã nguồn, thuật toán được triển khai thông qua các bước chính:
- Phương thức `thucthi()` là điểm vào chính của thuật toán
- `layTapMatHangMotPhoBien()` tìm các tập phổ biến 1-itemsets
- `layTapMatHangKPhoBien()` tìm các tập phổ biến k-itemsets từ các tập (k-1)-itemsets
- `_taoUngVienK()` tạo ra các tập ứng viên có kích thước k
- `_layDemUngVien()` tính support cho các tập ứng viên

### 2. Thuật Toán FP-Growth

#### Khái niệm cơ bản
FP-Growth (Frequent Pattern Growth) là thuật toán khai thác tập phổ biến không sử dụng phương pháp tạo ứng viên. Thay vào đó, nó sử dụng cấu trúc dữ liệu FP-Tree để lưu trữ thông tin tần suất theo cách nén.

#### Các cấu trúc dữ liệu chính
- **FPTreeNode**: Đại diện cho một nút trong cây FP-Tree, chứa thông tin về mục, số lần xuất hiện, và các liên kết
- **FPTree**: Cấu trúc cây chứa gốc và bảng header để truy cập nhanh các nút

#### Luồng thực thi trong mã nguồn
```
Pseudo code FP-Growth:
1. Quét cơ sở dữ liệu giao dịch để tìm các mục phổ biến và sắp xếp chúng theo tần suất giảm dần
2. Xây dựng FP-Tree:
   a. Tạo nút gốc
   b. Với mỗi giao dịch, lọc ra các mục phổ biến, sắp xếp theo tần suất và thêm vào cây
3. Khai thác tập phổ biến từ FP-Tree:
   a. Bắt đầu với các mục có tần suất thấp nhất
   b. Xây dựng cơ sở mẫu có điều kiện (conditional pattern base) cho mỗi mục
   c. Xây dựng FP-Tree có điều kiện (conditional FP-tree)
   d. Đệ quy để khai thác các tập phổ biến
```

Trong mã nguồn, cụ thể:
- Đầu tiên, đếm tần suất của mỗi mục và lọc/sắp xếp theo tần suất
- Xây dựng cây FP-Tree từ các giao dịch đã lọc
- Sử dụng phương pháp khai thác đệ quy `mineTree()`
- Cho mỗi mục, tạo cơ sở mẫu có điều kiện bằng phương thức `getConditionalPatternBase()`
- Lưu trữ chi tiết quá trình và kết quả trong các mảng `logs` và `frequentItemsetsData`

### 3. Thuật Toán K-means

#### Khái niệm cơ bản
K-means là thuật toán phân cụm có giám sát, phân chia dữ liệu thành K cụm dựa trên khoảng cách Euclidean giữa các điểm dữ liệu và tâm cụm.

#### Các tham số chính
- **K**: Số lượng cụm
- **solaptoida**: Số lần lặp tối đa của thuật toán

#### Luồng thực thi trong mã nguồn
```
Pseudo code K-means:
1. Khởi tạo K tâm cụm ngẫu nhiên
2. Lặp lại cho đến khi hội tụ hoặc đạt số lần lặp tối đa:
   a. Tính khoảng cách từ mỗi điểm dữ liệu đến mỗi tâm cụm (tạo ma trận D)
   b. Gán mỗi điểm vào cụm có tâm gần nhất
   c. Cập nhật tâm cụm mới bằng cách tính trung bình các điểm trong mỗi cụm (tạo ma trận G)
   d. Kiểm tra điều kiện dừng (tâm cụm không thay đổi đáng kể)
3. Trả về tâm cụm cuối cùng và việc phân cụm tương ứng
```

Trong mã nguồn, các phương thức chính:
- `dichuyenvoidulieu()`: Phương thức chính thực hiện thuật toán K-means
- `khoitaotamcumngaunhien()`: Khởi tạo K tâm cụm ngẫu nhiên từ dữ liệu
- `khoangcacheuclidean()`: Tính khoảng cách Euclidean giữa hai điểm
- `ganvaocum()`: Gán điểm dữ liệu vào cụm gần nhất
- `tinhtamcummoi()`: Cập nhật tâm cụm dựa trên trung bình các điểm trong cụm
- `kiemtratamcumthaydoi()`: Kiểm tra điều kiện dừng của thuật toán

## IV. Cách Hoạt Động Của Ứng Dụng

### Luồng thực thi chính
1. Người dùng truy cập giao diện web qua index.html
2. Chọn thuật toán muốn sử dụng (Apriori, FP-Growth hoặc K-means)
3. Nhập dữ liệu đầu vào và thiết lập các tham số
4. Thực thi thuật toán thông qua sự kiện click nút "Execute"
5. Kết quả được hiển thị trong phần "Results"

### Các chức năng chính
- **Chọn thuật toán**: Người dùng có thể chọn một trong ba thuật toán qua dropdown
- **Nhập dữ liệu**: Có thể nhập trực tiếp vào textarea hoặc import từ file
- **Cấu hình tham số**: Mỗi thuật toán có các tham số riêng để điều chỉnh
- **Hiển thị kết quả**: Kết quả được hiển thị dưới dạng text trong phần results
- **Chức năng Reset**: Xóa dữ liệu đã nhập và kết quả

### Trực quan hóa kết quả

Ứng dụng cung cấp các tính năng trực quan hóa để giúp người dùng hiểu rõ hơn về kết quả:

1. **Trực quan hóa thuật toán Apriori**:
   - Bảng hiển thị tần suất xuất hiện của mỗi mục
   - Danh sách các tập phổ biến theo kích thước
   - Biểu đồ các luật kết hợp với chỉ số support và confidence

2. **Trực quan hóa FP-Growth**:
   - Hiển thị cấu trúc FP-Tree với các nút và liên kết
   - Bảng quá trình tạo tập phổ biến theo từng bước
   - Chi tiết về cơ sở mẫu có điều kiện và cây FP điều kiện

3. **Trực quan hóa K-means**:
   - Biểu đồ phân tán 2D cho các điểm dữ liệu và tâm cụm
   - Màu sắc khác nhau để phân biệt các cụm
   - Hiển thị quá trình hội tụ qua từng vòng lặp
   - Bảng ma trận khoảng cách từ điểm đến tâm cụm

### Xử lý dữ liệu

Ứng dụng hỗ trợ nhiều định dạng dữ liệu và cung cấp công cụ xử lý:

1. **Nhập dữ liệu**:
   - Hỗ trợ nhập trực tiếp qua textarea
   - Import từ file CSV hoặc TSV
   - Tự động phát hiện dấu phân cách (comma, tab, semicolon)
   - Dữ liệu mẫu có sẵn cho mỗi thuật toán

2. **Tiền xử lý dữ liệu**:
   - Loại bỏ các dòng trống hoặc không hợp lệ
   - Chuyển đổi định dạng phù hợp với từng thuật toán
   - Chuẩn hóa dữ liệu cho K-means nếu cần

## V. Phân Tích Chi Tiết Các Hàm Quan Trọng

### Thuật toán Apriori

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

### Thuật toán FP-Growth

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

### Thuật toán K-means

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

## VI. Trực quan hóa và giao diện người dùng

### Thiết kế giao diện

Giao diện người dùng được thiết kế tập trung vào tính dễ sử dụng và trực quan:

1. **Bố cục chung**:
   - Layout dạng cột, chia thành các phần rõ ràng
   - Phần cấu hình và nhập dữ liệu ở phía trên
   - Phần kết quả và trực quan hóa ở phía dưới
   - Responsive design cho các kích thước màn hình khác nhau

2. **Thành phần UI chính**:
   - Dropdown chọn thuật toán
   - Textarea nhập dữ liệu
   - Input điều chỉnh tham số
   - Các nút chức năng (Execute, Reset, Import)
   - Khu vực hiển thị kết quả

3. **Trải nghiệm người dùng**:
   - Thay đổi giao diện động dựa trên thuật toán được chọn
   - Hiển thị phản hồi tức thì khi tham số thay đổi
   - Thời gian thực thi được hiển thị để so sánh hiệu suất

### Kỹ thuật trực quan hóa

Ứng dụng sử dụng nhiều kỹ thuật trực quan hóa để hiển thị kết quả:

1. **HTML Canvas**:
   - Vẽ biểu đồ phân tán cho K-means
   - Hiển thị cây FP-Tree cho FP-Growth
   - Cập nhật động theo thời gian thực khi thuật toán chạy

2. **DOM Manipulation**:
   - Tạo bảng động để hiển thị kết quả chi tiết
   - Cập nhật nội dung hiển thị theo từng bước thuật toán
   - Tô màu và định dạng để làm nổi bật thông tin quan trọng

3. **Kỹ thuật hiển thị nâng cao**:
   - Hiển thị dữ liệu đa chiều thông qua phép chiếu 2D
   - Cho phép người dùng chọn các chiều dữ liệu để hiển thị
   - Tương tác với biểu đồ để khám phá dữ liệu chi tiết

## VII. Kết Luận

Dự án "Data Mining Team Assignment" là một ứng dụng web giáo dục cung cấp các công cụ khai phá dữ liệu thông qua ba thuật toán phổ biến: Apriori, FP-Growth và K-means Clustering. Dự án đã được triển khai bằng TypeScript với giao diện web đơn giản và trực quan, cho phép người dùng tương tác với các thuật toán, nhập dữ liệu và xem kết quả.

Mỗi thuật toán đều được triển khai theo đúng các nguyên lý và bước thực hiện tiêu chuẩn, kèm theo các cải tiến để hiển thị chi tiết quá trình thực thi giúp người dùng hiểu rõ hơn về cách hoạt động của thuật toán. Việc lưu trữ chi tiết từng bước thực hiện của thuật toán không chỉ giúp người dùng hiểu rõ về thuật toán mà còn tạo cơ sở cho việc trực quan hóa quy trình khai phá dữ liệu.

Kiến trúc ứng dụng được thiết kế theo mô hình module, phân tách rõ ràng giữa logic thuật toán và giao diện người dùng, giúp dễ dàng mở rộng và bảo trì trong tương lai. Mối quan hệ giữa các thành phần như index.html và app.ts đã được thiết kế hợp lý, tạo nên một luồng hoạt động mượt mà và hiệu quả.

Dự án này có thể được phát triển thêm trong tương lai với các tính năng như:
1. Thêm nhiều thuật toán khai phá dữ liệu khác
2. Cải thiện giao diện trực quan hóa kết quả
3. Tối ưu hóa hiệu suất cho tập dữ liệu lớn
4. Thêm khả năng xuất kết quả dưới nhiều định dạng khác nhau
5. Tích hợp các công cụ phân tích và so sánh kết quả giữa các thuật toán
6. Phát triển phiên bản di động hoặc ứng dụng máy tính để bàn