# Nyan Movie - Database Design (MongoDB)

Hệ thống sử dụng MongoDB với Mongoose. Dưới đây là các Collections cốt lõi.

## 1. Bảng `users`
Lưu trữ thông tin người dùng và quyền hạn.
- `_id`: ObjectId
- `username`: String (Unique, Required)
- `email`: String (Unique, Required)
- `password`: String (Hashed)
- `role`: String (Enum: `['user', 'admin']`, Default: `'user'`)
- `avatar`: String (URL)
- `isActive`: Boolean (Default: `true`)
- `createdAt`, `updatedAt`: Timestamps

## 2. Các bảng Danh mục (Categories)
Thiết kế đơn giản để tag phim.
### `genres` (Thể loại)
- `name`: String (Required)
- `slug`: String (Unique)

### `countries` (Quốc gia)
- `name`: String (Required)
- `slug`: String (Unique)

### `years` (Năm phát hành)
- `year`: Number (Unique, Required)

## 3. Bảng `movies` (Phim)
Lưu thông tin chung của phim (áp dụng cho cả phim bộ và phim lẻ).
- `_id`: ObjectId
- `title`: String (Required)
- `slug`: String (Unique, Required)
- `description`: String
- `poster`: String (Image URL)
- `backdrop`: String (Image URL)
- `type`: String (Enum: `['single', 'series']`) - Phân biệt phim lẻ / phim bộ
- `duration`: Number (Thời lượng - Phút)
- `totalEpisodes`: Number (Tổng số tập dự kiến)
- `price`: Number (VND, Default: 0)
- `views`: Number (Default: 0)
- `genres`: [ObjectId] (Ref: `Genre`)
- `country`: ObjectId (Ref: `Country`)
- `year`: ObjectId (Ref: `Year`)
- `status`: String (Enum: `['ongoing', 'completed', 'hidden']`)
- `createdAt`, `updatedAt`: Timestamps

## 4. Bảng `episodes` (Tập phim)
Lưu chi tiết link video cho từng tập. 
*(Quy tắc: Phim lẻ (`single`) cũng sẽ có 1 record trong bảng này tương ứng với tập duy nhất để đồng nhất logic Query).*
- `_id`: ObjectId
- `movie`: ObjectId (Ref: `Movie`, Required)
- `name`: String (Tên tập, vd: "Tập 1", "Full")
- `episodeNumber`: Number (Thứ tự tập)
- `videoUrl`: String (YouTube Link / Iframe)
- `views`: Number (Default: 0)
- `createdAt`, `updatedAt`: Timestamps
- *Index:* Lập index cho `{ movie: 1, episodeNumber: 1 }`

## 5. Bảng `banners`
Phục vụ slider trang chủ.
- `_id`: ObjectId
- `movie`: ObjectId (Ref: `Movie`)
- `imageUrl`: String (Ảnh ngang chất lượng cao)
- `order`: Number (Thứ tự sắp xếp)
- `isActive`: Boolean

## 6. Bảng `comments`
- `_id`: ObjectId
- `user`: ObjectId (Ref: `User`)
- `movie`: ObjectId (Ref: `Movie`)
- `content`: String (Required)
- `createdAt`, `updatedAt`: Timestamps

## 7. Bảng `interactions` (Tương tác User - Movie)
Gộp chung các tương tác Yêu thích / Xem sau / Lịch sử để dễ quản lý, hoặc tách riêng tùy biến. Dưới đây là cách gộp tối ưu:
- `_id`: ObjectId
- `user`: ObjectId (Ref: `User`, Required)
- `movie`: ObjectId (Ref: `Movie`, Required)
- `type`: String (Enum: `['favorite', 'watch_later', 'history']`)
- `episode`: ObjectId (Ref: `Episode`, Optional - dùng cho history để biết đang xem tập mấy)
- `createdAt`: Timestamps

## 8. Ràng buộc bảo toàn dữ liệu (Cascade / Soft Delete)
- **Xóa Phim (`movies`):** - Không Hard-delete nếu phim đã có lượt xem hoặc comment.
  - *Giải pháp:* Cập nhật `status = 'hidden'` (Soft Delete).
  - Nếu buộc phải Hard-delete: Cần viết Middleware `pre('remove')` trong Mongoose để xóa các `episodes`, `comments` và `interactions` có liên quan tới `movieId` đó.
- **Xóa User (`users`):**
  - Không nên xóa thật để giữ lịch sử comment cộng đồng. Đề xuất: Đổi `isActive = false` và chặn login.