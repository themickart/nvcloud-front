export { };

declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                openTelegramLink: (url: string) => void;
            };
        };
    }
}