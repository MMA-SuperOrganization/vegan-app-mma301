# Guideline tích hợp API và Authentication cho Vegeta Mobile

> Phạm vi: `vegan-app-mma301` (Expo / React Native / TypeScript).  
> Backend: `vegan-api-mma302`, mặc định dùng prefix `/api/v1`.  
> Tài liệu này mô tả code hiện tại và là quy ước khi thêm API mới.

## 1. Mục tiêu và nguyên tắc

Sau khi đọc tài liệu này, developer có thể cấu hình kết nối backend, hiểu đúng token, triển khai auth, thêm API mới và kiểm thử trên web, emulator hoặc thiết bị thật.

Các nguyên tắc quan trọng:

1. Firebase Authentication xác thực danh tính và cấp token; backend không nhận hoặc lưu mật khẩu.
2. Backend chỉ nhận **Firebase ID token** trong `Authorization: Bearer <token>`.
3. Refresh token chỉ gửi đến Firebase Secure Token API, tuyệt đối không gửi đến backend Vegeta.
4. Feature không gọi `axios` trực tiếp. Mọi request backend đi qua `apiClient`.
5. Screen không gọi API service trực tiếp nếu dữ liệu là server state; dùng TanStack Query hook.
6. Không log token, mật khẩu, API key, Authorization header hoặc response chứa credential.
7. Không commit `.env`, token thật, service-account key hoặc tài khoản test thật.

## 2. Kiến trúc hiện tại

```text
Screen / Component
       |
       v
TanStack Query hook              Zustand auth store
       |                                |
       v                                v
Feature API service <----------- authApi / authSession
       |                                |
       +--------------+-----------------+
                      v
                  apiClient
             (Axios interceptor)
                      |
           Authorization: Bearer ID_TOKEN
                      |
                      v
              Vegeta Backend API
                      |
              Firebase Admin verify
```

Các file nền tảng:

| File                                    | Trách nhiệm                                              |
| --------------------------------------- | -------------------------------------------------------- |
| `src/config/appConfig.ts`               | Đọc và chuẩn hóa biến môi trường.                        |
| `src/services/api/apiConfig.ts`         | `baseURL`, timeout dùng chung.                           |
| `src/services/api/apiClient.ts`         | Axios instance và request interceptor gắn token.         |
| `src/services/api/apiRequest.ts`        | Bóc `data`, giữ pagination meta, chuẩn hóa lỗi.          |
| `src/services/api/apiError.ts`          | Chuyển Axios/backend error thành lỗi an toàn cho app.    |
| `src/services/auth/firebaseAuth.ts`     | Gọi Firebase REST cho email/password, Google và refresh. |
| `src/services/auth/authSession.ts`      | Lưu, đọc, refresh và xóa session.                        |
| `src/services/storage/*`                | Wrapper AsyncStorage và tên key tập trung.               |
| `src/features/auth/services/authApi.ts` | Điều phối Firebase session với `/auth/sync`.             |
| `src/features/auth/store/authStore.ts`  | Auth state phục vụ UI và navigation.                     |
| `src/app/_layout.tsx`                   | Restore session khi app khởi động, cung cấp QueryClient. |

## 3. Hiểu đúng các loại token

| Giá trị                    | Nguồn            | Gửi tới đâu               | Mục đích                                                    |
| -------------------------- | ---------------- | ------------------------- | ----------------------------------------------------------- |
| Firebase Web API key       | Firebase Console | Firebase REST URL         | Xác định Firebase project; không phải Bearer token.         |
| Google ID token            | Google Sign-In   | Firebase `signInWithIdp`  | Đổi credential Google thành Firebase session.               |
| Google access token        | Google OAuth     | Google API (nếu cần)      | Không dùng để gọi Vegeta backend.                           |
| Firebase ID token          | Firebase Auth    | Vegeta backend            | Chứng minh danh tính; backend xác minh bằng Firebase Admin. |
| Firebase refresh token     | Firebase Auth    | Firebase Secure Token API | Lấy ID token mới khi ID token sắp/hết hạn.                  |
| Firebase Admin private key | Backend secret   | Chỉ backend               | Xác minh token; tuyệt đối không có trong mobile app.        |

### 3.1. `accessToken` trong dự án này là gì?

Backend Vegeta không phát access token riêng. Token dùng để gọi backend thực chất là **Firebase ID token**. Code hiện lưu nó bằng key `auth_token` và Zustand dùng field `token`.

Nếu tài liệu, ticket hoặc code mới gọi giá trị này là `accessToken`, phải hiểu đó là bí danh của Firebase ID token:

```ts
type AuthTokens = {
  accessToken: string; // Firebase ID token
  refreshToken: string; // Firebase refresh token
};
```

Không được lấy Google access token rồi gắn vào API Vegeta.

### 3.2. Vòng đời token hiện tại

- Khi đăng nhập/đăng ký, Firebase trả `idToken`, `refreshToken`, `expiresIn`.
- `authSession.save()` tính `expiresAt = Date.now() + expiresIn * 1000`.
- Trước mỗi request, interceptor gọi `authSession.getValidToken()`.
- Nếu ID token còn hạn hơn 60 giây, app dùng lại token hiện tại.
- Nếu token sắp hết hạn, app dùng refresh token gọi Firebase để lấy session mới.
- Các request đồng thời dùng chung một `refreshInFlight`, tránh refresh nhiều lần.
- Khi logout, generation của session thay đổi nên refresh cũ không thể ghi đè session mới.

## 4. Cấu hình môi trường

### 4.1. Tạo `.env`

Từ thư mục FE:

```powershell
Copy-Item .env.example .env
```

Cấu hình tối thiểu:

```dotenv
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api/v1
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_WEB_API_KEY
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=YOUR_GOOGLE_ANDROID_CLIENT_ID
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_GOOGLE_IOS_CLIENT_ID
EXPO_PUBLIC_PRIVACY_POLICY_URL=https://example.com/privacy
```

Quy tắc:

- `EXPO_PUBLIC_API_URL` phải gồm `/api/v1` và không cần dấu `/` cuối.
- Các biến `EXPO_PUBLIC_*` nằm trong bundle client, vì vậy không chứa secret.
- Firebase Web API key và OAuth client ID là client configuration; service-account private key vẫn là secret.
- Sau khi đổi `.env`, restart Metro. Nếu cache cũ, chạy `npx expo start -c`.

### 4.2. Chọn API URL theo môi trường

| Nơi chạy app             | URL backend local thường dùng              |
| ------------------------ | ------------------------------------------ |
| Android Emulator         | `http://10.0.2.2:3000/api/v1`              |
| iOS Simulator            | `http://localhost:3000/api/v1`             |
| Expo Web cùng máy        | `http://localhost:3000/api/v1`             |
| Thiết bị thật cùng Wi-Fi | `http://<LAN-IP-CUA-MAY>:3000/api/v1`      |
| Backend deploy           | `https://vegan-api.ngocthang.io.vn/api/v1` |

`localhost` trên Android emulator/điện thoại là chính thiết bị đó, không phải máy đang chạy backend.

Để xem LAN IP trên Windows:

```powershell
ipconfig
```

Dùng địa chỉ IPv4 của card mạng đang hoạt động. Backend cần listen trên interface phù hợp và Windows Firewall phải cho phép port `3000`.

### 4.3. Firebase phải cùng project

FE `EXPO_PUBLIC_FIREBASE_API_KEY` và backend `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` phải thuộc cùng Firebase project. Nếu khác project, Firebase phía FE vẫn có thể đăng nhập nhưng backend sẽ từ chối token.

Với Google Sign-In native, cần thêm đúng Android package/application ID và SHA-1/SHA-256 của signing certificate vào Firebase Console. Sau khi đổi native config, rebuild dev client; chỉ restart Metro là chưa đủ.

## 5. Luồng authentication

### 5.1. Đăng nhập email/password

```text
LoginScreen
  -> authStore.login(email, password)
  -> authApi.login(...)
  -> Firebase accounts:signInWithPassword
  <- idToken + refreshToken + expiresIn
  -> authSession.save(session)
  -> POST /auth/sync (apiClient tự gắn Bearer ID token)
  <- account backend
  -> Zustand: user, token, isAuthenticated = true
```

`POST /auth/sync` có body `{}`. Email và role không được lấy từ body; backend lấy identity từ token đã xác minh.

### 5.2. Đăng ký email/password

Luồng hiện tại:

1. Firebase `accounts:signUp` tạo identity.
2. Firebase `accounts:update` cập nhật display name.
3. App lưu session.
4. App gọi `POST /auth/sync` để tạo/đồng bộ account MongoDB.
5. Backend trả account và app chuyển sang onboarding nếu chưa hoàn tất.

Nếu Firebase đã tạo user nhưng `/auth/sync` lỗi mạng, không đăng ký lại email đó. Đăng nhập bằng tài khoản vừa tạo; `/auth/sync` có tính idempotent theo Firebase UID.

### 5.3. Đăng nhập Google

1. Hook `useGoogleSignIn` lấy Google ID token từ native/web OAuth flow.
2. `firebaseAuth.signInWithGoogle()` đổi Google credential thành Firebase session.
3. App lưu Firebase ID token và refresh token.
4. App gọi `/auth/sync` giống email/password.

Google ID token chỉ là đầu vào của Firebase. Token gửi backend sau cùng vẫn là Firebase ID token.

### 5.4. Restore session khi mở app

`src/app/_layout.tsx` gọi `restoreSession()` một lần khi bootstrap:

1. Đọc ID token, refresh token và expiry từ AsyncStorage.
2. Refresh nếu ID token sắp hết hạn.
3. Gọi `/auth/sync` để kiểm tra session/account backend.
4. Nếu backend trả `401`, xóa token và cached user.
5. Nếu lỗi tạm thời nhưng token và cached user còn hợp lệ, app có thể dùng cached user.
6. UI giữ loading state qua `isRestoringSession` để không redirect nhấp nháy.

### 5.5. Logout

`authApi.logout()` xóa `auth_token`, `auth_refresh_token`, `auth_token_expires_at`, `auth_firebase_user_id` và `auth_user`.

Root layout còn xóa TanStack Query cache khi account thay đổi. Điều này ngăn dữ liệu account trước xuất hiện ở account sau.

Lưu ý: logout hiện tại là logout local; nó không revoke refresh token trên Firebase server. Với yêu cầu bảo mật cao hơn, cần thiết kế thêm revoke/session management ở backend.

## 6. Storage và bảo mật token

Code hiện dùng AsyncStorage. AsyncStorage là persistent key-value storage nhưng **không phải encrypted secure storage**. Không đọc token từ Zustand để tự lưu thêm ở nơi khác.

Quy ước hiện tại:

```text
auth_token             Firebase ID token
auth_refresh_token     Firebase refresh token
auth_token_expires_at  Epoch milliseconds dạng string
auth_firebase_user_id  Firebase UID
auth_user              User DTO đã chuẩn hóa để hỗ trợ restore
```

Checklist an toàn:

- không `console.log(session)`, `console.log(token)` hoặc log toàn bộ request config;
- không chụp/copy token lên issue, chat, commit hoặc tài liệu;
- không đưa token vào query string và không lưu password;
- không dùng `storage.clear()` khi logout vì có thể xóa locale/draft không liên quan;
- chỉ xóa đúng auth keys;
- production nên cân nhắc chuyển refresh token sang `expo-secure-store`/Keychain/Keystore sau khi đánh giá migration;
- nếu đổi storage, cần migration có version và vẫn xóa dữ liệu cũ an toàn.

## 7. Token được gắn vào API như thế nào?

`src/services/api/apiClient.ts` tạo Axios instance và interceptor:

```ts
export const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await authSession.getValidToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

Hệ quả:

- feature chỉ cần gọi `apiClient.get/post/...`;
- không import AsyncStorage trong feature service;
- không lấy `useAuthStore.getState().token` để tạo header;
- không truyền `Authorization` thủ công;
- interceptor tự refresh trước request nếu token gần hết hạn;
- public endpoint vẫn chạy bình thường khi không có session;
- optional-auth endpoint nhận token nếu user đã đăng nhập.

Không tạo thêm Axios instance trong từng feature. Nếu cần upload `multipart/form-data`, vẫn dùng `apiClient`; chỉ cấu hình request cụ thể và để Axios/runtime tạo boundary đúng cách.

## 8. Chuẩn request và response

### 8.1. Success envelope

```json
{
  "success": true,
  "data": {},
  "meta": { "requestId": "request-id" }
}
```

List phân trang có thêm `page`, `limit`, `total`, `totalPages` trong `meta`.

- Dùng `unwrapApiRequest<T>()` cho object hoặc array không cần pagination.
- Dùng `unwrapApiPageRequest<T>()` cho danh sách cần giữ `meta`.

### 8.2. Error envelope

```json
{
  "success": false,
  "error": {
    "code": "TOKEN_INVALID",
    "message": "Invalid authentication token",
    "details": []
  },
  "meta": { "requestId": "request-id" }
}
```

`normalizeApiError()` lấy `status`, `error.code`, `error.message`, sau đó unwrap helper ném `AppError`.

| Status    | Ý nghĩa                                          | Xử lý FE                                                  |
| --------- | ------------------------------------------------ | --------------------------------------------------------- |
| `400`     | Payload/query sai                                | Sửa validation và mapping request.                        |
| `401`     | Thiếu/sai/hết hạn/revoked token                  | Kiểm tra token flow; clear session nếu không thể refresh. |
| `403`     | Đã xác thực nhưng không có quyền/account bị chặn | Không retry; hiển thị thông báo phù hợp.                  |
| `404`     | Resource không tồn tại/không thuộc quyền         | Hiển thị empty/not found.                                 |
| `409`     | Conflict trạng thái hoặc dữ liệu trùng           | Refetch và hướng dẫn người dùng.                          |
| `422`     | Vi phạm validation                               | Map field errors nếu backend trả details.                 |
| `429`     | Rate limit                                       | Không spam retry; chờ và báo người dùng.                  |
| `500/503` | Backend/dependency lỗi                           | Cho phép retry có kiểm soát.                              |

## 9. Cách thêm một API mới

### Bước 1: đọc contract backend

Ưu tiên Swagger UI `/api-docs`, sau đó `vegan-api-mma302/docs/openapi.yaml`. Xác định method, path, auth, path/query/body, response, pagination và error codes. Không đoán DTO từ UI.

### Bước 2: khai báo type domain

```ts
export interface RecipeDetail {
  _id: string;
  title: string;
  saved?: boolean;
  isSaved?: boolean;
}
```

DTO backend có thể khai báo private trong API file; type UI tiêu thụ đặt trong feature `types.ts`. Nếu shape backend khác domain model, tạo mapper rõ ràng.

### Bước 3: thêm feature API service

```ts
import { apiClient, unwrapApiRequest } from '@/services/api';
import type { RecipeDetail } from './types';

export const recipeApi = {
  detail: async (idOrSlug: string) => {
    const recipe = await unwrapApiRequest<RecipeDetail>(() =>
      apiClient.get(`/recipes/${encodeURIComponent(idOrSlug)}`)
    );
    return { ...recipe, isSaved: recipe.isSaved ?? recipe.saved ?? false };
  },
};
```

Không bắt lỗi chỉ để ném lại. Chỉ `catch` khi cần fallback có chủ đích, rollback hoặc thêm context an toàn.

### Bước 4: tạo query key và hook

```ts
export const recipeKeys = {
  details: (userId?: string | null) =>
    ['account', userId ?? 'anonymous', 'recipes', 'detail'] as const,
  detail: (userId: string | null | undefined, id: string) =>
    [...recipeKeys.details(userId), id] as const,
};

export function useRecipeDetail(id: string) {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: recipeKeys.detail(userId, id),
    queryFn: () => recipeApi.detail(id),
    enabled: Boolean(id),
  });
}
```

Query chứa dữ liệu cá nhân phải có account identity trong key. Mutation cần invalidate đúng key; optimistic update phải snapshot và rollback trong `onError`.

### Bước 5: dùng hook ở screen

Screen xử lý loading ban đầu, success có data, empty, error và retry. Không copy query data vào Zustand. Zustand giữ client state; TanStack Query giữ server state.

### Bước 6: export qua feature public API

Chỉ export thứ feature khác cần dùng qua `index.ts`. Tránh import xuyên sâu vào implementation của feature khác.

## 10. Query parameters, body và upload

Loại bỏ `undefined` và chuỗi rỗng trước khi gửi. Không tự nối query string:

```ts
apiClient.get('/recipes', {
  params: { page: 1, limit: 10, category },
});
```

JSON body:

```ts
unwrapApiRequest(() =>
  apiClient.patch('/users/me', { displayName: values.displayName.trim() })
);
```

Không gửi field UI-only, empty string hoặc `undefined` nếu contract không cho phép.

Multipart mẫu:

```ts
const body = new FormData();
body.append('file', {
  uri: asset.uri,
  name: asset.fileName ?? 'upload.jpg',
  type: asset.mimeType ?? 'image/jpeg',
} as never);

await unwrapApiRequest(() => apiClient.post('/media', body));
```

Không tự đặt multipart boundary. Kiểm tra MIME type, kích thước và presigned-upload flow trong OpenAPI trước khi dùng.

## 11. Test API

### 11.1. Test readiness trước

```powershell
Invoke-RestMethod 'https://vegan-api.ngocthang.io.vn/api/v1/health/ready'
Invoke-RestMethod 'http://localhost:3000/api/v1/health/ready'
```

Mong đợi HTTP `200`, `success: true`, database connected/ready. Nếu readiness fail, chưa nên debug FE.

### 11.2. Lấy token test bằng Firebase REST

```powershell
$firebaseApiKey = 'YOUR_FIREBASE_WEB_API_KEY'
$credential = @{
  email = 'your-test-account@example.com'
  password = 'YOUR_TEST_PASSWORD'
  returnSecureToken = $true
} | ConvertTo-Json

$session = Invoke-RestMethod `
  -Method Post `
  -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$firebaseApiKey" `
  -ContentType 'application/json' `
  -Body $credential

$idToken = $session.idToken
$refreshToken = $session.refreshToken
```

Không in `$idToken` hoặc `$refreshToken` ra terminal dùng chung/CI log.

### 11.3. Gọi API protected bằng PowerShell

```powershell
$baseUrl = 'https://vegan-api.ngocthang.io.vn/api/v1'
$headers = @{ Authorization = "Bearer $idToken" }

Invoke-RestMethod `
  -Method Post `
  -Uri "$baseUrl/auth/sync" `
  -Headers $headers `
  -ContentType 'application/json' `
  -Body '{}'

Invoke-RestMethod `
  -Method Get `
  -Uri "$baseUrl/users/me" `
  -Headers $headers
```

### 11.4. Refresh token thủ công

```powershell
$refreshBody = "grant_type=refresh_token&refresh_token=$([uri]::EscapeDataString($refreshToken))"

$refreshed = Invoke-RestMethod `
  -Method Post `
  -Uri "https://securetoken.googleapis.com/v1/token?key=$firebaseApiKey" `
  -ContentType 'application/x-www-form-urlencoded' `
  -Body $refreshBody

$idToken = $refreshed.id_token
$refreshToken = $refreshed.refresh_token
```

Refresh response dùng snake_case (`id_token`, `refresh_token`, `expires_in`), khác sign-in response.

### 11.5. Test bằng Swagger UI

1. Chạy backend với `SWAGGER_ENABLED=true`.
2. Mở `/api-docs`, ví dụ `http://localhost:3000/api-docs`.
3. Bấm **Authorize**.
4. Dán Firebase ID token; không thêm chữ `Bearer` trong ô Swagger hiện tại.
5. Gọi `POST /auth/sync` trước các API cá nhân.
6. Test API đọc trước, sau đó mới test mutation bằng dữ liệu test.

Không dùng thao tác ghi/xóa chỉ để thử trên production.

### 11.6. Test từ mobile app

1. Xác minh backend readiness.
2. Cấu hình URL đúng theo emulator/device và restart Metro.
3. Đăng nhập và xác minh `/auth/sync` thành công.
4. Mở một màn hình dùng API protected như profile/saved items.
5. Đóng hẳn app, mở lại và xác minh restore session.
6. Xác minh request tiếp theo vẫn chạy sau khi token được refresh.
7. Logout, xác minh route về login và cache account cũ đã xóa.
8. Đăng nhập account khác, xác minh không lộ data account trước.

### 11.7. Chạy kiểm tra FE

```powershell
cd vegan-app-mma301
npm run typecheck
npm run lint
npm run test:ui
```

Khi sửa `authSession`, interceptor hoặc API unwrap, nên bổ sung test cho token còn hạn, refresh đồng thời, persist refresh response, logout trong lúc refresh, Bearer header, anonymous request, envelope/error và cache tách theo account.

## 12. Debug và lỗi thường gặp

| Hiện tượng                            | Nguyên nhân thường gặp                              | Cách xử lý                                                |
| ------------------------------------- | --------------------------------------------------- | --------------------------------------------------------- |
| `Network Error`, không có HTTP status | Sai host, firewall, HTTP bị chặn, backend chưa chạy | Test readiness; dùng `10.0.2.2`/LAN IP đúng.              |
| `404` cho mọi endpoint                | Base URL thiếu `/api/v1` hoặc thừa `/api-docs`      | Kiểm tra `EXPO_PUBLIC_API_URL`.                           |
| `TOKEN_MISSING`                       | Không có session/request không qua `apiClient`      | Đăng nhập; thay axios/fetch riêng bằng `apiClient`.       |
| `TOKEN_INVALID`                       | Sai token type/token hỏng/khác Firebase project     | Dùng Firebase ID token và đối chiếu project.              |
| `TOKEN_EXPIRED`                       | ID token cũ, expiry sai hoặc refresh thất bại       | Đăng nhập lại; kiểm tra Secure Token request và clock.    |
| `TOKEN_REVOKED`                       | Session bị revoke phía Firebase                     | Clear local session và yêu cầu đăng nhập lại.             |
| `401` dù vừa Google login             | Gửi Google token thay vì Firebase token             | Hoàn tất `signInWithIdp`, dùng Firebase `idToken`.        |
| Firebase `INVALID_REFRESH_TOKEN`      | Token sai/revoked/project mismatch                  | Clear session và đăng nhập lại.                           |
| Firebase `INVALID_LOGIN_CREDENTIALS`  | Sai email/password                                  | Kiểm tra credential; không map lỗi làm lộ user existence. |
| Firebase `OPERATION_NOT_ALLOWED`      | Provider chưa bật                                   | Bật provider trong Firebase Console.                      |
| Google web được nhưng Android lỗi     | Sai package, SHA fingerprint/client ID              | Sửa Firebase config và rebuild dev client.                |
| `.env` đổi nhưng URL cũ               | Metro cache/process cũ                              | Dừng Metro, chạy `npx expo start -c`.                     |
| API gọi lặp vô hạn                    | Query key/queryFn không ổn định                     | Kiểm tra hook, `enabled`, retry và filter object.         |
| Account A thấy data account B         | Query key thiếu userId/cache chưa clear             | Dùng account-scoped key và clear khi account đổi.         |

Chỉ log metadata an toàn như method, path, status, error code, request ID và duration. Không log auth body, Authorization, token, password, private key hoặc dữ liệu sức khỏe nhạy cảm.

## 13. Hành vi `401` và refresh cần lưu ý

Implementation hiện tại refresh **trước request** dựa vào expiry đã lưu. Nó chưa có response interceptor toàn cục để bắt mọi `401`, ép refresh rồi replay request.

`401` vẫn có thể xảy ra khi token bị revoke trước expiry, clock thiết bị sai, Firebase project thay đổi, account bị vô hiệu hóa hoặc token hết hạn ở edge case.

Nếu bổ sung response interceptor, phải tránh loop retry vô hạn, refresh chính request refresh, replay mutation không idempotent, nhiều refresh đồng thời và session cũ ghi đè sau logout. Policy khuyến nghị: retry tối đa một lần cho lỗi token có thể refresh; không retry `403`; refresh thất bại thì clear session và account-scoped query cache. Đây là hướng mở rộng, chưa phải hành vi đầy đủ của code hiện tại.

## 14. Definition of Done khi tích hợp endpoint

- [ ] Đã đối chiếu OpenAPI của đúng môi trường/version.
- [ ] Đã xác định public, optional-auth, user, admin hoặc internal auth.
- [ ] Type không dùng `any`; DTO và domain model được tách khi cần.
- [ ] Request đi qua `apiClient`; feature không tự gắn Bearer token.
- [ ] Dùng đúng unwrap helper và giữ pagination meta khi cần.
- [ ] Query key chứa toàn bộ input và userId nếu account-scoped.
- [ ] Có loading, empty, error, retry và success state.
- [ ] Mutation invalidate/rollback đúng cache.
- [ ] Không log hoặc commit secret/token/PII nhạy cảm.
- [ ] Test được bằng Swagger/PowerShell trước khi kết luận lỗi FE.
- [ ] Đã test emulator/device với đúng network URL.
- [ ] `npm run typecheck`, `npm run lint`, `npm run test:ui` pass.
- [ ] Đã test login, restore, logout và đổi account nếu có dữ liệu cá nhân.

## 15. Nên và không nên

Nên:

```ts
const profile = await unwrapApiRequest<ProfileDto>(() => apiClient.get('/users/me'));
```

Không nên:

```ts
const token = await AsyncStorage.getItem('auth_token');
const response = await axios.get(`${baseUrl}/users/me`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

Đoạn không nên nhân bản config, bỏ qua refresh coordination và làm auth logic phân tán.

## 16. Tài liệu liên quan

- FE environment mẫu: `.env.example`.
- Backend contract: `../../vegan-api-mma302/docs/openapi.yaml`.
- Backend auth test: `../../vegan-api-mma302/guideline/AUTH_REGISTER_LOGIN.md`.
- Backend API test cases: `../../vegan-api-mma302/guideline/test-cases/API_CASES.md`.
- API matrix: `../../vegan-api-mma302/docs/api-matrix.md`.

Khi tài liệu và runtime khác nhau, OpenAPI generate từ backend hiện tại và code đang deploy là nguồn cần xác minh. Ghi rõ môi trường, version/commit và request ID khi báo lỗi tích hợp.
