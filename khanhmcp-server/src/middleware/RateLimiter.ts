import { Logger } from "../utils/logger.js";

/**
 * RateLimiter: Dam bao khong goi API vuot qua RPM (Requests Per Minute).
 */
export class RateLimiter {
    private static lastCallTime = 0;
    private static minIntervalMs = 1500; // It nhat 1.5 giay moi lan goi (Safe for free/tier)

    static async waitIfNeeded(): Promise<void> {
        const now = Date.now();
        const timeSinceLastCall = now - this.lastCallTime;

        if (timeSinceLastCall < this.minIntervalMs) {
            const waitTime = this.minIntervalMs - timeSinceLastCall;
            Logger.info(`[RateLimiter] Dang doi ${waitTime}ms de tranh bi rate limit...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.lastCallTime = Date.now();
    }

    /**
     * Boc mot ham de tu dong doi neu can truoc khi thuc thi.
     */
    static async wrap<T>(fn: () => Promise<T>): Promise<T> {
        await this.waitIfNeeded();
        return await fn();
    }
}
