import "./globals.css";
import { Montserrat, Inter } from "next/font/google";
import Providers from "./Providers";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import "@/config/env.config";
const montserrat = Montserrat({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "First-Plug-Platform",
  description:
    "Web platform focused on inventory management, acquisition and control.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="font-inter">
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
