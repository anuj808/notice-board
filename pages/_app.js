import { Space_Grotesk, Plus_Jakarta_Sans } from 'next/font/google'
import Layout from '@/components/Layout'
import "@/styles/globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
})

export default function App({ Component, pageProps }) {
  return (
    <div className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} min-h-screen flex flex-col`}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </div>
  )
}
