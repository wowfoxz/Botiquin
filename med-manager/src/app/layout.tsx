import type { Metadata } from 'next';
import './globals.css';
import Menu from '@/components/menu/menu';
import { ThemeSwitch } from '@/components/providers/theme-switch';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'MedManager',
  description: 'Gestión de medicamentos y tratamientos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="fixed top-4 right-4 z-50">
            <ThemeSwitch />
          </div>
          <Menu />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}