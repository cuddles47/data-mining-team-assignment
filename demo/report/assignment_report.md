## I. Mục Tiêu Dự Án

Dự án "Data Mining Team Assignment" là một ứng dụng web cung cấp các công cụ khai phá dữ liệu với 3 thuật toán phổ biến:

1. **Thuật toán Apriori**: Dùng để tìm các tập mục phổ biến và luật kết hợp từ dữ liệu giao dịch.
2. **Thuật toán FP-Growth**: Một phương pháp hiệu quả hơn so với Apriori để tìm các tập mục phổ biến.
3. **Thuật toán K-means**: Dùng để phân cụm dữ liệu theo khoảng cách.

Mục tiêu chính của dự án là xây dựng một ứng dụng web cho phép:
- Nhập dữ liệu và cấu hình các tham số thuật toán
- Thực thi các thuật toán khai phá dữ liệu
- Hiển thị kết quả dưới dạng trực quan

## II. Cấu Trúc Dự Án

Dự án được tổ chức với cấu trúc thư mục rõ ràng và đầy đủ:

```
data-mining-team-assignment/
├── src/                # Mã nguồn triển khai các thuật toán
│   ├── apriori.ts      # Triển khai thuật toán Apriori
│   ├── fpGrowth.ts     # Triển khai thuật toán FP-Growth
│   ├── kmeans_clustering.ts # Triển khai thuật toán K-means
├── web/                # Giao diện người dùng web
│   ├── app.ts/js       # Logic xử lý giao diện
│   ├── index.html      # Cấu trúc HTML của ứng dụng
│   ├── styles.css      # Định dạng CSS cho ứng dụng
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
FP-Growth (Frequent Pattern Growth) là thuật toán khai thác tập mục phổ biến không sử dụng phương pháp tạo ứng viên như Apriori. Thay vào đó, nó sử dụng cấu trúc dữ liệu FP-Tree (Frequent Pattern Tree) để lưu trữ thông tin tần suất xuất hiện của các mục dưới dạng nén, giúp tiết kiệm bộ nhớ và tăng hiệu suất xử lý.

#### Các cấu trúc dữ liệu chính
1. **FPTreeNode**: Đại diện cho một nút trong cây FP-Tree, bao gồm:
   - `item`: Tên của mục (hoặc null cho nút gốc)
   - `count`: Số lần xuất hiện của mục trong đường dẫn từ gốc đến nút này
   - `parent`: Liên kết đến nút cha
   - `children`: Map lưu trữ các nút con, với key là tên mục và value là nút con
   - `next`: Liên kết đến nút tiếp theo có cùng mục (sử dụng trong bảng header)

2. **FPTree**: Cấu trúc cây FP-Tree, bao gồm:
   - `root`: Nút gốc của cây
   - `headerTable`: Bảng header lưu trữ con trỏ đến nút đầu tiên của mỗi mục

#### Kết quả trả về
Thuật toán trả về một đối tượng phức hợp gồm:
- `frequentItemsets`: Mảng các tập mục phổ biến và giá trị support của chúng
- `logs`: Bản ghi quá trình thực thi thuật toán để theo dõi
- `frequentItemsetsData`: Dữ liệu chi tiết về quá trình khai thác mỗi mục
- `treeNodes`: Thông tin cấu trúc cây để hiển thị trực quan

#### Luồng thực thi trong mã nguồn
```
Pseudo code FP-Growth:
1. Đếm tần suất của mỗi mục trong tất cả các giao dịch
2. Lọc ra các mục phổ biến (có tần suất ≥ minSupport) và sắp xếp theo tần suất giảm dần
3. Xây dựng FP-Tree:
   a. Tạo nút gốc
   b. Với mỗi giao dịch, lọc giữ lại các mục phổ biến, sắp xếp theo thứ tự tần suất, và chèn vào cây
   c. Duy trì bảng header để liên kết các nút có cùng tên mục
4. Khai thác các tập mục phổ biến từ FP-Tree (hàm mineTree):
   a. Với mỗi mục trong bảng header (bắt đầu từ mục có tần suất thấp nhất):
      i. Tính support của mục bằng cách tổng hợp count của tất cả các nút
      ii. Nếu support ≥ minSupport, tạo tập mục phổ biến bằng cách kết hợp mục hiện tại với các hậu tố (suffix)
      iii. Xây dựng cơ sở mẫu có điều kiện (conditional pattern base) cho mục hiện tại
      iv. Tạo FP-Tree có điều kiện (conditional FP-tree) từ cơ sở mẫu
      v. Gọi đệ quy mineTree với FP-Tree có điều kiện và tập mục đã tìm được
5. Loại bỏ các tập mục trùng lặp và trả về kết quả
```

Trong mã nguồn thực tế, thuật toán được triển khai theo các bước sau:

1. **Đếm tần suất các mục**:
   ```typescript
   const itemSupport: Map<string, number> = new Map();
   for (const transaction of transactions) {
       for (const item of transaction) {
           itemSupport.set(item, (itemSupport.get(item) || 0) + 1);
       }
   }
   ```

2. **Lọc và sắp xếp các mục phổ biến**:
   ```typescript
   const frequentItems = Array.from(itemSupport.entries())
       .filter(([_, count]) => count >= minSupport)
       .sort((a, b) => {
           if (b[1] !== a[1]) return b[1] - a[1];
           return a[0].localeCompare(b[0]);
       })
       .map(([item]) => item);
   ```

3. **Xây dựng FP-Tree từ các giao dịch đã lọc**:
   ```typescript
   const tree = new FPTree();
   for (const transaction of transactions) {
       const filteredTransaction = transaction
           .filter(item => frequentItems.includes(item))
           .sort((a, b) => frequentItems.indexOf(a) - frequentItems.indexOf(b));
       tree.addTransaction(filteredTransaction);
   }
   ```

4. **Khai thác tập mục phổ biến với hàm đệ quy mineTree**:
   - Lấy các mục theo thứ tự ngược với tần suất ban đầu (tăng dần)
   - Với mỗi mục, tính support tổng hợp từ các nút trong cây
   - Nếu support đạt ngưỡng, tạo tập mục phổ biến mới
   - Xây dựng cơ sở mẫu điều kiện và cây FP-Tree điều kiện
   - Khai thác đệ quy trên cây điều kiện

5. **Xử lý và ghi nhận kết quả chi tiết**:
   - Lưu lại quá trình khai thác trong logs
   - Lưu thông tin chi tiết về cơ sở mẫu điều kiện, cây FP-Tree và các mẫu phổ biến trong frequentItemsetsData
   - Lưu thông tin về cấu trúc cây để hiển thị trực quan

6. **Xử lý các tổ hợp con và pattern kết hợp**:
   - Mã nguồn thực tế tạo các tổ hợp con từ mỗi mục để phát hiện ra các pattern con có ý nghĩa
   - Các tập mục được lọc trùng và đảm bảo mỗi tập chỉ xuất hiện một lần trong kết quả cuối cùng

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

## VI. Kết Luận

Dự án "Data Mining Team Assignment" là một ứng dụng web giáo dục cung cấp các công cụ khai phá dữ liệu thông qua ba thuật toán phổ biến: Apriori, FP-Growth và K-means Clustering. Dự án đã được triển khai bằng TypeScript với giao diện web đơn giản và trực quan, cho phép người dùng tương tác với các thuật toán, nhập dữ liệu và xem kết quả.

Mỗi thuật toán đều được triển khai theo đúng các nguyên lý và bước thực hiện tiêu chuẩn, kèm theo các cải tiến để hiển thị chi tiết quá trình thực thi giúp người dùng hiểu rõ hơn về cách hoạt động của thuật toán. Việc lưu trữ chi tiết từng bước thực hiện của thuật toán không chỉ giúp người dùng hiểu rõ về thuật toán mà còn tạo cơ sở cho việc trực quan hóa quy trình khai phá dữ liệu.

Dự án này có thể được phát triển thêm trong tương lai với các tính năng như:
1. Thêm nhiều thuật toán khai phá dữ liệu khác
2. Cải thiện giao diện trực quan hóa kết quả
3. Tối ưu hóa hiệu suất cho tập dữ liệu lớn
4. Thêm khả năng xuất kết quả dưới nhiều định dạng khác nhau