import OpenAI from 'openai';
import { FOLLOW_UP_PROMPT, fillTemplate } from './promptTemplates';
import prisma from '../lib/prisma';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateFollowUp(
    code: string,
    language: string,
    questionId: string
): Promise<string> {
    try {
        const question = await prisma.question.findUnique({
            where: { id: questionId },
        });

        if (!question) return 'Can you explain your approach to this problem?';

        const prompt = fillTemplate(FOLLOW_UP_PROMPT, {
            problem_description: `${question.title}\n\n${question.description}`,
            language,
            code,
        });

        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 500,
        });

        return response.choices[0]?.message?.content || 'Tell me about the time complexity of your solution.';
    } catch (error) {
        console.error('Follow-up generation failed:', error);
        return 'Can you walk me through your approach step by step?';
    }
}
