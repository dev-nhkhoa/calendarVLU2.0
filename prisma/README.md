# VLU Calendar 2.0

![DB ERD Image](/public/idea-images/erd.png)

## Mô tả cấu trúc Database

### Bảng User

- `id`: ID người dùng (MongoDB ObjectId)
- `name`: Tên người dùng
- `studentId`: Mã số sinh viên (duy nhất)
- `email`: Email người dùng (duy nhất)
- `image`: Ảnh đại diện
- `accounts`: Quan hệ một-nhiều với bảng Account
- `createdAt`: Thời gian tạo
- `updatedAt`: Thời gian cập nhật

### Bảng Account

- `id`: ID tài khoản (MongoDB ObjectId)
- `userId`: ID người dùng (khóa ngoại)
- `type`: Loại tài khoản
- `provider`: Nhà cung cấp đăng nhập (Google, Facebook,...)
- `providerAccountId`: ID tài khoản từ nhà cung cấp
- `refresh_token`: Token làm mới
- `access_token`: Token truy cập
- `expires_at`: Thời gian hết hạn
- `token_type`: Loại token
- `scope`: Phạm vi quyền hạn
- `id_token`: Token định danh
- `session_state`: Trạng thái phiên
- `password`: Mật khẩu
- `createdAt`: Thời gian tạo
- `updatedAt`: Thời gian cập nhật

### Bảng Calendar

- `id`: ID lịch (MongoDB ObjectId)
- `userId`: ID người dùng (khóa ngoại)
- `yearStudy`: Năm học
- `termId`: ID học kỳ
- `lichType`: Loại lịch
- `details`: Chi tiết lịch
- `createdAt`: Thời gian tạo
- `updatedAt`: Thời gian cập nhật
- `user`: Quan hệ với bảng User
