import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/index.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Metro Echoes",
  description: "Metro Echoes web application",
  authors: [{ name: "Metro Echoes" }],
  openGraph: {
    title: "Metro Echoes",
    description: "Metro Echoes web application",
    type: "website",
    images: ["/placeholder.svg"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/placeholder.svg"],
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
