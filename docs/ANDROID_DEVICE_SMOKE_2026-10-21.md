# Android build và chạy emulator — 21/10/2026

## Kết quả

- Gradle assembleDebug đạt: 1 phút 38 giây, 621 task (25 chạy lại, 596 up-to-date).
- Cài APK bằng adb install -r thành công trên Medium_Phone / emulator-5554, Android 17, x86_64, page size 16 KB. Giữ nguyên dữ liệu và phiên đăng nhập cũ.
- Metro dev client chạy cổng 8081, adb reverse 8081. Android bundle 2053 module hoàn tất trong khoảng 27 giây.
- Cold start vào Home có dữ liệu API thật. Mở lại development-client URL khi app đang chạy cũng vào Home; không tái hiện RuntimeException “App react context shouldn't be created before.” ở hai cách khởi động này.
- Các màn đã mở: Home, Profile, Pantry, form thêm nguyên liệu, picker thực phẩm, Advanced Pantry, AI Chat, AI Meal Planner, Ingredient Recognition, Community, Post Editor, Reminders, Meal Plan, Grocery, Tracking Overview.
- Camera: cấp quyền qua Android, mở camera native, chụp ảnh, xác nhận ảnh và trở về preview trong Ingredient Recognition đạt. Không upload ảnh emulator hoặc ghi dữ liệu nghiệp vụ thử vào tài khoản cá nhân.
- TypeScript và ESLint đạt; unit test FE đạt 92/92, bao gồm hai test mới cho lỗi native push.

## Lỗi xác nhận được

**Đăng ký FCM không hoạt động vì thiếu cấu hình Firebase Android.**

Log lúc khởi động có FirebaseInitProvider “Default FirebaseApp failed to initialize because no default options were found”. Repo local hiện không có google-services.json ở root hay android/app, và Gradle chưa áp dụng google-services plugin. Sau khi cấp quyền thông báo và bấm đăng ký, Expo getDevicePushTokenAsync thất bại. Đây là thiếu cấu hình native, khác với Firebase REST dùng cho đăng nhập.

Đã sửa UI để nhận diện lỗi E_REGISTRATION_FAILED do thiếu Firebase Messaging/googleServicesFile và hiện thông báo ổn định “Bản Android này chưa được cấu hình nhận thông báo…”. Không hiển thị native/provider diagnostics cho người dùng. Đã kiểm tra thông báo mới trực tiếp trên emulator sau Fast Refresh.

Để bật FCM thực tế cần cấu hình Firebase Android đúng package com.ngocthang.veganapp, file google-services.json local, google-services Gradle/config plugin và build/cài native lại. Không tạo cấu hình giả, không sửa credential hoặc đưa file provider vào Git. Bật FCM ở backend không tự cấu hình Firebase cho APK.

## Các log không gây dừng app trong lượt thử

- DevLauncher không tìm thấy expo.modules.splashscreen.SplashScreenManager; package expo-splash-screen chưa nằm trong dependencies.
- ReactHost ghi SoftException onWindowFocusChange khi context đang tải; sau đó JS main vẫn chạy và UI hiển thị.
- DevLauncher cảnh báo AppearanceModule.colorScheme và một lần dev WebSocket ngắt kết nối.

Không có FATAL EXCEPTION/ReactNativeJS error trong log kiểm tra cuối của tiến trình app. Điều này chỉ xác nhận smoke hiện tại; không chứng minh lỗi khởi động cũ không thể tái diễn trong mọi điều kiện.

## Artifact và chạy lại

APK debug: android/app/build/outputs/apk/debug/app-debug.apk. Debug APK cần Metro; không phải bản phát hành tự chứa JS.

Logs và screenshot (ignored): test-results/android-device-build.log, android-device-metro.log, android-process.log, android-final-process.log; android-loaded.png, android-pantry.png, android-recognition-photo.png, android-community.png, android-meal.png, android-diary.png, android-push-fixed.png.

Lệnh dùng Node 24+, Java 17 và JAVA_TOOL_OPTIONS=-Djdk.net.unixdomain.tmpdir trỏ tới thư mục .java-tmp của workspace. Không thay local.properties hoặc key ký.

Giữ emulator và Metro chạy để người dùng tiếp tục xem. Chưa nghiệm thu thiết bị Android vật lý, giao nhận FCM thật, Google Sign-In native, upload/AI provider thật, thao tác ghi toàn bộ nghiệp vụ trên Android hoặc bản release/iOS.
