# **Data Mining Team Assignment**  

## **Mô tả**  
Dự án này triển khai thuật toán **Apriori** để khai thác các tập mục phổ biến và tạo ra các luật kết hợp từ dữ liệu giao dịch. Ứng dụng được xây dựng bằng **TypeScript** và có giao diện người dùng đơn giản để nhập dữ liệu và xem kết quả.  

## **Chức năng chính**  
- Nhập dữ liệu giao dịch dưới dạng danh sách.  
- Thiết lập ngưỡng **Minimum Support** và **Minimum Confidence**.  
- Thực thi thuật toán Apriori để tìm các tập mục phổ biến.  
- Hiển thị bảng tần suất các mục và các luật kết hợp.  
- Nút **"Reset"** để xóa dữ liệu đầu vào và kết quả.  

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
- Nhập dữ liệu giao dịch vào ô **"Input Transactions"**.  
- Thiết lập ngưỡng **Minimum Support** và **Minimum Confidence**.  
- Nhấn nút **"Execute Apriori"** để xem kết quả.  
- Nhấn nút **"Reset"** để xóa dữ liệu và kết quả.  

### **4. Cấu trúc thư mục**  
```
.
├── src/                # Source code chính
│   ├── apriori.ts      # Thuật toán Apriori
├── web/                # Giao diện người dùng
│   ├── app.ts          # Logic xử lý giao diện
│   ├── index.html      # File HTML chính
├── Dockerfile          # Dockerfile để container hóa ứng dụng
├── docker-compose.yml  # File Docker Compose
├── package.json        # Thông tin dự án và dependencies
└── README.md           # Tài liệu dự án
```  





