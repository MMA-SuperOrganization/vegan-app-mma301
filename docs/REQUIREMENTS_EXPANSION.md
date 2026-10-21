# Hoàn thiện yêu cầu và phần mở rộng — 21/10/2026

## Phạm vi

Giữ các luồng Sprint 2 của MMA_PRD_BR.pdf: Auth/Profile, Meal Planning, Grocery, Diary/Weight và QA. Theo yêu cầu làm tất cả, bổ sung cả nhóm PDF ghi ngoài Sprint 2: AI Chatbot, AI Meal Planner, Ingredient Recognition, Advanced Pantry, Moderation/Report, Advanced Push và Community.

## Vị trí giao diện

Từ **Cá nhân**:

- **Kho nguyên liệu**: mở kho, thêm nguyên liệu và **Kho nâng cao**.
- **Trợ lý và cộng đồng**: trò chuyện AI, AI lên thực đơn, nhận diện ảnh, cộng đồng, báo cáo của tôi và nhắc lịch.
- **Kiểm duyệt** chỉ xuất hiện với tài khoản admin; route cũng chặn user thường. Backend vẫn kiểm tra role.

Các route: /ai, /ai/meal-planner, /ai/ingredients, /pantry/advanced, /community, /community/editor, /community/post?id=..., /community/report, /community/video?id=..., /reminders, /moderation.

## Hành vi chính

- Chat lưu lịch sử, opt-in hồ sơ dinh dưỡng và gửi phản hồi hữu ích/chưa hữu ích. Lỗi provider có thông báo và không tạo câu trả lời giả.
- Thực đơn AI chọn tuần bắt đầu thứ Hai, 1–7 ngày, sửa tên/món/khẩu phần trước khi xác nhận. Generate chỉ tạo proposal; Confirm lưu draft. Có danh sách thực đơn đã lưu và thao tác kích hoạt có xác nhận việc lưu trữ thực đơn active cũ.
- Nhận diện nguyên liệu chọn ảnh/chụp ảnh → upload presigned PUT → confirm upload → AI → xem và sửa thực phẩm/lượng/đơn vị/hạn dùng → xác nhận thêm kho. API bearer token không được gửi tới upload URL.
- Kho nâng cao thêm 1–100 dòng qua bulk API với idempotency key giữ nguyên khi retry cùng nội dung, lọc hạn dùng 0–90 ngày và gợi ý công thức theo kho/hồ sơ. Tạo Grocery có tùy chọn trừ kho.
- Cộng đồng tạo/sửa nháp, gửi duyệt, xem trạng thái/lý do từ chối, đọc bài đã xuất bản, thích/bỏ thích, bình luận/sửa/xóa, báo cáo và theo dõi xử lý. Thẻ bài/video trên Explore/Search/Saved đã có đường mở; video dùng trình phát thiết bị.
- Admin xem nội dung chờ duyệt (post/recipe/video), xuất bản/từ chối, nhận báo cáo, tạo/gộp hồ sơ, đổi ưu tiên, ẩn/khôi phục nội dung và đóng hồ sơ với kết quả. Backend ghi audit và đồng bộ trạng thái báo cáo liên kết.
- Nhắc lịch tạo/sửa/xóa/tạm dừng/bật lại, một lần/hằng ngày/hằng tuần và múi giờ. Ngày giờ một lần nhập theo múi giờ người dùng, chuyển sang ISO ở lớp domain, chặn thời gian không tồn tại khi DST đổi.
- FCM Android đăng ký/hủy thiết bị bằng native device token; foreground notification làm mới inbox; tap mở inbox; token rotation cập nhật đăng ký đã opt-in. Đăng xuất hủy đăng ký trước khi xóa phiên; nếu mạng lỗi thì giữ phiên để người dùng thử lại.
- Giữ tên hồ sơ qua auth sync, bổ sung giới tính và lấy đủ pagination cho nhật ký/cân nặng.

## Kiểm chứng

- TypeScript, ESLint: đạt.
- Unit FE: 90/90 đạt.
- Browser 390×844 + API thật với repository in-memory: 46 thao tác ghi đạt; Firebase/AI/storage được thay ở biên, không tạo tài khoản hoặc gửi thông báo thật.
- Backend toàn bộ suite: 579 đạt, 50 skip có điều kiện DB/Redis; build và 184 API contract đạt.
- Android debug Gradle: BUILD SUCCESSFUL, 621 task; APK ở android/app/build/outputs/apk/debug/app-debug.apk. APK debug cần Metro.
- Đã xem ảnh UI của chat, review AI, pantry, nhận diện, cộng đồng và kiểm duyệt.

Chạy lại FE: npm run typecheck; npm run lint; npm run test:ui. Khởi động npx expo start --web --port 8085 --max-workers 2. BE chạy npm run test:sprint2 và npm run test:expanded:mobile. Đặt SPRINT2_FE_URL nếu đổi cổng.

## Cấu hình vận hành và giới hạn xác nhận

Đã thêm expo-image-picker theo phiên bản SDK 57 và plugin quyền ảnh/camera trong app.json. Cần cài bản native mới để dùng module ảnh; không chỉ reload bundle trên dev client cũ.

AI cần AI_ENABLED=true và provider hợp lệ. Nhắc lịch tự chạy cần REMINDER_SCHEDULER_ENABLED=true; gửi push cần FCM_ENABLED=true, Firebase messaging và thiết bị Android đã đăng ký, notification preferences cho phép. Ví dụ backend có sẵn trong .env.example. Không commit credential/.env/google-services.json/keystore.

Sau khi người dùng cho phép sửa đúng .env local, đã bật AI_ENABLED, REMINDER_SCHEDULER_ENABLED và FCM_ENABLED; backend đang chạy cổng 3000. Health/readiness/catalog trả 200. Gọi AI provider thật bị 401 invalid_authentication_error: cần thay AI_API_KEY hợp lệ tại máy trước khi dùng AI thật. Không ghi khóa vào log hoặc Git. Chưa có thiết bị để nghiệm thu push thực tế. Upload web cần CORS của bucket cho PUT/Content-Type; native không dùng browser CORS.

Không có emulator/thiết bị kết nối ở lượt build. Chưa xác nhận runtime camera/FCM thực tế hoặc sửa được lỗi Expo Dev Launcher người dùng báo trước đó. Không coi build APK hay browser fixture là nghiệm thu native hoặc production.
