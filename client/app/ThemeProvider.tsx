'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

export function ThemeProvider() {
    const loadSettings = useSettingsStore((s) => s.loadSettings);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    return null;
}
