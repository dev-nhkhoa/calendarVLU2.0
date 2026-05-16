# CalendarVLU

Đưa lịch học và lịch thi của bạn lên Google Calendar.

CalendarVLU là công cụ giúp sinh viên Đại học Văn Lang (VLU) import lịch học (`lichHoc`) và lịch thi (`lichThi`) từ [online.vlu.edu.vn](https://online.vlu.edu.vn) sang các nền tảng lịch phổ biến. Dự án gồm hai phần:

- **[Website Landing page](https://calendar-vlu.nhkhoa.site)** — Landing page giới thiệu vừa là back-end của app.
- **Chrome Extension** — Google Chrome Extension giúp thao tác nhanh ngay trên tab VLU, tự động fetch và đồng bộ lịch.

## Tính năng

- **Import lịch VLU** — Fetch lịch học và lịch thi trực tiếp từ online.vlu.edu.vn
- **Nhập lịch lên Google Calendar** — Đẩy lịch lên Google Calendar qua OAuth 2.0
- **Xuất CSV/iCal** — Tải dữ liệu lịch để import vào ứng dụng lịch khác
- **Export CSV** — Tải xuống tất cả event lịch học/lịch thi định dạng file .csv

## Hướng dẫn cài đặt

[![Hướng dẫn cài đặt CalendarVLU](https://img.youtube.com/vi/x3m1PGEfG5c/maxresdefault.jpg)](https://youtu.be/x3m1PGEfG5c)

1. Tải file `.zip` từ [website chính thức](https://calendar-vlu.nhkhoa.site) hoặc từ [Chrome Web Store]() (sắp có)
2. Giải nén file `.zip`
3. Vào `chrome://extensions/`
4. Bật **Developer mode** (góc trên bên phải)
5. Chọn **Load unpacked** và chọn thư mục vừa giải nén

## Hướng dẫn sử dụng

[![Hướng dẫn sử dụng CalendarVLU](https://img.youtube.com/vi/x3m1PGEfG5c/maxresdefault.jpg)](https://youtu.be/x3m1PGEfG5c)

## Công nghệ sử dụng

| Phần             | Công nghệ                                                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web App          | [Next.js 15](https://nextjs.org/), [NextAuth v5](https://next-auth.js.org/), [Prisma](https://www.prisma.io/), [Zustand](https://zustand-demo.pmnd.rs/), [Tailwind CSS](https://tailwindcss.com/) |
| Chrome Extension | [Plasmo](https://www.plasmo.com/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)                                                                                          |
| Database         | MongoDB (via [Prisma](https://www.prisma.io/))                                                                                                                                                    |
| Deploy           | [Vercel](https://vercel.com/)                                                                                                                                                                     |

## Đóng góp

Dự án mã nguồn mở — mọi đóng góp đều được chào đón.

1. Clone repo:
   ```bash
   git clone https://github.com/dev-nhkhoa/calendarVLU
   cd calendarVLU/calendarVLU2.0
   npm install
   ```
2. Tạo branch mới
3. Commit và push
4. Mở Pull Request

## Giấy phép

MIT — xem file [LICENSE](LICENSE).

## Liên kết

- [Website](https://calendar-vlu.nhkhoa.site)
- [GitHub](https://github.com/dev-nhkhoa/calendarVLU)
- [Chính sách bảo mật](https://calendar-vlu.nhkhoa.site/privacy-policy)
- [Điều khoản dịch vụ](https://calendar-vlu.nhkhoa.site/terms)
