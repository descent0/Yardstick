import "./globals.css";

export const metadata = {
  title: "Personal Finance Visualizer",
  description: "Track, analyze, and visualize your expenses...",
  generator: "v0.dev",
  openGraph: {
    title: "Personal Finance Visualizer",
    description: "Visualize your financial journey...",
    images: [{ url: "https://your-app-url.com/og-image.png" }],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
