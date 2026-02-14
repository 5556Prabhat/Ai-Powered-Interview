import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from './ThemeProvider';

export const metadata: Metadata = {
    title: 'InterviewIQ - AI-Powered Coding Interview Simulator',
    description: 'Master your coding interviews with AI-powered practice. Get real-time feedback, personalized questions, and comprehensive evaluations from a FAANG-level AI interviewer.',
    keywords: ['coding interview', 'AI interviewer', 'leetcode', 'practice', 'FAANG', 'tech interview'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark theme-gold">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            </head>
            <body className="min-h-screen bg-[#0A0A0A] text-[#E5E7EB] antialiased">
                <ThemeProvider />
                <div className="mesh-bg" />
                <div className="relative z-10">
                    {children}
                </div>
            </body>
        </html>
    );
}
