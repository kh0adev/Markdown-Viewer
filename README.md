# Trình chỉnh sửa Markdown

<div align="center">
  <img src="assets/icon.png" alt="Markdown Viewer Logo" width="140" />

  <p><strong>Công cụ soạn thảo Markdown</strong></p>
  <p>Bảo mật, xem trước trực tiếp, hỗ trợ LaTeX, Mermaid, tô sáng cú pháp và xuất PDF/HTML/MD nhanh chóng trên trình duyệt.</p>

  <p>
    <a href="https://markdown.com.vn/" target="_blank" rel="noopener noreferrer">Trang Demo</a> ·
    <a href="https://github.com/kh0adev/Markdown-Viewer/wiki" target="_blank" rel="noopener noreferrer">Tài liệu</a> ·
    <a href="https://github.com/kh0adev/Markdown-Viewer/issues" target="_blank" rel="noopener noreferrer">Vấn đề</a> ·
    <a href="https://github.com/kh0adev/Markdown-Viewer/releases" target="_blank" rel="noopener noreferrer">Phát hành</a>
  </p>

  <p>
    <img alt="Giấy phép" src="https://img.shields.io/github/license/kh0adev/Markdown-Viewer?color=2ea043" />
  
  </p>
</div>

---

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng](#tính-năng)
- [Ảnh chụp màn hình](#ảnh-chụp-màn-hình)
- [Bắt đầu](#bắt-đầu)
- [Sử dụng](#sử-dụng)
- [Dự án Firebase](#dự-án-firebase)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Trưng bày](#trưng-bày)
- [Người đóng góp](#người-đóng-góp)
- [Giấy phép](#giấy-phép)
- [Liên hệ](#liên-hệ)
- [Bàn giao tài khoản & tên miền](#bàn-giao-tài-khoản--tên-miền)

---

## Giới thiệu

Markdown Viewer là trình soạn thảo và xem trước Markdown đầy đủ tính năng, hiển thị Markdown theo phong cách GitHub trong thời gian thực. Ứng dụng hoàn toàn chạy phía client, nhẹ và được tối ưu cho quy trình làm việc chuyên nghiệp — từ ghi chú nhanh đến tài liệu kỹ thuật với biểu đồ và LaTeX.

Bản fork này được duy trì và triển khai bởi **Khoa Trần** tại **[markdown.com.vn](https://markdown.com.vn/)** với tích hợp Firebase để lưu đám mây, tự động chia sẻ và quản lý tài liệu.

---

## Tính năng

**Soạn thảo & Xem trước**
- Hiển thị chia đôi màn hình với cập nhật thời gian thực
- Hỗ trợ Markdown phong cách GitHub (GFM)
- Tô sáng cú pháp cho 190+ ngôn ngữ
- Cảnh báo/ghi chú kiểu GitHub (`[!NOTE]`, `[!TIP]`, `[!WARNING]`, v.v.)
- Hiển thị emoji shortcode (JoyPixels) và hỗ trợ Unicode emoji
- Phân tích YAML frontmatter với bảng metadata
- Markdown mở rộng: danh sách định nghĩa, chỉ số trên, chỉ số dưới, tô sáng, chú thích cuối trang

**Biểu đồ & Toán học**
- Hiển thị toán học LaTeX qua MathJax (inline + block)
- Biểu đồ Mermaid với thanh công cụ tương tác (phóng to, kéo, sao chép, xuất PNG/SVG)

**Đám mây & Chia sẻ (Mới)**
- Đăng nhập Google qua Firebase Auth
- **Lưu đám mây** — lưu tài liệu trực tiếp lên Firestore với liên kết chia sẻ
- **Tự động chia sẻ** — bật để tự động đồng bộ thay đổi lên đám mây khi bạn gõ
- **Tài liệu của tôi** — duyệt, mở và quản lý tất cả tài liệu đã lưu từ menu tài khoản
- Chia sẻ tài liệu qua URL với chế độ xem hoặc chỉnh sửa
- Nén URL chia sẻ bằng pako (deflate)

**Tập tin & Xuất file**
- Nhập từ tập tin cục bộ, kéo thả hoặc URL GitHub công khai (chọn nhiều tập tin với cây thư mục)
- Xuất Markdown, HTML (độc lập với CSS nhúng) hoặc PDF (tự động phân tích ngắt trang)
- Sao chép HTML đã hiển thị trực tiếp vào clipboard
- Xuất PDF với phát hiện ngắt trang tự động và thu nhỏ đồ họa quá khổ

**Năng suất & Quy trình làm việc**
- Đa tab tài liệu (mới, đổi tên, nhân bản, xóa, tối đa 20)
- Đặt lại tất cả tab trong một thao tác
- Kéo thả sắp xếp tab
- Lưu trạng thái tab vào localStorage
- Chế độ xem: chỉ soạn thảo, chỉ xem trước hoặc chia đôi
- Kích thước khung soạn thảo/xem trước có thể điều chỉnh (hỗ trợ bàn phím)
- Cuộn đồng bộ (bật/tắt)
- Thống kê nội dung trực tiếp (số từ, ký tự, thời gian đọc)
- Tìm kiếm & Thay thế với regex, phân biệt hoa thường, toàn bộ từ, bộ lọc phạm vi (tiêu đề/code/LaTeX/Mermaid/văn bản thường), xem trước thay đổi
- Hoàn tác / Làm lại
- Thanh công cụ định dạng Markdown (đậm, nghiêng, tiêu đề, danh sách, liên kết, hình ảnh, bảng, code, emoji, ký hiệu, cảnh báo, căn lề, chuyển đổi chữ hoa/thường)
- Phím tắt (xuất file, sao chép, tab mới/đóng, cuộn đồng bộ, thụt lề, tìm kiếm)

**Giao diện & Trợ năng**
- Bố cục responsive với menu di động riêng
- Giao diện sáng/tối với hỗ trợ phát hiện hệ thống
- Chuyển đổi hướng RTL/LTR
- Đa ngôn ngữ: Tiếng Việt, English, 中文, 日本語, 한국어, Português (Brasil)
- Focus trapping trong modal, nhãn ARIA, thông báo trình đọc màn hình

**Riêng tư & Bảo mật**
- Xử lý 100% phía client
- Hiển thị HTML đã được làm sạch bằng DOMPurify
- Firebase Authentication chỉ dùng cho tính năng lưu đám mây
- Không theo dõi, không cookie, không lưu trữ máy chủ (trừ khi bạn chọn lưu đám mây)

---

## Ảnh chụp màn hình

### Tô sáng cú pháp Code
![Tô sáng cú pháp Code](assets/code.png)

### Hỗ trợ biểu thức Toán học
![Biểu thức Toán học](assets/mathexp.png)

### Biểu đồ Mermaid
![Biểu đồ Mermaid](assets/mermaid.png)

### Hỗ trợ Bảng
![Hỗ trợ Bảng](assets/table.png)

---

## Bắt đầu

### Máy chủ tĩnh (phát triển local)
```bash
git clone https://github.com/kh0adev/Markdown-Viewer.git
cd Markdown-Viewer
python3 -m http.server 8080
```
Sau đó mở **http://localhost:8080**.

> **Lưu ý:** Firebase Authentication (Đăng nhập Google) yêu cầu tên miền thật hoặc `localhost` — sẽ **không** hoạt động với `127.0.0.1` hoặc IP tùy chỉnh. Dùng `http://localhost:8080` để kiểm tra local.

### Trang web trực tiếp
Bản production đang hoạt động tại **[https://markdown.com.vn/](https://markdown.com.vn/)** với đầy đủ tính năng đám mây Firebase.

---

## Sử dụng

1. Viết Markdown trong khung soạn thảo bên trái.
2. Xem trước kết quả hiển thị bên phải.
3. Dùng **Đăng nhập Google** để kích hoạt tính năng lưu đám mây/tự động chia sẻ.
4. Nhập, xuất, chia sẻ hoặc chuyển chế độ xem bằng thanh công cụ.
5. Dùng thanh tab để quản lý nhiều tài liệu.
6. Nhấp vào avatar (góc trên bên phải) để truy cập **Tài liệu của tôi** — các tập tin đã lưu trên đám mây.

**Phím tắt**
- `Ctrl/Cmd + S` → Xuất Markdown
- `Ctrl/Cmd + F` → Mở Tìm kiếm & Thay thế
- `Ctrl/Cmd + C` → Sao chép HTML đã hiển thị (khi không chọn văn bản)
- `Ctrl/Cmd + Shift + S` → Bật/tắt cuộn đồng bộ (chế độ chia đôi)
- `Ctrl/Cmd + T` → Tab mới
- `Ctrl/Cmd + W` → Đóng tab
- `Tab` → Thụt lề trong soạn thảo

---

## Dự án Firebase

Ứng dụng này sử dụng **Firebase** cho các tính năng đám mây:

| Dịch vụ | Mục đích |
|---------|----------|
| **Firebase Authentication** | Đăng nhập Google để xác thực người dùng |
| **Cloud Firestore** | Lưu trữ tài liệu (collection `shared-docs`) |

- **Dự án Firebase:** `markdown-viewer-d4d9b`
- **Vị trí Firestore:** `asia-southeast1` (Singapore)
- **Nhà cung cấp xác thực:** Google

Cấu hình Firebase được tiêm vào lúc build/triển khai qua đối tượng `firebaseConfig` trong `auth.js`. Kho mã nguồn chứa giá trị mẫu; thông tin production được quản lý an toàn.

---

## Công nghệ sử dụng

- HTML5, CSS3, JavaScript (Vanilla, không framework)
- [Bootstrap](https://getbootstrap.com/)
- [Marked.js](https://marked.js.org/)
- [highlight.js](https://highlightjs.org/)
- [MathJax](https://www.mathjax.org/)
- [Mermaid](https://mermaid.js.org/)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [FileSaver.js](https://github.com/eligrey/FileSaver.js)
- [html2canvas](https://github.com/niklasvh/html2canvas) + [jsPDF](https://www.npmjs.com/package/jspdf)
- [JoyPixels](https://www.joypixels.com/)
- [js-yaml](https://github.com/nodeca/js-yaml)
- [pako](https://github.com/nodeca/pako)
- [Firebase](https://firebase.google.com/) (Auth + Firestore)

---

## Trưng bày

**Được xây dựng với Markdown Viewer**

| Dự án | Mô tả |
|-------|-------|
| [Markdown Desk](https://github.com/jhrepo/markdown-desk) | Trình bao bọc native macOS xây dựng với [Tauri](https://tauri.app/), thêm tính năng tải lại trực tiếp và mở/lưu tập tin native. |

---

## Người đóng góp

- **Khoa Trần** ([@kh0adev](https://github.com/kh0adev)) — Tích hợp Firebase, lưu đám mây/tự động chia sẻ, Tài liệu của tôi, đa ngôn ngữ, triển khai & DevOps

---

## Giấy phép

Dự án này được cấp phép theo Apache License. Xem [LICENSE](LICENSE) để biết chi tiết.

---

## Liên hệ

- **Người duy trì:** Khoa Trần
- **GitHub:** [@kh0adev](https://github.com/kh0adev)
- **Trang web production:** [https://markdown.com.vn/](https://markdown.com.vn/)

---

## Bàn giao tài khoản & tên miền

Các tài sản sau đang được quản lý và có thể chuyển giao theo yêu cầu:

| Tài sản | Chi tiết |
|---------|----------|
| **Tên miền** | `markdown.com.vn` — đã đăng ký |
| **Firebase Console** | Dự án `markdown-viewer-d4d9b` — Firestore, Authentication |
| **GitHub Repository** | `kh0adev/Markdown-Viewer` — mã nguồn, vấn đề, phát hành |
