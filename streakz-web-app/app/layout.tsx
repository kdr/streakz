import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { NavBar } from "@/components/nav-bar";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    template: '%s | Streakz',
    default: 'Streakz - Track Your Daily Habits'
  },
  description: "Track your daily habits and build consistency with GitHub-inspired contribution calendars.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <main className="container py-4 pb-24">
            {children}
          </main>
          <NavBar />
        </ThemeProvider>
      </body>
    </html>
  );
}
