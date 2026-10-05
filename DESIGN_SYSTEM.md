# VEGETA v2 — UI core

Phạm vi: token global, theme, UI dùng chung và preview độc lập. Không chỉnh screen nghiệp vụ, route hoặc navigation. Root layout chỉ bổ sung nạp font trước khi render. Các file đã có thay đổi trước nhiệm vụ được cập nhật tại chỗ, không reset về Git HEAD.

## Nguồn chính thức

Đã tìm đệ quy workspace; gói thực tế ở `../VEGETA-components-v2-core/` (không có thư mục `component/` trong checkout này). Đọc `README-vi.md`, `tokens.json`, toàn bộ cây của `components.json`, `AUDIT.json`. Section Figma `200:1519`, bản trích xuất 2026-10-05. Script đồng bộ kiểm tra SHA-256 cả ba file theo AUDIT trước khi ghi dữ liệu.

Không đọc hoặc sử dụng gói global UI cũ, raw foundations hay screen overrides. `AUDIT.json` xác nhận tính toàn vẹn dữ liệu, không xác nhận render React Native.

## Cấu trúc và đường đi của token

| File/thư mục                                                                   | Vai trò                                                                                                                            |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `src/theme/designTokens.ts`                                                    | Nguồn runtime chung: palette, semantic, globalTokens, fontNames, controlMetrics, masterTypography, masterPaints và componentTokens |
| `scripts/sync-design.mjs`                                                      | Chuyển toàn bộ 13 family/57 variant và children sang dữ liệu RN; giữ ID để truy vết                                                |
| `src/theme/designTypes.ts`                                                     | Kiểu dữ liệu node thiết kế                                                                                                         |
| `src/theme/colors.ts`                                                          | Public color API cũ, giờ alias về semantic v2                                                                                      |
| `src/theme/spacing.ts`, `radius.ts`, `typography.ts`, `sizes.ts`, `shadows.ts` | Foundation API tương thích; shadow cũ đều alias về shadow Card v2                                                                  |
| `src/theme/lightTheme.ts`, `index.ts`, `types.ts`                              | Theme/export hiện có, mở rộng tại chỗ                                                                                              |
| `src/theme/fonts.ts`                                                           | Asset Montserrat cục bộ từ package Expo Google Fonts; hook `useDesignFonts`                                                        |
| `src/theme/componentTheme.ts`                                                  | Tra cứu family/variant/child và token hành vi bổ sung                                                                              |
| `src/components/ui/`                                                           | Button, Input, Card, Chip, Toggle, Summary, Illustration; giữ Badge, Loading và export cũ                                          |
| `src/components/ui/DesignNode.tsx`                                             | Render children dùng chung cho Card/Toggle/Summary                                                                                 |
| `src/preview/`, `preview/`                                                     | App preview riêng, không dùng Expo Router hoặc screen nghiệp vụ                                                                    |

Chuỗi màu: `palette → semantic → componentTokens[].style/children[].style → component`. Numeric foundation giữ binding Figma khi có: padding/gap về spacing, radius về semantic/global radius. Font size/line height dùng typography global khi có; line height 17/22/51 lấy từ master nằm trong `masterTypography` vì tokens.json không có những giá trị này. Letter spacing phần trăm chuyển sang pixel (`fontSize × percent / 100`), ví dụ label Input 0.1% tại size 14 = 0.014.

Các màu đối chiếu: primary/500 `#247A52`, primary/700 `#16583D`, bg/base `#F7F9F4`, bg/surface `#FFFFFF`, text/primary `#183C2B`, text/secondary `#60736A`, border/default `#DDE7DE`, accent/orange `#E99545`.

`accent/soft=#FFF0DB` có trong tokens.json nhưng không có khóa palette tương ứng: runtime tạo alias palette cùng giá trị. `masterPaints` giữ hai paint không bind trong cây Illustration (`#86B994`, `#000000`) riêng biệt; đây là paint từ master, không phải palette mới tự chọn. Illustration chưa render những vector đó vì thiếu path.

## Đổi thông số toàn hệ thống

- Màu: chỉnh `palette`/`semantic` trong `designTokens.ts`; các public aliases và component tự dùng giá trị mới. Chỉnh riêng semantic để không ảnh hưởng các vai trò khác dùng cùng palette.
- Font: chỉnh `fontNames` trong `designTokens.ts`, đổi asset trong `fonts.ts`; typography và component cùng tham chiếu fontNames. Mỗi weight là một file thật, không giả lập bold trên font Regular. Root dùng `useDesignFonts`, chặn render cho đến khi font tải xong. Font lỗi được ném lên error boundary.
- Cỡ chữ: `globalTokens.typography`; line height master ngoài global ở `masterTypography`.
- Radius: control/card ở `semantic['radius/control']`/`semantic['radius/card']`; các radius foundation ở `globalTokens.radius`. Những node không có variable binding giữ radius của master trong componentTokens (ví dụ track progress 4). Muốn đổi tất cả radius, cập nhật cả các vai trò này trong cùng nguồn.
- Chiều cao Button/Input: `controlMetrics.buttonHeight`/`inputHeight`, mặc định đều 48; Button và Input surface mọi state cùng tham chiếu. Input root preview giữ metadata 76 của Figma, không phải chiều cao field.
- Border/shadow của component: `componentTokens` tại đúng family/state/child. Shadow dùng `boxShadow` của RN 0.86, Card: offset (0,4), blur 16, spread 0, rgba xấp xỉ (23,51,33,0.06).
- Hit slop/vùng bấm và các extension: `interactionTokens` trong `componentTheme.ts`.

`designTokens.ts` là file được sinh. `npm run design:sync` sẽ khôi phục giá trị từ gói chính thức và ghi đè chỉnh tay. Khi có bản thiết kế mới, cập nhật gói được audit rồi chạy sync; nếu muốn tùy biến bền vững, sửa quy tắc trong script cùng bản runtime. Không sửa lặp lại màu/thông số ở từng component.

## Đối chiếu 13 family

| Family Figma                       | Component/public props              | Variant/master đã hỗ trợ                    |
| ---------------------------------- | ----------------------------------- | ------------------------------------------- |
| Button / Action / Complete v2      | `Button`, `variant`, `state`        | 5 style × 4 state = 20                      |
| Input / Field / Complete v2        | `Input`, `type`, `state`            | 4 type × 5 state = 20                       |
| Card / Vegan Content / Complete v2 | `Card`, `type`, `selected`/`state`  | 4 type × 2 state = 8                        |
| Chip / Filter / Complete v2        | `Chip`, `kind`, `state`             | 3 kind × 2 state = 6                        |
| Control / Toggle / Complete v2     | `Toggle`, `value`, `state`          | Off/On/Disabled = 3                         |
| Illustration / Mầm companion       | `Illustration`, `source`/`children` | Host 160×160; **chưa hoàn thành asset Mầm** |
| Summary / Energy                   | `Summary kind="energy"`             | Master 342×160                              |
| Summary / Water                    | `Summary kind="water"`              | Master 342×160                              |
| Summary / Weight                   | `Summary kind="weight"`             | Master 342×160                              |
| Summary / Week                     | `Summary kind="week"`               | Master 342×160                              |
| Summary / Grocery                  | `Summary kind="grocery"`            | Master 342×160                              |
| Summary / Upload                   | `Summary kind="upload"`             | Master 342×160                              |
| Summary / BMI                      | `Summary kind="bmi"`                | Master 342×160                              |

57 variant là tổng năm family có component set; 7 Summary và Illustration là master riêng, không tính vào 57. Danh sách từng variant/ID nằm cuối tài liệu.

## Props và trạng thái

**Button:** `title`, `onPress` và các PressableProps; `variant=primary|secondary|warning|danger|ghost`, `state=default|pressed|loading|disabled`. Alias `outline → secondary` được giữ. `loading`, `disabled`, `loadingTitle`, `fullWidth` (mặc định true để giữ API), `width`, `style`, `textStyle`, `testID`, `preview`. Disabled ưu tiên cao nhất, loading chặn callback và đặt busy. Trạng thái pressed tự theo Pressable khi không ép state. Loading hiển thị `•••  Đang xử lý` như master, không thay bằng spinner. Primary/Warning/Danger pressed giữ màu default với opacity 0.82; Secondary có viền pressed riêng; Ghost pressed có nền primary/100. Không suy ra màu pressed mới.

**Input:** giữ `label`, `placeholder`, `value`, `onChangeText`, `secureTextEntry`, `error`, `disabled`, `keyboardType`, `autoCapitalize`, `autoCorrect`, `style`, `inputStyle`, `testID`. Mở rộng TextInputProps (onFocus/onBlur được gọi lại), `type=text|search|password|select`, `state=default|focus|filled|error|disabled`, `onSelect`, `preview`. Không truyền state để tự chọn theo focus/value/error; disabled/readonly ưu tiên. Password giữ nút hiện/ẩn và chặn khi disabled. Search/Password/Select dùng chính glyph trong master (`⌕`, `●`, `⌄`), không tự đổi sang thư viện icon khác. Select gọi onSelect; màn sử dụng chịu trách nhiệm dữ liệu và picker, core không mở route hoặc API. Error message là props tùy chọn, không có helper text trong master; thông báo qua alert/live region và accessibility hint.

**Card:** `type=recipe|ingredient|nutrition|reminder`, `selected` hoặc `state=default|selected`; `title`, `subtitle`, `badge`, `thumbnail`, `onPress`, `disabled`, `accessibilityLabel`, `style`, `testID`, `preview`. Thumbnail mặc định là frame/glyph V/I/N/R đúng JSON, có thể thay qua slot. Nội dung mẫu nghiệp vụ chỉ dùng trong preview. `children` cũ vẫn được render như generic container dọc; alias `default|surface|outlined` về nền Default, `accent` về Selected. Không thêm opacity pressed ngoài master.

**Chip:** `label`, `kind=default|selected|danger`, `selected`, `state=default|pressed`, PressableProps, `style`, `preview`. Pressed opacity 0.78. Disabled là hành vi bổ sung, giữ style kind hiện tại vì Figma không có disabled variant. Role button, selected/pressed accessibility, hitSlop 4 để tổng vùng bấm 48.

**Toggle:** controlled `value`, `onValueChange`; `label`, `disabled`, `state=off|on|disabled` để đối chiếu, `style`, `testID`, `accessibilityLabel`, `preview`. Role switch, checked/disabled cho native và ARIA web. Track 52×30, knob 24×24 hình tròn, label Regular 14/22; root 184×48 trong preview. Disabled opacity 0.65 và chặn callback. Không animation tự suy ra ngoài thiết kế.

**Summary:** `kind`, `value` (string đã format), `unit`, `hint`, `overline`, `progress` (0..1, clamp; NaN/Infinity về 0), `style`, `testID`, `accessibilityLabel`, `preview`. Mỗi kind dùng đúng master; Water có nền info, các master còn lại primary/700. Value Bold 36/51, Unit Medium 12/17, Hint Regular 12/17. Không tính kcal, BMI hay tiến trình upload trong component. Progress có min/max/now cho trình đọc màn hình. Overline mặc định theo nhãn master; value/unit/hint do props quyết định.

**Illustration:** `source` cho raster Mầm đã xác minh hoặc `children` cho component SVG được cung cấp; `decorative`, `accessibilityLabel`, `style`, `testID`. Để trống khi không có asset; preview báo rõ thiếu asset. Không dựng mascot giả từ các bounding box vector. App chưa có thư viện SVG hoặc asset SVG; host cho phép tích hợp SVG phù hợp sau khi có path chính thức.

`buttonStyles` và `inputStyles` vẫn export với các khóa cũ, nay lấy từ master v2. Export `Button`, `Input`, `Card`, `Badge`, `Loading`, `theme`, `lightTheme`, `useAppTheme` được giữ. Badge/Loading là tiện ích tương thích dùng foundation v2, không tính thêm vào 57 variant.

## Ví dụ

```tsx
import { Button, Input, Card, Chip, Toggle, Summary } from '@/components/ui';

<Button title="Xác nhận" onPress={onConfirm} variant="primary" loading={saving} />
<Button title="Để sau" onPress={onLater} fullWidth={false} width={180} variant="secondary" />
<Input label="Tìm kiếm" type="search" value={query} onChangeText={setQuery} />
<Input label="Khẩu phần" type="select" value={portionLabel} onChangeText={setPortionLabel} onSelect={openPicker} />
<Card type="recipe" title={recipe.title} subtitle={recipe.subtitle} selected={selected} onPress={onSelect} />
<Chip label="Thuần chay" selected={selected} onPress={onSelect} />
<Toggle label="Nhắc uống nước" value={enabled} onValueChange={setEnabled} />
<Summary kind="water" value="1.250" unit="/ 2.000 ml" hint="Thêm 750 ml" progress={0.625} />
```

Props `preview` cố định kích thước master để đối chiếu; không dùng cho nội dung dài hay screen thực tế. Production dùng minHeight, text co giãn/xuống dòng; Button mặc định tối thiểu 48 nhưng tăng cao khi nội dung cần nhiều dòng. Input surface rộng 100% container. Card generic có children giữ bố cục dọc để không làm hỏng các call site hiện có.

## Preview và kiểm tra

```sh
npm run preview:ui
# http://localhost:8082 — entry riêng trong preview/, không qua navigation của app
npm run preview:ui:export
# Expo export Android/iOS/web vào dist/ui-core (ignored)
npm run design:sync
npm run typecheck
npm run lint
```

Preview dựng đủ 57 variant + 7 Summary + vùng báo thiếu Mầm. Có sandbox cho nội dung dài, focus/filled tự động, error, password, select, chip/card selected, toggle và loading.

Đã kiểm tra trên web trong Codex browser: các mẫu render được; đọc DOM kích thước/màu/radius/opacity tất cả mẫu; Button Primary 152×48, #247A52, radius16, font Montserrat_SemiBold; Pressed opacity0.82; Card358×112, Summary342×160, Chip cao40, Toggle184×48. Đã nhìn screenshot Button/Chip/Toggle/Summary/Input/Card và sandbox; sửa Input bị co chiều rộng và bỏ outline mặc định của input web vì surface đã có focus border. Đã bấm Select, toggle, loading, nhập text; xác nhận checked/busy/selected qua ARIA. Font hook tải xong trước khi gallery render; DOM dùng đúng các fontFamily weight.

`typecheck`, `lint`, export bundle Android/iOS/web đã chạy thành công. Chưa chạy ứng dụng trên thiết bị/emulator native, chưa thử VoiceOver/TalkBack, chưa có ảnh render Figma trong gói để so khớp pixel. Không khẳng định đã khớp trực quan Figma; screenshot chỉ xác nhận render của implementation.

## Chênh lệch dữ liệu, extension và phần còn thiếu

- **Mầm chưa hoàn thành:** JSON có 15 vector nhưng không có path; tìm asset đệ quy workspace và thư mục cha không thấy SVG phù hợp. Cần SVG/path hoặc raster Mầm chính thức, không dùng mascot khác. Host và preview cảnh báo đã có, hình minh họa còn thiếu.
- **Input root:** metadata 358×76 nhưng children label22 + gap8 + field48 = 78. Preview giữ root76 và surface48; nội dung có thể vượt root2px. Production tự giãn theo children, không ép 76. Không giảm field48 hay font/gap để che mâu thuẫn.
- **Border INSIDE:** Figma border nằm trong bounds; Yoga/web border tham gia box model. Preview giữ dimensions/padding đã trích xuất, nội dung một số child có thể lệch vài pixel. Summary preview dùng progress width298 của master; production giãn theo container.
- Hành vi bổ sung: minHeight thay fixedHeight cho nội dung dài, fullWidth theo API cũ, text shrink/wrap, hitSlop4 cho Chip và10 cho password icon, reset padding/outline input web, error helper, accessibility/ARIA, clamp progress. Những phần này không được gọi là thông số Figma.
- Các foundation convenience cũ không có đối ứng trực tiếp (primary50/900, tertiary, border subtle, rating, size sm/lg, shadow sm/md/lg/modal) là aliases v2 để giữ export. Spacing48/64 là bội số token24/32; touch/icon/avatar sizes và overlay opacity 0.4/0.24 là tiện ích bổ sung. Typography heading/body convenience là mapping trên global typography, không phải master mới.
- Loading dùng dấu chấm và label đúng JSON; không có animation spinner trong master. Glyph icon là chữ, không phải vector; mức độ giống glyph trên native cần kiểm tra thiết bị.
- Root chỉ nạp font; chưa sửa nghiệp vụ hoặc navigation. Global theme mới sẽ tự ảnh hưởng component/screen đang tham chiếu theme, nhưng không thay layout/call site của screen.

## Danh sách 57 variant

Danh sách bên dưới được lấy trực tiếp từ components.json, đối chiếu theo ID trong componentTokens và `sample-ID` của preview.

| Family  | Variant Figma                   | ID       | Props code                              |
| ------- | ------------------------------- | -------- | --------------------------------------- |
| Button  | Style=Primary, State=Default    | 200:1521 | `variant="primary"; state="default"`    |
| Button  | Style=Primary, State=Pressed    | 200:1523 | `variant="primary"; state="pressed"`    |
| Button  | Style=Primary, State=Loading    | 200:1525 | `variant="primary"; state="loading"`    |
| Button  | Style=Primary, State=Disabled   | 200:1527 | `variant="primary"; state="disabled"`   |
| Button  | Style=Secondary, State=Default  | 200:1529 | `variant="secondary"; state="default"`  |
| Button  | Style=Secondary, State=Pressed  | 200:1531 | `variant="secondary"; state="pressed"`  |
| Button  | Style=Secondary, State=Loading  | 200:1533 | `variant="secondary"; state="loading"`  |
| Button  | Style=Secondary, State=Disabled | 200:1535 | `variant="secondary"; state="disabled"` |
| Button  | Style=Warning, State=Default    | 200:1537 | `variant="warning"; state="default"`    |
| Button  | Style=Warning, State=Pressed    | 200:1539 | `variant="warning"; state="pressed"`    |
| Button  | Style=Warning, State=Loading    | 200:1541 | `variant="warning"; state="loading"`    |
| Button  | Style=Warning, State=Disabled   | 200:1543 | `variant="warning"; state="disabled"`   |
| Button  | Style=Danger, State=Default     | 200:1545 | `variant="danger"; state="default"`     |
| Button  | Style=Danger, State=Pressed     | 200:1547 | `variant="danger"; state="pressed"`     |
| Button  | Style=Danger, State=Loading     | 200:1549 | `variant="danger"; state="loading"`     |
| Button  | Style=Danger, State=Disabled    | 200:1551 | `variant="danger"; state="disabled"`    |
| Button  | Style=Ghost, State=Default      | 200:1553 | `variant="ghost"; state="default"`      |
| Button  | Style=Ghost, State=Pressed      | 200:1555 | `variant="ghost"; state="pressed"`      |
| Button  | Style=Ghost, State=Loading      | 200:1557 | `variant="ghost"; state="loading"`      |
| Button  | Style=Ghost, State=Disabled     | 200:1559 | `variant="ghost"; state="disabled"`     |
| Chip    | Kind=Default, State=Default     | 200:1723 | `kind="default"; state="default"`       |
| Chip    | Kind=Default, State=Pressed     | 200:1725 | `kind="default"; state="pressed"`       |
| Chip    | Kind=Selected, State=Default    | 200:1727 | `kind="selected"; state="default"`      |
| Chip    | Kind=Selected, State=Pressed    | 200:1729 | `kind="selected"; state="pressed"`      |
| Chip    | Kind=Danger, State=Default      | 200:1731 | `kind="danger"; state="default"`        |
| Chip    | Kind=Danger, State=Pressed      | 200:1733 | `kind="danger"; state="pressed"`        |
| Control | State=Off                       | 200:1736 | `state="off"`                           |
| Control | State=On                        | 200:1740 | `state="on"`                            |
| Control | State=Disabled                  | 200:1744 | `state="disabled"`                      |
| Input   | Type=Text, State=Default        | 200:1562 | `type="text"; state="default"`          |
| Input   | Type=Text, State=Focus          | 200:1566 | `type="text"; state="focus"`            |
| Input   | Type=Text, State=Filled         | 200:1570 | `type="text"; state="filled"`           |
| Input   | Type=Text, State=Error          | 200:1574 | `type="text"; state="error"`            |
| Input   | Type=Text, State=Disabled       | 200:1578 | `type="text"; state="disabled"`         |
| Input   | Type=Search, State=Default      | 200:1582 | `type="search"; state="default"`        |
| Input   | Type=Search, State=Focus        | 200:1587 | `type="search"; state="focus"`          |
| Input   | Type=Search, State=Filled       | 200:1592 | `type="search"; state="filled"`         |
| Input   | Type=Search, State=Error        | 200:1597 | `type="search"; state="error"`          |
| Input   | Type=Search, State=Disabled     | 200:1602 | `type="search"; state="disabled"`       |
| Input   | Type=Password, State=Default    | 200:1607 | `type="password"; state="default"`      |
| Input   | Type=Password, State=Focus      | 200:1612 | `type="password"; state="focus"`        |
| Input   | Type=Password, State=Filled     | 200:1617 | `type="password"; state="filled"`       |
| Input   | Type=Password, State=Error      | 200:1622 | `type="password"; state="error"`        |
| Input   | Type=Password, State=Disabled   | 200:1627 | `type="password"; state="disabled"`     |
| Input   | Type=Select, State=Default      | 200:1632 | `type="select"; state="default"`        |
| Input   | Type=Select, State=Focus        | 200:1637 | `type="select"; state="focus"`          |
| Input   | Type=Select, State=Filled       | 200:1642 | `type="select"; state="filled"`         |
| Input   | Type=Select, State=Error        | 200:1647 | `type="select"; state="error"`          |
| Input   | Type=Select, State=Disabled     | 200:1652 | `type="select"; state="disabled"`       |
| Card    | Type=Recipe, State=Default      | 200:1658 | `type="recipe"; state="default"`        |
| Card    | Type=Recipe, State=Selected     | 200:1666 | `type="recipe"; state="selected"`       |
| Card    | Type=Ingredient, State=Default  | 200:1674 | `type="ingredient"; state="default"`    |
| Card    | Type=Ingredient, State=Selected | 200:1682 | `type="ingredient"; state="selected"`   |
| Card    | Type=Nutrition, State=Default   | 200:1690 | `type="nutrition"; state="default"`     |
| Card    | Type=Nutrition, State=Selected  | 200:1698 | `type="nutrition"; state="selected"`    |
| Card    | Type=Reminder, State=Default    | 200:1706 | `type="reminder"; state="default"`      |
| Card    | Type=Reminder, State=Selected   | 200:1714 | `type="reminder"; state="selected"`     |
