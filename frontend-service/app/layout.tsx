// app/layout.tsx
import "bootstrap/dist/css/bootstrap.min.css";

export const metadata = { title: "Sani User Management System" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
