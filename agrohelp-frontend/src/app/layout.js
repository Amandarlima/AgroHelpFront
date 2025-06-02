import "./globals.css";
import ClientLayout from "../components/ClientLayout";

export const metadata = {
  title: "AgroHelp",
  description: "Sistema inteligente para upload e gestão de imagens",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
