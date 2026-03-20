import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Tuloy PH | Premium Student Housing",
  description: "Discover verified and safe student housing in the Philippines.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tuloy PH",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/logo/tuloyicon.png",
    apple: "/logo/tuloyicon.png",
  },
};

export const viewport = {
  themeColor: "#FF6B6B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} font-sans antialiased`}
      >
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.deferredPWAInstallPrompt = null;
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                window.deferredPWAInstallPrompt = e;
                // Dispatch a custom event to notify React if it's already mounted
                window.dispatchEvent(new CustomEvent('pwa-prompt-captured'));
              });

              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
