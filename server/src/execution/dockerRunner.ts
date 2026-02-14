import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const TIMEOUT = parseInt(process.env.DOCKER_TIMEOUT || '5000');
const MEMORY_LIMIT = process.env.DOCKER_MEMORY_LIMIT || '128m';

interface ExecutionResult {
    stdout: string;
    stderr: string;
    runtime: number;
    memory: number;
    error?: string;
}

const LANGUAGE_CONFIG: Record<string, { image: string; ext: string; cmd: (file: string) => string }> = {
    PYTHON: {
        image: 'python:3.11-slim',
        ext: '.py',
        cmd: (file: string) => `python ${file}`,
    },
    JAVA: {
        image: 'openjdk:17-slim',
        ext: '.java',
        cmd: (file: string) => `javac ${file} && java ${file.replace('.java', '')}`,
    },
    CPP: {
        image: 'gcc:latest',
        ext: '.cpp',
        cmd: (file: string) => `g++ -o /tmp/solution ${file} && /tmp/solution`,
    },
};

export async function runCode(code: string, language: string): Promise<ExecutionResult> {
    const config = LANGUAGE_CONFIG[language];

    if (!config) {
        return {
            stdout: '',
            stderr: `Unsupported language: ${language}`,
            runtime: 0,
            memory: 0,
            error: 'Unsupported language',
        };
    }

    // Create temp file for the code
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'interviewiq-'));
    const fileName = language === 'JAVA' ? 'Solution.java' : `solution${config.ext}`;
    const filePath = path.join(tmpDir, fileName);

    try {
        await fs.writeFile(filePath, code);

        const startTime = Date.now();

        const dockerCmd = [
            'docker', 'run', '--rm',
            `--memory=${MEMORY_LIMIT}`,
            '--cpus=1',
            '--network=none',
            '-v', `${tmpDir}:/app`,
            '-w', '/app',
            config.image,
            'sh', '-c', config.cmd(fileName),
        ].join(' ');

        const result = await executeWithTimeout(dockerCmd, TIMEOUT);
        const runtime = Date.now() - startTime;

        return {
            stdout: result.stdout.substring(0, 10000),
            stderr: result.stderr.substring(0, 5000),
            runtime,
            memory: 0, // Docker stats would be needed for precise memory
            error: result.stderr ? undefined : undefined,
        };
    } catch (error: any) {
        return {
            stdout: '',
            stderr: error.message || 'Execution failed',
            runtime: 0,
            memory: 0,
            error: error.message,
        };
    } finally {
        // Cleanup temp files
        await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => { });
    }
}

function executeWithTimeout(cmd: string, timeout: number): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
        const process = exec(cmd, { timeout }, (error, stdout, stderr) => {
            if (error && error.killed) {
                reject(new Error(`Time Limit Exceeded (${timeout}ms)`));
                return;
            }
            resolve({
                stdout: stdout || '',
                stderr: stderr || (error ? error.message : ''),
            });
        });
    });
}
