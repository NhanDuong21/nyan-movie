# Nyan Movie - Project Overview

## 1. Giới thiệu dự án
**Nyan Movie** là hệ thống website xem phim trực tuyến được thiết kế lại từ nền tảng ASP.NET MVC cũ sang kiến trúc hiện đại (MERN Stack). Mục tiêu chính là phục vụ đồ án môn học với cấu trúc code sạch, dễ hiểu, dễ demo và có khả năng mở rộng.

## 2. Mục tiêu kỹ thuật (Academic Project Goals)
- **Kiến trúc rõ ràng:** Phân tách hoàn toàn Frontend (Client) và Backend (Server) thông qua RESTful API.
- **Dễ dàng cài đặt & demo:** Hệ thống có thể chạy local dễ dàng chỉ với vài dòng lệnh.
- **Tối ưu tài nguyên:** Video sẽ được nhúng chủ yếu qua Iframe (YouTube/Drive) để không phải xử lý bài toán streaming phức tạp, tập trung vào CRUD và logic nghiệp vụ.
- **Responsive Design:** Giao diện tối ưu cho cả Desktop và Mobile.

## 3. Công nghệ sử dụng (Tech Stack)
- **Frontend:** React.js (Vite), React Router DOM, Axios, Tailwind CSS (hoặc Bootstrap 5 tùy chọn nếu cần nhanh).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (sử dụng Mongoose ODM).
- **Authentication:** JSON Web Token (JWT) - Lưu trữ trong HttpOnly Cookie hoặc LocalStorage.
- **Upload File:** Multer (Lưu trữ ảnh cover/banner local trong phase 1).
- **Deployment (Dự kiến):** Vercel (Frontend), Render/Railway (Backend), MongoDB Atlas (Database).

## 4. Các giai đoạn phát triển (Roadmap)
- **Phase 1:** Phân tích, thiết kế Database & Architecture.
- **Phase 2:** Khởi tạo base project, setup CI/CD cơ bản (nếu cần), kết nối DB.
- **Phase 3:** Xây dựng Authentication & Phân quyền (User/Admin).
- **Phase 4:** Phát triển Admin APIs & Dashboard (Quản lý Danh mục, Phim, Tập phim).
- **Phase 5:** Phát triển Frontend End-User (Trang chủ, Chi tiết, Xem phim).
- **Phase 6:** Xây dựng tính năng tương tác (Bình luận, Yêu thích, Lịch sử xem).
- **Phase 7:** Testing, Bug fixing, Seed data & Chuẩn bị tài liệu báo cáo.