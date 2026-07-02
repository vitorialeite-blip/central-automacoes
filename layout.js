import "./globals.css";
export const metadata = { title: "Central de Automações", description: "Painel de controle de automações" };
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
