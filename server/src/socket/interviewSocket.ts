import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import OpenAI from 'openai';
import { INTERVIEW_SYSTEM_PROMPT, fillTemplate } from '../ai/promptTemplates';
import prisma from '../lib/prisma';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface SessionContext {
    sessionId: string;
    userId: string;
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
}

const activeSessions = new Map<string, SessionContext>();

export function setupInterviewSocket(io: Server) {
    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: string };
            (socket as any).userId = decoded.userId;
            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const userId = (socket as any).userId;
        console.log(`📡 User connected: ${userId}`);

        // Join interview session
        socket.on('join_session', async (data: { sessionId: string; topic?: string; mode?: string }) => {
            const { sessionId, topic, mode } = data;

            socket.join(sessionId);

            // Initialize session context
            const systemPrompt = fillTemplate(INTERVIEW_SYSTEM_PROMPT, {
                topic: topic || 'General Algorithms & Data Structures',
                mode: mode || 'standard',
            });

            const context: SessionContext = {
                sessionId,
                userId,
                messages: [{ role: 'system', content: systemPrompt }],
            };

            // Load existing messages if any
            const existingMessages = await prisma.interviewMessage.findMany({
                where: { sessionId },
                orderBy: { createdAt: 'asc' },
            });

            existingMessages.forEach(msg => {
                context.messages.push({
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content,
                });
            });

            activeSessions.set(`${userId}-${sessionId}`, context);

            // If new session, send initial greeting
            if (existingMessages.length === 0) {
                const greeting = await getAIResponse(context);
                if (greeting) {
                    await saveMessage(sessionId, 'assistant', greeting);
                    context.messages.push({ role: 'assistant', content: greeting });

                    socket.emit('ai_message', {
                        content: greeting,
                        timestamp: new Date().toISOString(),
                    });
                }
            }

            socket.emit('session_joined', { sessionId, messageCount: existingMessages.length });
        });

        // Handle user message
        socket.on('send_message', async (data: { sessionId: string; content: string }) => {
            const { sessionId, content } = data;
            const contextKey = `${userId}-${sessionId}`;
            const context = activeSessions.get(contextKey);

            if (!context) {
                socket.emit('error', { message: 'Session not found. Please join a session first.' });
                return;
            }

            // Save user message
            await saveMessage(sessionId, 'user', content);
            context.messages.push({ role: 'user', content });

            // Signal that AI is typing
            socket.emit('ai_typing', { isTyping: true });

            // Get AI response
            const aiResponse = await getAIResponse(context);

            if (aiResponse) {
                await saveMessage(sessionId, 'assistant', aiResponse);
                context.messages.push({ role: 'assistant', content: aiResponse });

                // Simulate typing delay for realism
                const words = aiResponse.split(' ').length;
                const typingDelay = Math.min(words * 50, 3000);

                setTimeout(() => {
                    socket.emit('ai_typing', { isTyping: false });
                    socket.emit('ai_message', {
                        content: aiResponse,
                        timestamp: new Date().toISOString(),
                    });
                }, typingDelay);
            } else {
                socket.emit('ai_typing', { isTyping: false });
                socket.emit('error', { message: 'Failed to get AI response' });
            }
        });

        // End session
        socket.on('end_session', async (data: { sessionId: string }) => {
            const contextKey = `${userId}-${data.sessionId}`;
            activeSessions.delete(contextKey);
            socket.leave(data.sessionId);

            await prisma.interviewSession.update({
                where: { id: data.sessionId },
                data: { status: 'completed', endedAt: new Date() },
            });

            socket.emit('session_ended', { sessionId: data.sessionId });
        });

        socket.on('disconnect', () => {
            console.log(`📡 User disconnected: ${userId}`);
        });
    });
}

async function getAIResponse(context: SessionContext): Promise<string | null> {
    try {
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4',
            messages: context.messages,
            temperature: 0.7,
            max_tokens: 1000,
        });

        return response.choices[0]?.message?.content || null;
    } catch (error) {
        console.error('OpenAI error:', error);
        return null;
    }
}

async function saveMessage(sessionId: string, role: string, content: string) {
    await prisma.interviewMessage.create({
        data: { sessionId, role, content },
    });
}
