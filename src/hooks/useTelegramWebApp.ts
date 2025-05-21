import { useEffect, useState } from 'react';

export default function useTelegramWebviewProxy(): { isTelegramWebviewProxy: boolean; isReady: boolean } {
    const [isTelegramWebviewProxy, setIsTelegramWebviewProxy] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const detect = () => {
            if (typeof window !== 'undefined' && window.TelegramWebviewProxy) {
                setIsTelegramWebviewProxy(true);
            } else {
                setIsTelegramWebviewProxy(false);
            }
            setIsReady(true);
        };

        if (document.readyState === 'complete') {
            detect();
        } else {
            window.addEventListener('load', detect);
            return () => window.removeEventListener('load', detect);
        }
    }, []);

    return { isTelegramWebviewProxy, isReady };
}