import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Store Dose",
  description: "A curated directory of the best stores.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <html lang="en">
      <body>
        {children}
        {googleMapsKey && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsKey}&libraries=places`}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
