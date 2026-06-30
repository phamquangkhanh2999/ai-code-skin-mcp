import { dbPool } from '../db/connection.js';
import { Logger } from '../utils/logger.js';

export enum JobStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

export class JobQueue {
    /**
     * Dang ky mot job moi vao DB
     */
    static async registerJob(projectName: string, moduleFocus?: string): Promise<string> {
        const jobId = Math.random().toString(36).substring(2, 10).toUpperCase(); // Random 8-char ID
        const query = `
            INSERT INTO jobs (id, project_name, module_focus, status) 
            VALUES (?, ?, ?, ?)
        `;
        await dbPool.execute(query, [jobId, projectName, moduleFocus || 'Core', JobStatus.PENDING]);
        Logger.info(`[JobQueue] Registering new Job ID: ${jobId} for Project: ${projectName}`);
        return jobId;
    }

    /**
     * Cap nhat trang thai Job
     */
    static async updateJobStatus(jobId: string, status: JobStatus, error?: string): Promise<void> {
        const query = `
            UPDATE jobs 
            SET status = ?, error_message = ? 
            WHERE id = ?
        `;
        await dbPool.execute(query, [status, error || null, jobId]);
        Logger.info(`[JobQueue] Job ${jobId} status updated to: ${status}`);
    }
}
