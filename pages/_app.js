import "@/styles/globals.css";
import { Exo } from 'next/font/google'

const exo = Exo({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

export default function App({ Component, pageProps }) {
  return (
    <main className={exo.className}>
    <Component {...pageProps} />
  </main>
  )
}