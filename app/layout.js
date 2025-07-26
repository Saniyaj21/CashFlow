import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CashFlow - Personal Finance Tracker",
  description: "Track your income, expenses, and financial goals with our intuitive personal finance management app.",
  keywords: "finance, budget, expense tracker, income tracker, personal finance, money management",
  authors: [{ name: "CashFlow Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "CashFlow - Personal Finance Tracker",
    description: "Track your income, expenses, and financial goals with our intuitive personal finance management app.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CashFlow - Personal Finance Tracker",
    description: "Track your income, expenses, and financial goals with our intuitive personal finance management app.",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>

      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
