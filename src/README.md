# **PAGE IDEAS**

## Landing page

- Giới thiệu về website, cách thức vận hành và dòng thời gian phát triển,...

## Sign In Page

- Tài khoản có thể liên kết với tài khoản trang online.vlu.edu.vn và google để sync lịch học sang google calendar sau này.

Dùng auth.js Credentials & Google Provider

- [Auth.js | Authentication for the Web](https://authjs.dev/)

- [Auth.js | Credentials](https://authjs.dev/getting-started/providers/credentials?framework=next-js) cho tài khoản Văn Lang

- [Auth.js | Google](https://authjs.dev/getting-started/providers/google?framework=next-js)

## Calendar Interactions & more

- Nếu user đăng ký tài khoản mới thì cần thêm bước liên kết tài khoản VLU để có thể xem lịch học, lịch thi của mình.

- Tính năng:

  - Export lịch dạng .csv, .ical

  - Tự động chuyển lịch sang google calendar (User cần liên kết tài khoản Google để dùng tính năng này)

  - Tự động chuyển lịch sang outlook ( cần liên kết tài khoản microsoft trường cấp ) cần trường xét duyệt.

  - !!Sync lịch khi lịch thay đổi (Ý tưởng: Sau mỗi ngày server sẽ chạy so sánh tất cả các lịch của tất cả user trong db, nếu thấy lịch thay đổi thì sẽ thực hiện update lịch mới)

## Settings page

- Chuyển đổi theme, light/dark mode

- Hiển thị thông tin tài khoản, các tài khoản liên kết như Google, VLU, Microsoft,...

- Các thứ khác,...
