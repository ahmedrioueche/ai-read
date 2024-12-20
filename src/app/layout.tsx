import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="AI-Read" />
        <meta
          name="description"
          content="AI-Read is a powerful PDF reader powered by AI."
        />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/images/Fireball.svg" type="image/svg+xml" />
      </head>
      <body className="bg-dark-background">{children}</body>
    </html>
  );
}
