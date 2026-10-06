# Navigation skeleton và Core UI

Ứng dụng dùng React Native, Expo Router và route trong `src/app`. Root layout khôi phục
session một lần; `(auth)` chỉ dành cho khách và `(tabs)` chỉ dành cho người đã đăng nhập.
Redirect của hai group dùng replace semantics nên Back không mở lại vùng vừa bị guard.

## Thêm màn hình

- Màn chính mới của bottom navigation đặt trong `src/app/(tabs)`. Khi thêm tab thật,
  khai báo `Tabs.Screen` và cấu hình tương ứng trong `CustomTabBar`.
- Màn đăng nhập/đăng ký đặt trong `src/app/(auth)`.
- Màn con có thể đặt cạnh feature route phù hợp và dùng `CustomHeader` với Back tự động.
- Không thêm `SafeAreaProvider` trong screen; provider duy nhất nằm ở root layout.

Bottom navigation triển khai lần này cố định theo yêu cầu: Trang chủ, Thực đơn, Mua sắm,
Nhật ký, Cá nhân. Handoff Figma hiện có bộ icon/pattern gốc thiên về Trang chủ, Khám phá,
Mầm, Kho bếp, Cá nhân; implementation vẫn giữ đúng năm route được yêu cầu và tái sử dụng
asset gần nghĩa nhất cho tới khi có icon calendar/cart/diary chính thức.

## ScreenWrapper

`style` áp dụng cho outer safe-area container. `contentContainerStyle` áp dụng cho content
View ở chế độ cố định hoặc content container của ScrollView ở chế độ cuộn.

Màn cố định:

```tsx
<ScreenWrapper edges={['top', 'left', 'right']} keyboardAvoiding={false}>
  <CustomHeader title="Mua sắm" showBack={false} />
  <View style={{ flex: 1 }}>{content}</View>
</ScreenWrapper>
```

Màn form hoặc nội dung dài:

```tsx
<ScreenWrapper scrollable contentContainerStyle={{ padding: spacing.xl }}>
  <AppInput label="Tên" value={name} onChangeText={setName} />
</ScreenWrapper>
```

Màn có `FlatList`/`SectionList` không bật `scrollable`, tránh nested scrolling:

```tsx
<ScreenWrapper edges={['top', 'left', 'right']} keyboardAvoiding={false}>
  <FlatList data={items} renderItem={renderItem} />
</ScreenWrapper>
```

Screen thuộc tabs bỏ edge `bottom`, vì `CustomTabBar` sở hữu bottom safe-area inset.
Screen độc lập mặc định dùng đủ bốn edges. `KeyboardAvoidingView` bật mặc định; tắt cho
screen không có input hoặc screen chứa virtualized list tự quản lý keyboard.

## CustomHeader

Header không tự xử lý top inset; `ScreenWrapper` bao ngoài xử lý phần đó. Navigator phải
đặt `headerShown: false` khi dùng custom header.

```tsx
<CustomHeader title="Chi tiết món" />

<CustomHeader
  title="Nhật ký"
  rightAction={{
    icon: 'spark',
    accessibilityLabel: 'Tạo nhật ký',
    onPress: openComposer,
  }}
/>
```

`showBack="auto"` là mặc định và chỉ hiện khi navigator quay lại được. Nếu ép hiện Back,
component quay lại khi có history, nếu không sẽ replace về `backFallbackHref` (mặc định là
`/(tabs)`). `onBack` luôn được ưu tiên khi caller cần hành vi riêng. Hai side slot luôn giữ
cùng chiều rộng để title ổn định; title dài tối đa hai dòng.

## Loading và empty state

```tsx
<LoadingSpinner size="small" text="Đang cập nhật…" />

// Tự tạo full-screen ScreenWrapper.
<LoadingScreen message="Đang tải…" />

// Dùng khi screen đã có ScreenWrapper.
<LoadingScreen withinScreen message="Đang tải danh sách…" />

<EmptyState
  title="Danh sách mua sắm đang trống"
  description="Thêm nguyên liệu từ thực đơn tuần."
  actionLabel="Thêm nguyên liệu"
  onAction={openAddItem}
/>
```

`EmptyState` không chứa nội dung theo feature và dùng trực tiếp được làm
`ListEmptyComponent`. `LoadingSpinner` là trạng thái inline; `LoadingScreen` là trạng thái
chiếm vùng nội dung hoặc toàn screen, không có timer/API giả.

## Theme token

Import token qua `@/theme`; không lặp màu hoặc spacing literal trong screen. Màu semantic,
typography và spacing nằm trong các module theme hiện có. Kích thước header/tab được gom ở
`coreTokens.navigation`. Thay đổi token nguồn thiết kế phải theo quy trình `npm run design:sync`
được mô tả trong `DESIGN_SYSTEM.md`.

## Chạy và preview

```bash
npm install
npm run start
npm run typecheck
npm run lint
npm run test:ui
```

Đăng nhập hiện dùng mock service đã tồn tại trong project: email hợp lệ và mật khẩu ít nhất
sáu ký tự. Register route đã có điều hướng hai chiều nhưng form/API đăng ký được để lại làm
điểm tích hợp rõ ràng vì backend register chưa tồn tại trong frontend này.

Các screen thông thường dùng `ScreenWrapper`, và dùng `CustomHeader` khi cần header. Camera,
video toàn màn hoặc modal có scaffold riêng có thể là ngoại lệ nếu tự quản lý safe area.
