
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cores } from "@/lib/cores";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Admin - Agendou Barbearia",
  description: "Sistema administrativo da barbearia Agendou",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ 
          background: cores.background.primary,
          color: cores.neutral.white,
          margin: 0,
          minHeight: '100vh'
        }}
      >
        <Header />
        <main style={{ paddingTop: '80px', minHeight: 'calc(100vh - 80px)' }}>
          {children}
        </main>
      </body>
    </html>
  );
}