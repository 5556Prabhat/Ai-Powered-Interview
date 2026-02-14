import OpenAI from 'openai';
import { EVALUATION_PROMPT, fillTemplate } from './promptTemplates';
import prisma from '../lib/prisma';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface EvaluationResult {
    logicScore: number;
    readabilityScore: number;
    optimizationScore: number;
    edgeCaseAnalysis: string;
    suggestions: string[];
    timeComplexity: string;
    spaceComplexity: string;
    overallScore: number;
    rawResponse?: any;
}

export async function evaluateCode(
    code: string,
    language: string,
    questionId: string
): Promise<EvaluationResult | null> {
    try {
        // Fetch question details
        const question = await prisma.question.findUnique({
            where: { id: questionId },
        });

        if (!question) {
            console.error('Question not found for evaluation');
            return null;
        }

        const prompt = fillTemplate(EVALUATION_PROMPT, {
            problem_description: `${question.title}\n\n${question.description}`,
            language,
            code,
        });

        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a senior FAANG interviewer. Always respond with valid JSON only.',
                },
                { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 1500,
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content;
        if (!content) return null;

        const parsed = JSON.parse(content);

        return {
            logicScore: parsed.logic_score || 0,
            readabilityScore: parsed.readability_score || 0,
            optimizationScore: parsed.optimization_score || 0,
            edgeCaseAnalysis: parsed.edge_case_analysis || '',
            suggestions: parsed.suggestions || [],
            timeComplexity: parsed.time_complexity || 'Unknown',
            spaceComplexity: parsed.space_complexity || 'Unknown',
            overallScore: parsed.overall_score || 0,
            rawResponse: parsed,
        };
    } catch (error) {
        console.error('AI evaluation failed:', error);
        return null;
    }
}
