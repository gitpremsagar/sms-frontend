import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { SessionHydrator } from "@/components/auth/session-hydrator";
import { StoreProvider } from "@/components/providers/store-provider";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sagar Middle School",
  description:
    "Official website of Sagar Middle School — academics, community, and student portal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <SessionHydrator />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
