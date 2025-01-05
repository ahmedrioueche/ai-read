"use client";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="AI Read" content="AI-Read" />
        <meta
          name="description"
          content="AI Read is a powerful PDF reader powered by AI."
        />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/images/Fireball.svg" type="image/svg+xml" />
      </head>
      <body className="bg-dark-background">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
