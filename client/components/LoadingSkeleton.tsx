'use client';

export default function LoadingSkeleton({ className = '' }: { className?: string }) {
    return (
        <div className={`skeleton rounded-lg ${className}`} />
    );
}

export function CardSkeleton() {
    return (
        <div className="glass-card p-6 space-y-4">
            <LoadingSkeleton className="h-6 w-3/4" />
            <LoadingSkeleton className="h-4 w-full" />
            <LoadingSkeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
                <LoadingSkeleton className="h-6 w-16 !rounded-full" />
                <LoadingSkeleton className="h-6 w-20 !rounded-full" />
            </div>
        </div>
    );
}
