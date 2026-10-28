# Chạy VEGETA trên điện thoại Android qua USB

## Chuẩn bị một lần

1. Cài Android SDK Platform Tools và JDK 17.
2. Tạo `.env` từ `.env.example`, điền URL backend HTTPS và cấu hình Firebase/OAuth thật.
3. Đặt `google-services.json` của package `com.ngocthang.veganapp` vào `android/app/`. File này và `.env` không được commit.
4. Trên điện thoại, bật **Developer options** và **USB debugging**. Kết nối bằng cáp truyền dữ liệu, chọn chế độ File transfer và chấp nhận dấu vân tay RSA.

Kiểm tra kết nối trong PowerShell:

```powershell
adb kill-server
adb start-server
adb devices -l
```

Thiết bị phải có trạng thái `device`. Nếu hiện `unauthorized`, mở khóa điện thoại và chấp nhận hộp thoại RSA. Nếu danh sách trống trên Windows, cài USB driver của hãng điện thoại rồi thử cáp/cổng USB khác.

Nếu Gradle báo `Unable to establish loopback connection`, đây là lỗi Java/Windows local IPC trước khi mã Android được biên dịch. Khởi động lại Windows và thử lại trước. Nếu vẫn lỗi, mở PowerShell bằng quyền Administrator, chạy `netsh winsock reset`, khởi động lại máy rồi build lại; lệnh reset này thay đổi cấu hình mạng nên chỉ dùng khi lỗi còn tái diễn.

## Cài và chạy bản debug với Metro

Tại thư mục frontend:

```powershell
npm ci
npm run preandroid
adb reverse tcp:8081 tcp:8081
npm run android -- --device
```

Lệnh cuối build native app, cài vào thiết bị và mở Expo development client. Giữ terminal Metro đang chạy trong suốt phiên test.

Nếu muốn build APK trước rồi tự cài:

```powershell
cd android
.\gradlew.bat app:assembleDebug
cd ..
adb install -r .\android\app\build\outputs\apk\debug\app-debug.apk
adb reverse tcp:8081 tcp:8081
npm run android:dev
```

APK debug cần Metro để tải JavaScript. Nếu `adb install -r` báo chữ ký không khớp, chỉ gỡ app cũ khi đã chấp nhận mất toàn bộ dữ liệu cục bộ của app:

```powershell
adb uninstall com.ngocthang.veganapp
adb install .\android\app\build\outputs\apk\debug\app-debug.apk
```

## Dùng backend chạy trên máy tính

Ứng dụng nên dùng backend HTTPS đã deploy. Nếu cần test backend local ở cổng `3000`, đặt:

```dotenv
EXPO_PUBLIC_API_URL=http://127.0.0.1:3000/api/v1
```

Sau đó chuyển tiếp cổng qua USB trước khi mở app:

```powershell
adb reverse tcp:3000 tcp:3000
adb reverse tcp:8081 tcp:8081
```

`127.0.0.1` lúc này được chuyển qua máy phát triển; không cần dùng IP Wi-Fi.

## Xem lỗi trên thiết bị

```powershell
adb logcat -c
adb logcat ReactNativeJS:V Expo:V *:S
```

Khi test xong, có thể xóa các rule chuyển tiếp:

```powershell
adb reverse --remove-all
```

Đây là quy trình phát triển nội bộ. Bản đưa lên Google Play phải dùng khóa release riêng và cấu hình Play App Signing như mô tả trong `docs/ANDROID_SIGNING.md`.
