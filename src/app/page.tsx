'use client';

import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/login');
  };

  return (
    <>
      <Head>
        <title>NV Hosting | Добро пожаловать</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Просто. Надежно. Для студентов." />
      </Head>

      <main className="min-h-screen bg-white flex flex-col justify-between items-center text-center">
        {/* Верхняя часть */}
        <div className="flex flex-col items-center justify-center flex-grow px-4 pt-15">
          <h1 className="text-4xl font-bold mb-6 text-gray-900">Добро<br />пожаловать!</h1>

          <Image
            src="/blue-logo.svg"
            alt="NV Hosting"
            width={100}
            height={100}
            className="mb-4"
          />

          <p className="text-lg font-semibold text-gray-800 mb-10">
            Просто. Надежно. Для студентов.
          </p>


          <button onClick={handleStart} className="z-2 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-3 px-8 rounded-2xl shadow-md flex items-center gap-2 transition-all hover:shadow-lg active:transform active:scale-95 active:shadow-inner">
            Начать
            <span className="text-xl">→</span>
          </button>

        </div>

        {/* Нижняя часть с облаками */}
        <div className="relative w-full h-100 overflow-hidden z-[1] -mt-25">
          <Image
            src="/cloud-home.svg"
            alt="Облака"
            fill
            priority
            className="object-cover object-top opacity-50"
          />
        </div>
      </main>
    </>
  );
}