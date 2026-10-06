# VEGETA shared hooks

Đã đọc toàn bộ `../VEGETA_SHARED_HOOKS_GUIDELINE.md`, triển khai mục 9 và audit tất cả 37 candidate ở `HOOK_IMPLEMENTATION_MATRIX.md`. Source handoff thực tế ở `../VEGETA-ui-handoff/`. Runtime chỉ nằm trong app; không import guideline/handoff từ thư mục cha. Giữ cấu trúc `src/hooks/` hiện có thay vì tạo thư mục hook song song.

Phạm vi: UI core và preview. Không đổi theme/token/style master, layout/navigation, screen nghiệp vụ hay backend. Không có provider/cache/form framework mới, không có API giả hoặc hook stub.

## Nguồn state và consumer

| Hook / API tương đương                  | File                                                   | Ownership / provider                                                      | Consumer thực tế                                                         |
| --------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| useAppTheme (reuse)                     | src/hooks/useAppTheme.ts                               | Singleton lightTheme static; không cần provider                           | HooksPreview; core giữ theme import trực tiếp                            |
| useResponsiveLayout                     | src/hooks/useResponsiveLayout.ts + responsiveLayout.ts | RN useWindowDimensions, derive trong render                               | HooksPreview, preview-only                                               |
| useKeyboardInsets                       | src/hooks/useKeyboardInsets.ts + keyboardObserver.ts   | Một observer native lazy chung, subscription cuối cleanup; không provider | HooksPreview + KeyboardProbe, preview-only                               |
| useFieldState                           | src/hooks/useFieldState.ts                             | local per mounted instance                                                | Input.tsx (integrated-core) và field A/B của HooksPreview                |
| useSelection                            | src/hooks/useSelection.ts + selection.ts               | local hoặc controlled từ caller; không global store                       | HooksPreview single/multi/controlled, preview-only                       |
| useDisclosure                           | src/hooks/useDisclosure.ts                             | local hoặc controlled từ caller                                           | Input password (integrated-core), panels/mount probes trong HooksPreview |
| useDebouncedValue                       | src/hooks/useDebouncedValue.ts + debounce.ts           | local value/timer, không cache/API/storage                                | Search DebounceProbe trong HooksPreview, preview-only                    |
| useAsyncAction                          | src/hooks/useAsyncAction.ts + asyncAction.ts           | Controller local cho từng instance, không query cache                     | AsyncProbe → Button loading/callback trong HooksPreview, preview-only    |
| useAuthStore (reuse useAuth equivalent) | src/features/auth/store/authStore.ts                   | Zustand singleton + authApi/storage hiện có                               | RootLayout, LoginScreen, HomeScreen đã có; không consumer mới            |

Tạo 7 hook, reuse2 API. Chỉ FieldState và Disclosure được nối mới vào core; không gọi auth/feature/API trong Input/Button. Feature hooks và hệ thống/form còn lại defer theo matrix, không claim integrated toàn app. Helpers pure chỉ hỗ trợ hook, không được đổi tên thành hook.

## useAppTheme

`import { useAppTheme } from '@/hooks'`. Không input; trả AppTheme/lightTheme hiện có, gồm componentPresets/token v2. Không state/error/cancel/reset hoặc subscription. Hai consumer nhận cùng object. Master Button48/Chip40; không chọn screen52/38 theo breakpoint ngầm. Có thể import theme trực tiếp nơi không cần hook.

## useResponsiveLayout

Input `{ maxWidth=640, gutter=spacing.lg (16), preset='master' }`, output width/height/scale/fontScale của RN, contentWidth/compact/wide/preset. ContentWidth = min(maxWidth, max(0,width−2*gutter)); maxWidth<=0 về0, không finite dùng availableWidth. Compact khi availableWidth<maxWidth, wide khi >=. Cap640 là chính sách proposed ngoài Figma, cho phép caller đổi. Không nhân fontSize với viewport/fontScale, không tự apply style hoặc chọn screen preset. RN quản lý Dimensions subscription/cleanup, không provider riêng. Không error/reset/cancel.

## useKeyboardInsets

Không input; output `{ visible, height, screenY, overlap, supported }`. Native RN Keyboard.metrics và DidShow/DidHide; iOS thêm WillChangeFrame. Observer chỉ gắn một bộ listener khi có consumer, gỡ sau unsubscribe cuối. getSnapshot giữ identity đến khi metrics đổi; server snapshot hidden.

Web RN Keyboard không có metrics/soft keyboard event: supported=false, visible=false/height=0/screenY=null/overlap=0 là fallback không có dữ liệu, **không chứng minh bàn phím không mở**. Native overlap=max(0,min(height,windowHeight−screenY)), thông tin dựa trên tọa độ window/screen RN; floating keyboard/safe area cần consumer xét theo layout thực và kiểm tra thiết bị.

Không bù padding, safe-area hoặc scroll. Login hiện có KeyboardAvoidingView là owner bù inset; chưa migrate nó. Không cộng thêm overlap nếu KAV/navigator đã xử lý. Không có error/reset/cancel và không yêu cầu permission.

## useFieldState

Không input; output focused=false/touched=false, onFocus(), onBlur(), reset(). Focus chỉ bật focused; blur tắt focused và đặt touched=true; reset cả hai false. Không sở hữu value, dirty, error hoặc validation. Reset metadata không gọi native blur và không xóa value. Callback caller onFocus/onBlur trong Input được gọi như trước. Hai instance độc lập, không effect/listener/provider/error/cancel.

## useDisclosure

Input `{ initialOpen=false, isOpen?, onOpenChange? }`; output isOpen/open()/close()/toggle(). Có isOpen nghĩa là controlled: chỉ phát onOpenChange(next), caller phải cập nhật prop. Không có thì dùng state local; initialOpen chỉ dùng khi mount. Open/close cùng giá trị không gọi callback lại. Uncontrolled actions liên tiếp dùng ref đồng bộ, không đặt side effect vào state updater. Không đổi controlled↔uncontrolled trong cùng mount; remount khi đổi ownership. Hai panel không chia sẻ state. Không error/cancel/reset; close là action đóng. Input dùng local để reveal password, không giữ mật khẩu trong hook.

## useSelection

Input `{ mode='single', defaultSelectedKeys=[], selectedKeys?, onChange? }`; key string|number, array readonly. Output selectedKeys/isSelected(key)/select(key)/toggle(key)/clear(). Single giữ tối đa key đầu sau dedupe; select thay key, toggle key hiện tại xóa. Multi thêm/xóa; select key sẵn có là no-op. Clear về[]; không phát callback nếu không đổi.

Có selectedKeys: controlled, hook copy/normalize để đọc và phát array mới qua onChange; caller là nguồn duy nhất và phải render prop mới. Không có: state local, defaultSelectedKeys đọc khi mount. Uncontrolled actions liên tiếp cập nhật ref đồng bộ. Không mutate array/Set của caller, mỗi instance độc lập; không chuyển ownership trong cùng mount. Thay mode normalize output và các action tiếp theo.

Policy key biến mất khỏi items: **retain** vì hook không giữ items, không reset ngầm khi filter thay đổi; caller gọi clear hoặc truyền selectedKeys đã reconcile khi muốn bỏ key. Chuyển user/entity phải controlled reset hoặc remount; selection local không tự đọc auth. Không error/cancel/API/provider.

## useDebouncedValue

`useDebouncedValue(value, delay=300)` trả value đầu ngay khi mount; sau đó giữ giá trị trước cho đến khi delay kể từ lần value/delay cuối. Delay âm/không finite về0 (vẫn timer async). Effect dependency value/delay, cleanup clearTimeout khi đổi hoặc unmount. Object dùng identity React, caller nên truyền giá trị bất biến. Không callback/API/storage/cache, không flush/reset public; cần những contract này thì thiết kế theo consumer cụ thể sau.

## useAsyncAction

`useAsyncAction(action, { scopeKey? })`: action(...args) trả Promise<Result>. ScopeKey string|number ổn định (user/entity/filter identifier của caller); undefined mặc định. Output run(...args):Promise<Result>, pending=false, error:unknown=null, reset(). Callback action thay đổi chỉ tác động run tiếp theo; run đang chạy giữ callback/args lúc bắt đầu. Thay entity/filter phải truyền scopeKey mới hoặc reset rõ ràng.

Policy:

- Khóa đồng bộ trước await; run trùng reject AsyncActionBusyError, không gọi action lần hai và không thay error chính. pending được dùng làm loading ở Button.
- Thành công trả result; lỗi thật được lưu error và rethrow nguyên lỗi. Không nuốt lỗi thành undefined; caller catch Promise. Error cũ xóa khi run mới/reset.
- Reset/scopeKey đổi vô hiệu hóa generation cũ, xóa error nhưng **giữ pending/khóa đến khi action settle**; request server không bị hủy. Run cũ sau đó reject AsyncActionDiscardedError kể cả resolve hoặc reject, không cập nhật lỗi/result cũ.
- Unmount vô hiệu generation và ngừng notify state; Promise cũ reject Discarded. Layout-effect cleanup vô hiệu ngay khi unmount; StrictMode replay có activate/deactivate. Hook không retry, không cache, không fake progress hoặc abort server.
- Caller sở hữu side effect và các .then/.catch callbacks của chính mình. Hook chỉ bảo vệ result/state của hook; không thể undo side effect bên trong action. Async button disabled chỉ ngăn UI callback; guard hook bảo vệ cả hai run trong cùng tick.

```tsx
import {
  useAsyncAction,
  AsyncActionDiscardedError,
  AsyncActionBusyError,
} from '@/hooks';
const action = useAsyncAction(saveExistingService, { scopeKey: entityId });
async function submit() {
  try {
    await action.run(formValue);
  } catch (error) {
    if (
      error instanceof AsyncActionDiscardedError ||
      error instanceof AsyncActionBusyError
    )
      return;
    // Present an actual error using the consumer's existing mechanism.
  }
}
// <Button title="Lưu" loading={action.pending} onPress={submit} />
```

Đây là ví dụ contract, không thêm save API. Preview dùng promise local được resolve/reject bằng nút, nhãn ghi rõ không API; không login hoặc persist thông tin demo.

## Auth và các phần deferred

Reuse trực tiếp `useAuthStore(selector)` từ `@/features/auth`, không tạo useAuth wrapper. User/session/loading/error và login/logout/restoreSession/clearError có contract tại auth.types.ts. Hai consumer đọc cùng Zustand store; authApi hiện mô phỏng login rồi lưu AsyncStorage. Backend thực yêu cầu Firebase/auth sync; không gọi mock token là production auth. App chỉ có Login/Home; Home đọc user session là reuse sẵn có, không phải useUserProfile remote.

QueryClient chung đã có trong RootLayout nhưng app chưa có query/list feature. Không tạo useApi/useFetch/query wrapper, pagination/refetch state thứ hai hoặc fake feature endpoint. Chưa kiểm tra/sửa auth storage corruption, secure credentials, concurrent login/logout/account switch hoặc account-scoped query integration; không thêm query feature nên không phát sinh cache user mới. Form draft (đặc biệt credential), form framework, confirmation/toast presenter, media/permissions/network/preferences/lifecycle và 15 feature candidate còn thiếu frontend consumer/contract được ghi cụ thể trong matrix.

## Kiểm tra và bàn giao

Baseline typecheck/lint/test:ui đạt. Sau code: typecheck/lint/test:ui đạt với 12 test (11 hooks/support,1 progress). Tests dùng Node:test có sẵn; support async controller/timer/observer/selection/viewport là code thật hook dùng. Kiểm tra double run, error/reset, stale rejection/resolution, deactivate/activate, instance độc lập, cleanup subscription/timer, selection không mutate readonly input, clamp viewport. MockTimers Node22 có ExperimentalWarning, không failure. Không cài test framework mới và không gọi support test là test native renderer.

Web sandbox đã render: controlled/single/multi/clear selection callback; disclosure độc lập/controlled; field focus/blur/touched và password; debounce rapid a/ab/abc, delay500 ra abc; async double/reset/resolve/reject/scope/unmount; viewport390→content358/compact và1280→640/wide, preset master giữ48/40. Listener native test qua adapter; web keyboard supported=false. Chưa kiểm tra thiết bị/simulator, TalkBack/VoiceOver hoặc bàn phím native. Font/token không đổi.

Preview: `npm run preview:ui` (port8082), `src/preview/HooksPreview.tsx` bên trong CorePreview riêng. Check: `npm run typecheck`, `npm run lint`, `npm run test:ui`, `npm run preview:ui:export`. Export Android/iOS/web đã đạt. Sandbox được bọc React.StrictMode; đã kiểm tra double-run chỉ started=1, controlled callback một lần, unmount/scope discard và không có console error/warn mới sau reload cuối. Không có migration screen trong nhiệm vụ này.

Tham khảo implementation: [React useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) cho snapshot/subscription ổn định; [useEffect](https://react.dev/reference/react/useEffect) cho dependencies/cleanup; [custom hooks](https://react.dev/learn/reusing-logic-with-custom-hooks) cho ownership mỗi instance. Contract cụ thể trên là quy ước VEGETA, không phải yêu cầu React phải có đủ 37 hook.
