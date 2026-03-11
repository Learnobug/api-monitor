
import { ClerkProvider } from '@clerk/nextjs'
import Providers from './components/providers'
import './globals.css'

export const metadata = {
  title: 'API Monitor',
  description: 'Monitor your API endpoints in real time',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
    </ClerkProvider>
  );
}
