-- Lưu thông tin dự án tổng quát
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Giai đoạn 1: Lưu các phân tích ban đầu từ Gemini
CREATE TABLE IF NOT EXISTS analysis_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    idea_prompt TEXT NOT NULL,
    prompt_vector JSON, -- [NEW] Dùng cho Semantic Search để tái sử dụng kết quả
    gemini_analysis MEDIUMTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Giai đoạn 2: Lưu PRD chi tiết (Đã được chuyển sang Gemini Pro/Flash)
CREATE TABLE IF NOT EXISTS prd_modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    module_name VARCHAR(100),
    content MEDIUMTEXT,
    vector_json JSON,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Giai đoạn 4: Thư viện đoạn code mẫu (Skills/Snippets) để tái sử dụng
CREATE TABLE IF NOT EXISTS code_snippets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    skill_category VARCHAR(100), -- Ví dụ: 'Auth', 'Database', 'UI'
    snippet_name VARCHAR(100),
    code_content MEDIUMTEXT,
    best_practices TEXT, -- Các tiêu chuẩn, rule chuẩn hóa
    vector_json JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- [NEW] Quản lý hàng đợi công việc và Rate Limiter
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(50) PRIMARY KEY,
    project_name VARCHAR(255),
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    module_focus VARCHAR(100),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
