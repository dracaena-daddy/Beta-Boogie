import "../styles/globals.css";
import NavBar from "./components/NavBar";
import "./globals.css";

export const metadata = {
  title: "Beta Boogie",
  description: "Where VaR meets vibes!",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-[#1A1A40] text-[#F4F4F4]">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
