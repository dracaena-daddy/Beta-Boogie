import "../styles/globals.css";
import NavBar from "./components/NavBar";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';

const inter = Inter({subsets: ['latin']});

export const metadata = {
  title: "Beta Boogie",
  description: "Where VaR meets vibes!",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
             <head>
         <link rel="icon" href="/favicon.ico" type="image/x-icon" />
         <meta name="viewport" content="width=device-width, initial-scale=1" />
         </head>
        <body className={inter.className}>
          <NavBar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}