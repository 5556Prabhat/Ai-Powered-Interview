import { Request, Response } from 'express';
import { submissionService } from '../services/submissionService';
import { AuthRequest } from '../middleware/auth';
import { evaluateCode } from '../ai/evaluator';
import { runWithTestCases } from '../execution/dockerRunner';
import { questionService } from '../services/questionService';

export const submissionController = {
    async submit(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { questionId, code, language } = req.body;
            const userId = req.userId!;

            // Step 1: Fetch question with test cases
            const question = await questionService.getById(questionId);
            const testCases = question.testCases.map((tc: any) => ({
                input: tc.input,
                expected: tc.expected,
                isHidden: tc.isHidden,
            }));

            // Map language enum to lowercase for the runner
            const langMap: Record<string, string> = { PYTHON: 'python', JAVA: 'java', CPP: 'cpp' };
            const lang = langMap[language] || language.toLowerCase();

            // Step 2: Run code against all test cases
            const testCaseResult = await runWithTestCases(
                code,
                lang,
                testCases.map((tc: any) => ({ input: tc.input, expected: tc.expected }))
            );

            // Step 3: Save submission with passed/total
            const submission = await submissionService.create({
                userId,
                questionId,
                code,
                language,
                status: testCaseResult.compilationError
                    ? 'error'
                    : testCaseResult.passed === testCaseResult.total
                        ? 'accepted'
                        : 'wrong_answer',
                stdout: testCaseResult.results.map(r => r.actual).join('\n---\n'),
                stderr: testCaseResult.compilationError || '',
                runtime: testCaseResult.runtime,
                memory: 0,
                passed: testCaseResult.passed,
                total: testCaseResult.total,
            });

            // Step 4: AI evaluation (async, non-blocking response)
            evaluateCode(code, language, questionId).then(async (evaluation) => {
                if (evaluation) {
                    await submissionService.saveEvaluation(submission.id, evaluation);
                }
            }).catch(err => {
                console.error('AI evaluation error:', err);
            });

            // Filter out hidden test cases from response
            const visibleResults = testCaseResult.results.filter((_, i) => !testCases[i].isHidden);

            res.status(201).json({
                submission,
                testCaseResults: visibleResults,
                passed: testCaseResult.passed,
                total: testCaseResult.total,
                runtime: testCaseResult.runtime,
                compilationError: testCaseResult.compilationError,
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },


    async getSubmission(req: AuthRequest, res: Response): Promise<void> {
        try {
            const submission = await submissionService.getById(req.params.id);
            if (!submission) {
                res.status(404).json({ error: 'Submission not found' });
                return;
            }
            res.json(submission);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    async getUserSubmissions(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { questionId } = req.query;
            const submissions = await submissionService.getUserSubmissions(
                req.userId!,
                questionId as string | undefined
            );
            res.json(submissions);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAnalytics(req: AuthRequest, res: Response): Promise<void> {
        try {
            const analytics = await submissionService.getAnalytics(req.userId!);
            res.json(analytics);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },
};
