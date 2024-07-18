import "@/styles/globals.css";
import { DM_Serif_Display } from 'next/font/google'

const dmSerifDisplay = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

export default function App({ Component, pageProps }) {
  return (
    <main className={dmSerifDisplay.className}>
    <Component {...pageProps} />
  </main>
  )
}
