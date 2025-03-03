# CalendarVLU2.0 - Website hỗ trợ sinh viên Văn Lang quản lý lịch học & lịch thi dễ dàng

## Giới thiệu

**CalendarVLU2.0** là một ứng dụng web được thiết kế dành riêng cho sinh viên trường Đại học Văn Lang, giúp quản lý lịch học và lịch thi một cách hiệu quả trên cả PC và Mobile. Không chỉ giới hạn ở trang [Online](https://online.vlu.edu.vn), ứng dụng còn hỗ trợ tích hợp với các nền tảng quản lý thời gian phổ biến, mang lại sự tiện lợi tối đa để sinh viên tổ chức và theo dõi lịch trình của mình mọi lúc, mọi nơi.

### Tính năng chính:

- **Export lịch học và lịch thi** ra file Excel (.csv) để dễ dàng lưu trữ và chia sẻ.
- **Đồng bộ hóa** lịch học và lịch thi với các ứng dụng lịch phổ biến như:
  - [Google Calendar](https://calendar.google.com/)
  - Outlook (đang phát triển).
- **Chia sẻ lịch** học và lịch thi với bạn bè một cách đơn giản (đang phát triển).
- **Cập nhật tự động** khi có thay đổi trong lịch học hoặc lịch thi (đang phát triển).

CalendarVLU2.0 là phiên bản được thiết kế lại và cải tiến từ dự án [CalendarVLU](https://github.com/dev-nhkhoa/calendarVLU). Đây là một dự án cá nhân mà tôi đã dành nhiều tâm huyết từ khâu thiết kế đến khi hoàn thiện, với mục tiêu mang lại trải nghiệm tốt nhất cho cộng đồng sinh viên Văn Lang.

## Nền tảng khả dụng hiện tại

- **Microsoft Excel** - Định dạng .csv
- **[Google Calendar](https://calendar.google.com/)** - Lịch Google

## Công nghệ sử dụng

- **[NextJS 15](https://nextjs.org/)** - Framework React FullStack mạnh mẽ cho phát triển ứng dụng web.
- **[Prisma](https://www.prisma.io/)** - ORM giúp quản lý và tương tác với cơ sở dữ liệu một cách dễ dàng.
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Thư viện quản lý state nhẹ và hiệu quả cho React.

## Hướng dẫn sử dụng

1. Truy cập ứng dụng qua [website chính thức](https://calendarvlu2-0.vercel.app/).
2. Đăng nhập bằng tài khoản sinh viên Văn Lang của bạn.
3. Sử dụng các tính năng như export lịch sang Excel, đồng bộ với Google Calendar hoặc các tính năng khác khi chúng được hoàn thiện.

## Đóng góp

Tôi rất hoan nghênh mọi ý kiến, ý tưởng và sự đóng góp từ cộng đồng để cải thiện CalendarVLU2.0. Nếu bạn muốn tham gia phát triển hoặc đề xuất tính năng mới, hãy làm theo các bước sau:

1. Clone project:
   ```cmd
   git clone https://github.com/dev-nhkhoa/calendarVLU2.0
   cd calendarVLU2.0
   npm i
   npm run dev
   ```
2. Tạo một nhánh mới cho tính năng hoặc sửa lỗi bạn muốn đóng góp.
3. Commit và push code của bạn lên repository.
4. Mở một Pull Request để tôi xem xét và hợp nhất đóng góp của bạn.

Mọi sự đóng góp đều được trân trọng và sẽ góp phần giúp ứng dụng trở nên hữu ích hơn cho sinh viên Văn Lang.
