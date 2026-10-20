import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UniPath | A clearer path to university',
  description: 'Plan applications, organise documents, track deadlines, and move toward university with confidence.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#f7f8f3]">
      <body className="font-sans antialiased bg-[#f7f8f3]">
        {children}
      </body>
    </html>
  )
}
