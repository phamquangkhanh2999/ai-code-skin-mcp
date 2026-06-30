import fs from 'fs';
import path from 'path';

export class Logger {
    private static logFile = path.resolve(process.cwd(), 'server.log');

    static info(message: string) {
        this.writeLog('THONG_BAO', message);
    }

    static error(message: string, error?: any) {
        const errorContent = error ? `\nChi tiet loi: ${error.stack || error.message || error}` : '';
        this.writeLog('LOI', `${message}${errorContent}`);
    }

    static warn(message: string) {
        this.writeLog('CANH_BAO', message);
    }

    private static writeLog(level: string, message: string) {
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const logEntry = `[${timestamp}] [${level}] ${message}\n`;
        
        try {
            fs.appendFileSync(this.logFile, logEntry, { encoding: 'utf8' });
        } catch (e) {
            // Cannot log to file, fallback to stderr 
            console.error('Khong the ghi file log:', e);
        }
    }
}
