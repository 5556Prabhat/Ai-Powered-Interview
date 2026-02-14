'use client';

import { create } from 'zustand';

export type ThemeMode = 'dark' | 'gold' | 'system';

interface SettingsState {
    theme: ThemeMode;
    editorFontSize: number;
    setTheme: (theme: ThemeMode) => void;
    setEditorFontSize: (size: number) => void;
    loadSettings: () => void;
}

const STORAGE_KEY = 'interviewiq-settings';

function getStoredSettings(): { theme: ThemeMode; editorFontSize: number } {
    if (typeof window === 'undefined') return { theme: 'gold', editorFontSize: 14 };
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return {
                theme: (['dark', 'gold', 'system'].includes(parsed.theme) ? parsed.theme : 'gold') as ThemeMode,
                editorFontSize: [12, 14, 16, 18, 20].includes(parsed.editorFontSize) ? parsed.editorFontSize : 14,
            };
        }
    } catch { /* ignore */ }
    return { theme: 'gold', editorFontSize: 14 };
}

function persistSettings(theme: ThemeMode, editorFontSize: number) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, editorFontSize }));
}

/** Resolve what CSS theme class to apply */
function resolveThemeClass(theme: ThemeMode): string {
    if (theme === 'dark') return 'theme-dark';
    if (theme === 'gold') return 'theme-gold';
    // system — check OS preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'theme-gold'; // light system → gold accent
    }
    return 'theme-dark'; // dark system → dark/blue accent
}

function applyThemeToDOM(theme: ThemeMode) {
    if (typeof window === 'undefined') return;
    const html = document.documentElement;
    html.classList.remove('theme-dark', 'theme-gold');
    html.classList.add(resolveThemeClass(theme));
}

// Listener for system theme changes (only active when theme === 'system')
let systemMediaListener: (() => void) | null = null;

function setupSystemListener(getTheme: () => ThemeMode) {
    if (typeof window === 'undefined') return;
    // Remove old listener
    if (systemMediaListener) {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', systemMediaListener);
        systemMediaListener = null;
    }
    if (getTheme() === 'system') {
        const listener = () => applyThemeToDOM('system');
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
        systemMediaListener = listener;
    }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    theme: 'gold',
    editorFontSize: 14,

    setTheme: (theme: ThemeMode) => {
        set({ theme });
        persistSettings(theme, get().editorFontSize);
        applyThemeToDOM(theme);
        setupSystemListener(() => theme);
    },

    setEditorFontSize: (size: number) => {
        set({ editorFontSize: size });
        persistSettings(get().theme, size);
    },

    loadSettings: () => {
        const stored = getStoredSettings();
        set(stored);
        applyThemeToDOM(stored.theme);
        setupSystemListener(() => stored.theme);
    },
}));
