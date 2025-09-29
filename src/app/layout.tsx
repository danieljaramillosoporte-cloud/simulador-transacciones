import "./globals.css";

export const metadata = {
  title: "Test CSS",
  description: "Comprobando si carga globals.css",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
