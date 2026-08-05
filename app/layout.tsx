import "./globals.css";

export const metadata = {
  title: "Katalog UMKM",
  description: "Web Sampel UMKM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}