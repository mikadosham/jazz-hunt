import { AuthProvider } from "../context/AutoContext";
import "../app/globals.css"; // Add your global CSS if needed

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </AuthProvider>
  );
}
