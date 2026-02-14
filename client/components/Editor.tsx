'use client';

import dynamic from 'next/dynamic';
import { useSettingsStore } from '@/store/useSettingsStore';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface EditorProps {
    code: string;
    onChange: (value: string) => void;
    language: string;
}

const LANGUAGE_MAP: Record<string, string> = {
    PYTHON: 'python',
    python: 'python',
    JAVA: 'java',
    java: 'java',
    CPP: 'cpp',
    cpp: 'cpp',
};

export default function Editor({ code, onChange, language }: EditorProps) {
    const monacoLang = LANGUAGE_MAP[language] || 'python';
    const editorFontSize = useSettingsStore((s) => s.editorFontSize);

    return (
        <div className="h-full w-full">
            <MonacoEditor
                height="100%"
                language={monacoLang}
                value={code}
                onChange={(value) => onChange(value || '')}
                theme="vs-dark"
                options={{
                    fontSize: editorFontSize,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontLigatures: true,
                    minimap: { enabled: false },
                    padding: { top: 16, bottom: 16 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    renderLineHighlight: 'all',
                    bracketPairColorization: { enabled: true },
                    automaticLayout: true,
                    lineNumbers: 'on',
                    roundedSelection: true,
                    wordWrap: 'on',
                    tabSize: 4,
                }}
            />
        </div>
    );
}
