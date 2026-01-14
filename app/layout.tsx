import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { AppProviders } from "./providers";
import { Description, Icon, Title } from "@/lib/consts";

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
    <ConvexAuthNextjsServerProvider>
      <html lang="ru" className={`${inter.variable} font-inter `} suppressHydrationWarning>
        <body className={`antialiased`} suppressHydrationWarning>
          <AppProviders>{children}</AppProviders>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
