import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { Description, Icon, Title } from "@/lib/consts";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["cyrillic", "latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: Title,
  description: Description,
  icons: {
    icon: Icon,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} font-inter `}>
      <body className={`antialiased`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
