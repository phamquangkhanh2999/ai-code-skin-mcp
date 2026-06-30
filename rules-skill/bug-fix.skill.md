---
name: bug-fix
description: >-
  Chẩn đoán và sửa bug một cách an toàn, có hệ thống. Dùng khi người dùng báo
  lỗi (stack trace, exception, behavior sai, test fail, crash, regression) và
  muốn tìm nguyên nhân gốc rồi sửa tối thiểu. Bắt buộc tái hiện lỗi → tìm root
  cause → sửa đúng chỗ → verify, không vá triệu chứng, không sửa lan man.
version: 1.0.0
---

# Bug Fix — Diagnose & Repair

Tìm **nguyên nhân gốc (root cause)** rồi sửa bằng thay đổi tối thiểu, có bằng
chứng trước/sau. Không đoán mò, không vá triệu chứng, không refactor ngoài phạm vi.

## Nguyên tắc cốt lõi (BẮT BUỘC)

1. **Reproduce First** — Phải tái hiện được bug trước khi sửa. Không reproduce được → thu thập thêm thông tin, không sửa mò.
2. **Root Cause Over Symptom** — Sửa nguyên nhân, không che lỗi (không nuốt exception, không thêm `?.` bừa).
3. **Minimal Diff** — Thay đổi nhỏ nhất giải quyết được vấn đề. Không kèm refactor/format ngoài phạm vi.
4. **Evidence-Based** — Mọi kết luận dựa trên log/test/diff thực, không suy đoán.
5. **Verify Before Done** — Chỉ báo xong khi đã chứng minh lỗi hết VÀ không gây regression.

## Khi nào dùng skill này

- Stack trace / exception / error message
- Hành vi sai (output không đúng kỳ vọng)
- Test fail / CI đỏ
- Crash, hang, memory leak, race condition
- Regression (trước chạy được, giờ hỏng)
- Bug khó tái hiện / chập chờn (flaky)

---

## Quy trình 7 bước (chạy tuần tự)

### 1 — Triage & Hiểu báo cáo
Nắm rõ: triệu chứng, môi trường (OS/runtime/version), bước tái hiện, expected vs actual,
mức nghiêm trọng, phạm vi ảnh hưởng. Nếu thiếu thông tin then chốt → hỏi trước khi đào.

### 2 — Reproduce (tái hiện)
- Dựng lại lỗi bằng test/script/lệnh cụ thể. Ghi lại lệnh tái hiện.
- Nếu chập chờn: chạy nhiều lần, cô lập điều kiện (timing, data, env, thứ tự).
- **Viết 1 failing test** thể hiện đúng bug (nếu repo có test) — test này sẽ là tiêu chí xác minh.

### 3 — Khoanh vùng (localize)
- Đọc stack trace từ trên xuống, lần theo frame trong code dự án (bỏ qua thư viện trừ khi cần).
- Thu hẹp bằng: `git log`/`git blame`/`git bisect`, log có chủ đích, breakpoint, binary search.
- Xác định **file:line** nghi ngờ và đường đi dữ liệu dẫn tới lỗi.

### 4 — Phân tích Root Cause
- Trả lời: *Tại sao* lỗi xảy ra ở đây? Điều kiện nào kích hoạt?
- Phân loại: logic sai · off-by-one · null/undefined · race/async · type mismatch ·
  state cũ/cache · biên (empty/large/unicode) · config/env · contract API đổi · phụ thuộc.
- Dùng kỹ thuật **5 Whys** đến khi chạm nguyên nhân thật, không dừng ở triệu chứng.

### 5 — Sửa (fix)
- Áp dụng diff tối thiểu đúng tại root cause.
- Giữ đúng style & convention xung quanh; không đổi public API trừ khi bắt buộc.
- Xử lý các biên liên quan cùng nguyên nhân (để không lặp lại lỗi tương tự).
- Không thêm code chết, không `console.log` sót, không nuốt lỗi.

### 6 — Verify (xác minh)
- Failing test ở bước 2 phải **PASS**.
- Chạy lại test suite liên quan + lint/type-check → không hỏng cái khác (no regression).
- Kiểm tra lại đúng kịch bản tái hiện ban đầu: lỗi đã hết.
- Nếu sửa được nhờ thay đổi behavior, nêu rõ side-effects.

### 7 — Báo cáo & Phòng ngừa
- Tóm tắt: root cause, fix, bằng chứng trước/sau.
- Gợi ý phòng ngừa: thêm test/guard, sửa nơi tương tự, ghi chú nếu là vấn đề hệ thống.

---

## Output bắt buộc

Sau khi sửa, trình bày ngắn gọn theo cấu trúc:

```
🐛 Triệu chứng:   <mô tả + cách tái hiện>
🔎 Root cause:    <nguyên nhân gốc tại file:line, vì sao>
🔧 Fix:           <thay đổi gì, vì sao tối thiểu>
✅ Verify:        <test/lệnh đã chạy + kết quả pass, no regression>
🛡️ Phòng ngừa:    <test thêm / guard / nơi tương tự cần xem>
```

## Quy tắc PHẢI / KHÔNG

**PHẢI:** tái hiện trước khi sửa · tìm root cause · viết/cập nhật test thể hiện bug ·
diff tối thiểu · chạy lại test + lint/type-check · báo bằng chứng trước/sau · nêu side-effects.

**KHÔNG:** sửa mò khi chưa hiểu nguyên nhân · vá triệu chứng (nuốt exception, `try/catch`
rỗng, `?.`/`!` bừa để hết warning) · refactor/format ngoài phạm vi · đổi public API khi
không cần · bỏ qua bước verify · để lại debug code · báo "đã xong" khi chưa chứng minh.

## Checklist trước khi đóng bug

- [ ] Đã tái hiện được bug ban đầu
- [ ] Có failing test thể hiện bug (nếu repo có test)
- [ ] Đã xác định root cause cụ thể (file:line + lý do)
- [ ] Diff tối thiểu, đúng style dự án
- [ ] Failing test giờ PASS
- [ ] Test liên quan + lint + type-check sạch (no regression)
- [ ] Không còn debug code / log thừa / code chết
- [ ] Đã nêu side-effects và gợi ý phòng ngừa
