import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { generateCppDriver, hasMainFunction } from './cppWrapper';

// ─── Configuration ───────────────────────────────────────────────────────────
const TIMEOUT_MS = parseInt(process.env.DOCKER_TIMEOUT || '15000', 10);
const MEMORY_LIMIT = process.env.DOCKER_MEMORY_LIMIT || '100m';
const CPU_LIMIT = process.env.DOCKER_CPU_LIMIT || '0.5';
const IMAGE_NAME = process.env.DOCKER_IMAGE || 'code-sandbox';
const TEMP_DIR = path.resolve(__dirname, '../../temp');

// ─── Types ───────────────────────────────────────────────────────────────────
export interface ExecutionResult {
    stdout: string;
    stderr: string;
    runtime: number;
    memory: number;
    error?: string;
}

export interface TestCaseInput {
    input: string;
    expected: string;
}

export interface TestCaseResult {
    testCase: number;
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
    runtime: number;
    error?: string;
}

export interface TestCaseRunResult {
    passed: number;
    total: number;
    runtime: number;
    results: TestCaseResult[];
    compilationError?: string;
}

interface LanguageConfig {
    fileName: string;
    compileCommand?: string;
    runCommand: string;
}

// ─── Language Configs ────────────────────────────────────────────────────────
function getLanguageConfig(language: string): LanguageConfig | null {
    const configs: Record<string, LanguageConfig> = {
        cpp: {
            fileName: 'main.cpp',
            compileCommand: 'g++ -std=c++17 main.cpp -o main',
            runCommand: './main',
        },
        java: {
            fileName: 'Main.java',
            compileCommand: 'javac Main.java',
            runCommand: 'java Main',
        },
        python: {
            fileName: 'main.py',
            runCommand: 'python3 main.py',
        },
    };

    return configs[language.toLowerCase()] || null;
}

// ─── Code Preprocessor ───────────────────────────────────────────────────────
// Auto-wraps solution functions with a main() entry point when missing.
// For C++, uses the intelligent wrapper generator.
function preprocessCode(code: string, language: string): string {
    const lang = language.toLowerCase();

    if (lang === 'cpp') {
        // Use the intelligent C++ wrapper generator
        return generateCppDriver(code);
    }

    if (lang === 'java') {
        // Check if code contains a main method
        if (!/public\s+static\s+void\s+main\s*\(/.test(code)) {
            // Check if code already has a class named Main
            if (/class\s+Main\b/.test(code)) {
                const lastBrace = code.lastIndexOf('}');
                if (lastBrace !== -1) {
                    return code.slice(0, lastBrace) +
                        '\n    public static void main(String[] args) {\n        // Auto-generated entry point\n    }\n' +
                        code.slice(lastBrace);
                }
            } else {
                return 'public class Main {\n' + code + '\n    public static void main(String[] args) {\n        // Auto-generated entry point\n    }\n}\n';
            }
        }
        if (/public\s+class\s+(?!Main\b)(\w+)/.test(code)) {
            code = code.replace(/public\s+class\s+(\w+)/, 'public class Main');
        }
    }

    return code;
}

// ─── Main Execution Function ─────────────────────────────────────────────────
export async function runCode(code: string, language: string, stdin?: string): Promise<ExecutionResult> {
    const config = getLanguageConfig(language);

    if (!config) {
        return {
            stdout: '',
            stderr: `Unsupported language: ${language}. Supported: cpp, java, python`,
            runtime: 0,
            memory: 0,
            error: 'Unsupported language',
        };
    }

    const executionId = randomUUID();
    const executionDir = path.join(TEMP_DIR, executionId);

    try {
        await fs.mkdir(executionDir, { recursive: true });

        const processedCode = preprocessCode(code, language);
        const filePath = path.join(executionDir, config.fileName);
        await fs.writeFile(filePath, processedCode, 'utf-8');

        if (stdin) {
            await fs.writeFile(path.join(executionDir, 'input.txt'), stdin, 'utf-8');
        }

        const startTime = Date.now();

        const fullCommand = config.compileCommand
            ? `${config.compileCommand} && ${config.runCommand}${stdin ? ' < input.txt' : ''}`
            : `${config.runCommand}${stdin ? ' < input.txt' : ''}`;

        const dockerCmd = buildDockerCommand(executionDir, fullCommand);
        const result = await executeWithTimeout(dockerCmd, TIMEOUT_MS);
        const runtime = Date.now() - startTime;

        return {
            stdout: result.stdout.substring(0, 10000),
            stderr: result.stderr.substring(0, 5000),
            runtime,
            memory: 0,
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
        await fs.rm(executionDir, { recursive: true, force: true }).catch(() => { });
    }
}

// ─── Run Code Against Multiple Test Cases ────────────────────────────────────
export async function runWithTestCases(
    code: string,
    language: string,
    testCases: TestCaseInput[]
): Promise<TestCaseRunResult> {
    const config = getLanguageConfig(language);

    if (!config) {
        return {
            passed: 0,
            total: testCases.length,
            runtime: 0,
            results: testCases.map((tc, i) => ({
                testCase: i + 1,
                input: tc.input,
                expected: tc.expected,
                actual: '',
                passed: false,
                runtime: 0,
                error: `Unsupported language: ${language}`,
            })),
        };
    }

    const executionId = randomUUID();
    const executionDir = path.join(TEMP_DIR, executionId);

    try {
        await fs.mkdir(executionDir, { recursive: true });

        // Preprocess code: for C++ this generates the full driver with main()
        const processedCode = preprocessCode(code, language);
        const filePath = path.join(executionDir, config.fileName);
        await fs.writeFile(filePath, processedCode, 'utf-8');

        // DEBUG: Also save the generated code for inspection
        console.log('[DockerRunner] Generated code for language:', language);
        console.log('[DockerRunner] Code length:', processedCode.length, 'bytes');

        // Compile first (if needed) — only once
        if (config.compileCommand) {
            const compileCmd = buildDockerCommand(executionDir, config.compileCommand);
            try {
                await executeWithTimeout(compileCmd, TIMEOUT_MS);
            } catch (error: any) {
                // Compilation error — all test cases fail
                const errorMsg = error.message || 'Compilation failed';
                console.error('[DockerRunner] Compilation error:', errorMsg);
                return {
                    passed: 0,
                    total: testCases.length,
                    runtime: 0,
                    compilationError: errorMsg,
                    results: testCases.map((tc, i) => ({
                        testCase: i + 1,
                        input: tc.input,
                        expected: tc.expected,
                        actual: '',
                        passed: false,
                        runtime: 0,
                        error: 'Compilation Error',
                    })),
                };
            }
        }

        // Run each test case
        const results: TestCaseResult[] = [];
        let totalPassed = 0;
        let totalRuntime = 0;

        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];

            try {
                // Write input for this test case
                await fs.writeFile(path.join(executionDir, 'input.txt'), tc.input, 'utf-8');

                const startTime = Date.now();
                const runCmd = buildDockerCommand(executionDir, `${config.runCommand} < input.txt`);
                const result = await executeWithTimeout(runCmd, TIMEOUT_MS);
                const runtime = Date.now() - startTime;
                totalRuntime += runtime;

                const actual = result.stdout.trim();
                const expected = tc.expected.trim();
                const passed = actual === expected;

                if (passed) totalPassed++;

                results.push({
                    testCase: i + 1,
                    input: tc.input,
                    expected: tc.expected,
                    actual: result.stdout,
                    passed,
                    runtime,
                    error: result.stderr || undefined,
                });
            } catch (error: any) {
                results.push({
                    testCase: i + 1,
                    input: tc.input,
                    expected: tc.expected,
                    actual: '',
                    passed: false,
                    runtime: 0,
                    error: error.message || 'Runtime Error',
                });
            }
        }

        return {
            passed: totalPassed,
            total: testCases.length,
            runtime: totalRuntime,
            results,
        };
    } catch (error: any) {
        return {
            passed: 0,
            total: testCases.length,
            runtime: 0,
            results: testCases.map((tc, i) => ({
                testCase: i + 1,
                input: tc.input,
                expected: tc.expected,
                actual: '',
                passed: false,
                runtime: 0,
                error: error.message || 'Execution failed',
            })),
        };
    } finally {
        await fs.rm(executionDir, { recursive: true, force: true }).catch(() => { });
    }
}

// ─── Docker Command Builder ──────────────────────────────────────────────────
function buildDockerCommand(hostDir: string, runCommand: string): string {
    const mountPath = hostDir.replace(/\\/g, '/');

    const args = [
        'docker', 'run', '--rm',
        '--network=none',
        `--memory=${MEMORY_LIMIT}`,
        `--cpus=${CPU_LIMIT}`,
        '--pids-limit=64',
        '-v', `"${mountPath}:/app"`,
        '-w', '/app',
        IMAGE_NAME,
        'bash', '-c', `"${runCommand}"`,
    ];

    return args.join(' ');
}

// ─── Timeout-Protected Execution ─────────────────────────────────────────────
function executeWithTimeout(
    cmd: string,
    timeout: number
): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
        exec(
            cmd,
            { timeout, maxBuffer: 1024 * 1024 },
            (error, stdout, stderr) => {
                if (error && error.killed) {
                    reject(new Error(`Time Limit Exceeded (${timeout}ms)`));
                    return;
                }
                if (error && error.code === 137) {
                    reject(new Error('Memory Limit Exceeded'));
                    return;
                }

                // ── NEW: Detect non-zero exit codes (compilation errors, etc.) ──
                if (error && error.code && error.code !== 0) {
                    reject(new Error(stderr || error.message || `Process exited with code ${error.code}`));
                    return;
                }

                resolve({
                    stdout: stdout || '',
                    stderr: stderr || '',
                });
            }
        );
    });
}
