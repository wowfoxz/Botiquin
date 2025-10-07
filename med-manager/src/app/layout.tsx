import type { Metadata } from 'next';
import './globals.css';
import Menu from '@/components/menu/menu';
import { ThemeSwitch } from '@/components/providers/theme-switch';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Botilyx',
  description: 'Recuerda por ti',
  icons: {
    icon: [
      { url: '/icons/favicon.ico', sizes: 'any' },
      { url: '/icons/favicon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple/apple-touch-icon-57x57.png', sizes: '57x57', type: 'image/png' },
      { url: '/icons/apple/apple-touch-icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/icons/apple/apple-touch-icon-76x76.png', sizes: '76x76', type: 'image/png' },
      { url: '/icons/apple/apple-touch-icon-114x114.png', sizes: '114x114', type: 'image/png' },
      { url: '/icons/apple/apple-touch-icon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/icons/apple/apple-touch-icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/icons/apple/apple-touch-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/apple/apple-touch-icon-180x180.png', sizes: '180x180', type: 'image/png' },
      { url: '/icons/apple/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
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