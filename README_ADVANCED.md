## Hướng dẫn nâng cao

**Lần đầu tạo project mới :**&#x20;

Xóa hết dữ liệu cũ trong thư mục storage (để lại .gitignore). Tạo bảng CSDL mới chỉnh sửa .env.

Chạy `npm run seed` để tạo CSDL mẫu gồm tài khoản quản trị

**Thêm Bảng CSDL vào trang quản lý :**&#x20;

Cần sử dụng [prisma](https://github.com/prisma/prisma). Thêm bảng csdl trong schema.prisma, chạy các lệnh `npx prisma migrate` và `npx prisma generate` cần thiết

Tìm đến **table.ts** theo đường dẫn `my-app/app/admin/(admin)/[slug]/table.ts` rồi thêm vào mảng **TABLES_SAMPLE**

**Thêm cấu hình settings vào trang quản lý :**&#x20;

Thêm vào biến **GROUP_SETTINGS** trong file **table.ts**

**Lưu ý:**

Sau khi sửa cần build lại ứng dụng trong sản xuất bằng `npm run build`