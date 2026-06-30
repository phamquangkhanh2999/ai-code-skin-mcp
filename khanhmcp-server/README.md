# 🚀 KhanhSCP (Smart Context Processor)

**Khẩu hiệu:** _"Tối ưu hóa Context - Tiết kiệm Token - Làm chủ quy trình AI"_

## 1. Vấn đề giải quyết (The Problem)

Khi làm việc với AI (Gemini, ChatGPT) trong các IDE như Antigravity, người dùng thường gặp 2 vấn đề lớn:

- **Mất ngữ cảnh (Context Loss):** Khi chuyển từ bước phân tích sang viết PRD hoặc code, dữ liệu dễ bị trôi hoặc AI quên ý tưởng ban đầu.
- **Tốn kém Token:** Việc phải copy-paste toàn bộ tài liệu dài vào mỗi lần chat khiến chi phí API tăng cao và AI dễ bị "loãng" thông tin.

## 2. Giải pháp (The Solution)

Xây dựng một MCP Server đóng vai trò là "Bộ não trung gian" và kết nối với MySQL Docker (Local) để làm "Bộ nhớ dài hạn". MCP này điều phối luồng làm việc giữa các Model AI khác nhau ngay trong IDE.

## 3. Mô hình hoạt động (The Workflow)

Quy trình được tự động hóa qua 4 giai đoạn chính:

| Giai đoạn                    | Model đảm nhiệm  | Nhiệm vụ của MCP & DB                                                                      |
| :--------------------------- | :--------------- | :----------------------------------------------------------------------------------------- |
| **1. Ý tưởng & Phân tích**   | Gemini 1.5 Pro   | Nhận yêu cầu thô -> Phân tích logic -> Lưu vào bảng `analysis_logs`.                       |
| **2. Viết PRD chi tiết**     | ChatGPT (GPT-4o) | Truy vấn dữ liệu từ `analysis_logs` -> Viết PRD theo module -> Lưu vào bảng `prd_modules`. |
| **3. Thực thi Code**         | Antigravity IDE  | Truy vấn đúng module cần code từ `prd_modules` -> Sinh code chính xác theo tài liệu.       |
| **4. Lưu trữ & Tái sử dụng** | Hệ thống         | Lưu các đoạn code mẫu vào `code_snippets` để dùng lại cho các dự án sau.                   |

## 4. Kiến trúc hệ thống (Technical Architecture)

Mã nguồn được cấu trúc theo chuẩn Domain Blueprint:

- **`src/config/`**: Cấu trúc nạp biến môi trường an toàn (EnvVars).
- **`src/db/`**: Quản lý Database Connection Pool (Tránh timeout) và thực thi SQL thô.
- **`src/prompts/`**: Trung tâm quản lý các **Skill Prompts** dùng để chuẩn hóa LLM (Tuân thủ UI/UX Promax, Vitals).
- **`src/services/`**: Nhánh gọi API ra bên ngoài (Gemini Service, OpenAI Service).
- **`src/index.ts`**: Entrypoint của MCP Server.

## 5. Các Bước Cài Đặt (Setup Guide)

### Bước 1: Setup Database Local

Sử dụng công cụ Docker để khởi chạy MySQL:

```bash
docker-compose up -d
```

Nhờ cơ chế auto-init của Docker MySQL, file `schema.sql` đã được tự động nạp vào Database ngay lần đầu container khởi chạy. Bạn không cần chạy lệnh import thủ công nào nữa!

_(Mẹo: Để xem và quản lý dữ liệu lưu trữ trực quan qua app **DBeaver**, hãy tạo connection với thông số sau: Hệ quản trị: `MySQL` | Host: `localhost` | Port: `3306` | Database: `mcp_db` | Username: `root` | Password: `root_password`)_

### Bước 2: Thiết lập API Keys (Bắt buộc)

Lấy API keys tại các đường dẫn sau:

- **OpenAI:** [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Gemini:** [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

Sau đó copy file `.env.example` thành `.env`, và điền 2 loại API key vào:

```env
OPENAI_API_KEY="sk-..."
GEMINI_API_KEY="AIza..."
```

_(Cả 2 là bắt buộc để tính năng Auto-Pilot làm việc)._

### Bước 3: Biên Dịch (Build)

Biên dịch từ mã TypeScript sang JavaScript bằng lệnh:

```bash
npm run build
```

_(💡 **Lưu ý cực kỳ quan trọng về cách hoạt động:** Khác với Web Server thường dùng `npm start`, MCP Server giao tiếp qua chuẩn STDIO bí mật. Do đó bạn **KHÔNG THỂ VÀ KHÔNG CẦN CHẠY CODE TRÊN TERMINAL** bằng lệnh Start. Server này được thiết kế để "nằm vùng", chờ chính Antigravity/Cursor gọi nó thức dậy tự động ở Bước 4)._

### Bước 4: Tích hợp IDE (Antigravity/Cursor)

Bên dưới là 2 cách để cấu hình IDE lắng nghe Server. _(Lưu ý bạn phải thay thế đoạn đường dẫn ở dưới bằng đường dẫn thật của máy bạn)._

💡 **Mẹo: Lệnh lấy đường dẫn tuyệt đối siêu nhanh:**
Mở Terminal tại thư mục gốc dự án và chạy câu lệnh sau. Máy sẽ in ra chính xác đường dẫn tuyệt đối `dist/index.js`, bạn chỉ cần bôi đen và copy:

```bash
node -e "console.log(require('path').resolve('dist/index.js').replace(/\\\\/g, '/'))"
```

**Cách 1: Thêm trực tiếp vào cấu hình file mcp_config.json (Khuyên dùng)**
Nếu IDE của bạn hỗ trợ cấu hình bằng JSON (như Antigravity hoặc Claude Desktop), hãy mở file cấu hình đó lên (ví dụ: `~/.gemini/antigravity/mcp_config.json` hoặc `%APPDATA%/Claude/claude_desktop_config.json`) và thêm block này vào object `mcpServers`:

```json
    "KhanhSCP": {
      "command": "node",
      "args": [
        "C:/Thay_bang_duong_dan_tuyet_doi/dist/index.js"
      ]
    }
```

**Cách 2: Thêm qua giao diện Settings UI (Cho Cursor/Antigravity)**
Ấn `Ctrl + ,` để mở màn hình Settings của IDE, tìm phần **MCP Servers** và cấu hình như sau:

- Name: `KhanhSCP`
- Type: `stdio`
- Command: `node`
- Args: `C:/Thay_bang_duong_dan_tuyet_doi/dist/index.js`

✅ **Cách xác nhận thành công (Test Connection):**
Cách nhanh nhất là bạn hãy copy và dán câu lệnh sau vào thẳng khung Chat với AI (Antigravity/Cursor):

> 🗣️ **_"Hãy kiểm tra xem bạn đã kết nối được với KhanhSCP chưa, hãy liệt kê các tool của nó và gọi thử tool system_diagnostics giúp tôi để kiểm tra hệ thống!"_**

Nếu AI phản hồi lại danh sách tool và kết quả chẩn đoán thành công thì tức là MCP đã hoạt động hoàn hảo!

Ngoài ra, bạn cũng có thể mở file `server.log` ở thư mục gốc. Nếu thấy dòng thông báo: `[THÔNG_BÁO] 🚀 [HỆ THỐNG] Tiến trình MCP Server đã khởi động...`, tức là Antigravity đã nhận diện và kéo Server lên thành công ở dưới background.

💡 **Lưu ý kiểm soát MCP (Khi nào AI mới dùng tới nó?):**
Nếu bạn lo lắng MCP này sẽ chạy lộn xộn vào các Project khác mà bạn không muốn dùng tới, thì đừng lo:
1. **AI sẽ KHÔNG TỰ ĐỘNG** ghi dữ liệu hay gọi API nếu bạn không chủ động yêu cầu. Chỉ khi nào bạn chat nhờ AI *"hãy chạy tính năng của KhanhSCP"* hoặc nhắc tên tool cụ thể, AI mới sử dụng tới máy chủ này.
2. Nếu muốn tắt hẳn, bạn chỉ việc gõ `Ctrl + ,`, vào mục **MCP Servers** và **gạt nút tắt (hoặc xóa)** cấu hình của nó đi là xong. Lần tới cần dùng lại chỉ việc bật lên.

---

## 6. Hướng Dẫn Sử Dụng Tools (User Manual)

Ngay trên khung chat IDE, hãy nhờ trợ lý ảo của bạn chạy các công cụ sau:

### 🌟 Auto-Pilot (Orchestration Workflow)

Chỉ cần gọi một lệnh, hệ thống sẽ tự động phối hợp gọi Gemini phân tích và ChatGPT viết PRD.

- **Tên Tool:** `run_full_analysis_workflow`
- **Prompt ví dụ:** "Khánh ơi, hãy gọi tool run_full_analysis_workflow. Dự án: 'App E-commerce', ý tưởng: 'App bán hàng tối giản', tập trung module: 'Giỏ hàng'."
- _Lợi ích:_ Bỏ qua bước copy-paste lòng vòng. AI tự thiết kế theo chuẩn Domain Blueprints và lưu trọn vẹn kết quả vào Database.

### 🔍 Tìm Kiếm Context

- **Tên Tool:** `fetch_smart_context`
- **Prompt ví dụ:** "Lọc context giúp tôi bằng tool fetch_smart_context với từ khoá là 'Giỏ hàng' để tôi có cơ sở viết tính năng mới."

### 📊 Xem Snapshot Báo Cáo

- **Tên Tool:** `project_snapshot`
- **Prompt ví dụ:** "Liệt kê báo cáo tổng thể của dự án 'App E-commerce' bằng project_snapshot."

### 🧩 Tìm thư viện Mẫu (Code Snippets)

- **Tên Tool:** `list_code_snippets`
- **Prompt ví dụ:** "Hãy gọi list_code_snippets để xem có cấu trúc Auth mẫu nào không."

### 🩺 Kiểm tra Tổng Thể (Ping Test)

Lần đầu cài đặt, bạn nên gọi tool này để chắc chắn phần backend đang hoạt động ổn định.

- **Tên Tool:** `system_diagnostics`
- **Prompt ví dụ:** "Gọi system_diagnostics giúp tôi để xem MySQL và API có đang connect thành công không nào."
- _Lợi ích:_ Kịp thời bắt bệnh (do thiếu mạng, sai mật khẩu DB hoặc API hết hạn).

---

## 7. Bắt Bệnh Từ Hệ Thống (Debugging & Logging)

Nếu trong quá trình Auto-Pilot xảy ra lỗi từ IDE như "Server Failed", bạn không cần hoang mang. Hệ thống đã được tích hợp bộ phận ghi nhật ký độc lập.

**Cách 1: Đọc tệp tin**
Hãy mở file **`server.log`** ngay ở thư mục gốc của project này (cạnh `package.json`). Mọi thông tin kết nối, hay đặc biệt là Stacktrace Báo Lỗi chính gốc sẽ được in đầy đủ về đây kèm Timestamp theo thời gian thực.

**Cách 2: Đọc trực tiếp từ Chat AI (Tiện lợi nhất) ✨**
Không cần mở project, dù bạn đang làm ở bất cứ đâu, chỉ cần gõ vào khung chat IDE:
> 🗣️ *"Hãy dùng tool `read_server_logs` để lấy 30 dòng log báo lỗi gần nhất giúp tôi."*

Lập tức AI sẽ móc nối tới máy chủ này và ném log lên màn hình chat ngay lập tức cho bạn.

---

## 8. Cập nhật Code cho MCP (Bí kíp cho Dev)
Nếu bạn thay đổi mã nguồn trong thư mục `src/` của dự án MCP, bạn thường sẽ phải mở Terminal và gõ `npm run build` rất mất công. 

Thay vì thế, để phục vụ trải nghiệm lười tối đa, **KhanhSCP đã có tính năng tự Build thông qua Chat!** 
Khi bạn sửa code xong, ở bất kỳ màn hình nào, hãy nói với AI:
> 🗣️ *"Hãy nâng cấp cho tôi bằng tool `rebuild_mcp_server` nhé!"*

Mã nguồn mới của bạn sẽ tự động được biên dịch ở dưới nền. Sau đó bạn chỉ cần Reload IDE (`Ctrl + R`) để tiếp tục làm việc!
