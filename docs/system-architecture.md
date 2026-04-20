# Nyan Movie - System Architecture

## 1. Cấu trúc hệ thống tổng quan
Dự án áp dụng mô hình **Client-Server** với API RESTful.
- **Client (React.js):** Gửi HTTP Requests (thông qua Axios) lấy/cập nhật dữ liệu. Không xử lý trực tiếp với DB.
- **Server (Node.js/Express):** Tiếp nhận request, xác thực JWT, tương tác với MongoDB qua Mongoose, trả về dữ liệu định dạng JSON.

## 2. Cấu trúc thư mục (Monorepo Layout)
Để sinh viên dễ nộp bài và quản lý chung 1 repository:

```text
nyan-movie/
├── client/                 # Frontend React (Vite)
│   ├── src/
│   │   ├── api/            # Cấu hình Axios, các hàm gọi API
│   │   ├── assets/         # Images, global CSS
│   │   ├── components/     # UI Components dùng chung (Button, Card, Modal)
│   │   ├── features/       # Phân chia theo module (Auth, Movie, Admin)
│   │   ├── hooks/          # Custom hooks (useAuth, useFetch)
│   │   ├── layouts/        # MainLayout, AdminLayout
│   │   ├── pages/          # Các trang chính (Home, Detail, Watch, Dashboard)
│   │   ├── routes/         # Cấu hình React Router
│   │   ├── store/          # Context API hoặc Zustand/Redux (nếu cần)
│   │   ├── utils/          # Format date, constants
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── config/         # DB connection, env variables
│   │   ├── controllers/    # Xử lý logic từ routes
│   │   ├── middlewares/    # Auth, Error handler, Upload
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Định nghĩa API endpoints
│   │   ├── services/       # Business logic (tùy chọn để tách controller)
│   │   ├── utils/          # Helper functions (hash password, jwt)
│   │   ├── app.js          # Cấu hình Express app
│   │   └── server.js       # Entry point
│   ├── uploads/            # Thư mục lưu ảnh upload local
│   ├── .env
│   └── package.json
│
├── docs/                   # Tài liệu dự án (Markdown)
└── README.md