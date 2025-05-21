export { };

declare global {
    interface Window {
        TelegramWebviewProxy?: {
            postEvent?: (eventType: string, eventData: unknown) => void;
        };
    }
}