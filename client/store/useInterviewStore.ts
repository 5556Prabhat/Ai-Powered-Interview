import { create } from 'zustand';

interface InterviewState {
    currentQuestion: any | null;
    code: string;
    language: string;
    isRunning: boolean;
    executionResult: any | null;
    aiEvaluation: any | null;
    isEvaluating: boolean;

    setQuestion: (question: any) => void;
    setCode: (code: string) => void;
    setLanguage: (language: string) => void;
    setIsRunning: (running: boolean) => void;
    setExecutionResult: (result: any) => void;
    setAIEvaluation: (evaluation: any) => void;
    setIsEvaluating: (evaluating: boolean) => void;
    reset: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
    currentQuestion: null,
    code: '',
    language: 'PYTHON',
    isRunning: false,
    executionResult: null,
    aiEvaluation: null,
    isEvaluating: false,

    setQuestion: (question) => set({ currentQuestion: question }),
    setCode: (code) => set({ code }),
    setLanguage: (language) => set({ language }),
    setIsRunning: (isRunning) => set({ isRunning }),
    setExecutionResult: (executionResult) => set({ executionResult }),
    setAIEvaluation: (aiEvaluation) => set({ aiEvaluation }),
    setIsEvaluating: (isEvaluating) => set({ isEvaluating }),
    reset: () => set({
        currentQuestion: null,
        code: '',
        language: 'PYTHON',
        isRunning: false,
        executionResult: null,
        aiEvaluation: null,
        isEvaluating: false,
    }),
}));
