import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NV-Cloud | Облачный хостинг",
  description: "Облачный хостинг с мониторингом ресурсов и удобным интерфейсом",
  keywords: [
    "LXC",
    "контейнеры",
    "виртуализация",
    "облачные сервисы",
    "VPS",
    "управление серверами"
  ],
  openGraph: {
    title: "NV-Cloud | Облачный хостинг",
    description: "Облачный хостинг с мониторингом ресурсов и удобным интерфейсом",
    url: "https://cloud.nv-server.online",
    siteName: "NV-Cloud",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NV-Cloud | Облачный хостинг",
    description: "Облачный хостинг с мониторингом ресурсов и удобным интерфейсом",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}