import { Request, Response } from 'express';
import { runCode, runWithTestCases } from '../execution/dockerRunner';

const SUPPORTED_LANGUAGES = ['cpp', 'java', 'python'] as const;

export const executeController = {
    /**
     * POST /api/execute
     * Body: { language: "cpp" | "java" | "python", code: string, testCases?: { input, expected }[] }
     * Returns: { success, output, error, runtime, testCaseResults? }
     */
    async execute(req: Request, res: Response): Promise<void> {
        try {
            const { language, code, testCases } = req.body;

            // ── Validation ───────────────────────────────────────────────
            if (!language || !code) {
                res.status(400).json({
                    success: false,
                    error: 'Missing required fields: language, code',
                });
                return;
            }

            const lang = language.toLowerCase();

            if (!SUPPORTED_LANGUAGES.includes(lang as any)) {
                res.status(400).json({
                    success: false,
                    error: `Unsupported language: ${language}. Supported: ${SUPPORTED_LANGUAGES.join(', ')}`,
                });
                return;
            }

            if (code.length > 50000) {
                res.status(400).json({
                    success: false,
                    error: 'Code exceeds maximum length of 50,000 characters',
                });
                return;
            }

            // ── Execute with test cases ─────────────────────────────────
            if (testCases && Array.isArray(testCases) && testCases.length > 0) {
                const result = await runWithTestCases(code, lang, testCases);

                res.status(200).json({
                    success: result.passed === result.total,
                    testCaseResults: result.results,
                    passed: result.passed,
                    total: result.total,
                    runtime: result.runtime,
                    compilationError: result.compilationError,
                });
                return;
            }

            // ── Execute without test cases (plain run) ──────────────────
            const result = await runCode(code, lang);

            if (result.error) {
                res.status(200).json({
                    success: false,
                    output: result.stdout || '',
                    error: result.error,
                    stderr: result.stderr || '',
                    runtime: result.runtime,
                });
                return;
            }

            res.status(200).json({
                success: true,
                output: result.stdout,
                stderr: result.stderr || '',
                runtime: result.runtime,
            });
        } catch (error: any) {
            console.error('[ExecuteController] Unexpected error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error during code execution',
            });
        }
    },
};

