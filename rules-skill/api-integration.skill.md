---
name: api-integration
description: >-
  Tích hợp bất kỳ API nào vào dự án và sinh code production-ready (types +
  service + hook + example). Dùng khi người dùng paste curl, Swagger/OpenAPI,
  Postman/HAR, docs text hoặc code mẫu và muốn tạo lớp gọi API khớp 100% style
  dự án. Tự động phát hiện framework/HTTP client/state management, kiểm tra
  xung đột trước khi sinh code, không sửa file cũ.
version: 1.0.0
---

# API Integration & Code Generator

Biến mô tả API (curl / OpenAPI / docs / code) thành lớp tích hợp hoàn chỉnh
khớp đúng convention của dự án, an toàn và không phá vỡ code hiện có.

## Nguyên tắc cốt lõi (BẮT BUỘC)

1. **Zero Configuration** — Nếu có `.api-config.json` ở root thì load tự động, không hỏi lại.
2. **Template Over Generation** — Luôn đọc & tái sử dụng pattern từ file API có sẵn trong dự án.
3. **Conflict First** — Kiểm tra xung đột TRƯỚC khi sinh code; không auto-merge.
4. **Explicit Over Implicit** — Không tự quyết định ngầm; luôn liệt kê assumptions.
5. **Minimal Invasive** — Chỉ tạo file mới, KHÔNG sửa/ghi đè file cũ.

## Khi nào dùng skill này

Người dùng cung cấp một trong các định dạng input và muốn lớp gọi API:
- curl command
- Swagger 2.0 / OpenAPI 3.0 (YAML/JSON)
- Postman collection / HAR
- Docs dạng text (Endpoint, Method, Request, Response...)
- Code mẫu (fetch/axios) để reverse-engineer

## Hỗ trợ

- **API types:** REST, GraphQL, WebSocket, File Upload/Download, SSE, Webhook
- **Frameworks:** React, Vue, Next.js, Nuxt, Node.js/Express, SvelteKit
- **HTTP clients:** axios, fetch, custom wrapper, undici, got, superagent
- **State:** React Query, Redux, Zustand, Pinia, Context, Vuex, Apollo
- **Languages:** TypeScript (ưu tiên), JavaScript, JSDoc

---

## Quy trình 6 Phase (chạy tuần tự)

### Phase 1 — Input Validation
Xác thực input trước khi parse. Kiểm tra:
- URL endpoint hợp lệ (không typo)
- HTTP method hợp lệ (GET/POST/PUT/DELETE/PATCH/HEAD/OPTIONS)
- Auth format hợp lệ (Bearer / API-Key / OAuth2 / Basic)
- Có request info (params/body/headers)
- Có response info (success + error cases)
- Response format rõ ràng (JSON/binary/stream)

Nếu thiếu thông tin quan trọng → **STOP**, hỏi developer làm rõ. Không đoán bừa.

Output:
```json
{ "validation": { "status": "VALID|INVALID", "confidence": 0, "errors": [], "warnings": [], "parsed_input_type": "curl" } }
```

### Phase 2 — API Contract Extraction
Bóc tách input thành contract chuẩn:
```
metadata: { name, domain, endpoint, method, version?, description? }
request:  { pathParams, queryParams, headers, body{ type, schema }, auth }
response: { success{ statusCode, contentType, schema, pagination? }, errors[] }
rateLimit?, timeout?
```
Mỗi field cần: `type`, `required`, và nếu có: `nullable`, `enum`, `minLength/maxLength`, `pattern`, `example`, `items`.

### Phase 3 — Project Profile Detection
1. Thử load `.api-config.json` ở root → nếu có thì dùng luôn.
2. Nếu không có, scan dự án để suy ra:
   - Framework (package.json + config files)
   - HTTP client (imports, `src/lib/axios.*`)
   - State management (`@tanstack/react-query`, `@reduxjs/toolkit`, `zustand`...)
   - Type system (tsconfig.json → TS; JSDoc; plain JS)
   - Cấu trúc thư mục (`src/services`, `src/types`, `src/hooks`...)
   - Naming convention (camelCase / PascalCase / snake_case; `{name}.api.ts`...)
3. Đọc 1–2 file API có sẵn, **trích pattern** (import style, structure, typing, error handling) để áp dụng cho code mới.

### Phase 4 — Conflict Detection
Kiểm tra TRƯỚC khi sinh code:
- **ENDPOINT_DUPLICATE** — endpoint đã tồn tại? (so logic: giống → reuse, khác → cảnh báo) — HIGH
- **FUNCTION_DUPLICATE** — tên function trùng? → gợi ý đổi tên
- **TYPE_DUPLICATE** — type trùng? (so schema: giống → reuse, khác → đổi tên)
- **LOGIC_OVERLAP** — logic trùng API khác? → gợi ý merge
- **IMPORT_CONFLICT** — path import xung đột → HIGH

Nếu có conflict HIGH → **KHÔNG sinh code**, xuất report chi tiết + gợi ý, chờ quyết định.

### Phase 5 — Code Generation
Sinh file mới theo template đã trích (Phase 3). Chỉ tạo file mới:
- `src/types/{name}.types.ts` — request/response/error types + type guards
- `src/services/{name}.api.ts` — service client (CRUD) + JSDoc
- `src/hooks/use{Name}.ts` — hooks (query/mutation) + cache invalidation (nếu dùng React Query)
- `src/examples/{Name}Example.tsx` — ví dụ dùng, ghi rõ "DELETE AFTER UNDERSTANDING"

### Phase 6 — Quality Validation
Checklist bắt buộc đạt trước khi báo READY:
- TypeScript strict, compile sạch, **không có `any`**
- Mọi function/param có type & return type
- Không import thừa, không `console.log`/debug code
- Error handling đầy đủ (try-catch / `.catch`)
- **Không hardcode** URL / token / secret (dùng env var)
- Khớp naming + cấu trúc dự án
- Tái dùng HTTP client / interceptor / queryClient có sẵn
- JSDoc đầy đủ cho public functions
- React: dependency array đúng, cleanup đúng, không race condition

---

## Output bắt buộc

Ngoài các file code, luôn sinh:

1. **`ANALYSIS_REPORT.json`** — gồm: input, validation, api_contract, project_analysis,
   conflicts, generation_plan (files_to_create / files_to_modify), data_flow_diagram,
   **assumptions**, quality_metrics, next_steps, rollback_instructions.

2. **`INTEGRATION_REPORT.md`** — tài liệu: API info, what was generated, how to use
   (ví dụ query + mutation), bảng quality, potential issues, env vars cần set, test mẫu,
   next steps, rollback commands.

## Quy tắc PHẢI / KHÔNG

**PHẢI:** theo đúng 6 phase · check conflict trước · sinh đủ types+service+hook+example ·
sinh ANALYSIS_REPORT.json + INTEGRATION_REPORT.md · strict TS · JSDoc · ready-to-use ngay.

**KHÔNG:** bỏ qua conflict detection · auto-merge khi chưa hỏi · sinh code khi có conflict
HIGH · dùng `any` · hardcode URL/token/secret · ghi đè file cũ · copy code từ dự án khác ·
bỏ qua error cases · bỏ qua documentation.

## Định dạng file tham chiếu `.api-config.json`

```json
{
  "framework": "React",
  "httpClient": "axios",
  "stateManagement": "react-query",
  "typing": "typescript",
  "conventions": {
    "servicePath": "src/services/",
    "typePath": "src/types/",
    "hookPath": "src/hooks/",
    "naming": "camelCase",
    "fileNaming": "{name}.api.ts",
    "typeFileNaming": "{Name}Type.ts",
    "hookFileNaming": "use{Name}.ts"
  },
  "httpConfig": {
    "baseURL": "process.env.REACT_APP_API_URL",
    "interceptor": "src/lib/axios.instance.ts",
    "authHeader": "Authorization",
    "timeout": 30000
  },
  "stateConfig": {
    "queryClient": "src/lib/queryClient.ts",
    "cacheTime": 300000,
    "staleTime": 60000
  },
  "templateExamples": {
    "existingService": "src/services/user.api.ts",
    "existingHook": "src/hooks/useUser.ts",
    "existingType": "src/types/user.types.ts"
  }
}
```
