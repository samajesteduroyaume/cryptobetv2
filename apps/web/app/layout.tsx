import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import SideBar from "@/src/components/SideBar";
import TopBar from "@/src/components/TopBar";
import { Web3Provider } from "@/src/config/Web3Provider";
import ClientOnly from "@/src/components/ClientOnly";

const roboto = Roboto({ weight: ["400", "500", "700"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CryptoBet - Paris Sportifs Web3",
  description: "Plateforme de paris sportifs décentralisée sur Optimism",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.className} flex bg-background`}>
        <ClientOnly>
          <Web3Provider>
            <SideBar />
            <div className={'flex flex-col w-full min-h-screen bg-background'}>
              <TopBar />
              <div className='content w-full h-full pl-80 pt-24'>
                {children}
              </div>
            </div>
          </Web3Provider>
        </ClientOnly>
      </body>
    </html>
  );
}
