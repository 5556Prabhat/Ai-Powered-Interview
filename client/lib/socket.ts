import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function getSocket(): Socket {
    if (!socket) {
        const token = typeof window !== 'undefined' ? sessionStorage.getItem('interviewiq-token') : null;

        socket = io(WS_URL, {
            auth: { token },
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
    }
    return socket;
}

export function connectSocket(): void {
    const s = getSocket();
    if (!s.connected) {
        s.connect();
    }
}

export function disconnectSocket(): void {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
