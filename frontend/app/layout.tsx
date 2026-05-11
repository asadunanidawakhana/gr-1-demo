import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { CartProvider } from '@/lib/cart-context'
import Navbar from '@/components/layout/Navbar'
import MobileNav from '@/components/layout/MobileNav'
import SplashScreen from '@/components/layout/SplashScreen'
import Footer from '@/components/layout/Footer'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#C9A66B',
}

export const metadata: Metadata = {
  title: {
    default: 'Aurangzaib Garments — Premium Fashion',
    template: '%s | Aurangzaib Garments'
  },
  description: 'Discover premium fashion collections at Aurangzaib Garments. Shop men, women, kids clothing, accessories and more with fast delivery across Pakistan.',
  keywords: ['fashion', 'clothing', 'garments', 'Pakistan', 'men wear', 'women wear', 'premium fashion'],
  openGraph: {
    title: 'Aurangzaib Garments — Premium Fashion',
    description: 'Discover premium fashion collections at Aurangzaib Garments.',
    type: 'website',
    siteName: 'Aurangzaib Garments',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <SplashScreen />
            <Navbar />
            <main className="main-content">
              {children}
            </main>
            <Footer />
            <MobileNav />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
