import { dbPool } from './connection.js';
import { Logger } from '../utils/logger.js';

export class DBService {
    /**
     * Lay ID du an hoac tao moi
     */
    static async createOrGetProject(name: string, summary: string, conn: any = dbPool): Promise<number> {
        await conn.query('INSERT IGNORE INTO projects (name, summary) VALUES (?, ?)', [name, summary]);
        const [rows]: any = await conn.query('SELECT id FROM projects WHERE name = ? LIMIT 1', [name]);
        return rows[0]?.id;
    }

    /**
     * Tim kiem y tuong tuong tu trong DB (Smart Caching)
     */
    static async findSimilarAnalysis(ideaPrompt: string, conn: any = dbPool): Promise<any | null> {
        // Lay tat ca logs co vector de so sanh
        const [rows]: any = await conn.query('SELECT idea_prompt, prompt_vector, gemini_analysis FROM analysis_logs WHERE prompt_vector IS NOT NULL');
        return rows;
    }

    /**
     * Luu ket qua phan tich kem Vector (Caching)
     */
    static async saveAnalysis(projectId: number, ideaPrompt: string, promptVector: number[], analysis: string, conn: any = dbPool) {
        await conn.query(
            'INSERT INTO analysis_logs (project_id, idea_prompt, prompt_vector, gemini_analysis) VALUES (?, ?, ?, ?)',
            [projectId, ideaPrompt, JSON.stringify(promptVector), analysis]
        );
    }

    /**
     * Luu PRD
     */
    static async savePRD(projectId: number, moduleName: string, content: string, vector: number[], conn: any = dbPool) {
        await conn.query(
            'INSERT INTO prd_modules (project_id, module_name, content, vector_json) VALUES (?, ?, ?, ?)',
            [projectId, moduleName, content, JSON.stringify(vector)]
        );
    }

    /**
     * Lay bao cao tong the
     */
    static async getProjectSnapshot(projectName: string) {
        const [projects]: any = await dbPool.query('SELECT id, summary FROM projects WHERE name = ? LIMIT 1', [projectName]);
        if (projects.length === 0) return null;
        
        const projectId = projects[0].id;
        const [analysis]: any = await dbPool.query('SELECT id, created_at FROM analysis_logs WHERE project_id = ?', [projectId]);
        const [prds]: any = await dbPool.query('SELECT module_name, updated_at FROM prd_modules WHERE project_id = ?', [projectId]);
        const [snippets]: any = await dbPool.query('SELECT snippet_name FROM code_snippets');
        const [jobs]: any = await dbPool.query('SELECT id, status, updated_at FROM jobs WHERE project_name = ?', [projectName]);

        return {
            summary: projects[0].summary,
            analysisCount: analysis.length,
            prds: prds,
            snippetCount: snippets.length,
            jobsCount: jobs.length,
            latestJobs: jobs.slice(-3)
        };
    }

    /**
     * Tim kiem context (Keyword base)
     */
    static async searchContext(keyword: string) {
        const searchPattern = `%${keyword}%`;
        const [rows]: any = await dbPool.query(`
            SELECT 'PRD' as type, module_name as name, content 
            FROM prd_modules WHERE content LIKE ?
            UNION
            SELECT 'Snippet' as type, snippet_name as name, code_content as content
            FROM code_snippets WHERE code_content LIKE ? OR snippet_name LIKE ?
            LIMIT 5
        `, [searchPattern, searchPattern, searchPattern]);
        return rows;
    }

    static async getSnippets() {
        const [rows]: any = await dbPool.query('SELECT skill_category, snippet_name, best_practices FROM code_snippets LIMIT 50');
        return rows;
    }

    static async getAllVectors() {
        const [rows]: any = await dbPool.query(`
            SELECT 'PRD' as type, module_name as name, content, vector_json 
            FROM prd_modules WHERE vector_json IS NOT NULL
            UNION
            SELECT 'Snippet' as type, snippet_name as name, code_content as content, vector_json
            FROM code_snippets WHERE vector_json IS NOT NULL
        `);
        return rows;
    }
}
