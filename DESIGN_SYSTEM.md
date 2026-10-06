# VEGETA · giai đoạn 0–2

Chỉ foundation và UI core. Không đổi screen nghiệp vụ, layout, navigation hoặc backend. ContentCard, SummaryCard, component ghép và migration screen nằm ở giai đoạn tiếp theo; Card/Summary từ lần triển khai trước được giữ nguyên, không tính vào nghiệm thu lần này.

Nguồn chính thức thực tế: `../VEGETA-ui-handoff/` tại gốc workspace (checkout không có `component/`). Đã đọc README-vi, IMPLEMENTATION_PLAN, UI_CATALOG, catalog, LAYOUT_AND_TOKEN_RULES, source/tokens-v2, masters-v2, live-verification và assets/manifest. `scripts/sync-design.mjs` kiểm tra toàn bộ checksum AUDIT, ID/kích thước variant và màu live trước khi sinh runtime. Không dùng gói global UI cũ hoặc raw foundations.

Nguồn runtime chung: `src/theme/designTokens.ts`: palette → semantic → componentTokens và children. Các module colors/typography/spacing/radius/sizes/shadows giữ API cũ, alias về v2. `src/theme/coreTokens.ts` tách token primitive derived-master, componentPresets master/screen và phần bổ sung proposed. `src/theme/lightTheme.ts` tích hợp vào theme hiện có. Component chỉ lấy style qua token/helper, không lặp palette trong file.

Đối chiếu: primary/500 #247A52; primary/700 #16583D; bg/base #F7F9F4; bg/surface #FFFFFF; text/primary #183C2B; text/secondary #60736A; border/default #DDE7DE; accent/orange #E99545. Paint không bind của mascot giữ nguyên SVG nguồn, không dùng làm palette UI.

Font: `src/theme/fonts.ts` nạp Montserrat Regular, Medium, SemiBold, Bold và Regular Italic từ @expo-google-fonts/montserrat. Root layout đã có font gate từ trước; nhiệm vụ này không sửa nó. `src/theme/assets.ts` chứa XML của 7 SVG byte gốc sao chép vào `assets/vegeta/`; AppIcon dùng react-native-svg/SvgXml 15.15.4 theo Expo. Không cần SVG transformer. Mầm giữ màu nguyên bản; icon đơn sắc có thể tint qua token.

Đổi toàn hệ thống: chỉnh nguồn `source/tokens-v2.json` rồi chạy `npm run design:sync`; thay đổi typography/radius/padding của master phải cập nhật nguồn masters-v2 theo handoff mới. Trong runtime, palette/semantic/globalTokens/controlMetrics/masterTypography nằm ở designTokens.ts; coreTokens.ts điều khiển preset và primitive. Sửa runtime trực tiếp sẽ bị lần sync tiếp theo ghi đè. Font binary/weight mapping ở fonts.ts và typography.ts. Button/Input cao mặc định 48; Button radius 16; Chip 40. Preset `screen` opt-in có Button 52, Chip 38; chưa áp dụng vào screen nào. Production dùng minHeight để nội dung và font scaling tăng chiều cao; preview giữ kích thước master 152×48 cho Button.

## Mapping reuse/update/create

Tên alias AppButton/AppInput/FilterChip/AppToggle trỏ đúng Button/Input/Chip/Toggle hiện có, không có hai implementation. Badge cập nhật tại chỗ và giữ variant/size/style/textStyle/testID cũ; thêm selected. Các primitive còn lại tạo mới theo catalog. Theme/font registry tái sử dụng; asset registry bổ sung SVG thực.

| Catalog                 | Phân loại nguồn | Giai đoạn | Code / trạng thái                                      |
| ----------------------- | --------------- | --------- | ------------------------------------------------------ |
| Theme/Tokens            | master          | 1         | src/theme/designTokens.ts; coreTokens.ts               |
| FontRegistry            | proposed        | 1         | src/theme/fonts.ts                                     |
| AssetRegistry           | screen-pattern  | 1         | src/theme/assets.ts; assets/vegeta/                    |
| AppText                 | derived-master  | 2         | src/components/ui/AppText/AppText.tsx                  |
| AppIcon                 | proposed        | 2         | src/components/ui/AppIcon/AppIcon.tsx                  |
| Surface                 | proposed        | 2         | src/components/ui/Surface/Surface.tsx                  |
| Badge                   | derived-master  | 2         | src/components/ui/Badge/Badge.tsx                      |
| Thumbnail               | derived-master  | 2         | src/components/ui/Thumbnail/Thumbnail.tsx              |
| AppButton               | master          | 2         | src/components/ui/Button/Button.tsx                    |
| IconButton/BackButton   | screen-pattern  | 2         | src/components/ui/IconButton/IconButton.tsx            |
| FormField               | proposed        | 2         | src/components/ui/FormField/FormField.tsx              |
| AppInput                | master          | 2         | src/components/ui/Input/Input.tsx                      |
| FilterChip              | master          | 2         | src/components/ui/Chip/Chip.tsx                        |
| ChipGroup/FilterBar     | screen-pattern  | 3         | Hoãn sau UI core (không triển khai trong nhiệm vụ này) |
| AppToggle               | master          | 2         | src/components/ui/Toggle/Toggle.tsx                    |
| ProgressBar             | derived-master  | 2         | src/components/ui/ProgressBar/ProgressBar.tsx          |
| ContentCard             | master          | 3         | Hoãn sau UI core (không triển khai trong nhiệm vụ này) |
| SummaryCard             | master          | 3         | Hoãn sau UI core (không triển khai trong nhiệm vụ này) |
| MamIllustration         | master          | 3         | Hoãn sau UI core (không triển khai trong nhiệm vụ này) |
| AppHeader               | screen-pattern  | 3         | Hoãn sau UI core (không triển khai trong nhiệm vụ này) |
| SectionHeader           | screen-pattern  | 3         | Hoãn sau UI core (không triển khai trong nhiệm vụ này) |
| ListRow                 | screen-pattern  | 3         | Hoãn sau UI core (không triển khai trong nhiệm vụ này) |
| ProfileIdentityCard     | screen-pattern  | 3         | Hoãn sau UI core (không triển khai trong nhiệm vụ này) |
| NutrientProgressList    | screen-pattern  | 3         | Hoãn sau UI core (không triển khai trong nhiệm vụ này) |
| StatePanel              | screen-pattern  | 3         | Hoãn sau UI core (không triển khai trong nhiệm vụ này) |
| MetricTile/Grid         | screen-pattern  | 3         | Hoãn sau UI core (không triển khai trong nhiệm vụ này) |
| BrandHeader             | screen-pattern  | 3         | Hoãn sau UI core (không triển khai trong nhiệm vụ này) |
| HeroMedia               | screen-pattern  | 3         | Hoãn sau UI core (không triển khai trong nhiệm vụ này) |
| AIActionCard            | screen-pattern  | 3         | Hoãn sau UI core (không triển khai trong nhiệm vụ này) |
| ScreenScaffold          | proposed        | 4         | Hoãn sau UI core (không triển khai trong nhiệm vụ này) |
| ScrollScreen/ListScreen | screen-pattern  | 4         | Hoãn sau UI core (không triển khai trong nhiệm vụ này) |
| ActionDock              | screen-pattern  | 4         | Hoãn sau UI core (không triển khai trong nhiệm vụ này) |
| FormScreen              | proposed        | 4         | Hoãn sau UI core (không triển khai trong nhiệm vụ này) |
| BottomTabBar            | screen-pattern  | 4         | Hoãn sau UI core (không triển khai trong nhiệm vụ này) |
| StateLayout/AdminLayout | proposed        | 4         | Hoãn sau UI core (không triển khai trong nhiệm vụ này) |

`master` là component Figma; `derived-master` trích node con; `screen-pattern` là frame screen; `proposed` là API/kiến trúc bổ sung. Surface, FormField, AppIcon không có master độc lập và không được gọi là khớp master Figma. BackButton lấy frame 217:1761 (44×44/radius22), glyph 217:1762 (20×20). IconButton dùng nền này cho icon khác là proposed.

## Props và sử dụng

Import từ `@/components/ui`; token từ `@/theme`. Các kiểu props được export cùng component.

```tsx
import { AppText, AppIcon, Surface, Badge, Thumbnail, AppButton,
  BackButton, FormField, AppInput, FilterChip, AppToggle, ProgressBar } from '@/components/ui';

<AppButton title="Xác nhận" variant="primary" loading={saving} onPress={onSave} />
<AppInput label="Tên món" value={name} onChangeText={setName} required helper="Tên hiển thị" />
<AppInput type="select" value={portion} onChangeText={setPortion} onSelect={openSelection} />
<FilterChip label="Thuần chay" selected={selected} onPress={onToggleFilter} />
<AppToggle value={enabled} onValueChange={setEnabled} label="Nhắc nhở" />
<ProgressBar value={water} max={2000} tone="water" />
<AppIcon name="mam-companion" accessibilityLabel="Mầm" />
```

| Component               | Props chính / state                                                                                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AppText                 | TextProps; variant keyof textTokens, color, style; font scaling native mặc định                                                                                                                                                            |
| AppIcon                 | name từ registry (mam-companion/home/explore/spark/pantry/profile/back), size, color, decorative, accessibilityLabel; giữ tỉ lệ SVG                                                                                                        |
| Surface                 | ViewProps, tone surface/base/muted/selected, padding và radius nhận token key hoặc số, bordered                                                                                                                                            |
| Badge                   | label, variant primary/secondary/success/warning/danger/neutral, size sm/md, selected; default/selected lấy node Badge của Card                                                                                                            |
| Thumbnail               | source, kind recipe/ingredient/nutrition/reminder, size, radius, fallback, resizeMode, onImageError; lỗi ảnh về glyph master và reset khi đổi source                                                                                       |
| Button / AppButton      | title, variant primary/secondary/outline/ghost/warning/danger; state default/pressed/loading/disabled; loading/disabled, loadingTitle, onPress, width/fullWidth, textStyle, preset, preview                                                |
| IconButton / BackButton | icon (IconButton), accessibilityLabel, disabled, onPress, size/iconSize; BackButton không chứa route                                                                                                                                       |
| FormField               | label, helper, error, required, labelStyle, children, ViewProps; caller cung cấp lỗi                                                                                                                                                       |
| Input / AppInput        | value/onChangeText controlled, type text/search/password/select; state default/focus/filled/error/disabled; label/helper/required/error, editable/disabled, onFocus/onBlur/onSelect, inputStyle/preset/preview; password visibility nội bộ |
| Chip / FilterChip       | label, kind default/selected/danger, selected, state default/pressed, disabled, onPress, preset/preview                                                                                                                                    |
| Toggle / AppToggle      | value/onValueChange, label, state off/on/disabled, disabled, testID/accessibilityLabel                                                                                                                                                     |
| ProgressBar             | value/max, tone energy/water, height/style, testID/accessibilityLabel; clamp 0–1, max<=0/nonfinite và NaN về 0                                                                                                                             |

## 49 variant master đã hỗ trợ

Button: 5 style × 4 state = 20. `outline` là alias tương thích của Secondary, không phải variant thứ 21. Input: 4 type × 5 state = 20. Chip: 3 kind × 2 state = 6. Toggle: Off/On/Disabled = 3. Preview sinh trực tiếp mọi node từ componentTokens nên giữ ID, tên và child style, gồm opacity, viền, font, line height và letter spacing. Default/Pressed giữ đúng dữ liệu nguồn, không tự đổi màu.

| Family  | Variant                         | ID       | File                                |
| ------- | ------------------------------- | -------- | ----------------------------------- |
| Button  | Style=Primary, State=Default    | 200:1521 | src/components/ui/Button/Button.tsx |
| Button  | Style=Primary, State=Pressed    | 200:1523 | src/components/ui/Button/Button.tsx |
| Button  | Style=Primary, State=Loading    | 200:1525 | src/components/ui/Button/Button.tsx |
| Button  | Style=Primary, State=Disabled   | 200:1527 | src/components/ui/Button/Button.tsx |
| Button  | Style=Secondary, State=Default  | 200:1529 | src/components/ui/Button/Button.tsx |
| Button  | Style=Secondary, State=Pressed  | 200:1531 | src/components/ui/Button/Button.tsx |
| Button  | Style=Secondary, State=Loading  | 200:1533 | src/components/ui/Button/Button.tsx |
| Button  | Style=Secondary, State=Disabled | 200:1535 | src/components/ui/Button/Button.tsx |
| Button  | Style=Warning, State=Default    | 200:1537 | src/components/ui/Button/Button.tsx |
| Button  | Style=Warning, State=Pressed    | 200:1539 | src/components/ui/Button/Button.tsx |
| Button  | Style=Warning, State=Loading    | 200:1541 | src/components/ui/Button/Button.tsx |
| Button  | Style=Warning, State=Disabled   | 200:1543 | src/components/ui/Button/Button.tsx |
| Button  | Style=Danger, State=Default     | 200:1545 | src/components/ui/Button/Button.tsx |
| Button  | Style=Danger, State=Pressed     | 200:1547 | src/components/ui/Button/Button.tsx |
| Button  | Style=Danger, State=Loading     | 200:1549 | src/components/ui/Button/Button.tsx |
| Button  | Style=Danger, State=Disabled    | 200:1551 | src/components/ui/Button/Button.tsx |
| Button  | Style=Ghost, State=Default      | 200:1553 | src/components/ui/Button/Button.tsx |
| Button  | Style=Ghost, State=Pressed      | 200:1555 | src/components/ui/Button/Button.tsx |
| Button  | Style=Ghost, State=Loading      | 200:1557 | src/components/ui/Button/Button.tsx |
| Button  | Style=Ghost, State=Disabled     | 200:1559 | src/components/ui/Button/Button.tsx |
| Chip    | Kind=Default, State=Default     | 200:1723 | src/components/ui/Chip/Chip.tsx     |
| Chip    | Kind=Default, State=Pressed     | 200:1725 | src/components/ui/Chip/Chip.tsx     |
| Chip    | Kind=Selected, State=Default    | 200:1727 | src/components/ui/Chip/Chip.tsx     |
| Chip    | Kind=Selected, State=Pressed    | 200:1729 | src/components/ui/Chip/Chip.tsx     |
| Chip    | Kind=Danger, State=Default      | 200:1731 | src/components/ui/Chip/Chip.tsx     |
| Chip    | Kind=Danger, State=Pressed      | 200:1733 | src/components/ui/Chip/Chip.tsx     |
| Control | State=Off                       | 200:1736 | src/components/ui/Toggle/Toggle.tsx |
| Control | State=On                        | 200:1740 | src/components/ui/Toggle/Toggle.tsx |
| Control | State=Disabled                  | 200:1744 | src/components/ui/Toggle/Toggle.tsx |
| Input   | Type=Text, State=Default        | 200:1562 | src/components/ui/Input/Input.tsx   |
| Input   | Type=Text, State=Focus          | 200:1566 | src/components/ui/Input/Input.tsx   |
| Input   | Type=Text, State=Filled         | 200:1570 | src/components/ui/Input/Input.tsx   |
| Input   | Type=Text, State=Error          | 200:1574 | src/components/ui/Input/Input.tsx   |
| Input   | Type=Text, State=Disabled       | 200:1578 | src/components/ui/Input/Input.tsx   |
| Input   | Type=Search, State=Default      | 200:1582 | src/components/ui/Input/Input.tsx   |
| Input   | Type=Search, State=Focus        | 200:1587 | src/components/ui/Input/Input.tsx   |
| Input   | Type=Search, State=Filled       | 200:1592 | src/components/ui/Input/Input.tsx   |
| Input   | Type=Search, State=Error        | 200:1597 | src/components/ui/Input/Input.tsx   |
| Input   | Type=Search, State=Disabled     | 200:1602 | src/components/ui/Input/Input.tsx   |
| Input   | Type=Password, State=Default    | 200:1607 | src/components/ui/Input/Input.tsx   |
| Input   | Type=Password, State=Focus      | 200:1612 | src/components/ui/Input/Input.tsx   |
| Input   | Type=Password, State=Filled     | 200:1617 | src/components/ui/Input/Input.tsx   |
| Input   | Type=Password, State=Error      | 200:1622 | src/components/ui/Input/Input.tsx   |
| Input   | Type=Password, State=Disabled   | 200:1627 | src/components/ui/Input/Input.tsx   |
| Input   | Type=Select, State=Default      | 200:1632 | src/components/ui/Input/Input.tsx   |
| Input   | Type=Select, State=Focus        | 200:1637 | src/components/ui/Input/Input.tsx   |
| Input   | Type=Select, State=Filled       | 200:1642 | src/components/ui/Input/Input.tsx   |
| Input   | Type=Select, State=Error        | 200:1647 | src/components/ui/Input/Input.tsx   |
| Input   | Type=Select, State=Disabled     | 200:1652 | src/components/ui/Input/Input.tsx   |

## Hành vi bổ sung và giới hạn

- Minimum touch 48, Chip hitSlop 4, password hitSlop 10 nằm ở componentTheme.interactionTokens, là bổ sung RN. Loading/disabled chặn Pressable và thông báo busy/disabled. Callback và validation do caller sở hữu.
- Select chưa có picker đủ đặc tả; tìm code hiện tại không có Picker/Modal/ActionSheet chọn lựa để tái sử dụng. Giữ cơ chế callback onSelect có sẵn, value controlled. Preview đổi lựa chọn mẫu bằng callback; không coi đây là picker production hoàn chỉnh.
- AppIcon mặc định icon đơn sắc 24 (proposed), giữ Mầm 160; Helper/error/required marker, loadingTitle tùy chỉnh, Badge status tones và sm size, Surface tones, override size/radius là API bổ sung; không thêm variant Figma. Badge default API primary được giữ để tương thích, dùng selected={false} hoặc variant="neutral" để lấy Badge default master.
- Input parent metadata cao 76 nhưng children label22 + gap8 + surface48 thành 78. Preview giữ metadata và không ép surface co lại; production tự giãn. Border Figma INSIDE và Yoga border có khác biệt mô hình; minHeight/padding bảo toàn thông số và cho phép nội dung tăng chiều cao. Font scaling thật trên thiết bị chưa kiểm tra; preview có mẫu chữ lớn 160% mô phỏng.
- Không thiếu 7 SVG trong manifest. Không có ảnh nội dung thực; Thumbnail nhận ảnh caller và glyph fallback. Illustration/Card/Summary cũ không nằm trong nghiệm thu này; mascot hiện được render qua asset registry/AppIcon.

## Preview và kiểm tra

`npm run preview:ui`: Expo app riêng tại preview/, port 8082, không dùng Login/Home hoặc navigation. `src/preview/CorePreview.tsx` có 49 master, mọi primitive, SVG, nội dung dài, sandbox controlled/error/password/select/loading/disabled và progress edge cases.

Đã chạy thành công: design:sync (audit hash + live verification), typecheck, lint, test:ui (10 trường hợp progress), preview:ui:export (Android/iOS/web). Web đã render và xem screenshot, đối chiếu references/components-v2.png; DOM xác nhận 49 mẫu, Button 152×48/radius16, Chip40, màu primary #247A52. Bấm forced disabled và lặp loading cho tổng callback=1; nhập controlled cập nhật các field; Select đổi 2 người; password visibility đổi Ẩn mật khẩu; progress ARIA = 0/25/100/0/0 theo clamp. Font family Montserrat_Regular được kiểm tra trên input; label Button Montserrat_SemiBold/15/22/letter spacing 0.015 và opacity Pressed 0.82 đã đối chiếu DOM; export có đủ 5 font binary. Không tuyên bố pixel-perfect hoặc đã chạy simulator/thiết bị native. Chưa kiểm tra TalkBack/VoiceOver hoặc font scaling OS thật.
