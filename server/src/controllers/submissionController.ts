import { Request, Response } from 'express';
import { submissionService } from '../services/submissionService';
import { AuthRequest } from '../middleware/auth';
import { evaluateCode } from '../ai/evaluator';
import { runCode } from '../execution/dockerRunner';

export const submissionController = {
    async submit(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { questionId, code, language } = req.body;
            const userId = req.userId!;

            // Step 1: Execute code
            const executionResult = await runCode(code, language);

            // Step 2: Save submission
            const submission = await submissionService.create({
                userId,
                questionId,
                code,
                language,
                status: executionResult.error ? 'error' : 'completed',
                stdout: executionResult.stdout,
                stderr: executionResult.stderr,
                runtime: executionResult.runtime,
                memory: executionResult.memory,
            });

            // Step 3: AI evaluation (async, non-blocking response)
            evaluateCode(code, language, questionId).then(async (evaluation) => {
                if (evaluation) {
                    await submissionService.saveEvaluation(submission.id, evaluation);
                }
            }).catch(err => {
                console.error('AI evaluation error:', err);
            });

            res.status(201).json({
                submission,
                execution: executionResult,
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
