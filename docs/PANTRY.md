# Kho nguyên liệu / Pantry

Trang **Cá nhân** có mục **Kho nguyên liệu**, với hai lựa chọn **Mở kho nguyên liệu** và **Thêm nguyên liệu** để vào form thêm trực tiếp. Tab **Mua sắm → Mở kho nguyên liệu** vẫn dùng chung màn hình quản lý kho.

- `/pantry`: xem, tìm và lọc nguyên liệu theo tất cả / sắp hết hạn trong 7 ngày / đã hết hạn.
- `/pantry/item`: chọn thực phẩm trong danh mục có tìm kiếm và tải thêm, nhập số lượng, đơn vị, hạn dùng và ghi chú để thêm.
- `/pantry/item?itemId=<uuid>`: sửa số lượng, đơn vị, hạn dùng, ghi chú hoặc xác nhận xóa. Thực phẩm không đổi được trên mục đã lưu, đúng theo API.

Feature nằm ở `src/features/pantry`: `pantryApi.ts` gọi HTTP, `hooks.ts` quản lý TanStack Query theo tài khoản, `pantryState.ts` xử lý số lượng/ngày/lọc, `screens/` điều phối UI. Route yêu cầu đăng nhập và sử dụng auth interceptor hiện có. Dữ liệu hiển thị đến từ BE, không có mock/fallback inventory trong app.

BE có sẵn `GET /pantry`, `POST /pantry/items`, `PATCH /pantry/items/:itemId`, `DELETE /pantry/items/:itemId`. Sau mutation, cache được cập nhật bằng kết quả server và đồng bộ lại. Backend tự kiểm tra chủ sở hữu; FE không gửi `userId`, tên thực phẩm snapshot hoặc ID tự tạo.

Hạn dùng nhập theo `YYYY-MM-DD`, đổi thành cuối ngày ở múi giờ thiết bị. Sửa số lượng không thay đổi thời điểm hết hạn cũ; xóa ngày gửi `null`, xóa ghi chú gửi chuỗi rỗng. Kho tối đa 500 mục nên lọc cục bộ trên toàn bộ kết quả `/pantry`, không chỉ một trang dữ liệu. Danh mục chọn thực phẩm có phân trang riêng.

Đã có trạng thái tải, rỗng, lỗi/thử lại, không tìm thấy mục, kiểm tra form, khóa nút khi đang lưu/xóa, giữ draft khi request lỗi và xác nhận xóa. Ngôn ngữ Việt/Anh theo thiết lập app.

Kiểm tra:

```powershell
npm run typecheck
npm run lint
npm run test:ui
```

Kiểm thử giao diện FE → BE: chạy FE ở cổng 8085, rồi từ repo BE chạy `node tests/browser/pantry-mobile.mjs` với Node 24+ và Chrome. Script dùng backend thật với repository trong bộ nhớ và fake auth, chặn external request; ảnh 390 × 844 nằm ở `test-results/pantry-mobile/` của BE. Đây không phải xác nhận kết nối MongoDB/Firebase thật hoặc kiểm thử native Android/iOS.

AI nhận diện, UI thêm hàng loạt và thông báo hạn dùng theo lịch không thuộc flow thủ công này.
