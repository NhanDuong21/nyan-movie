# Nyan Movie - Feature Breakdown (MVP Scope)

Dự án được bẻ nhỏ thành các module tính năng để dễ dàng quản lý tiến độ.

## 1. Phân hệ Người dùng (Public / User End)
### 1.1. Xác thực & Tài khoản
- **Đăng ký/Đăng nhập:** Bằng email/username và mật khẩu (JWT Auth).
- **Quản lý hồ sơ:** Đổi mật khẩu, cập nhật thông tin cơ bản.

### 1.2. Trải nghiệm xem phim
- **Trang chủ (Home):** - Slider Banner nổi bật.
  - Phim Bộ mới cập nhật / Trending.
  - Phim Lẻ mới cập nhật.
- **Duyệt phim:** Theo Thể loại (Genre), Quốc gia (Country), Năm phát hành (Year).
- **Tìm kiếm:** Tìm theo tên phim (Search bar).
- **Chi tiết phim:** Hiển thị Poster, thông tin (đạo diễn, diễn viên, thời lượng, số tập), tóm tắt phim. Có nút "Xem phim", "Yêu thích", "Xem sau".
- **Trang xem phim:**
  - Nhúng video player (YouTube iframe).
  - Chọn tập phim (đối với Phim Bộ).
  - Nút chuyển tập (Tập trước, Tập sau), Báo lỗi.

### 1.3. Tương tác cộng đồng & Cá nhân hóa
- **Bình luận (Comments):** Viết, sửa, xóa bình luận của mình dưới mỗi phim.
- **Danh sách cá nhân:**
  - Phim yêu thích (Favorites).
  - Phim xem sau (Watch Later).
  - Lịch sử xem (Watch History).

## 2. Phân hệ Quản trị (Admin Panel)
### 2.1. Quản lý Danh mục (Master Data)
- **CRUD Thể loại (Genres):** Hành động, Hài hước, Tình cảm...
- **CRUD Quốc gia (Countries):** Việt Nam, Nhật Bản, Mỹ...
- **CRUD Năm phát hành (Years):** 2024, 2023...

### 2.2. Quản lý Nội dung
- **CRUD Banner:** Chọn phim đưa lên slider trang chủ.
- **CRUD Phim (Movies):** - Phân loại Phim Lẻ / Phim Bộ.
  - Upload hình ảnh, nhập thông tin mô tả.
  - Quản lý trạng thái (Publish/Hidden).
- **CRUD Tập phim (Episodes):** Gắn video link (YouTube) vào từng tập của một bộ phim.

### 2.3. Quản lý Tương tác & Người dùng
- **Quản lý Users:** Xem danh sách, cấp quyền Admin, khóa tài khoản.
- **Quản lý Comments:** Xem và xóa các bình luận vi phạm.

*(Ghi chú: Tính năng "Đặt mua/Giá phim" từ hệ thống cũ sẽ được lưu trong DB nhưng ở MVP sẽ ẩn UI thanh toán để tập trung làm mượt luồng xem phim miễn phí).*