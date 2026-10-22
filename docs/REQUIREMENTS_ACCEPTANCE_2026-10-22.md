# Nghiệm thu MMA_PRD_BR.pdf — 22/10/2026

Phạm vi đối chiếu: toàn bộ nội dung Sprint 2 trong PDF (Auth/Profile, Meal Planning, Grocery, Tracking, QA). Các phần mở rộng đã triển khai gồm AI, kho nguyên liệu nâng cao, cộng đồng, báo cáo/kiểm duyệt và nhắc lịch/push; PDF ghi chúng ngoài Sprint 2 nên kết quả provider được báo riêng. Kho nguyên liệu nằm trong trang Cá nhân theo yêu cầu.

## Bổ sung trong lượt rà soát

- Grocery có trường **Chọn thực đơn**, thay vì luôn tự chọn một thực đơn trong tuần. Danh sách lấy hết các trang API; vẫn chọn được tuần và khoảng ngày, gộp nguyên liệu và trừ kho. Browser E2E tạo thêm một thực đơn rỗng rồi chọn thực đơn có món để kiểm tra đúng nguồn generate.
- Thêm cấu hình Firebase native có điều kiện trong `app.config.ts` và Gradle. File `google-services.json` chỉ ở máy build, được ignore; thiếu cấu hình vẫn build được và màn đăng ký push báo lỗi cấu hình có hướng dẫn.
- Gradle nhận tùy chọn `-Pvegeta.cmakeStagingDirectory=<đường dẫn ngắn>` để tránh Ninja vượt giới hạn đường dẫn Windows. Không hardcode đường dẫn máy trong source.
- Backend ghi mã HTTP upstream khi AI lỗi, kèm request ID và test chống lộ key/nội dung. API công khai vẫn trả lỗi tổng quát.
- Thêm runner Android opt-in, khóa vào AVD riêng; xem `vegan-api-mma302/tests/android/README.md`.

## Đã kiểm chứng

| Kiểm tra                                    | Kết quả                                                                                                                                                                                                       |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FE TypeScript / ESLint                      | PASS                                                                                                                                                                                                          |
| FE unit                                     | 92/92 PASS                                                                                                                                                                                                    |
| Export web tĩnh                             | PASS                                                                                                                                                                                                          |
| Core browser 390×844                        | PASS; 26 thao tác ghi HTTP; có chọn thực đơn, hồ sơ/targets, meal/servings/replace/remove, grocery/checklist, diary/summary/date, cân nặng và logout                                                          |
| Expanded browser                            | PASS; 46 thao tác ghi, 3 lần gọi provider AI giả lập; kho, cộng đồng, báo cáo/admin và nhắc lịch                                                                                                              |
| BE suite offline                            | 580 PASS, 50 opt-in SKIP; riêng bộ AI sau sửa 22/22 PASS                                                                                                                                                      |
| BE build                                    | PASS; syntax, 184 API operations, startup/health/auth/shutdown offline                                                                                                                                        |
| BE format                                   | PASS với `--end-of-line auto` trên checkout Windows; CI Linux chạy lệnh format mặc định thành công                                                                                                            |
| Seed hiện tại                               | Không có lỗi tham chiếu/dinh dưỡng; 30 công thức công khai                                                                                                                                                    |
| MongoDB persistence                         | PASS; 33 request; database thử riêng đã được dọn, không ghi vào database ứng dụng                                                                                                                             |
| Deployed public API và Firebase auth        | PASS trên URL từ frontend `.env`                                                                                                                                                                              |
| Deployed AI provider                        | FAIL: `POST /ai/conversations/:id/messages` trả `502 AI_PROVIDER_ERROR`; log Dozzle của bản mới xác nhận upstream **401** (provider từ chối xác thực)                                                         |
| Android build/install                       | PASS; APK standalone x86_64, có bundle JS và Firebase native; xác nhận bundle deployment chứa đúng HTTPS API và không chứa URL test localhost                                                                 |
| Android core native + MongoDB/Firebase thật | PASS; **61 request, 19 thao tác ghi**; đăng ký/onboarding, hồ sơ/4 targets, tìm công thức, thêm/servings/replace/remove, grocery/chọn thực đơn/300g/nhóm/check/uncheck, diary/summary, cân nặng/chart, logout |
| Android với deployment                      | PASS; login thật, 5 tab, mở kho từ Cá nhân, **đăng ký và hủy FCM native**, logout; crash buffer không có crash của package ứng dụng                                                                           |

Browser dùng HTTP app/service thật với Firebase và repository giả lập ở biên. Runner MongoDB dùng database thật riêng. Deployment probe dùng Firebase thật và chỉ tài khoản test do runner tự tạo; tài khoản BE được soft-delete qua API, Firebase identity được xóa sau chạy. Không coi các bài offline là xác nhận provider production.

## Build Android trên Windows

Đặt file Firebase Android đúng package `com.ngocthang.veganapp` ở root frontend và `android/app/google-services.json` trên máy build. Không commit các file này hoặc signing key. Với đường dẫn checkout dài, dùng một thư mục build tạm ngắn:

```powershell
cd android
.\gradlew.bat :app:assembleRelease -PreactNativeArchitectures=x86_64 -Pvegeta.cmakeStagingDirectory=D:/vegeta-native-build --max-workers=2
```

`x86_64` dành cho emulator; điện thoại ARM cần build đúng ABI. Cấu hình release hiện tại ký bằng debug key cho kiểm thử, chưa phải bản ký để phát hành lên store. URL API lấy từ frontend `.env`; APK test localhost và APK deployment phải được phân biệt rõ.

## Giới hạn nghiệm thu

AI trên deployment chưa hoạt động: Dozzle ghi `upstreamStatus: 401` lúc `2026-10-22T05:31:34Z` (12:31 giờ Việt Nam), request ID `18d5e2d9-bc5b-4b5b-9f64-53b553d93bc3`. Container backend đã chạy commit bổ sung chẩn đoán `1b406fa`. Chỉ đọc log được người dùng cung cấp; không sửa biến môi trường trên deployment. Cần thông tin xác thực AI được provider chấp nhận ở môi trường deploy; không suy ra nguyên nhân cụ thể hơn từ 401.

Đã kiểm tra đăng ký/hủy token FCM, chưa gửi và xác nhận nhận push theo lịch từ scheduler production. Không gửi email reset mật khẩu thật hoặc kiểm tra Google Sign-In bằng tài khoản cá nhân. Không kiểm tra iOS hay mọi phiên bản Android/ABI.

Android được kiểm tra bằng **APK release thử nghiệm có bundle JS**, không cần Metro server. Lệnh mở Metro dev-client bị hệ thống duyệt tự động từ chối trước đó, nên lượt này không xác nhận lại lỗi Dev Launcher ở bản debug.

Các lần debug runner từng dừng vì selector, dữ liệu fixture, timing và một lần lỗi DNS; đã sửa runner và chạy lại toàn bộ. Lần native core cuối đạt và xác nhận Firebase identity cùng toàn bộ bản ghi trong database thử đã được dọn. Deployment probe soft-delete tài khoản test, không purge dữ liệu production. Không commit Firebase config, `.env`, signing key hoặc APK.
