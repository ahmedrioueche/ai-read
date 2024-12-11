import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/FireBall.svg" type="image/svg+xml" />
      </head>
      <body className="bg-dark-background">{children}</body>
    </html>
  );
}
