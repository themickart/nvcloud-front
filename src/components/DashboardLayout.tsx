'use client'

import useTelegramWebviewProxy from '@/hooks/useTelegramWebApp';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import BackButton from './BackButton';

export default function DashboardLayout({ title, children }: { title: string; children: React.ReactNode }) {
    const router = useRouter();
    const { isTelegramWebviewProxy, isReady } = useTelegramWebviewProxy();

    const handleLogout = () => {
        document.cookie = `authToken=; path=/; max-age=0; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
        setTimeout(() => {
            router.replace('/login');
        }, 100);
    };

    return (
        <div className="relative flex flex-col items-center min-h-screen bg-white overflow-hidden">
            <Image
                width={715}
                height={703}
                src="/cloud-left.svg"
                alt="Cloud Left"
                className="hidden lg:block fixed bottom-0 left-0 w-auto h-[50vh] min-h-[300px] opacity-80 pointer-events-none select-none"
            />
            <Image
                width={715}
                height={703}
                src="/cloud-right.svg"
                alt="Cloud Right"
                className="hidden lg:block fixed bottom-0 right-0 w-auto h-[50vh] min-h-[300px] opacity-80 pointer-events-none select-none"
            />
            {isReady && !isTelegramWebviewProxy ? (
                <div className="w-full bg-blue-500 py-3 px-4 sm:py-2 sm:px-6 flex justify-between items-center z-10">
                    <>
                        <Image width={72} height={72} src="/nv-logo.svg" alt="NV Hosting Logo" className="h-13 sm:h-12 md:h-14" />
                        <button onClick={handleLogout} className="cursor-pointer">
                            <Image width={46} height={46} src="/exit-logo.svg" alt="Exit Logo" className="h-10 sm:h-12 md:h-14" />
                        </button>
                    </>
                </div>
                //) : <div className="w-full bg-blue-500 py-7 px-4 sm:py-2 sm:px-6 flex justify-between items-center z-10"></div>}
            ) : (null)}

            <div className="w-full flex-1 flex flex-col items-center">
                <div className="w-full max-w-7xl px-1 sm:px-6 relative pt-6 pb-6">
                    <div className="relative flex items-center justify-center h-[48px] sm:h-[64px] md:h-[80px]">
                        {title !== 'Профиль' && (
                            <div className="absolute left-0 z-10">
                                <BackButton href="/profile" />
                            </div>
                        )}
                        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl font-extrabold text-black px-4 break-words">
                            {title}
                        </h2>
                    </div>
                </div>
                <div className="w-full max-w-7xl px-6 sm:px-6 flex-1 flex flex-col">
                    <div className="flex-1 flex flex-col items-center pb-6 sm:pb-10">
                        <div className="w-full sm:w-11/12 md:w-10/12 lg:w-8/12 xl:w-7/12 2xl:w-6/12">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}