import useTelegramWebviewProxy from "@/hooks/useTelegramWebApp";
import Image from "next/image";

export default function AuthLayout({ title, children }: { title: string; children: React.ReactNode }) {
    const { isTelegramWebviewProxy, isReady } = useTelegramWebviewProxy();

    return (
        <div className="relative flex flex-col items-center min-h-screen bg-white overflow-hidden">
            {/* Облака - только на больших экранах */}
            < Image
                width={715}
                height={703}
                src="/cloud-left.svg"
                alt="Cloud Left"
                className="hidden lg:block absolute bottom-[-50px] left-[-100px] h-[50vh] min-h-[300px] opacity-80 pointer-events-none select-none"
            />
            <Image
                width={715}
                height={703}
                src="/cloud-right.svg"
                alt="Cloud Right"
                className="hidden lg:block absolute bottom-[-50px] right-[-100px] h-[50vh] min-h-[300px] opacity-80 pointer-events-none select-none"
            />

            {/* Шапка */}
            {isReady && !isTelegramWebviewProxy ? (
                <div className="w-full bg-blue-500 py-3 px-4 sm:py-2 sm:px-6 flex justify-start z-10">
                    <Image
                        width={72}
                        height={72}
                        src="/nv-logo.svg"
                        alt="NV Hosting Logo"
                        className="h-10 sm:h-12 md:h-14"
                    />
                </div>
            ) : (null)}

            {/* Основной контент */}
            <div className="w-full flex-1 flex flex-col">
                {/* Контейнер с ограничением максимальной ширины */}
                <div className="w-full max-w-7xl mx-auto px-6 sm:px-6 flex-1 flex flex-col">
                    {/* Центрирующий контейнер */}
                    <div className="flex-1 flex flex-col items-center justify-center py-4 sm:py-10">
                        {title === "Вход" && (
                            <div className="flex items-center justify-center h-full -mt-10 p-4">
                                <Image
                                    width={150}
                                    height={120}
                                    src="/blue-logo.svg"
                                    alt="NV Hosting Logo"
                                    className="h-30 sm:h-20"
                                />
                            </div>
                        )}
                        {/* Адаптивный блок контента */}
                        <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl px-4 sm:px-6">
                            <h2 className="py-1 text-3xl sm:text-3xl md:text-4xl font-extrabold text-center text-black">
                                {title}
                            </h2>
                            <div className="w-full">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    )
}