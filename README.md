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

## **Công nghệ sử dụng**  
- **TypeScript**: Ngôn ngữ chính để phát triển ứng dụng.  
- **HTML/CSS**: Xây dựng giao diện người dùng.  
- **Node.js**: Chạy ứng dụng.  
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
│   ├── app.ts/js       # Logic xử lý giao diện
│   ├── index.html      # Cấu trúc HTML của ứng dụng
│   ├── styles.css      # Định dạng CSS cho ứng dụng
├── data/               # Dữ liệu mẫu cho kiểm thử
├── package.json        # Thông tin dự án và dependencies
└── tsconfig.json       # Cấu hình TypeScript
```





